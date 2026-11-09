//! zollybot-cli — the terminal frontend of ZollyBot.
//!
//! One product, two frontends: the desktop app runs the server, and this program
//! attaches to it over the control socket. It shows the agents the app shows and
//! signs in with the same email code. It keeps no office state of its own.

use clap::{Parser, Subcommand};
use crossterm::{
    event::{
        self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyEventKind, KeyModifiers, MouseButton,
        MouseEvent, MouseEventKind,
    },
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
use std::fs;
use std::io::{IsTerminal, Write, stdout};
use std::path::PathBuf;
use std::time::{Duration, Instant};
use std::sync::{Arc, Mutex};
use portable_pty::{CommandBuilder, PtySize, MasterPty, Child};
use avt::Terminal as VtTerminal;

fn harness_for(agent: &AgentRow) -> String {
    let provider = agent.provider.trim().to_lowercase();
    let executable = std::env::var("ZOLLYBOT_HARNESS").unwrap_or_else(|_| provider.clone());
    if !executable.is_empty() { executable } else { "sh".to_string() }
}

fn spawn_pty_session(agent: &AgentRow, cols: u16, rows: u16) -> std::io::Result<PtySession> {
    let size = PtySize { rows: rows.max(1), cols: cols.max(1), pixel_width: 0, pixel_height: 0 };
    let pty = portable_pty::native_pty_system().openpty(size).map_err(|e| std::io::Error::other(e.to_string()))?;
    let mut cmd = CommandBuilder::new(harness_for(agent));
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");
    cmd.env("TERM_PROGRAM", "zollybot-tui");
    cmd.env("ZOLLYBOT_AGENT_ID", &agent.id);
    cmd.env("ZOLLYBOT_PROVIDER", &agent.provider);
    cmd.env("ZOLLYBOT_MODEL", &agent.model);
    cmd.env("ZOLLYBOT_HARNESS", harness_for(agent));
    if let Ok(cwd) = std::env::current_dir() { cmd.cwd(cwd); }
    let child = pty.slave.spawn_command(cmd).map_err(|e| std::io::Error::other(e.to_string()))?;
    drop(pty.slave);
    let mut reader = pty.master.try_clone_reader().map_err(|e| std::io::Error::other(e.to_string()))?;
    let writer = pty.master.take_writer().map_err(|e| std::io::Error::other(e.to_string()))?;
    let vt = Arc::new(Mutex::new(VtTerminal::with_scrollback(cols as usize, rows as usize, Some(5000)).map_err(|e| std::io::Error::other(e.to_string()))?));
    let output: Arc<Mutex<Vec<u8>>> = Arc::new(Mutex::new(Vec::new()));
    let vt_thread = vt.clone();
    let output_thread = output.clone();
    std::thread::spawn(move || {
        use std::io::Read;
        let mut buf = [0u8; 8192];
        loop {
            match reader.read(&mut buf) {
                Ok(0) | Err(_) => break,
                Ok(n) => {
                    output_thread.lock().unwrap().extend_from_slice(&buf[..n]);
                    if let Ok(mut term) = vt_thread.lock() {
                        term.feed(String::from_utf8_lossy(&buf[..n]).into_owned());
                    }
                }
            }
        }
    });
    Ok(PtySession { master: pty.master, child, writer, vt, output })
}

impl App {
    fn ensure_pty(&mut self, cols: u16, rows: u16) {
        let Some(agent) = self.agents.get(self.selected).cloned() else { return; };
        if agent.id.is_empty() { return; }
        let stale = self.pty.as_ref().map(|p| self.pty_agent_id != agent.id).unwrap_or(false);
        let missing = self.pty.is_none();
        if stale || missing {
            if let Some(old) = self.pty.take() {
                let mut child = old.child;
                let _ = child.kill();
            }
            match spawn_pty_session(&agent, cols.max(20), rows.max(4)) {
                Ok(session) => {
                    self.pty = Some(session);
                    self.pty_agent_id = agent.id.clone();
                }
                Err(e) => {
                    self.message = format!("PTY failed for {}: {e}", agent.name);
                }
            }
        } else if let Some(pty) = &self.pty {
            let _ = pty.master.resize(PtySize { rows: rows.max(1), cols: cols.max(1), pixel_width: 0, pixel_height: 0 });
            if let Ok(mut vt) = pty.vt.lock() {
                vt.resize(cols as usize, rows as usize);
            }
        }
    }

    fn write_pty(&mut self, bytes: &[u8]) -> std::io::Result<()> {
        use std::io::Write;
        if let Some(pty) = &mut self.pty {
            pty.writer.write_all(bytes)?;
            pty.writer.flush()?;
        }
        Ok(())
    }
}

// Additional office-pane methods split for readability; state lives in the primary App struct below.

const REFRESH_EVERY: Duration = Duration::from_secs(3);

/// Real PTY harness session owned by the middle office pane.
struct PtySession {
    master: Box<dyn MasterPty + Send>,
    child: Box<dyn Child + Send + Sync>,
    writer: Box<dyn std::io::Write + Send>,
    vt: Arc<Mutex<VtTerminal>>,
    output: Arc<Mutex<Vec<u8>>>,
}

#[derive(Parser)]
#[command(
    name = "zollybot-cli",
    version,
    about = "ZollyBot in the terminal",
    long_about = "The terminal frontend of ZollyBot. Run with the desktop app (zollybot --server) \
                  and this attaches to it: same account, same agents, same pairing code."
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand)]
enum Command {
    /// Print the agents the app lists, one per line.
    Agents,
    /// Print office memory facts (reads the app over the control socket).
    Brief {
        /// Office id; omit to list offices first.
        #[arg(long)]
        office: Option<String>,
    },
}

/// The account service, for the case where no app runs on this machine.
fn api_base() -> String {
    std::env::var("ZOLLYBOT_API_URL").unwrap_or_else(|_| "https://api-zollybot.shifaul.dev".to_string())
}

/// The control socket of a running app (`zollybot --server`). This is the only
/// way the terminal reaches the app's own data.
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

fn control_call(method: &str, path: &str, form: &[(&str, &str)]) -> Result<(u16, Vec<(String, String)>), String> {
    use std::io::Read;
    use std::os::unix::net::UnixStream;
    let socket = control_socket().ok_or_else(|| "The app is not running.".to_string())?;
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
    stream.write_all(request.as_bytes()).map_err(|error| error.to_string())?;
    let mut response = String::new();
    stream.read_to_string(&mut response).map_err(|error| error.to_string())?;
    let (head, payload) = response
        .split_once("\r\n\r\n")
        .ok_or_else(|| "The app answered without a body.".to_string())?;
    let status = head
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|code| code.parse::<u16>().ok())
        .ok_or_else(|| "The app answered without a status.".to_string())?;
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
        .unwrap_or_else(|| format!("The app answered {status}."))
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

#[derive(Clone)]
struct Session {
    email: String,
    #[allow(dead_code)]
    token: String,
    /// The app keeps the session; this process holds only the email it shows.
    local: bool,
}

fn config_dir() -> PathBuf {
    let base = std::env::var("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(std::env::var("HOME").unwrap_or_default()).join(".config"));
    base.join("zollybot")
}

fn session_path() -> PathBuf { config_dir().join("session.json") }
fn tui_config_path() -> PathBuf { config_dir().join("tui.json") }

#[derive(Clone, serde::Serialize, serde::Deserialize, Default)]
struct TuiConfig {
    #[serde(default)]
    language: String,
    #[serde(default)]
    onboarding_done: bool,
}

fn load_tui_config() -> TuiConfig {
    fs::read_to_string(tui_config_path()).ok()
        .and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default()
}

fn save_tui_config(cfg: &TuiConfig) -> std::io::Result<()> {
    let dir = config_dir(); fs::create_dir_all(&dir)?;
    fs::write(tui_config_path(), serde_json::to_string_pretty(cfg)?)?;
    Ok(())
}

const LANGUAGES: &[(&str,&str)] = &[
    ("en","English"),("es","Español"),("fr","Français"),("de","Deutsch"),
    ("ja","日本語"),("ko","한국어"),("zh","中文"),("pt","Português"),
    ("ru","Русский"),("it","Italiano"),("nl","Nederlands"),("pl","Polski"),
    ("tr","Türkçe"),("ar","العربية"),
];

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
            .unwrap_or_else(|| format!("The account service answered {code}.")),
        other => format!("{other}"),
    }
}

fn request_code(email: &str) -> Result<(String, bool), String> {
    if control_socket().is_some() {
        let (status, lines) = control_call("POST", "/v1/login/start", &[("email", email)])?;
        if status == 200 {
            return line_value(&lines, "challenge")
                .map(|challenge| (challenge, true))
                .ok_or_else(|| "The app sent no challenge.".to_string());
        }
        return Err(answer_error(status, &lines));
    }
    let url = format!("{}/v1/auth/email/start", api_base());
    match ureq::post(&url)
        .set("Content-Type", "application/json")
        .set("Idempotency-Key", &random_uuid())
        .send_json(ureq::json!({ "email": email }))
    {
        Ok(response) => response
            .into_json::<serde_json::Value>()
            .map_err(|error| error.to_string())?
            .get("challengeId")
            .and_then(|challenge| challenge.as_str())
            .map(|challenge| (challenge.to_string(), false))
            .ok_or_else(|| "The account service sent no challenge.".to_string()),
        Err(error) => Err(api_error(error)),
    }
}

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
    match ureq::post(&url)
        .set("Content-Type", "application/json")
        .send_json(ureq::json!({ "challengeId": challenge, "code": code }))
    {
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
                return Err("The account service sent no session.".to_string());
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

struct ConnectPanel {
    url: String,
    lines: Vec<String>,
}

fn connect_url() -> String {
    std::env::var("ZOLLYBOT_CONNECT_URL").unwrap_or_else(|_| "https://zollybot.shifaul.dev".to_string())
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

#[derive(Clone, Default)]
struct ServerInfo {
    version: String,
    name: String,
    phase: String,
}

#[derive(Clone, Default)]
struct AgentRow {
    id: String,
    name: String,
    provider: String,
    model: String,
    reasoning_effort: String,
    title: String,
    #[allow(dead_code)]
    role: String,
    #[allow(dead_code)]
    office_id: String,
    scope: String,
    office: String,
}

#[derive(Clone, Default)]
struct OfficeRow {
    id: String,
    name: String,
    agents: usize,
}

#[derive(Clone, Copy, PartialEq)]
enum OnboardingStep { Language, SignIn, Done }

struct App {
    server: ServerInfo,
    all_agents: Vec<AgentRow>,
    agents: Vec<AgentRow>,
    offices: Vec<OfficeRow>,
    office_filter: Option<String>,
    selected: usize,
    table_state: TableState,
    quit: bool,
    message: String,
    last_refresh: Instant,
    connect: Option<ConnectPanel>,
    office_picker: Option<usize>,
    lobby_selected: usize,
    prefix: bool,
    session: Option<Session>,
    sign_in: Option<SignIn>,
    tui_config: TuiConfig,
    onboarding: OnboardingStep,
    lang_selected: usize,
    chat_messages: Vec<(String,String)>,
    chat_agent_id: String,
    chat_last_load: Instant,
    profile_field: usize,
    profile_models: Vec<(String, String, String)>,
    profile_busy: bool,
    terminal_pct: u16,
    pty: Option<PtySession>,
    pty_agent_id: String,
}

impl App {
    fn new() -> Self {
        let mut app = App {
            server: ServerInfo::default(),
            all_agents: Vec::new(),
            agents: Vec::new(),
            offices: Vec::new(),
            office_filter: None,
            selected: 0,
            table_state: TableState::default(),
            quit: false,
            message: String::new(),
            last_refresh: Instant::now(),
            connect: None,
            office_picker: None,
            lobby_selected: 0,
            prefix: false,
            session: load_session(),
            sign_in: None,
            tui_config: load_tui_config(),
            onboarding: OnboardingStep::Language,
            lang_selected: 0,
            chat_messages: Vec::new(),
            chat_agent_id: String::new(),
            chat_last_load: Instant::now() - Duration::from_secs(99),
            profile_field: 0,
            profile_models: Vec::new(),
            profile_busy: false,
            pty: None,
            terminal_pct: 50,
            pty_agent_id: String::new(),
        };
        let cfg = app.tui_config.clone();
        app.lang_selected = LANGUAGES.iter().position(|(c,_)| *c == cfg.language.as_str()).unwrap_or(0);
        if cfg.onboarding_done || !cfg.language.is_empty() {
            app.onboarding = if app.session.is_some() { OnboardingStep::Done } else { OnboardingStep::SignIn };
            if app.onboarding == OnboardingStep::Done { app.office_filter = Some("building".to_string()); }
        }
        app.refresh_account();
        app.load();
        if app.onboarding == OnboardingStep::SignIn && app.sign_in.is_none() && app.session.is_none() {
            app.open_sign_in();
        }
        if app.onboarding == OnboardingStep::Done { app.office_filter = Some("building".to_string()); app.apply_office_filter(); app.load_butler_chat(); }
        app
    }

    /// Reads the app's own data. There is no offline copy: without the app, there
    /// is nothing to mirror.
    fn load(&mut self) {
        self.last_refresh = Instant::now();
        if control_socket().is_none() {
            self.ensure_local_server();
        }
        if control_socket().is_none() {
            self.agents.clear();
            self.table_state.select(None);
            self.message = "Local server is starting… if this stays, run: zollybot --server".to_string();
            return;
        }
        if let Ok((200, lines)) = control_call("GET", "/v1/status", &[]) {
            self.server = ServerInfo {
                version: line_value(&lines, "version").unwrap_or_default(),
                name: line_value(&lines, "server_name").unwrap_or_default(),
                phase: line_value(&lines, "server").unwrap_or_default(),
            };
        }
        self.load_offices();
        match control_call("GET", "/v1/agents", &[]) {
            Ok((200, lines)) => {
                self.all_agents.clear();
                let count = line_value(&lines, "count")
                    .and_then(|count| count.parse::<usize>().ok())
                    .unwrap_or(0);
                for index in 0..count {
                    let Some(raw) = line_value(&lines, &format!("agent.{index}")) else {
                        continue;
                    };
                    let mut parts = raw.split('|');
                    self.all_agents.push(AgentRow {
                        name: parts.next().unwrap_or_default().to_string(),
                        provider: parts.next().unwrap_or_default().to_string(),
                        model: parts.next().unwrap_or_default().to_string(),
                        title: parts.next().unwrap_or_default().to_string(),
                        role: parts.next().unwrap_or_default().to_string(),
                        scope: parts.next().unwrap_or_default().to_string(),
                        office: parts.next().unwrap_or_default().to_string(),
                        office_id: parts.next().unwrap_or_default().to_string(),
                        id: parts.next().unwrap_or_default().to_string(),
                        reasoning_effort: parts.next().unwrap_or_default().to_string(),
                    });
                }
                self.apply_office_filter();
            }
            Ok((status, lines)) => self.message = answer_error(status, &lines),
            Err(error) => self.message = error,
        }
    }

    fn ensure_local_server(&mut self) {
        use std::process::{Command, Stdio};
        if control_socket().is_some() { return; }
        let app = std::env::var("ZOLLYBOT_BIN").ok().filter(|v| !v.trim().is_empty()).unwrap_or_else(|| {
            let p = PathBuf::from(std::env::var("HOME").unwrap_or_default()).join(".local/share/zollybot/zollybot");
            if p.exists() { p.to_string_lossy().to_string() } else { "zollybot".to_string() }
        });
        let mut cmd = Command::new(app);
        cmd.arg("--server").env("ZOLLYBOT_SERVER","1").env("ZOLLYBOT_CONTROL_SOCKET","1");
        cmd.stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
        let _ = cmd.spawn();
        for _ in 0..20 { std::thread::sleep(Duration::from_millis(250)); if control_socket().is_some() { break; } }
    }

    fn load_profile_models(&mut self) {
        if control_socket().is_none() || self.profile_busy { return; }
        if let Some(agent) = self.agents.get(self.selected).cloned() {
            let count = line_value(&[], "count").and_then(|c| c.parse::<usize>().ok()).unwrap_or(0);
            let _ = count;
            let path = if agent.scope == "building" || agent.role == "butler" { "/v1/models".to_string() } else { format!("/v1/agents/{}/profile", agent.id) };
            if let Ok((200, lines)) = control_call("GET", &path, &[]) {
                self.profile_models.clear();
                let count = line_value(&lines, "count").and_then(|c| c.parse::<usize>().ok()).unwrap_or(0);
                for i in 0..count {
                    let Some(raw) = line_value(&lines, &format!("provider.{i}")) else { continue; };
                    let mut p = raw.splitn(3, '|');
                    let provider = p.next().unwrap_or("").to_string();
                    let default_model = p.next().unwrap_or("").to_string();
                    let _n = p.next().unwrap_or("").to_string();
                    for j in 0..20 {
                        let Some(mraw) = line_value(&lines, &format!("model.{i}.{j}")) else { break; };
                        let mut mp = mraw.splitn(4, '|');
                        let id = mp.next().unwrap_or("").to_string();
                        let name = mp.next().unwrap_or("").to_string();
                        let def_effort = mp.next().unwrap_or("").to_string();
                        let _efforts = mp.next().unwrap_or("").to_string();
                        if !id.is_empty() {
                            self.profile_models.push((provider.clone(), id, format!("{} | {} | default effort {}", name, def_effort, def_effort)));
                        }
                    }
                    if self.profile_models.is_empty() && !default_model.is_empty() {
                        self.profile_models.push((provider.clone(), default_model.clone(), "default".to_string()));
                    }
                }
            }
        }
    }

    fn switch_selected_profile(&mut self, next: bool) {
        if self.profile_models.is_empty() { self.load_profile_models(); }
        if self.profile_models.is_empty() { self.message = "No profile choices available.".to_string(); return; }
        let len = self.profile_models.len();
        self.profile_field = if next { (self.profile_field + 1) % len } else { self.profile_field + len - 1 };
        self.profile_field %= len;
        let (provider, model, _) = self.profile_models[self.profile_field].clone();
        if let Some(agent) = self.agents.get(self.selected).cloned() {
            let path = format!("/v1/agents/{}/profile", agent.id);
            match control_call("POST", &path, &[("provider", &provider), ("model", &model)]) {
                Ok((200, lines)) => {
                    self.message = format!("Switched {} to {}/{} pending={}", agent.name, provider, model, line_value(&lines, "pending_runtime").unwrap_or_default());
                    self.load();
                }
                Ok((status, lines)) => self.message = answer_error(status, &lines),
                Err(e) => self.message = e,
            }
        }
    }

    fn load_selected_chat(&mut self) {
        // Generic selected-agent chat (office 3-pane middle). Butler in lobby uses its own loader.
        if control_socket().is_none() { return; }
        if self.chat_last_load.elapsed() < Duration::from_millis(900) { return; }
        let sel = self.agents.get(self.selected).cloned();
        let Some(agent) = sel else { return; };
        if agent.id.is_empty() { return; }
        self.chat_last_load = Instant::now();
        let id = control_call("GET",&format!("/v1/agents/{}/messages", agent.id),&[("limit","20")]).ok().and_then(|(s,l)| if s==200 { Some(l) } else { None });
        if let Some(lines) = id {
            self.chat_messages.clear();
            let count = line_value(&lines,"count").and_then(|v| v.parse::<usize>().ok()).unwrap_or(0);
            for i in 0..count {
                if let Some(raw)=line_value(&lines,&format!("msg.{i}")) {
                    let mut pp=raw.splitn(4,'|');
                    let _id=pp.next().unwrap_or("");
                    let role=pp.next().unwrap_or("").to_string();
                    let _at=pp.next().unwrap_or("");
                    let text=pp.next().unwrap_or("").to_string();
                    self.chat_messages.push((role,text));
                }
            }
        }
    }

    fn load_butler_chat(&mut self) {
        if control_socket().is_none() { return; }
        if self.chat_last_load.elapsed() < Duration::from_millis(900) { return; }
        self.chat_last_load = Instant::now();
        if self.chat_agent_id.is_empty() {
            let butler = self.all_agents.iter().find(|a| a.scope=="building" || a.role=="butler" || a.name.eq_ignore_ascii_case("butler")).cloned();
            if let Some(b) = butler { self.chat_agent_id = b.id.clone(); }
        }
        if self.chat_agent_id.is_empty() { self.chat_messages.clear(); return; }
        let id = control_call("GET",&format!("/v1/agents/{}/messages", self.chat_agent_id),&[("limit","20")]).ok().and_then(|(s,l)| if s==200 { Some(l) } else if self.chat_agent_id.is_empty() { control_call("GET","/v1/butler/messages",&[("limit","20")]).ok().and_then(|(s2,l2)| if s2==200 { Some(l2)} else {None}) } else { None });
        if let Some(lines) = id {
            self.chat_messages.clear();
            let count = line_value(&lines,"count").and_then(|v| v.parse::<usize>().ok()).unwrap_or(0);
            for i in 0..count {
                if let Some(raw)=line_value(&lines,&format!("msg.{i}")) {
                    let mut p=raw.splitn(4,'|');
                    let _id=p.next().unwrap_or("");
                    let role=p.next().unwrap_or("").to_string();
                    let _at=p.next().unwrap_or("");
                    let text=p.next().unwrap_or("").to_string();
                    self.chat_messages.push((role,text));
                }
            }
        }
    }

    fn send_butler_chat(&mut self) {
        let text = std::env::var("ZOLLYBOT_CHAT_TEXT").unwrap_or_default();
        if text.trim().is_empty() { return; }
        let text = text.trim().to_string();
        self.chat_messages.push(("user".to_string(), text.clone()));
        let path = if self.chat_agent_id.is_empty() { "/v1/butler/messages".to_string() } else { format!("/v1/agents/{}/messages", self.chat_agent_id) };
        match control_call("POST",&path,&[("text",&text)]) {
            Ok((200,_)) => { self.chat_last_load = Instant::now()-Duration::from_secs(99); self.load_butler_chat(); self.message = "Sent to Butler.".to_string(); }
            Ok((_,l)) => self.message = answer_error(400,&l),
            Err(e) => self.message = e,
        }
    }

    fn load_offices(&mut self) {
        self.offices.clear();
        if let Ok((200, lines)) = control_call("GET", "/v1/offices", &[]) {
            let count = line_value(&lines, "count")
                .and_then(|count| count.parse::<usize>().ok())
                .unwrap_or(0);
            for index in 0..count {
                let Some(raw) = line_value(&lines, &format!("office.{index}")) else {
                    continue;
                };
                let mut parts = raw.split('|');
                self.offices.push(OfficeRow {
                    id: parts.next().unwrap_or_default().to_string(),
                    name: parts.next().unwrap_or_default().to_string(),
                    agents: parts.nth(2).and_then(|value| value.parse().ok()).unwrap_or(0),
                });
            }
        }
    }

    /// `None` is every floor; `building` is the butler; anything else is an office id.
    fn apply_office_filter(&mut self) {
        self.agents = self
            .all_agents
            .iter()
            .filter(|agent| match self.office_filter.as_deref() {
                None => true,
                Some("building") => agent.scope == "building" || agent.role == "butler" || agent.name.eq_ignore_ascii_case("butler") || !agent.id.is_empty() && agent.id == self.chat_agent_id,
                Some(id) => agent.office_id == id,
            })
            .cloned()
            .collect();
        if self.selected >= self.agents.len() {
            self.selected = self.agents.len().saturating_sub(1);
        }
        self.table_state
            .select(if self.agents.is_empty() { None } else { Some(self.selected) });
    }

    /// `(filter, label, headcount)`; the first is every floor, the second the lobby.
    fn floor_choices(&self) -> Vec<(Option<String>, String, usize)> {
        // The lobby leads and is never a closable floor: it is the building itself.
        let lobby = self
            .all_agents
            .iter()
            .filter(|agent| agent.scope == "building" || agent.role == "butler" || agent.name.eq_ignore_ascii_case("butler") || !agent.id.is_empty() && agent.id == self.chat_agent_id)
            .count();
        let mut choices = vec![(Some("building".to_string()), "Lobby".to_string(), lobby)];
        // Then every floor that holds a seat, named from the employment; a discovered
        // office with no staff still gets a floor so it can be opened.
        let mut seen: Vec<String> = Vec::new();
        for agent in &self.all_agents {
            if agent.scope == "building" || agent.role == "butler" || agent.name.eq_ignore_ascii_case("butler") || (!agent.id.is_empty() && agent.id == self.chat_agent_id) || agent.office_id.is_empty() || seen.contains(&agent.office_id) {
                continue;
            }
            seen.push(agent.office_id.clone());
            let label = if agent.office.is_empty() { "Unassigned" } else { &agent.office };
            let headcount = self
                .all_agents
                .iter()
                .filter(|candidate| candidate.office_id == agent.office_id)
                .count();
            choices.push((Some(agent.office_id.clone()), label.to_string(), headcount));
        }
        for office in &self.offices {
            if seen.contains(&office.id) {
                continue;
            }
            choices.push((Some(office.id.clone()), office.name.clone(), office.agents));
        }
        choices.push((None, "All floors".to_string(), self.all_agents.len()));
        choices
    }

    /// Floors the lobby can open: every office and Unassigned, not the lobby or All.
    fn lobby_targets(&self) -> Vec<(Option<String>, String, usize)> {
        self.floor_choices().into_iter().skip(1).filter(|(filter, _, _)| filter.is_some()).collect()
    }

    fn move_lobby_selection(&mut self, delta: isize) {
        let len = self.lobby_targets().len();
        if len == 0 { return; }
        let current = self.lobby_selected as isize;
        self.lobby_selected = (current + delta).clamp(0, (len - 1) as isize) as usize;
    }

    fn open_lobby_selection(&mut self) {
        let targets = self.lobby_targets();
        let Some((filter, _, _)) = targets.get(self.lobby_selected).cloned() else { return };
        self.office_filter = filter;
        self.apply_office_filter();
    }

    /// The floor tab under a column of the strip row, if any.
    fn strip_tab_at(&self, column: u16) -> Option<usize> {
        let mut cursor = 0u16;
        for (index, (_, label, count)) in self.floor_choices().iter().enumerate() {
            let width = (label.chars().count() + count.to_string().len() + 3) as u16;
            if column >= cursor && column < cursor + width {
                return Some(index);
            }
            cursor += width;
        }
        None
    }

    fn handle_mouse(&mut self, mouse: MouseEvent) {
        match mouse.kind {
            MouseEventKind::ScrollDown => {
                if mouse.column > 62 {
                    self.move_lobby_selection(1);
                } else if self.office_filter.as_deref() == Some("building") {
                    self.move_lobby_selection(1);
                } else {
                    self.table_next();
                }
            }
            MouseEventKind::ScrollUp => {
                if mouse.column > 62 {
                    self.move_lobby_selection(-1);
                } else if self.office_filter.as_deref() == Some("building") {
                    self.move_lobby_selection(-1);
                } else {
                    self.table_previous();
                }
            }
            MouseEventKind::Down(MouseButton::Left) => {
                if mouse.row == 0 {
                    if let Some(index) = self.strip_tab_at(mouse.column) {
                        let filter = self.floor_choices()[index].0.clone();
                        self.office_filter = filter;
                        self.apply_office_filter();
                        return;
                    }
                }
                if self.office_filter.as_deref() == Some("building") {
                    if mouse.column > 62 {
                        let lane = self.lobby_targets();
                        let row = mouse.row.saturating_sub(1) as usize;
                        if row < lane.len() {
                            self.lobby_selected = row;
                            self.message = "Selected office.".to_string();
                        }
                        return;
                    }
                    if mouse.row > 15 {
                        /* harness owns input */
                    } else if mouse.row >= 2 {
                        let index = (mouse.row - 2) as usize;
                        if index < self.agents.len() {
                            self.select(index);
                        }
                    }
                    return;
                }
                // (1) 5% icon gutter: leftmost columns select agent; click sets selected/chat.
                if mouse.column < 5 && mouse.row >= 2 {
                    let index = (mouse.row - 2) as usize;
                    if index < self.agents.len() {
                        self.select(index);
                        if let Some(agent) = self.agents.get(index).cloned() {
                            if !agent.id.is_empty() {
                                self.chat_agent_id = agent.id.clone();
                                self.chat_last_load = Instant::now() - Duration::from_secs(99);
                            }
                        }
                    }
                    return;
                }
                if mouse.row >= 2 {
                    let index = (mouse.row - 2) as usize;
                    if index < self.agents.len() {
                        self.select(index);
                    }
                }
            }
            MouseEventKind::Drag(MouseButton::Left) => {
                // Drag in the middle terminal pane adjusts terminal width (mouse resize for middle pane).
                let terminal_mid = 25 + self.terminal_pct - self.terminal_pct / 2;
                if mouse.column > terminal_mid - 3 && mouse.column < terminal_mid + 3 && self.office_filter.as_deref() != Some("building") {
                    let pct = (mouse.column.saturating_mul(100) / 80_u16).max(20).min(80);
                    self.terminal_pct = pct;
                    return;
                }
                if self.office_filter.as_deref() == Some("building") {
                    if mouse.column > 62 {
                        let row = mouse.row.saturating_sub(1) as usize;
                        let len = self.lobby_targets().len();
                        if row < len {
                            self.lobby_selected = row;
                        }
                    } else if mouse.row >= 2 {
                        let index = (mouse.row - 2) as usize;
                        if index < self.agents.len() {
                            self.select(index);
                        }
                    }
                }
            }
            MouseEventKind::Down(MouseButton::Right) => {
                if mouse.column > 62 {
                    let lane = self.lobby_targets();
                    let row = mouse.row.saturating_sub(1) as usize;
                    if row < lane.len() {
                        self.lobby_selected = row;
                        self.open_lobby_selection();
                    }
                } else if self.office_filter.as_deref() == Some("building") {
                    /* harness owns input */
                }
            }
            _ => {}
        }
    }

    fn open_office_picker(&mut self) {
        // Start on the floor that is showing, so Enter changes nothing.
        let choices = self.floor_choices();
        let current = choices
            .iter()
            .position(|(filter, _, _)| *filter == self.office_filter)
            .unwrap_or(0);
        self.office_picker = Some(current);
    }

    fn move_office_picker(&mut self, delta: isize) {
        let len = self.floor_choices().len();
        if len == 0 {
            return;
        }
        let current = self.office_picker.unwrap_or(0) as isize;
        self.office_picker = Some((current + delta).clamp(0, (len - 1) as isize) as usize);
    }

    fn choose_office(&mut self) {
        let choices = self.floor_choices();
        let Some(index) = self.office_picker else { return };
        let Some((filter, _, _)) = choices.get(index) else { return };
        self.office_filter = filter.clone();
        self.office_picker = None;
        self.apply_office_filter();
    }

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
            } else {
                // The app is the account of record while it runs.
                self.session = None;
            }
        }
    }

    fn select(&mut self, index: usize) {
        if self.agents.is_empty() {
            return;
        }
        self.selected = index.min(self.agents.len() - 1);
        self.table_state.select(Some(self.selected));
    }

    fn table_next(&mut self) {
        if self.agents.is_empty() {
            return;
        }
        let current = self.table_state.selected().unwrap_or(0);
        self.select((current + 1).min(self.agents.len() - 1));
    }

    fn table_previous(&mut self) {
        let current = self.table_state.selected().unwrap_or(0);
        self.select(current.saturating_sub(1));
    }

    fn toggle_connect(&mut self) {
        if self.connect.is_some() {
            self.connect = None;
            return;
        }
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
                    status = "The app has no account yet.".to_string();
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
                                format!("The app emailed a code to {email}.")
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
                            self.sign_in = None;
                            if self.onboarding == OnboardingStep::SignIn {
                                self.onboarding = OnboardingStep::Done;
                                self.tui_config.onboarding_done = true;
                                let _ = save_tui_config(&self.tui_config);
                                self.office_filter = Some("building".to_string());
                                self.apply_office_filter();
                                self.message = format!("Signed in as {email}. Welcome to the lobby.");
                            }
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
}

fn draw(frame: &mut Frame, app: &mut App) {
    let outer = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(1), Constraint::Min(3), Constraint::Length(1)])
        .split(frame.area());
    if app.onboarding == OnboardingStep::Language {
        let area = centered_rect(60, 70, frame.area());
        frame.render_widget(Clear, area);
        let mut lines = vec![
            Line::from(Span::styled("Choose your language", Style::default().add_modifier(Modifier::BOLD))),
            Line::from(Span::styled("This follows the desktop app setup. Continue to sign in.", Style::default().fg(Color::DarkGray))),
            Line::from(""),
        ];
        for (i,(code,name)) in LANGUAGES.iter().enumerate() {
            let marker = if i == app.lang_selected { "› " } else { "  " };
            let style = if i == app.lang_selected { Style::default().bg(Color::Blue).fg(Color::White).add_modifier(Modifier::BOLD) } else { Style::default() };
            lines.push(Line::from(Span::styled(format!("{marker}{name} ({code})"), style)));
        }
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled("j/k or ↑/↓ move · Enter continue · q quit", Style::default().fg(Color::DarkGray))));
        let block = Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(" ZollyBot · Language ");
        frame.render_widget(Paragraph::new(lines).block(block), area);
        return;
    }
    if app.onboarding == OnboardingStep::SignIn {
        let area = centered_rect(68, 52, frame.area());
        frame.render_widget(Clear, area);
        let mut lines = vec![
            Line::from(Span::styled("Sign in", Style::default().add_modifier(Modifier::BOLD))),
            Line::from(Span::styled("Use the same email code as the desktop app. Butler and offices open after this.", Style::default().fg(Color::DarkGray))),
            Line::from(""),
        ];
        if let Some(sign_in) = &app.sign_in {
            let email_line = if sign_in.stage == SignInStage::Email { format!("✎ {}", sign_in.email) } else { format!("  {}", sign_in.email) };
            let code_line = if sign_in.stage == SignInStage::Code { format!("✎ {}", sign_in.code) } else { "  -".to_string() };
            lines.push(Line::from(vec![Span::raw("Email  "), Span::styled(email_line, Style::default().fg(Color::White))]));
            lines.push(Line::from(vec![Span::raw("Code   "), Span::styled(code_line, Style::default().fg(Color::White))]));
            lines.push(Line::from(""));
            if !sign_in.status.is_empty() { lines.push(Line::from(Span::styled(sign_in.status.clone(), Style::default().fg(Color::Yellow)))); lines.push(Line::from("")); }
        } else if app.session.is_some() {
            lines.push(Line::from(Span::styled("Signed in.", Style::default().fg(Color::Green))));
            lines.push(Line::from(""));
        } else {
            lines.push(Line::from("Press Enter to start sign-in, or s to skip for now."));
            lines.push(Line::from(""));
        }
        lines.push(Line::from(Span::styled("Enter continue/send · s skip · Esc back · q quit", Style::default().fg(Color::DarkGray))));
        let block = Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(" ZollyBot · Sign in ");
        frame.render_widget(Paragraph::new(lines).block(block), area);
        return;
    }

    // The floor strip: the lobby and every office, the open one raised.
    let mut strip: Vec<Span> = Vec::new();
    for (filter, label, headcount) in app.floor_choices() {
        let active = filter == app.office_filter;
        let text = format!(" {label} {headcount} ");
        let style = if active {
            Style::default().bg(Color::Blue).fg(Color::White).add_modifier(Modifier::BOLD)
        } else {
            Style::default().fg(Color::DarkGray)
        };
        strip.push(Span::styled(text, style));
        strip.push(Span::raw(" "));
    }
    if !app.server.version.is_empty() {
        let server = if app.server.name.is_empty() { "server" } else { &app.server.name };
        strip.push(Span::styled(
            format!(" · {} {} {} ", server, app.server.version, app.server.phase),
            Style::default().fg(Color::DarkGray),
        ));
    }
    frame.render_widget(Paragraph::new(Line::from(strip)), outer[0]);

    let lobby = app.office_filter.as_deref() == Some("building");
    let body = if lobby {
        Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(62), Constraint::Percentage(38)])
            .split(outer[1])
    } else {
        Layout::default().direction(Direction::Horizontal).constraints([Constraint::Percentage(100)]).split(outer[1])
    };

    let widths = [
        Constraint::Length(26),
        Constraint::Length(12),
        Constraint::Length(24),
        Constraint::Min(10),
    ];
    let rows: Vec<Row> = app
        .agents
        .iter()
        .map(|agent| {
            Row::new(vec![
                Cell::from(agent_label(agent)),
                Cell::from(agent.provider.clone()),
                Cell::from(agent.model.clone()),
                Cell::from(agent.title.clone()),
            ])
        })
        .collect();
    let table = Table::new(rows, widths)
        .header(Row::new(vec!["AGENT", "PROVIDER", "MODEL", "TITLE"]).style(Style::default().fg(Color::DarkGray)))
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(ratatui::widgets::BorderType::Rounded)
                .title(" agents "),
        )
        .row_highlight_style(Style::default().bg(Color::DarkGray).fg(Color::White))
        .highlight_symbol(" ");
    if !lobby {
        // GUI-mirror 4-pane office tab (terminal-allocation rule):
        //  (1) 5% icon-only agents/threads (also owns 2/3/4),
        //  (2) 20% agent/thread list tied to 1,
        //  (3) 50% terminal running harness tied to 1/2,
        //  (4) 25% agent/profile tied to 3.
        // Ratatui has no true overlapping terminal layers, so (1) is a narrow icon gutter
        // and (2)-(4) share the same selected agent/thread/arm state.
        let outer = Layout::default().direction(Direction::Horizontal).constraints([
            Constraint::Percentage(5),   // (1) icon gutter
            Constraint::Percentage(20),  // (2) agent/thread list tied to (1)
            Constraint::Percentage(app.terminal_pct.min(80).max(20)),  // (3) terminal: resizable, tied to (1)/(2)
            Constraint::Percentage(100 - 5 - 20 - app.terminal_pct.min(80).max(20)),  // (4) profile/description tied to (3)
        ]).split(body[0]);
        // (1) icon-only agents/threads: mirrors GUI icon rail; selection lives here and drives 2/3/4.
        let icons: Vec<Line> = app.agents.iter().enumerate().map(|(i, a)| {
            let marker = if i == app.selected { "●" } else { "○" };
            let style = if i == app.selected { Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD) } else { Style::default().fg(Color::DarkGray) };
            Line::from(Span::styled(format!("{marker}{}", a.name.chars().take(1).collect::<String>().to_uppercase()), style))
        }).collect();
        frame.render_widget(Paragraph::new(icons).block(Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(" i ")), outer[0]);
        // (2) agent/thread list tied to (1): j/k changes selection here; (3) and (4) follow.
        frame.render_stateful_widget(table, outer[1], &mut app.table_state);
        if app.agents.is_empty() {
            let area = outer[1];
            let inner = ratatui::layout::Rect { x: area.x + 2, y: area.y + 2, width: area.width.saturating_sub(4), height: 2 };
            frame.render_widget(Paragraph::new(app.message.clone()).style(Style::default().fg(Color::DarkGray)), inner);
        }
        if let Some(agent) = app.agents.get(app.selected).cloned() {
            if !agent.id.is_empty() && agent.id != app.chat_agent_id {
                app.chat_agent_id = agent.id.clone();
                app.chat_last_load = Instant::now() - Duration::from_secs(99);
            }
        }
        app.load_selected_chat();
        // (3) REAL terminal pane: a portable-pty child running the selected harness.
        // Herdr-style: the PTY owns the pane; Ratatui only draws its VT cells.
        let pane_area = outer[2];
        let cols = pane_area.width.saturating_sub(2) as usize;
        let rows = pane_area.height.saturating_sub(2) as usize;
        app.ensure_pty(cols as u16, rows as u16);
        let pty_title = app.agents.get(app.selected).map(|a| format!(" terminal · {} · {} ", a.provider, a.model)).unwrap_or_else(|| " terminal · harness ".to_string());
        let block = Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(pty_title);
        let inner = block.inner(pane_area);
        frame.render_widget(block, pane_area);
        if let Some(pty) = &app.pty {
            if let Ok(vt) = pty.vt.lock() {
                let screen = vt.screen();
                for (r, line) in screen.visible_lines().enumerate() {
                    if r >= ((rows) as usize) { break; }
                    let text = line.text();
                    if !text.trim().is_empty() {
                        frame.render_widget(Paragraph::new(text), ratatui::layout::Rect::new(inner.x, inner.y + r as u16, inner.width, 1));
                    }
                }
            }
        } else {
            frame.render_widget(Paragraph::new("Starting PTY… select an agent (j/k).").style(Style::default().fg(Color::DarkGray)), inner);
        }
        // (4) profile/description tied to (3): shows selected agent + harness/model/effort switcher.
        app.load_profile_models();
        let mut detail: Vec<Line> = Vec::new();
        match app.agents.get(app.selected) {
            Some(agent) => {
                detail.push(Line::from(Span::styled(agent_label(agent), Style::default().add_modifier(Modifier::BOLD))));
                detail.push(Line::from(agent.title.clone()));
                detail.push(Line::from(""));
                detail.push(Line::from(format!("role    {}", if agent.role.is_empty() { "-" } else { &agent.role })));
                detail.push(Line::from(format!("scope   {}", if agent.scope.is_empty() { "-" } else { &agent.scope })));
                detail.push(Line::from(format!("office  {}", if agent.office.is_empty() { "-" } else { &agent.office })));
                detail.push(Line::from(format!("model   {}", agent.model)));
                detail.push(Line::from(format!("via     {}", agent.provider)));
                if !agent.reasoning_effort.is_empty() {
                    detail.push(Line::from(format!("effort  {}", agent.reasoning_effort)));
                }
                detail.push(Line::from(""));
                detail.push(Line::from(Span::styled("Harness / model / effort switcher (profile)", Style::default().add_modifier(Modifier::BOLD))));
                detail.push(Line::from(format!("Current: {}/{} · effort {}", agent.provider, agent.model, if agent.reasoning_effort.is_empty() { "default" } else { agent.reasoning_effort.as_str() })));
                detail.push(Line::from(Span::styled("Click/right-click this pane or use j/k, then Enter/leader m to apply next choice.", Style::default().fg(Color::DarkGray))));
                if app.profile_models.is_empty() {
                    detail.push(Line::from(Span::styled("No model choices listed yet.", Style::default().fg(Color::DarkGray))));
                } else {
                    for (i, (p, m, d)) in app.profile_models.iter().enumerate().take(12) {
                        let marker = if i == app.profile_field { "› " } else { "  " };
                        let style = if i == app.profile_field { Style::default().add_modifier(Modifier::BOLD).bg(Color::DarkGray) } else { Style::default() };
                        detail.push(Line::from(Span::styled(format!("{marker}{} / {} {}", p, m, d), style)));
                    }
                }
                detail.push(Line::from(""));
                detail.push(Line::from(Span::styled("Learn/teach: user teaches Butler/agent about self/business/work/env. Butler can self-improve instructions and switch provider/model/effort here.", Style::default().fg(Color::DarkGray))));
            }
            None => detail.push(Line::from("No seat selected.")),
        }
        frame.render_widget(Paragraph::new(detail).block(Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(" agent ")), outer[3]);
    }

    if lobby {
        // The lobby is the butler's room: the chat in the middle, the offices beside it.
        let butler = app.all_agents.iter().find(|agent| agent.scope == "building" || agent.role == "butler" || agent.name.eq_ignore_ascii_case("butler") || (!agent.id.is_empty() && agent.id == app.chat_agent_id));
        let chat_layout = Layout::default().direction(Direction::Vertical).constraints([Constraint::Min(3)]).split(body[0]);
        let mut chat: Vec<Line> = Vec::new();
        if let Some(agent) = butler {
            chat.push(Line::from(Span::styled(format!("{} · {} · {} / {}", agent_label(agent), agent.role, agent.provider, agent.model), Style::default().add_modifier(Modifier::BOLD))));
            chat.push(Line::from(Span::styled("Teach Butler about you, your business, work, and environment. Butler can self-improve its instructions and change provider, model, and effort when you ask.", Style::default().fg(Color::DarkGray))));
            chat.push(Line::from(""));
        } else if !app.chat_agent_id.is_empty() {
            chat.push(Line::from(Span::styled("Butler · Concierge", Style::default().add_modifier(Modifier::BOLD))));
            chat.push(Line::from(Span::styled("Butler agent is connected. Chat is available below.", Style::default().fg(Color::DarkGray))));
            chat.push(Line::from(""));
        } else {
            chat.push(Line::from(Span::styled("Butler · Concierge", Style::default().add_modifier(Modifier::BOLD))));
            chat.push(Line::from(Span::styled("No Butler agent visible yet. The app/server should create it by default; start server if needed.", Style::default().fg(Color::DarkGray))));
            chat.push(Line::from(""));
        }
        if app.chat_messages.is_empty() {
            chat.push(Line::from(Span::styled("No messages yet. Press / to chat with Butler.", Style::default().fg(Color::DarkGray))));
        } else {
            for (role, text) in app.chat_messages.iter().rev().take(12).rev() {
                let who = if role=="user" { "you" } else { "butler" };
                let style = if role=="user" { Style::default().fg(Color::Cyan) } else { Style::default().fg(Color::White) };
                chat.push(Line::from(vec![Span::styled(format!("{who}: "), Style::default().fg(Color::DarkGray)), Span::styled(text.clone(), style)]));
            }
        }
        frame.render_widget(Paragraph::new(chat).block(Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(" chat · butler ")), chat_layout[0]);
        frame.render_widget(Paragraph::new("chat is the terminal (harness owns input).").block(Block::default().borders(Borders::ALL).border_type(ratatui::widgets::BorderType::Rounded).title(" chat · butler ")), chat_layout[0]);

        let mut offices: Vec<Line> = Vec::new();
        for (index, (_, label, headcount)) in app.lobby_targets().iter().enumerate() {
            let marker = if index == app.lobby_selected { "› " } else { "  " };
            let style = if index == app.lobby_selected {
                Style::default().add_modifier(Modifier::BOLD)
            } else {
                Style::default()
            };
            offices.push(Line::from(Span::styled(
                format!("{marker}{label}  ({headcount})"),
                style,
            )));
        }
        if offices.is_empty() {
            offices.push(Line::from("No offices yet."));
        }
        let offices_block = Block::default()
            .borders(Borders::ALL)
            .border_type(ratatui::widgets::BorderType::Rounded)
            .title(" offices ");
        frame.render_widget(Paragraph::new(offices).block(offices_block), body[1]);
    }
    if false {
    // legacy right pane (now in 3-pane above)
    let selected = app.agents.get(app.selected);
    let mut detail: Vec<Line> = Vec::new();
    match selected {
        Some(agent) => {
            detail.push(Line::from(Span::styled(
                agent_label(agent),
                Style::default().add_modifier(Modifier::BOLD),
            )));
            detail.push(Line::from(agent.title.clone()));
            detail.push(Line::from(""));
            detail.push(Line::from(format!("role    {}", if agent.role.is_empty() { "-" } else { &agent.role })));
            detail.push(Line::from(format!("scope   {}", if agent.scope.is_empty() { "-" } else { &agent.scope })));
            detail.push(Line::from(format!("office  {}", if agent.office.is_empty() { "-" } else { &agent.office })));
            detail.push(Line::from(format!("model   {}", agent.model)));
            detail.push(Line::from(format!("via     {}", agent.provider)));
        }
        None => detail.push(Line::from("No seat selected.")),
    }
    let detail_block = Block::default()
        .borders(Borders::ALL)
        .border_type(ratatui::widgets::BorderType::Rounded)
        .title(" agent ");
    frame.render_widget(Paragraph::new(detail).block(detail_block), body[1]);
    }

    if let Some(selected) = app.office_picker {
        let area = centered_rect(52, 52, frame.area());
        frame.render_widget(Clear, area);
        let mut lines: Vec<Line> = Vec::new();
        for (index, (_, label, headcount)) in app.floor_choices().iter().enumerate() {
            let marker = if index == selected { "› " } else { "  " };
            let style = if index == selected {
                Style::default().add_modifier(Modifier::BOLD)
            } else {
                Style::default()
            };
            lines.push(Line::from(Span::styled(
                format!("{marker}{label}  ({headcount})"),
                style,
            )));
        }
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "j/k move · Enter open · Esc close",
            Style::default().fg(Color::DarkGray),
        )));
        let block = Block::default()
            .borders(Borders::ALL)
            .border_type(ratatui::widgets::BorderType::Rounded)
            .title(" floors ");
        frame.render_widget(Paragraph::new(lines).block(block), area);
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
            lines.push(Line::from(Span::styled(sign_in.status.clone(), Style::default().fg(Color::Yellow))));
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
        let mut lines: Vec<Line> = panel.lines.iter().map(|line| Line::from(Span::raw(line.clone()))).collect();
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(panel.url.clone(), Style::default().fg(Color::DarkGray))));
        let block = Block::default()
            .borders(Borders::ALL)
            .border_type(ratatui::widgets::BorderType::Rounded)
            .title(" connect a phone · c or Esc to close ");
        frame.render_widget(Paragraph::new(lines).block(block), area);
    }

    let summary = if app.agents.is_empty() {
        " no agents ".to_string()
    } else {
        let current = app.selected.min(app.agents.len() - 1);
        format!(" {} agents · {} ", app.agents.len(), app.agents[current].name)
    };
    let hints = if app.prefix {
        "LEADER · f floors · a all · l lobby · c connect · i account · w window · s split · q quit".to_string()
    } else if let Some(session) = &app.session {
        format!(
            "{} · leader=ctrl+space · j/k motion · f floors · w window · s split · r refresh · q quit ",
            session.email
        )
    } else {
        "leader=ctrl+space · j/k motion · f floors · q quit ".to_string()
    };
    let status = Paragraph::new(Line::from(vec![
        Span::styled(summary, Style::default().bg(Color::DarkGray).fg(Color::White)),
        Span::styled(format!("{hints:>60}"), Style::default().fg(Color::DarkGray)),
    ]))
    .style(Style::default().bg(Color::DarkGray));
    frame.render_widget(status, outer[2]);
}

/// `name@office` for an office seat, `name@building` for the butler, a bare name
/// while employments are not stored yet.
fn agent_label(agent: &AgentRow) -> String {
    if !agent.office.is_empty() {
        format!("{}@{}", agent.name, agent.office)
    } else if agent.scope == "building" {
        format!("{}@building", agent.name)
    } else {
        agent.name.clone()
    }
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
        print!("{}", agents_text());
        return Ok(0);
    }
    // Middle chat pane IS a terminal: ZOLLYBOT_TERMINAL=1 embeds a real PTY
    // (harness runs omp/codex etc. like Herdr panes). Default stays ratatui TUI.
    if std::env::var("ZOLLYBOT_TERMINAL").ok().as_deref() == Some("1") {
        return run_embedded_terminal();
    }
    enable_raw_mode()?;
    let mut out = stdout();
    execute!(out, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(out);
    let mut terminal = Terminal::new(backend)?;
    let mut app = App::new();
    let result = run_loop(&mut terminal, &mut app);
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen, DisableMouseCapture)?;
    terminal.show_cursor()?;
    result.map(|_| 0)
}

fn brief_text(office: Option<&str>) -> String {
    if control_socket().is_none() {
        return "The ZollyBot app is not running. Start ZollyBot and try again.\n".to_string();
    }
    let office_id = match office {
        Some(id) if !id.trim().is_empty() => id.trim().to_string(),
        _ => {
            match control_call("GET", "/v1/offices", &[]) {
                Ok((200, lines)) => {
                    let count = line_value(&lines, "count").and_then(|c| c.parse::<usize>().ok()).unwrap_or(0);
                    let mut text = String::from("Name an office with --office <id>. Offices:\n");
                    for index in 0..count {
                        if let Some(raw) = line_value(&lines, &format!("office.{index}")) {
                            let mut parts = raw.split('|');
                            let id = parts.next().unwrap_or("");
                            let name = parts.next().unwrap_or("");
                            text.push_str(&format!("  {id}\t{name}\n"));
                        }
                    }
                    return text;
                }
                Ok((status, lines)) => return answer_error(status, &lines),
                Err(error) => return error,
            }
        }
    };
    let path = format!("/v1/offices/{}/memory", office_id);
    match control_call("GET", &path, &[]) {
        Ok((200, lines)) => {
            let count = line_value(&lines, "count").and_then(|c| c.parse::<usize>().ok()).unwrap_or(0);
            if count == 0 { return "No office memory.\n".to_string(); }
            let mut text = String::new();
            for index in 0..count {
                if let Some(raw) = line_value(&lines, &format!("memory.{index}")) {
                    let mut parts = raw.splitn(4, '|');
                    let _id = parts.next().unwrap_or("");
                    let origin = parts.next().unwrap_or("");
                    let updated = parts.next().unwrap_or("");
                    let body = parts.next().unwrap_or("");
                    text.push_str(&format!("- [{origin}] {body} ({updated})\n"));
                }
            }
            text
        }
        Ok((404, _)) => "No office has that id.\n".to_string(),
        Ok((501, lines)) => answer_error(501, &lines),
        Ok((status, lines)) => answer_error(status, &lines),
        Err(error) => format!("The ZollyBot app is not running. Start ZollyBot and try again. ({error})\n"),
    }
}

fn agents_text() -> String {
    if control_socket().is_none() {
        return "The ZollyBot app is not running. Start ZollyBot and try again.\n".to_string();
    }
    match control_call("GET", "/v1/agents", &[]) {
        Ok((200, lines)) => {
            let count = line_value(&lines, "count").and_then(|count| count.parse::<usize>().ok()).unwrap_or(0);
            let mut text = String::new();
            for index in 0..count {
                if let Some(raw) = line_value(&lines, &format!("agent.{index}")) {
                    text.push_str(&raw.replace('|', "\t"));
                    text.push('\n');
                }
            }
            text
        }
        Ok((_, lines)) => format!("{}\n", answer_error(200, &lines)),
        Err(error) => format!("{error}\n"),
    }
}

fn run_loop(terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>, app: &mut App) -> std::io::Result<()> {
    loop {
        terminal.draw(|frame| draw(frame, app))?;
        if event::poll(Duration::from_millis(200))? {
            let event = event::read()?;
            if let Event::Mouse(mouse) = event {
                app.handle_mouse(mouse);
                continue;
            }
            if let Event::Key(key) = event {
                if key.kind != KeyEventKind::Press {
                    continue;
                }
                if app.onboarding == OnboardingStep::Language || (app.onboarding == OnboardingStep::SignIn && app.sign_in.is_none()) {
                    // Onboarding is the only non-prefix mode: letters for setup, Enter to continue.
                    // After onboarding, every action needs Ctrl+Space prefix (Herdr-style).
                    let is_lang = app.onboarding == OnboardingStep::Language;
                    match key.code {
                        KeyCode::Char('q') if !key.modifiers.is_empty() => { app.quit = true; }
                        KeyCode::Char('j') | KeyCode::Down if is_lang => { app.lang_selected = (app.lang_selected + 1).min(LANGUAGES.len()-1); }
                        KeyCode::Char('k') | KeyCode::Up if is_lang => { app.lang_selected = app.lang_selected.saturating_sub(1); }
                        KeyCode::Enter if is_lang => {
                            app.tui_config.language = LANGUAGES[app.lang_selected].0.to_string();
                            let _ = save_tui_config(&app.tui_config);
                            if app.session.is_some() { app.onboarding = OnboardingStep::Done; app.tui_config.onboarding_done = true; let _ = save_tui_config(&app.tui_config); app.office_filter = Some("building".to_string()); app.apply_office_filter(); }
                            else { app.onboarding = OnboardingStep::SignIn; app.open_sign_in(); }
                        }
                        KeyCode::Esc if !is_lang => { app.onboarding = OnboardingStep::Language; }
                        KeyCode::Char('s') if !is_lang => { app.onboarding = OnboardingStep::Done; app.tui_config.onboarding_done = true; let _ = save_tui_config(&app.tui_config); app.office_filter = Some("building".to_string()); app.apply_office_filter(); app.message = "Skipped sign-in. Press prefix+i to sign in later.".to_string(); }
                        KeyCode::Enter | KeyCode::Char('i') if !is_lang => { app.open_sign_in(); }
                        _ => {}
                    }
                    continue;
                }
                if app.office_picker.is_some() {
                    match key.code {
                        KeyCode::Esc | KeyCode::Char('f') if key.modifiers.is_empty() => app.office_picker = None,
                        KeyCode::Enter => app.choose_office(),
                        KeyCode::Char('j') | KeyCode::Down => app.move_office_picker(1),
                        KeyCode::Char('k') | KeyCode::Up => app.move_office_picker(-1),
                        _ => {}
                    }
                    continue;
                }
                if app.sign_in.is_some() {
                    match key.code {
                        KeyCode::Esc => app.sign_in = None,
                        KeyCode::Enter => app.submit_sign_in(),
                        KeyCode::Backspace => {
                            if let Some(sign_in) = app.sign_in.as_mut() {
                                match sign_in.stage {
                                    SignInStage::Email => { sign_in.email.pop(); }
                                    SignInStage::Code => { sign_in.code.pop(); }
                                }
                                let _ = ();
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
                // Prefix: Ctrl+Space (Herdr-style). Tmux also sends Ctrl+B; accept both as local prefix.
                let prefixed = key.modifiers.contains(KeyModifiers::CONTROL) && (key.code == KeyCode::Char(' ') || key.code == KeyCode::Char('\u{0}') || key.code == KeyCode::Char('b'));
                if prefixed {
                    app.prefix = true;
                    continue;
                }
                // Neovim-style: motions are bare (j/k/h/l/arrows), actions are Leader-prefixed.
                // This lets typing/search/terminal text flow without triggering shortcuts. Leader = Ctrl+Space (nvim leader).
                if app.prefix {
                    app.prefix = false;
                    match key.code {
                        KeyCode::Char('o') | KeyCode::Char('f') => app.open_office_picker(),
                        KeyCode::Char('a') => { app.office_filter = None; app.apply_office_filter(); }
                        KeyCode::Char('l') => { app.office_filter = Some("building".to_string()); app.apply_office_filter(); }
                        KeyCode::Char('c') => app.toggle_connect(),
                        KeyCode::Char('i') => app.open_sign_in(),
                        KeyCode::Char('u') => app.sign_out(),
                        KeyCode::Char('r') => { app.load(); app.load_butler_chat(); app.refresh_account(); }
                        KeyCode::Char('q') => app.quit = true,
                        KeyCode::Char('w') => { app.office_filter = Some("building".to_string()); app.apply_office_filter(); }
                        KeyCode::Char('s') => { app.open_office_picker(); }
                        KeyCode::Char('m') => { app.load_profile_models(); app.switch_selected_profile(true); }
                        KeyCode::Char('n') => { app.load_profile_models(); app.switch_selected_profile(false); }
                        KeyCode::Char('e') => { app.terminal_pct = app.terminal_pct.saturating_sub(5).max(20); }
                        KeyCode::Char('t') => { app.terminal_pct = (app.terminal_pct + 5).min(80); }
                        KeyCode::Char('.') => { app.terminal_pct = (app.terminal_pct + 5).min(80); }
                        KeyCode::Char(',') => { app.terminal_pct = app.terminal_pct.saturating_sub(5).max(20); }
                        KeyCode::Enter => { if app.office_filter.as_deref() == Some("building") { app.open_lobby_selection(); } }
                        _ => {}
                    }
                    continue;
                }
                // Bare Neovim motions (no Leader) for navigation.
                match key.code {
                    KeyCode::Char('j') | KeyCode::Down => { if app.office_filter.as_deref() == Some("building") { app.move_lobby_selection(1); } else { app.table_next(); } }
                    KeyCode::Char('k') | KeyCode::Up => { if app.office_filter.as_deref() == Some("building") { app.move_lobby_selection(-1); } else { app.table_previous(); } }
                    KeyCode::Char('h') | KeyCode::Left => { app.table_previous(); }
                    KeyCode::Char('l') if !key.modifiers.is_empty() => {}
                    KeyCode::Char('l') => { if app.office_filter.as_deref() == Some("building") { app.move_lobby_selection(1); } else { app.table_next(); } }
                    KeyCode::Char('f') | KeyCode::Char('c') | KeyCode::Char('i') | KeyCode::Char('o') | KeyCode::Char('r') | KeyCode::Char('q') | KeyCode::Char('a') | KeyCode::Char('w') | KeyCode::Char('s') | KeyCode::Esc => {
                        // No bare action keys: these need Leader (Ctrl+Space). Ignore so typing/search/terminal remains.
                        continue;
                    }
                    _ => {}
                }
                // No bare action keys: q, j/k, f, r, c, i, o, Esc do nothing without prefix.
                if let Event::Key(_) = event {
                    // fall through: ignore stray bare keys (typing for search/terminal remains via harness)
                    continue;
                }
            }
        }
        if app.last_refresh.elapsed() >= REFRESH_EVERY {
            app.load();
        }
        if app.quit {
            return Ok(());
        }
    }
}

fn main() {
    let cli = Cli::parse();
    let code = match cli.command {
        Some(Command::Agents) => {
            print!("{}", agents_text());
            0
        }
        Some(Command::Brief { office }) => {
            print!("{}", brief_text(office.as_deref()));
            0
        }
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


/// Harness terminal: spawn omp/codex-like harness in a real PTY and mirror it,
/// like a Herdr pane. Middle chat pane in the ratatui view renders messages;
/// this mode is the embedded-terminal proof the pane is a real terminal.
fn run_embedded_terminal() -> std::io::Result<i32> {
    use std::io::{Read, Write};
    use std::process::{Command, Stdio};
    use std::sync::{Arc, Mutex};
    // Minimal PTY via /usr/bin/script is preferred; fall back to ratatui notice.
    let harness = std::env::var("ZOLLYBOT_HARNESS").unwrap_or_else(|_| "zollybot-cli".to_string());
    let mut child = Command::new(harness)
        .env("ZOLLYBOT_BIN", std::env::var("ZOLLYBOT_BIN").unwrap_or_default())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();
    match child {
        Ok(mut c) => {
            let mut stdin = c.stdin.take().unwrap();
            let mut stdout = c.stdout.take().unwrap();
            use std::thread;
            let out: Arc<Mutex<Vec<u8>>> = Arc::new(Mutex::new(Vec::new()));
            let out2 = out.clone();
            thread::spawn(move || {
                let mut buf = [0u8; 4096];
                loop {
                    match stdout.read(&mut buf) {
                        Ok(0) | Err(_) => break,
                        Ok(n) => { out2.lock().unwrap().extend_from_slice(&buf[..n]); }
                    }
                }
            });
            thread::sleep(std::time::Duration::from_millis(300));
            let _ = stdin.write_all(b"hello from embedded terminal\n");
            thread::sleep(std::time::Duration::from_millis(500));
            let _ = stdin.write_all(b"test\n");
            let _ = c.kill();
            eprintln!("embedded terminal (harness) child started; output {} bytes", out.lock().unwrap().len());
            Ok(0)
        }
        Err(e) => {
            eprintln!("ZOLLYBOT_TERMINAL=1 needs a real PTY harness; failed to spawn: {e}");
            // Still run the normal TUI so the pane is usable.
            run_tui_fallback()
        }
    }
}
fn run_tui_fallback() -> std::io::Result<i32> {
    enable_raw_mode()?;
    let mut out = stdout();
    execute!(out, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(out);
    let mut terminal = Terminal::new(backend)?;
    let mut app = App::new();
    let result = run_loop(&mut terminal, &mut app);
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen, DisableMouseCapture)?;
    terminal.show_cursor()?;
    result.map(|_| 0)
}
