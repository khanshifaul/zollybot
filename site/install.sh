#!/bin/sh
# ZollyBot installer for Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/khanshifaul/zollybot/main/site/install.sh | sh
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
# <prefix>/bin. The download is verified against release SHA256SUMS when available.
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
			sed -n '2,18p' "$0" 2>/dev/null || true
			exit 0 ;;
		*) err "unknown option: $1"; exit 2 ;;
	esac
done

need() { command -v "$1" >/dev/null 2>&1 || { err "missing dependency: $1"; exit 1; }; }
need curl
need sha256sum

arch="$(uname -m)"
case "$arch" in
	x86_64|amd64) asset_arch="x86_64"; manifest_name="latest-linux.yml"; checksum_name="SHA256SUMS-linux-x64.txt" ;;
	aarch64|arm64) asset_arch="arm64"; manifest_name="latest-linux-arm64.yml"; checksum_name="SHA256SUMS-linux-arm64.txt" ;;
	*) err "unsupported architecture: $arch (expected x86_64 or arm64)"; exit 1 ;;
esac

log "ZollyBot Linux installer"
log "  arch: $arch"
log "  prefix: $PREFIX"
log "  base URL: $BASE_URL"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

# Read the version and the artifact name from electron-updater's manifest. The manifest is the
# release's own statement of what it published, so the installer cannot drift from the asset names.
manifest_url="$GITHUB_RELEASES/latest/download/$manifest_name"
if [ -n "$DOWNLOAD_BASE" ]; then
	manifest_url="$DOWNLOAD_BASE/releases/latest/$manifest_name"
fi
if [ -z "$VERSION" ]; then
	log "  version: fetching $manifest_url"
	manifest_file="$tmp/$manifest_name"
	curl -fsSL "$manifest_url" -o "$manifest_file" || { err "could not read $manifest_url"; exit 1; }
	VERSION="$(sed -n 's/^version: *//p' "$manifest_file" | head -n 1)"
	appimage_asset="$(sed -n 's/^path: *//p' "$manifest_file" | head -n 1)"
fi
VERSION="$(printf '%s' "${VERSION#v}" | tr -d '\r\n')"
[ -n "$VERSION" ] || { err "the release manifest has no version"; exit 1; }
log "  version: $VERSION"

if [ -n "$DOWNLOAD_BASE" ]; then
	release="$DOWNLOAD_BASE/releases/$VERSION"
	checksums_candidates="$checksum_name SHA256SUMS SHA256SUMS-linux-$asset_arch.txt"
else
	release="$GITHUB_RELEASES/v$VERSION"
	checksums_candidates="$checksum_name SHA256SUMS-linux-$asset_arch.txt SHA256SUMS"
fi

# A caller can name an older version. Its manifest sits beside its artifacts in the release.
if [ -z "${appimage_asset:-}" ]; then
	manifest_file="$tmp/$manifest_name"
	if curl -fsSL "$release/$manifest_name" -o "$manifest_file" 2>/dev/null; then
		appimage_asset="$(sed -n 's/^path: *//p' "$manifest_file" | head -n 1)"
	fi
fi
if [ -z "${appimage_asset:-}" ]; then
	appimage_asset="zollybot-gui-${VERSION}-${asset_arch}.AppImage"
fi
tar_asset="zollybot-linux-${asset_arch}-${VERSION}.tar.gz"

fetch_checksums() {
	for name in $checksums_candidates; do
		if curl -fsSL "$release/$name" -o "$tmp/SHA256SUMS" 2>/dev/null; then
			log "  checksums: $release/$name"
			return 0
		fi
	done
	return 1
}

checksum_for() {
	name="$1"
	[ -f "$tmp/SHA256SUMS" ] || return 1
	awk -v name="$name" '{ n = $2; sub(/^[.]\//, "", n); if (n == name) { print $1; exit } }' "$tmp/SHA256SUMS"
}

download_verified() {
	asset="$1"
	url="$release/$asset"
	expected="$(checksum_for "$asset" || true)"
	attempt=1
	while :; do
		log "Downloading $asset (attempt $attempt)..."
		curl -fsSLo "$tmp/$asset" "$url" </dev/null
		actual="$(sha256sum "$tmp/$asset" | awk '{ print $1 }')"
		log "  actual SHA256:   $actual"
		if [ -n "$expected" ]; then
			log "  expected SHA256: $expected"
			[ "$actual" = "$expected" ] && return 0
			if [ "$attempt" -ge 2 ]; then
				err "checksum mismatch for $asset"
				return 1
			fi
			attempt=$((attempt + 1))
			rm -f "$tmp/$asset"
			err "checksum mismatch; downloading again..."
			continue
		fi
		log "  checksum: not listed (continuing without verification)"
		return 0
	done
}

log "Fetching checksums (best effort)..."
fetch_checksums || log "  no checksum file found; will install without checksum verification"

asset="$appimage_asset"
mode="appimage"
arch_linux=0
if [ -f /etc/arch-release ] || command -v pacman >/dev/null 2>&1; then
	arch_linux=1
fi
if [ "$arch_linux" -eq 1 ] && curl -fsI "$release/$tar_asset" >/dev/null 2>&1; then
	# Arch has no libfuse2 guarantee; the portable archive avoids the AppImage mount.
	asset="$tar_asset"
	mode="tar"
elif ! curl -fsI "$release/$asset" >/dev/null 2>&1; then
	err "no Linux AppImage found at $release/$asset"
	err "The release manifest's path is the source of truth; run with --version only for a published release."
	exit 1
fi
log "  artifact: $asset"

download_verified "$asset" || exit 1

log "Installing to $PREFIX/lib/zollybot..."
mkdir -p "$PREFIX/lib" "$PREFIX/bin"
rm -rf "$PREFIX/lib/zollybot"
mkdir -p "$PREFIX/lib/zollybot"

if [ "$mode" = "appimage" ]; then
	install -m 0755 "$tmp/$asset" "$PREFIX/lib/zollybot/ZollyBot.AppImage"
	app="$PREFIX/lib/zollybot/ZollyBot.AppImage"
else
	need tar
	tar -xzf "$tmp/$asset" -C "$PREFIX/lib/zollybot"
	app="$PREFIX/lib/zollybot/linux-unpacked/zollybot"
fi

if [ ! -x "$app" ]; then
	err "installed app binary not found or not executable: $app"
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

# The CLI ships inside the desktop payload, so the installer extracts it from the AppImage rather
# than from a standalone release asset that the release does not publish.
if [ "$CLI" -eq 1 ]; then
	cli_src=""
	if [ "$mode" = "appimage" ]; then
		if (cd "$tmp" && "$app" --appimage-extract resources/bin/zollybot-cli >/dev/null 2>&1) &&
			[ -f "$tmp/squashfs-root/resources/bin/zollybot-cli" ]; then
			cli_src="$tmp/squashfs-root/resources/bin/zollybot-cli"
		fi
	elif [ -f "$PREFIX/lib/zollybot/linux-unpacked/resources/bin/zollybot-cli" ]; then
		cli_src="$PREFIX/lib/zollybot/linux-unpacked/resources/bin/zollybot-cli"
	fi
	if [ -n "$cli_src" ]; then
		install -m 0755 "$cli_src" "$PREFIX/bin/zollybot-cli"
		log "Installed CLI: $PREFIX/bin/zollybot-cli"
	else
		log "CLI binary not found in the app payload; skipped (--no-cli to silence)"
	fi
fi

if [ "$DESKTOP" -eq 1 ]; then
	data="${XDG_DATA_HOME:-$HOME/.local/share}"
	mkdir -p "$data/applications"
	icon_src=""
	for i in "$PREFIX/lib/zollybot/zollybot.png" "$PREFIX/lib/zollybot/resources/icons/icon-production.png" "$PREFIX/lib/zollybot/usr/share/icons/hicolor/512x512/apps/zollybot.png"; do
		[ -f "$i" ] && icon_src="$i" && break
	done
	if [ -n "$icon_src" ]; then
		mkdir -p "$data/icons"
		install -m 0644 "$icon_src" "$data/icons/zollybot.png"
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
	exec_path="$app"
	[ "$mode" = "appimage" ] && exec_path="$PREFIX/lib/zollybot/ZollyBot.AppImage"
	cat > "$unit_dir/zollybot-server.service" <<UNIT
[Unit]
Description=ZollyBot server (keeps the office running without a window)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=ZOLLYBOT_SERVER=1
Environment=XDG_RUNTIME_DIR=%t
ExecStart=$exec_path --server --ozone-platform=headless
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
