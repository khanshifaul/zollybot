//! zollybot-cli — the terminal version of the ZollyBot desktop app.
//!
//! Run with no arguments for the interactive TUI, or use a subcommand for
//! scripts. The office files stay canonical: everything here reads `.agents/`
//! and never writes to it.

use clap::{Parser, Subcommand};
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Cell, Clear, Paragraph, Row, Table, TableState},
    Frame, Terminal,
};
use serde::Serialize;
use std::collections::BTreeMap;
use std::fs;
use std::io::{IsTerminal, stdout};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

const REFRESH_EVERY: Duration = Duration::from_secs(3);

#[derive(Parser)]
#[command(
    name = "zollybot-cli",
    version,
    about = "ZollyBot offices in the terminal",
    long_about = "Run with no arguments for the interactive TUI. Subcommands print one view \
                  and exit, for scripts and SSH one-liners."
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand)]
enum Command {
    /// List offices found under the given roots.
    Offices {
        #[arg(long)]
        root: Vec<PathBuf>,
        #[arg(long, default_value_t = 3)]
        depth: usize,
        #[arg(long)]
        json: bool,
    },
    /// List the queue briefs of one office.
    Queue {
        office: String,
        #[arg(long)]
        json: bool,
    },
    /// List results that carry a gate and have not been approved.
    Gates {
        office: String,
        #[arg(long)]
        json: bool,
    },
}

#[derive(Serialize, Clone)]
struct Office {
    root: String,
    frequency: Option<String>,
    base_branch: Option<String>,
    remote: Option<String>,
    queue: Counts,
}

#[derive(Serialize, Clone, Default)]
struct Counts {
    queued: usize,
    dispatched: usize,
    blocked: usize,
    done: usize,
    failed: usize,
    escalated: usize,
}

#[derive(Serialize, Clone)]
struct QueueEntry {
    id: String,
    title: String,
    status: String,
    gate: String,
}

#[derive(Serialize, Clone)]
struct GateEntry {
    task: String,
    title: String,
    gate: String,
    approved: bool,
}

fn front_matter(text: &str) -> BTreeMap<String, String> {
    let mut map = BTreeMap::new();
    let mut lines = text.lines();
    if lines.next().map(str::trim) != Some("---") {
        return map;
    }
    for line in lines {
        if line.trim() == "---" {
            break;
        }
        if let Some((key, value)) = line.split_once(':') {
            map.insert(
                key.trim().to_string(),
                value.trim().trim_matches('"').to_string(),
            );
        }
    }
    map
}

fn read_office(root: &Path) -> Option<(Option<String>, Option<String>, Option<String>)> {
    let config = root.join(".agents/zolly/config.toml");
    let text = fs::read_to_string(&config).ok()?;
    let value = |key: &str| -> Option<String> {
        for line in text.lines() {
            let Some((k, v)) = line.split_once('=') else {
                continue;
            };
            if k.trim() == key {
                return Some(v.trim().trim_matches('"').to_string());
            }
        }
        None
    };
    Some((value("frequency"), value("base_branch"), value("remote")))
}

fn walk(dir: &Path, depth: usize, max_depth: usize, found: &mut Vec<Office>, seen: &mut Vec<PathBuf>) {
    if depth > max_depth {
        return;
    }
    let canonical = fs::canonicalize(dir).unwrap_or_else(|_| dir.to_path_buf());
    if seen.contains(&canonical) {
        return;
    }
    seen.push(canonical);

    if let Some((frequency, base_branch, remote)) = read_office(dir) {
        found.push(Office {
            root: dir.display().to_string(),
            frequency,
            base_branch,
            remote,
            queue: queue_counts(dir),
        });
        return;
    }

    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut children: Vec<PathBuf> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().map(|t| t.is_dir()).unwrap_or(false))
        .map(|entry| entry.path())
        .filter(|path| {
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            !name.starts_with('.') && name != "node_modules"
        })
        .collect();
    children.sort();
    for child in children {
        walk(&child, depth + 1, max_depth, found, seen);
    }
}

fn discover(roots: &[PathBuf], depth: usize) -> Vec<Office> {
    let mut found = Vec::new();
    let mut seen = Vec::new();
    for root in roots {
        walk(root, 0, depth, &mut found, &mut seen);
    }
    found.sort_by(|a, b| a.root.cmp(&b.root));
    found
}

fn queue_entries(root: &Path) -> Vec<QueueEntry> {
    let dir = root.join(".agents/queue");
    let Ok(entries) = fs::read_dir(&dir) else {
        return Vec::new();
    };
    let mut out: Vec<QueueEntry> = entries
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|e| e.to_str()) == Some("md"))
        .filter_map(|path| {
            let text = fs::read_to_string(&path).ok()?;
            let fm = front_matter(&text);
            Some(QueueEntry {
                id: fm.get("id").cloned().unwrap_or_else(|| {
                    path.file_stem().and_then(|s| s.to_str()).unwrap_or("").to_string()
                }),
                title: fm.get("title").cloned().unwrap_or_default(),
                status: fm.get("status").cloned().unwrap_or_else(|| "unknown".into()),
                gate: fm.get("gate").cloned().unwrap_or_else(|| "auto".into()),
            })
        })
        .collect();
    out.sort_by(|a, b| a.id.cmp(&b.id));
    out
}

fn queue_counts(root: &Path) -> Counts {
    let mut counts = Counts::default();
    for entry in queue_entries(root) {
        match entry.status.as_str() {
            "queued" => counts.queued += 1,
            "dispatched" => counts.dispatched += 1,
            "blocked" => counts.blocked += 1,
            "done" => counts.done += 1,
            "failed" => counts.failed += 1,
            "escalated" => counts.escalated += 1,
            _ => {}
        }
    }
    counts
}

fn gate_entries(root: &Path) -> Vec<GateEntry> {
    let dir = root.join(".agents/results");
    let Ok(entries) = fs::read_dir(&dir) else {
        return Vec::new();
    };
    let mut out: Vec<GateEntry> = entries
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|e| e.to_str()) == Some("md"))
        .filter_map(|path| {
            let text = fs::read_to_string(&path).ok()?;
            let fm = front_matter(&text);
            let gate = fm.get("gate").cloned().unwrap_or_else(|| "auto".into());
            if gate != "human" {
                return None;
            }
            Some(GateEntry {
                task: fm.get("id").cloned().unwrap_or_else(|| {
                    path.file_stem().and_then(|s| s.to_str()).unwrap_or("").to_string()
                }),
                title: fm.get("title").cloned().unwrap_or_default(),
                gate,
                approved: fm.get("approved").map(|v| v == "yes").unwrap_or(false),
            })
        })
        .collect();
    out.sort_by(|a, b| a.task.cmp(&b.task));
    out
}

fn home() -> PathBuf {
    std::env::var_os("HOME").map(PathBuf::from).unwrap_or_else(|| PathBuf::from("."))
}

fn default_roots() -> Vec<PathBuf> {
    let projects = home().join("Projects");
    if projects.is_dir() {
        vec![projects]
    } else {
        vec![std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))]
    }
}

fn resolve_office(arg: &str) -> Option<PathBuf> {
    let direct = PathBuf::from(arg);
    if direct.join(".agents/zolly/config.toml").is_file() {
        return Some(direct);
    }
    let mut matches: Vec<PathBuf> = Vec::new();
    for office in discover(&default_roots(), 3) {
        if office.frequency.as_deref() == Some(arg) {
            matches.push(PathBuf::from(office.root));
        }
    }
    match matches.len() {
        0 | 2.. => None,
        1 => Some(matches.remove(0)),
    }
}

fn print_offices(offices: &[Office]) {
    if offices.is_empty() {
        println!("no offices found");
        return;
    }
    let width = offices.iter().map(|o| o.root.len()).max().unwrap_or(4).max(4);
    println!(
        "{:<width$}  {:<16}  {:>7}  {:>10}  {:>8}",
        "ROOT",
        "FREQUENCY",
        "QUEUED",
        "DISPATCHED",
        "BLOCKED",
        width = width
    );
    for office in offices {
        println!(
            "{:<width$}  {:<16}  {:>7}  {:>10}  {:>8}",
            office.root,
            office.frequency.as_deref().unwrap_or("-"),
            office.queue.queued,
            office.queue.dispatched,
            office.queue.blocked,
            width = width
        );
    }
}

fn cmd_offices(roots: Vec<PathBuf>, depth: usize, json: bool) -> i32 {
    let roots = if roots.is_empty() { default_roots() } else { roots };
    let offices = discover(&roots, depth);
    if json {
        println!("{}", serde_json::to_string_pretty(&offices).unwrap());
    } else {
        print_offices(&offices);
    }
    0
}

fn cmd_queue(office: &str, json: bool) -> i32 {
    let Some(root) = resolve_office(office) else {
        eprintln!("no office matches '{office}'");
        return 1;
    };
    let entries = queue_entries(&root);
    if json {
        println!("{}", serde_json::to_string_pretty(&entries).unwrap());
    } else if entries.is_empty() {
        println!("queue is empty");
    } else {
        for entry in &entries {
            println!("{:<34}  {:<10}  {:<5}  {}", entry.id, entry.status, entry.gate, entry.title);
        }
    }
    0
}

fn cmd_gates(office: &str, json: bool) -> i32 {
    let Some(root) = resolve_office(office) else {
        eprintln!("no office matches '{office}'");
        return 1;
    };
    let gates = gate_entries(&root);
    if json {
        println!("{}", serde_json::to_string_pretty(&gates).unwrap());
    } else if gates.is_empty() {
        println!("no gates waiting");
    } else {
        for gate in &gates {
            println!(
                "{:<34}  {:<8}  {}",
                gate.task,
                if gate.approved { "approved" } else { "WAITING" },
                gate.title
            );
        }
    }
    0
}

#[derive(PartialEq, Clone, Copy)]
enum View {
    Queue,
    Gates,
}

fn office_name(office: &Office) -> String {
    match office.frequency.as_deref() {
        Some(name) if !name.is_empty() && !name.contains("{{") => name.to_string(),
        _ => "(unnamed)".to_string(),
    }
}

struct ConnectPanel {
    url: String,
    lines: Vec<String>,
}

fn connect_url() -> String {
    std::env::var("ZOLLYBOT_CONNECT_URL").unwrap_or_else(|_| "https://zollybot.shifaul.dev".to_string())
}

/// The account service the GUI talks to. The CLI follows the same steps, so the
/// same host answers it.
fn api_base() -> String {
    std::env::var("ZOLLYBOT_API_URL").unwrap_or_else(|_| "https://api-zollybot.shifaul.dev".to_string())
}

#[derive(Clone)]
struct Session {
    email: String,
    #[allow(dead_code)]
    token: String,
    /// The session lives in the running server, not in this process, so there is no
    /// token to write to disk.
    local: bool,
}

/// The control socket of a running `zollybot --server`. The GUI and the TUI are two
/// frontends of that one server, exactly like herdr.
fn control_socket() -> Option<PathBuf> {
    let runtime = std::env::var("XDG_RUNTIME_DIR").ok()?;
    if runtime.trim().is_empty() {
        return None;
    }
    let path = PathBuf::from(runtime).join("control.sock");
    if path.exists() {
        Some(path)
    } else {
        None
    }
}

fn url_encode(value: &str) -> String {
    let mut encoded = String::new();
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => encoded.push(byte as char),
            b' ' => encoded.push('+'),
            other => encoded.push_str(&format!("%{other:02X}")),
        }
    }
    encoded
}

/// One request to the control socket, answered with a status and `key=value` lines.
fn control_call(
    method: &str,
    path: &str,
    form: &[(&str, &str)],
) -> Result<(u16, Vec<(String, String)>), String> {
    use std::io::{Read, Write};
    use std::os::unix::net::UnixStream;
    let socket = control_socket().ok_or_else(|| "no running zollybot server".to_string())?;
    let mut stream = UnixStream::connect(&socket).map_err(|error| error.to_string())?;
    stream
        .set_read_timeout(Some(Duration::from_secs(30)))
        .map_err(|error| error.to_string())?;
    let body = form
        .iter()
        .map(|(key, value)| format!("{}={}", url_encode(key), url_encode(value)))
        .collect::<Vec<_>>()
        .join("&");
    let request = format!(
        "{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    stream
        .write_all(request.as_bytes())
        .map_err(|error| error.to_string())?;
    let mut response = String::new();
    stream
        .read_to_string(&mut response)
        .map_err(|error| error.to_string())?;
    let (head, payload) = response
        .split_once("\r\n\r\n")
        .ok_or_else(|| "the server answered without a body".to_string())?;
    let status = head
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|code| code.parse::<u16>().ok())
        .ok_or_else(|| "the server answered without a status".to_string())?;
    let mut lines = Vec::new();
    for line in payload.lines() {
        if let Some((key, value)) = line.split_once('=') {
            lines.push((key.to_string(), value.to_string()));
        }
    }
    Ok((status, lines))
}

fn line_value(lines: &[(String, String)], key: &str) -> Option<String> {
    lines
        .iter()
        .find(|(name, _)| name == key)
        .map(|(_, value)| value.clone())
}

fn answer_error(status: u16, lines: &[(String, String)]) -> String {
    line_value(lines, "message")
        .filter(|message| !message.is_empty())
        .or_else(|| line_value(lines, "error"))
        .unwrap_or_else(|| format!("the server answered {status}"))
}

fn decode_base64(input: &str) -> Option<String> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut output = Vec::new();
    let mut buffer = 0u32;
    let mut bits = 0u8;
    for byte in input.bytes().filter(|byte| !byte.is_ascii_whitespace() && *byte != b'=') {
        let value = ALPHABET.iter().position(|candidate| *candidate == byte)? as u32;
        buffer = (buffer << 6) | value;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            output.push((buffer >> bits) as u8);
        }
    }
    String::from_utf8(output).ok()
}

fn config_dir() -> PathBuf {
    let base = std::env::var("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(std::env::var("HOME").unwrap_or_default()).join(".config"));
    base.join("zollybot")
}

fn session_path() -> PathBuf {
    config_dir().join("session.json")
}

fn load_session() -> Option<Session> {
    let text = fs::read_to_string(session_path()).ok()?;
    let value: serde_json::Value = serde_json::from_str(&text).ok()?;
    Some(Session {
        email: value.get("email")?.as_str()?.to_string(),
        token: value.get("token")?.as_str()?.to_string(),
        local: false,
    })
}

fn save_session(session: &Session) -> std::io::Result<()> {
    if session.local {
        return Ok(());
    }
    let dir = config_dir();
    fs::create_dir_all(&dir)?;
    let path = session_path();
    fs::write(
        &path,
        serde_json::to_string_pretty(&ureq::json!({
            "email": session.email,
            "token": session.token,
        }))?,
    )?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&path, fs::Permissions::from_mode(0o600))?;
    }
    Ok(())
}

fn random_uuid() -> String {
    fs::read_to_string("/proc/sys/kernel/random/uuid")
        .map(|value| value.trim().to_string())
        .unwrap_or_else(|_| {
            let nanos = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|duration| duration.as_nanos())
                .unwrap_or_default();
            format!("{nanos:x}")
        })
}

fn api_error(error: ureq::Error) -> String {
    match error {
        ureq::Error::Status(code, response) => response
            .into_json::<serde_json::Value>()
            .ok()
            .and_then(|value| {
                value
                    .get("error")
                    .and_then(|error| error.get("message"))
                    .and_then(|message| message.as_str())
                    .map(|message| message.to_string())
            })
            .unwrap_or_else(|| format!("the account service answered {code}")),
        other => format!("{other}"),
    }
}

/// Step one of the GUI flow: the service emails a code and returns the challenge.
/// A running server owns the sign-in, so ask it first; without one, call the API directly.
fn request_code(email: &str) -> Result<(String, bool), String> {
    if control_socket().is_some() {
        let (status, lines) = control_call("POST", "/v1/login/start", &[("email", email)])?;
        if status == 200 {
            return line_value(&lines, "challenge")
                .map(|challenge| (challenge, true))
                .ok_or_else(|| "the server sent no challenge".to_string());
        }
        return Err(answer_error(status, &lines));
    }
    let url = format!("{}/v1/auth/email/start", api_base());
    let response = ureq::post(&url)
        .set("Content-Type", "application/json")
        .set("Idempotency-Key", &random_uuid())
        .send_json(ureq::json!({ "email": email }));
    match response {
        Ok(response) => response
            .into_json::<serde_json::Value>()
            .map_err(|error| error.to_string())?
            .get("challengeId")
            .and_then(|challenge| challenge.as_str())
            .map(|challenge| (challenge.to_string(), false))
            .ok_or_else(|| "the account service sent no challenge".to_string()),
        Err(error) => Err(api_error(error)),
    }
}

/// Step two: the code becomes a session, which the server keeps or the CLI stores.
fn verify_code(challenge: &str, code: &str) -> Result<Session, String> {
    if control_socket().is_some() {
        let (status, lines) = control_call(
            "POST",
            "/v1/login/verify",
            &[("challenge", challenge), ("code", code)],
        )?;
        if status == 200 {
            return Ok(Session {
                email: line_value(&lines, "email").unwrap_or_default(),
                token: String::new(),
                local: true,
            });
        }
        return Err(answer_error(status, &lines));
    }
    let url = format!("{}/v1/auth/email/verify", api_base());
    let response = ureq::post(&url)
        .set("Content-Type", "application/json")
        .send_json(ureq::json!({ "challengeId": challenge, "code": code }));
    match response {
        Ok(response) => {
            let value = response
                .into_json::<serde_json::Value>()
                .map_err(|error| error.to_string())?;
            let token = value
                .get("sessionToken")
                .and_then(|token| token.as_str())
                .unwrap_or_default()
                .to_string();
            let email = value
                .get("user")
                .and_then(|user| user.get("email"))
                .and_then(|email| email.as_str())
                .unwrap_or_default()
                .to_string();
            if token.is_empty() {
                return Err("the account service sent no session".to_string());
            }
            Ok(Session { email, token, local: false })
        }
        Err(error) => Err(api_error(error)),
    }
}

#[derive(Clone, Copy, PartialEq)]
enum SignInStage {
    Email,
    Code,
}

struct SignIn {
    stage: SignInStage,
    email: String,
    code: String,
    challenge: String,
    status: String,
    server: bool,
}

fn connect_qr(url: &str) -> Vec<String> {
    match qrcode::QrCode::new(url.as_bytes()) {
        Ok(code) => code
            .render::<qrcode::render::unicode::Dense1x2>()
            .quiet_zone(true)
            .build()
            .lines()
            .map(|line| line.to_string())
            .collect(),
        Err(_) => Vec::new(),
    }
}

struct App {
    offices: Vec<Office>,
    selected: usize,
    queue: Vec<QueueEntry>,
    gates: Vec<GateEntry>,
    view: View,
    table_state: TableState,
    quit: bool,
    message: String,
    last_refresh: Instant,
    connect: Option<ConnectPanel>,
    session: Option<Session>,
    sign_in: Option<SignIn>,
}

impl App {
    fn new() -> Self {
        let mut app = App {
            offices: Vec::new(),
            selected: 0,
            queue: Vec::new(),
            gates: Vec::new(),
            view: View::Queue,
            table_state: TableState::default(),
            quit: false,
            message: String::new(),
            last_refresh: Instant::now(),
            connect: None,
            session: load_session(),
            sign_in: None,
        };
        app.refresh_account();
        app.reload();
        app
    }

    fn reload(&mut self) {
        self.offices = discover(&default_roots(), 3);
        if self.selected >= self.offices.len() {
            self.selected = self.offices.len().saturating_sub(1);
        }
        self.load_detail();
        self.last_refresh = Instant::now();
    }

    fn load_detail(&mut self) {
        if let Some(office) = self.offices.get(self.selected) {
            let root = PathBuf::from(&office.root);
            self.queue = queue_entries(&root);
            self.gates = gate_entries(&root);
            let len = match self.view {
                View::Queue => self.queue.len(),
                View::Gates => self.gates.len(),
            };
            self.table_state.select(if len > 0 { Some(0) } else { None });
        } else {
            self.queue.clear();
            self.gates.clear();
            self.table_state.select(None);
        }
    }

    fn select(&mut self, index: usize) {
        if self.offices.is_empty() {
            return;
        }
        self.selected = index.min(self.offices.len() - 1);
        self.load_detail();
    }

    fn next_office(&mut self) {
        if !self.offices.is_empty() {
            self.select((self.selected + 1).min(self.offices.len() - 1));
        }
    }

    fn previous_office(&mut self) {
        self.select(self.selected.saturating_sub(1));
    }

    fn toggle_view(&mut self) {
        self.view = match self.view {
            View::Queue => View::Gates,
            View::Gates => View::Queue,
        };
        self.load_detail();
    }

    fn toggle_connect(&mut self) {
        if self.connect.is_some() {
            self.connect = None;
            return;
        }
        // The server mints the pairing code the GUI shows, so ask it for the same QR.
        if control_socket().is_some() {
            match control_call("POST", "/v1/mobile-connect", &[]) {
                Ok((200, lines)) => {
                    if let Some(qr) = line_value(&lines, "qr").and_then(|encoded| decode_base64(&encoded)) {
                        let lines = qr.lines().map(|line| line.to_string()).collect();
                        self.connect = Some(ConnectPanel {
                            url: "scan with the ZollyBot app".to_string(),
                            lines,
                        });
                        return;
                    }
                }
                Ok((status, lines)) => {
                    self.message = answer_error(status, &lines);
                    return;
                }
                Err(error) => {
                    self.message = error;
                    return;
                }
            }
        }
        let url = match &self.session {
            Some(_) => format!("zollybot://mobile-connect?api={}", api_base()),
            None => connect_url(),
        };
        let lines = connect_qr(&url);
        self.connect = Some(ConnectPanel { url, lines });
    }

    /// The server owns the account, so the first read comes from it, not from a token file.
    fn refresh_account(&mut self) {
        if control_socket().is_none() {
            return;
        }
        if let Ok((200, lines)) = control_call("GET", "/v1/status", &[]) {
            if line_value(&lines, "account").as_deref() == Some("signed_in") {
                self.session = Some(Session {
                    email: line_value(&lines, "email").unwrap_or_default(),
                    token: String::new(),
                    local: true,
                });
            }
        }
    }

    fn open_sign_in(&mut self) {
        let mut email = self
            .session
            .as_ref()
            .map(|session| session.email.clone())
            .unwrap_or_default();
        let mut status = String::new();
        if control_socket().is_some() {
            if let Ok((200, lines)) = control_call("GET", "/v1/status", &[]) {
                if line_value(&lines, "account").as_deref() == Some("signed_in") {
                    email = line_value(&lines, "email").unwrap_or(email);
                } else {
                    status = "The server has no account yet.".to_string();
                }
            }
        }
        self.sign_in = Some(SignIn {
            stage: SignInStage::Email,
            email,
            code: String::new(),
            challenge: String::new(),
            status,
            server: false,
        });
    }

    /// Enter inside the dialog: request a code, then turn the code into a session.
    fn submit_sign_in(&mut self) {
        let mut sign_in = match self.sign_in.take() {
            Some(sign_in) => sign_in,
            None => return,
        };
        match sign_in.stage {
            SignInStage::Email => {
                let email = sign_in.email.trim().to_string();
                if email.is_empty() {
                    sign_in.status = "Enter your email first.".into();
                } else {
                    match request_code(&email) {
                        Ok((challenge, server)) => {
                            sign_in.challenge = challenge;
                            sign_in.server = server;
                            sign_in.stage = SignInStage::Code;
                            sign_in.status = if server {
                                format!("The running server emailed a code to {email}.")
                            } else {
                                format!("Code sent to {email}.")
                            };
                            sign_in.email = email;
                        }
                        Err(error) => sign_in.status = error,
                    }
                }
            }
            SignInStage::Code => {
                let code = sign_in.code.trim().to_string();
                if code.is_empty() {
                    sign_in.status = "Enter the code from the email.".into();
                } else {
                    match verify_code(&sign_in.challenge, &code) {
                        Ok(session) => {
                            let email = session.email.clone();
                            if let Err(error) = save_session(&session) {
                                self.message = format!("signed in, but saving failed: {error}");
                            } else {
                                self.message = format!("signed in as {email}");
                            }
                            self.session = Some(session);
                            return;
                        }
                        Err(error) => {
                            sign_in.status = error;
                            sign_in.code.clear();
                        }
                    }
                }
            }
        }
        self.sign_in = Some(sign_in);
    }

    fn sign_out(&mut self) {
        if control_socket().is_some() {
            match control_call("POST", "/v1/logout", &[]) {
                Ok((200, _)) => {
                    self.message = "signed out".into();
                }
                Ok((status, lines)) => {
                    self.message = answer_error(status, &lines);
                    return;
                }
                Err(error) => {
                    self.message = error;
                    return;
                }
            }
        } else {
            let _ = fs::remove_file(session_path());
            self.message = "signed out".into();
        }
        self.session = None;
        self.sign_in = None;
    }

    fn table_next(&mut self) {
        let len = match self.view {
            View::Queue => self.queue.len(),
            View::Gates => self.gates.len(),
        };
        if len == 0 {
            return;
        }
        let current = self.table_state.selected().unwrap_or(0);
        self.table_state.select(Some((current + 1).min(len - 1)));
    }

    fn table_previous(&mut self) {
        let current = self.table_state.selected().unwrap_or(0);
        self.table_state.select(Some(current.saturating_sub(1)));
    }
}

fn draw(frame: &mut Frame, app: &mut App) {
    let outer = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(1), Constraint::Min(3), Constraint::Length(1)])
        .split(frame.area());

    // Tab strip, the herdr-style workspace row.
    let mut tabs: Vec<Span> = Vec::new();
    for (index, office) in app.offices.iter().enumerate() {
        let active = index == app.selected;
        let blocked = office.queue.blocked;
        let label = format!(" {} {} {} ", index + 1, office_name(office), if blocked > 0 { "!" } else { "" });
        let style = if active {
            Style::default().bg(Color::Blue).fg(Color::White).add_modifier(Modifier::BOLD)
        } else if blocked > 0 {
            Style::default().fg(Color::Yellow)
        } else {
            Style::default().fg(Color::DarkGray)
        };
        tabs.push(Span::styled(label, style));
    }
    if tabs.is_empty() {
        tabs.push(Span::styled(" no offices ", Style::default().fg(Color::DarkGray)));
    }
    frame.render_widget(Paragraph::new(Line::from(tabs)), outer[0]);

    // Body: one pane for the active office.
    let name = app
        .offices
        .get(app.selected)
        .map(office_name)
        .unwrap_or_else(|| "no office".to_string());
    let view_title = match app.view {
        View::Queue => "queue",
        View::Gates => "gates",
    };
    let title = format!(" {view_title} · {name} ");
    let widths = [
        Constraint::Length(32),
        Constraint::Length(11),
        Constraint::Length(7),
        Constraint::Min(10),
    ];
    let (header_cells, rows, len) = match app.view {
        View::Queue => {
            let rows: Vec<Row> = app
                .queue
                .iter()
                .map(|entry| {
                    let style = match entry.status.as_str() {
                        "blocked" => Style::default().fg(Color::Yellow),
                        "failed" | "escalated" => Style::default().fg(Color::Red),
                        "done" => Style::default().fg(Color::Green),
                        _ => Style::default(),
                    };
                    Row::new(vec![
                        Cell::from(entry.id.clone()),
                        Cell::from(entry.status.clone()),
                        Cell::from(entry.gate.clone()),
                        Cell::from(entry.title.clone()),
                    ])
                    .style(style)
                })
                .collect();
            (
                Row::new(vec!["ID", "STATUS", "GATE", "TITLE"])
                    .style(Style::default().fg(Color::DarkGray)),
                rows,
                app.queue.len(),
            )
        }
        View::Gates => {
            let rows: Vec<Row> = app
                .gates
                .iter()
                .map(|gate| {
                    let (label, style) = if gate.approved {
                        ("approved", Style::default().fg(Color::Green))
                    } else {
                        ("WAITING", Style::default().fg(Color::Yellow))
                    };
                    Row::new(vec![
                        Cell::from(gate.task.clone()),
                        Cell::from(label),
                        Cell::from(gate.gate.clone()),
                        Cell::from(gate.title.clone()),
                    ])
                    .style(style)
                })
                .collect();
            (
                Row::new(vec!["TASK", "STATE", "GATE", "TITLE"])
                    .style(Style::default().fg(Color::DarkGray)),
                rows,
                app.gates.len(),
            )
        }
    };

    let table = Table::new(rows, widths)
        .header(header_cells)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(ratatui::widgets::BorderType::Rounded)
                .title(title),
        )
        .row_highlight_style(Style::default().bg(Color::DarkGray).fg(Color::White))
        .highlight_symbol(" ");
    frame.render_stateful_widget(table, outer[1], &mut app.table_state);

    if len == 0 {
        let empty = Paragraph::new(match app.view {
            View::Queue => " no queue briefs",
            View::Gates => " no gates waiting",
        })
        .style(Style::default().fg(Color::DarkGray));
        let area = outer[1];
        let inner = ratatui::layout::Rect {
            x: area.x + 2,
            y: area.y + 2,
            width: area.width.saturating_sub(4),
            height: 1,
        };
        frame.render_widget(empty, inner);
    }

    if let Some(sign_in) = &app.sign_in {
        let area = centered_rect(64, 42, frame.area());
        frame.render_widget(Clear, area);
        let email_line = if sign_in.stage == SignInStage::Email {
            format!("✎ {}", sign_in.email)
        } else {
            format!("  {}", sign_in.email)
        };
        let code_line = if sign_in.stage == SignInStage::Code {
            format!("✎ {}", sign_in.code)
        } else {
            "  -".to_string()
        };
        let mut lines = vec![
            Line::from(Span::styled(
                "Sign in with the email that owns your account.",
                Style::default().fg(Color::DarkGray),
            )),
            Line::from(""),
            Line::from(vec![Span::raw("Email  "), Span::styled(email_line, Style::default().fg(Color::White))]),
            Line::from(vec![Span::raw("Code   "), Span::styled(code_line, Style::default().fg(Color::White))]),
            Line::from(""),
        ];
        if !sign_in.status.is_empty() {
            lines.push(Line::from(Span::styled(
                sign_in.status.clone(),
                Style::default().fg(Color::Yellow),
            )));
            lines.push(Line::from(""));
        }
        lines.push(Line::from(Span::styled(
            "Enter to continue · Backspace to edit · Esc to close",
            Style::default().fg(Color::DarkGray),
        )));
        let block = Block::default()
            .borders(Borders::ALL)
            .border_type(ratatui::widgets::BorderType::Rounded)
            .title(" sign in · the same steps as the app ");
        frame.render_widget(Paragraph::new(lines).block(block), area);
    }

    if let Some(panel) = &app.connect {
        let area = centered_rect(70, 80, frame.area());
        frame.render_widget(Clear, area);
        let mut lines: Vec<Line> = panel
            .lines
            .iter()
            .map(|line| Line::from(Span::raw(line.clone())))
            .collect();
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            panel.url.clone(),
            Style::default().fg(Color::DarkGray),
        )));
        let block = Block::default()
            .borders(Borders::ALL)
            .border_type(ratatui::widgets::BorderType::Rounded)
            .title(" connect a phone · c or Esc to close ");
        frame.render_widget(Paragraph::new(lines).block(block), area);
    }

    // Status bar.
    let summary = app
        .offices
        .get(app.selected)
        .map(|office| {
            format!(
                " {} offices · {} queued · {} dispatched · {} blocked ",
                app.offices.len(),
                office.queue.queued,
                office.queue.dispatched,
                office.queue.blocked
            )
        })
        .unwrap_or_else(|| " no offices ".to_string());
    let hints = match &app.session {
        Some(session) => format!(
            "{} · h/l office · j/k row · v queue/gates · c connect · i account · o sign out · r refresh · q quit ",
            session.email
        ),
        None => "h/l office · j/k row · v queue/gates · c connect · i sign in · r refresh · q quit ".to_string(),
    };
    let status = Paragraph::new(Line::from(vec![
        Span::styled(summary, Style::default().bg(Color::DarkGray).fg(Color::White)),
        Span::styled(format!("{hints:>60}"), Style::default().fg(Color::DarkGray)),
    ]))
    .style(Style::default().bg(Color::DarkGray));
    frame.render_widget(status, outer[2]);
}

fn centered_rect(percent_x: u16, percent_y: u16, area: ratatui::layout::Rect) -> ratatui::layout::Rect {
    let vertical = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Percentage((100 - percent_y) / 2),
            Constraint::Percentage(percent_y),
            Constraint::Percentage((100 - percent_y) / 2),
        ])
        .split(area);
    Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage((100 - percent_x) / 2),
            Constraint::Percentage(percent_x),
            Constraint::Percentage((100 - percent_x) / 2),
        ])
        .split(vertical[1])[1]
}

fn run_tui() -> std::io::Result<i32> {
    if !stdout().is_terminal() {
        print_offices(&discover(&default_roots(), 3));
        return Ok(0);
    }

    enable_raw_mode()?;
    let mut out = stdout();
    execute!(out, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(out);
    let mut terminal = Terminal::new(backend)?;
    let mut app = App::new();
    let result = run_loop(&mut terminal, &mut app);
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    result.map(|_| 0)
}

fn run_loop(terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>, app: &mut App) -> std::io::Result<()> {
    loop {
        terminal.draw(|frame| draw(frame, app))?;

        if event::poll(Duration::from_millis(200))? {
            if let Event::Key(key) = event::read()? {
                if key.kind != KeyEventKind::Press {
                    continue;
                }
                if app.sign_in.is_some() {
                    match key.code {
                        KeyCode::Esc => app.sign_in = None,
                        KeyCode::Enter => app.submit_sign_in(),
                        KeyCode::Backspace => {
                            if let Some(sign_in) = app.sign_in.as_mut() {
                                match sign_in.stage {
                                    SignInStage::Email => {
                                        sign_in.email.pop();
                                    }
                                    SignInStage::Code => {
                                        sign_in.code.pop();
                                    }
                                }
                            }
                        }
                        KeyCode::Char(character) => {
                            if let Some(sign_in) = app.sign_in.as_mut() {
                                match sign_in.stage {
                                    SignInStage::Email => sign_in.email.push(character),
                                    SignInStage::Code => sign_in.code.push(character),
                                }
                            }
                        }
                        _ => {}
                    }
                    continue;
                }
                match key.code {
                    KeyCode::Esc if app.connect.is_some() => app.connect = None,
                    KeyCode::Char('c') => app.toggle_connect(),
                    KeyCode::Char('i') => app.open_sign_in(),
                    KeyCode::Char('o') => app.sign_out(),
                    KeyCode::Char('q') | KeyCode::Esc => app.quit = true,
                    KeyCode::Char('h') | KeyCode::Left => app.previous_office(),
                    KeyCode::Char('l') | KeyCode::Right => app.next_office(),
                    KeyCode::Char('j') | KeyCode::Down => app.table_next(),
                    KeyCode::Char('k') | KeyCode::Up => app.table_previous(),
                    KeyCode::Char('v') => app.toggle_view(),
                    KeyCode::Char('r') => {
                        app.reload();
                        app.message = "refreshed".into();
                    }
                    KeyCode::Char(c) if c.is_ascii_digit() => {
                        let index = c.to_digit(10).unwrap_or(1) as usize;
                        if index >= 1 && index <= app.offices.len() {
                            app.select(index - 1);
                        }
                    }
                    _ => {}
                }
            }
        }

        if app.last_refresh.elapsed() >= REFRESH_EVERY {
            app.reload();
        }

        if app.quit {
            return Ok(());
        }
    }
}

fn main() {
    let cli = Cli::parse();
    let code = match cli.command {
        Some(Command::Offices { root, depth, json }) => cmd_offices(root, depth, json),
        Some(Command::Queue { office, json }) => cmd_queue(&office, json),
        Some(Command::Gates { office, json }) => cmd_gates(&office, json),
        None => match run_tui() {
            Ok(code) => code,
            Err(error) => {
                eprintln!("zollybot-cli: {error}");
                1
            }
        },
    };
    std::process::exit(code);
}
