//! zollybot-cli — read a zolly office from the terminal.
//!
//! The office files stay canonical: this binary parses `.agents/` exactly as the
//! desktop app does, and never writes to it.

use clap::{Parser, Subcommand};
use serde::Serialize;
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(
    name = "zollybot-cli",
    version,
    about = "ZollyBot offices from the terminal",
    long_about = "Read zolly offices (repositories with .agents/) without starting the app. \
                  Files are parsed, never written."
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// List offices found under the given roots.
    Offices {
        /// Root to search. Repeatable. Defaults to ~/Projects, then the current directory.
        #[arg(long)]
        root: Vec<PathBuf>,
        /// How many directory levels to walk below each root.
        #[arg(long, default_value_t = 3)]
        depth: usize,
        /// Machine-readable output.
        #[arg(long)]
        json: bool,
    },
    /// List the queue briefs of one office.
    Queue {
        /// Office path, or its frequency name (name, shifaul-dev, ...).
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

fn walk(
    dir: &Path,
    depth: usize,
    max_depth: usize,
    found: &mut Vec<Office>,
    seen: &mut Vec<PathBuf>,
) {
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
        return; // do not descend into an office
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
                    path.file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string()
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
                    path.file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string()
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

fn default_roots() -> Vec<PathBuf> {
    let projects = dirs_home().join("Projects");
    if projects.is_dir() {
        vec![projects]
    } else {
        vec![std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))]
    }
}

fn dirs_home() -> PathBuf {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."))
}

fn resolve_office(arg: &str) -> Option<PathBuf> {
    let direct = PathBuf::from(arg);
    if direct.join(".agents/zolly/config.toml").is_file() {
        return Some(direct);
    }
    let roots = default_roots();
    let mut matches = Vec::new();
    for root in &roots {
        let mut offices = Vec::new();
        walk(root, 0, 3, &mut offices, &mut Vec::new());
        for office in offices {
            if office.frequency.as_deref() == Some(arg) {
                matches.push(PathBuf::from(office.root));
            }
        }
    }
    match matches.len() {
        0 => None,
        1 => Some(matches.remove(0)),
        _ => None,
    }
}

fn print_offices(offices: &[Office]) {
    if offices.is_empty() {
        println!("no offices found");
        return;
    }
    let width = offices
        .iter()
        .map(|o| o.root.len())
        .max()
        .unwrap_or(4)
        .max(4);
    println!("{:<width$}  {:<16}  {:>7}  {:>10}  {:>8}", "ROOT", "FREQUENCY", "QUEUED", "DISPATCHED", "BLOCKED", width = width);
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
    let mut found = Vec::new();
    let mut seen = Vec::new();
    for root in &roots {
        walk(root, 0, depth, &mut found, &mut seen);
    }
    found.sort_by(|a, b| a.root.cmp(&b.root));
    if json {
        println!("{}", serde_json::to_string_pretty(&found).unwrap());
    } else {
        print_offices(&found);
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
            println!(
                "{:<34}  {:<10}  {:<5}  {}",
                entry.id, entry.status, entry.gate, entry.title
            );
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

fn main() {
    let cli = Cli::parse();
    let code = match cli.command {
        Command::Offices { root, depth, json } => cmd_offices(root, depth, json),
        Command::Queue { office, json } => cmd_queue(&office, json),
        Command::Gates { office, json } => cmd_gates(&office, json),
    };
    std::process::exit(code);
}
