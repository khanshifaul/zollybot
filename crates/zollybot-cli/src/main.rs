//! zollybot-cli — the terminal frontend of ZollyBot.
//!
//! One product, two frontends: the desktop app runs the server, and this program
//! attaches to it over the control socket. It shows the agents the app shows and
//! signs in with the same email code. It keeps no office state of its own.

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
use std::fs;
use std::io::{IsTerminal, Write, stdout};
use std::path::PathBuf;
use std::time::{Duration, Instant};

const REFRESH_EVERY: Duration = Duration::from_secs(3);

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
    name: String,
    provider: String,
    model: String,
    title: String,
    #[allow(dead_code)]
    role: String,
    scope: String,
    office: String,
}

struct App {
    server: ServerInfo,
    agents: Vec<AgentRow>,
    selected: usize,
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
            server: ServerInfo::default(),
            agents: Vec::new(),
            selected: 0,
            table_state: TableState::default(),
            quit: false,
            message: String::new(),
            last_refresh: Instant::now(),
            connect: None,
            session: load_session(),
            sign_in: None,
        };
        app.refresh_account();
        app.load();
        app
    }

    /// Reads the app's own data. There is no offline copy: without the app, there
    /// is nothing to mirror.
    fn load(&mut self) {
        self.last_refresh = Instant::now();
        if control_socket().is_none() {
            self.agents.clear();
            self.table_state.select(None);
            self.message = "Start ZollyBot, then this attaches to it.".to_string();
            return;
        }
        if let Ok((200, lines)) = control_call("GET", "/v1/status", &[]) {
            self.server = ServerInfo {
                version: line_value(&lines, "version").unwrap_or_default(),
                name: line_value(&lines, "server_name").unwrap_or_default(),
                phase: line_value(&lines, "server").unwrap_or_default(),
            };
        }
        match control_call("GET", "/v1/agents", &[]) {
            Ok((200, lines)) => {
                self.agents.clear();
                let count = line_value(&lines, "count")
                    .and_then(|count| count.parse::<usize>().ok())
                    .unwrap_or(0);
                for index in 0..count {
                    let Some(raw) = line_value(&lines, &format!("agent.{index}")) else {
                        continue;
                    };
                    let mut parts = raw.split('|');
                    self.agents.push(AgentRow {
                        name: parts.next().unwrap_or_default().to_string(),
                        provider: parts.next().unwrap_or_default().to_string(),
                        model: parts.next().unwrap_or_default().to_string(),
                        title: parts.next().unwrap_or_default().to_string(),
                        role: parts.next().unwrap_or_default().to_string(),
                        scope: parts.next().unwrap_or_default().to_string(),
                        office: parts.next().unwrap_or_default().to_string(),
                    });
                }
                if self.selected >= self.agents.len() {
                    self.selected = self.agents.len().saturating_sub(1);
                }
                self.table_state.select(if self.agents.is_empty() { None } else { Some(self.selected) });
            }
            Ok((status, lines)) => self.message = answer_error(status, &lines),
            Err(error) => self.message = error,
        }
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

    let header = if app.server.version.is_empty() {
        " ZollyBot · no app running".to_string()
    } else {
        let name = if app.server.name.is_empty() { "server" } else { &app.server.name };
        format!(" ZollyBot {} · {} · {}", app.server.version, name, app.server.phase)
    };
    frame.render_widget(
        Paragraph::new(Line::from(Span::styled(
            header,
            Style::default().bg(Color::Blue).fg(Color::White).add_modifier(Modifier::BOLD),
        ))),
        outer[0],
    );

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
    frame.render_stateful_widget(table, outer[1], &mut app.table_state);

    if app.agents.is_empty() {
        let area = outer[1];
        let inner = ratatui::layout::Rect {
            x: area.x + 2,
            y: area.y + 2,
            width: area.width.saturating_sub(4),
            height: 2,
        };
        frame.render_widget(
            Paragraph::new(app.message.clone()).style(Style::default().fg(Color::DarkGray)),
            inner,
        );
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
    let hints = match &app.session {
        Some(session) => format!(
            "{} · j/k agent · c connect · i account · o sign out · r refresh · q quit ",
            session.email
        ),
        None => "j/k agent · c connect · i sign in · r refresh · q quit ".to_string(),
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

fn agents_text() -> String {
    if control_socket().is_none() {
        return "The app is not running. Start ZollyBot and try again.\n".to_string();
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
                    KeyCode::Char('j') | KeyCode::Down => app.table_next(),
                    KeyCode::Char('k') | KeyCode::Up => app.table_previous(),
                    KeyCode::Char('r') => {
                        app.load();
                        app.refresh_account();
                        app.message = "refreshed".into();
                    }
                    _ => {}
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
