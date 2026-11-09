#!/bin/sh
# ZollyBot installer for Linux.
#
#   curl -fsSL https://zollybot.shifaul.dev/install.sh | sh
#
# Options:
#   --prefix <dir>   install root (default: $HOME/.local)
#   --version <v>    install a specific version instead of the latest
#   --no-desktop     skip the desktop entry
#   --no-cli         skip the terminal companion (zollybot-cli)
#   --server         install and enable a user service that keeps the server running
#   --quiet          show only errors and final result
#
# Installs files under <prefix>/lib/zollybot and links launchers into
# <prefix>/bin. The download is verified against the release SHA256SUMS.
# Environment: ZOLLYBOT_BASE_URL, ZOLLYBOT_DOWNLOAD_BASE, ZOLLYBOT_PREFIX.

set -eu

BASE_URL="${ZOLLYBOT_BASE_URL:-https://zollybot.shifaul.dev}"
DOWNLOAD_BASE="${ZOLLYBOT_DOWNLOAD_BASE:-}"
GITHUB_RELEASES="${ZOLLYBOT_GITHUB_RELEASES:-https://github.com/khanshifaul/zollybot/releases/download}"
PREFIX="${ZOLLYBOT_PREFIX:-$HOME/.local}"
VERSION=""
DESKTOP=1
CLI=1
SERVER=0
QUIET=0

log() { [ "$QUIET" -eq 1 ] || printf '%s\n' "$*"; }
err() { printf '%s\n' "$*" >&2; }
run() { if [ "$QUIET" -eq 1 ]; then "$@" >/dev/null 2>&1; else "$@"; fi; }

while [ $# -gt 0 ]; do
	case "$1" in
		--prefix) PREFIX="$2"; shift 2 ;;
		--version) VERSION="$2"; shift 2 ;;
		--no-desktop) DESKTOP=0; shift ;;
		--no-cli) CLI=0; shift ;;
		--server) SERVER=1; shift ;;
		--quiet|-q) QUIET=1; shift ;;
		--help|-h)
			sed -n '2,16p' "$0" 2>/dev/null || true
			exit 0 ;;
		*) err "unknown option: $1"; exit 2 ;;
	esac
done

need() { command -v "$1" >/dev/null 2>&1 || { err "missing dependency: $1"; exit 1; }; }
need curl
need sha256sum
need tar

arch="$(uname -m)"
case "$arch" in
	x86_64|amd64) asset_arch="x86_64" ;;
	aarch64|arm64) asset_arch="arm64" ;;
	*) err "unsupported architecture: $arch (expected x86_64 or arm64)"; exit 1 ;;
esac

log "ZollyBot Linux installer"
log "  arch: $arch ($asset_arch)"
log "  prefix: $PREFIX"
log "  base URL: $BASE_URL"

if [ -z "$VERSION" ]; then
	log "  version: fetching $BASE_URL/latest"
	VERSION="$(curl -fsSL "$BASE_URL/latest")" || { err "could not read $BASE_URL/latest"; exit 1; }
	VERSION="$(printf '%s' "$VERSION" | tr -d '\r\n')"
fi
log "  version: $VERSION"

asset="zollybot-linux-${asset_arch}-${VERSION}.tar.gz"
if [ -n "$DOWNLOAD_BASE" ]; then
  release="$DOWNLOAD_BASE/releases/$VERSION"
  checksums_name="SHA256SUMS"
else
  release="$GITHUB_RELEASES/$VERSION"
  checksums_name="SHA256SUMS-linux-x86_64.txt"
fi
log "  checksum URL: $release/$checksums_name"
log "  archive URL: $release/$asset"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

log "Downloading SHA256SUMS..."
curl -fsSL "$release/$checksums_name" -o "$tmp/SHA256SUMS"
expected="$(awk -v name="$asset" '{ n = $2; sub(/^[.]\//, "", n); if (n == name) { print $1; exit } }' "$tmp/SHA256SUMS")"
if [ -z "$expected" ]; then
	err "no checksum for $asset in SHA256SUMS"
	err "available entries:"
	awk '{print "  - " $2}' "$tmp/SHA256SUMS" >&2 || true
	exit 1
fi
log "  expected SHA256: $expected"

attempt=1
while :; do
	log "Downloading $asset (attempt $attempt)..."
	curl -fsSLo "$tmp/$asset" "$release/$asset" </dev/null
	actual="$(sha256sum "$tmp/$asset" | awk '{ print $1 }')"
	log "  actual SHA256:   $actual"
	[ "$actual" = "$expected" ] && break
	if [ "$attempt" -ge 2 ]; then
		err "checksum mismatch for $asset"
		exit 1
	fi
	attempt=$((attempt + 1))
	rm -f "$tmp/$asset"
	err "checksum mismatch; downloading again..."
done

log "Extracting to $PREFIX/lib/zollybot..."
mkdir -p "$PREFIX/lib" "$PREFIX/bin"
rm -rf "$PREFIX/lib/zollybot"
mkdir -p "$PREFIX/lib/zollybot"
tar -xzf "$tmp/$asset" -C "$PREFIX/lib/zollybot"

if [ -d "$PREFIX/lib/zollybot/zollybot" ]; then
	flat="$PREFIX/lib/.zollybot-install"
	rm -rf "$flat"
	mv "$PREFIX/lib/zollybot/zollybot" "$flat"
	rm -rf "$PREFIX/lib/zollybot"
	mv "$flat" "$PREFIX/lib/zollybot"
elif [ -x "$PREFIX/lib/zollybot/linux-unpacked/zollybot" ]; then
	flat="$PREFIX/lib/.zollybot-install"
	rm -rf "$flat"
	mv "$PREFIX/lib/zollybot/linux-unpacked" "$flat"
	rm -rf "$PREFIX/lib/zollybot"
	mv "$flat" "$PREFIX/lib/zollybot"
fi

app="$PREFIX/lib/zollybot/zollybot"
if [ ! -x "$app" ]; then
	err "the archive carried no zollybot binary"
	err "top-level files:"
	ls "$PREFIX/lib/zollybot" >&2 || true
	exit 1
fi

cat > "$PREFIX/bin/zollybot" <<WRAPPER
#!/bin/sh
unit=zollybot-server.service
handover=0
if command -v systemctl >/dev/null 2>&1 && systemctl --user is-active --quiet "\$unit" 2>/dev/null; then
	handover=1
	systemctl --user stop "\$unit" >/dev/null 2>&1 || true
fi
resume() {
	if [ "\$handover" -eq 1 ]; then
		sleep 2
		systemctl --user start "\$unit" >/dev/null 2>&1 || true
	fi
}
trap 'resume' EXIT
trap 'resume; exit 143' INT TERM
"$app" "\$@"
status=\$?
trap - EXIT INT TERM
resume
exit \$status
WRAPPER
chmod 0755 "$PREFIX/bin/zollybot"
log "Installed launcher: $PREFIX/bin/zollybot"

if [ "$CLI" -eq 1 ] && [ -f "$PREFIX/lib/zollybot/zollybot-cli" ]; then
	install -m 0755 "$PREFIX/lib/zollybot/zollybot-cli" "$PREFIX/bin/zollybot-cli"
	log "Installed CLI: $PREFIX/bin/zollybot-cli"
elif [ "$CLI" -eq 1 ]; then
	log "CLI binary not found in archive; skipped (--no-cli to silence)"
fi

if [ "$DESKTOP" -eq 1 ]; then
	data="${XDG_DATA_HOME:-$HOME/.local/share}"
	mkdir -p "$data/applications"
	if [ -f "$PREFIX/lib/zollybot/zollybot.png" ]; then
		mkdir -p "$data/icons"
		install -m 0644 "$PREFIX/lib/zollybot/zollybot.png" "$data/icons/zollybot.png"
		log "Installed icon: $data/icons/zollybot.png"
	fi
	icon_line=""
	[ -f "$data/icons/zollybot.png" ] && icon_line="Icon=zollybot"
	cat > "$data/applications/zollybot.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=ZollyBot
Comment=Local-first multi-agent workspace
Exec=$PREFIX/bin/zollybot %U
$icon_line
Terminal=false
Categories=Development;
MimeType=x-scheme-handler/zollybot;
EOF
	command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$data/applications" >/dev/null 2>&1 || true
	log "Installed desktop entry: $data/applications/zollybot.desktop"
fi

if [ "$SERVER" -eq 1 ]; then
	need systemctl
	unit_dir="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
	mkdir -p "$unit_dir"
	cat > "$unit_dir/zollybot-server.service" <<UNIT
[Unit]
Description=ZollyBot server (keeps the office running without a window)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=ZOLLYBOT_SERVER=1
Environment=XDG_RUNTIME_DIR=%t
ExecStart=$PREFIX/lib/zollybot/zollybot --server --ozone-platform=headless
Restart=on-failure
RestartSec=2

[Install]
WantedBy=default.target
UNIT
	systemctl --user daemon-reload
	systemctl --user enable --now zollybot-server.service
	log "Enabled user service: zollybot-server.service"
fi

case ":$PATH:" in
	*":$PREFIX/bin:"*) ;;
	*) log "PATH note: add $PREFIX/bin to PATH to run 'zollybot' from a terminal." ;;
esac

log "Done. Run: zollybot"
