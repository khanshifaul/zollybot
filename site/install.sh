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
#
# This installs files, the way a package manager does: the release archive is
# unpacked under <prefix>/lib/zollybot, the launcher is linked into <prefix>/bin,
# and nothing runs from a self-mounting AppImage. The download is verified
# against the release's SHA256SUMS before anything is written.

set -eu

BASE_URL="${ZOLLYBOT_BASE_URL:-https://zollybot.shifaul.dev}"
DOWNLOAD_BASE="${ZOLLYBOT_DOWNLOAD_BASE:-$BASE_URL}"
PREFIX="${ZOLLYBOT_PREFIX:-$HOME/.local}"
VERSION=""
DESKTOP=1
CLI=1

while [ $# -gt 0 ]; do
	case "$1" in
		--prefix) PREFIX="$2"; shift 2 ;;
		--version) VERSION="$2"; shift 2 ;;
		--no-desktop) DESKTOP=0; shift ;;
		--no-cli) CLI=0; shift ;;
		*) echo "unknown option: $1" >&2; exit 2 ;;
	esac
done

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing dependency: $1" >&2; exit 1; }; }
need curl
need sha256sum
need tar

arch="$(uname -m)"
case "$arch" in
	x86_64|amd64) asset_arch="x86_64" ;;
	aarch64|arm64) asset_arch="arm64" ;;
	*) echo "unsupported architecture: $arch" >&2; exit 1 ;;
esac

if [ -z "$VERSION" ]; then
	VERSION="$(curl -fsSL "$BASE_URL/latest")" || { echo "could not read $BASE_URL/latest" >&2; exit 1; }
fi

asset="zollybot-linux-${asset_arch}.tar.gz"
release="$DOWNLOAD_BASE/releases/$VERSION"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

echo "Downloading $asset ..."
curl -fsSL "$release/$asset" -o "$tmp/$asset"
curl -fsSL "$release/SHA256SUMS" -o "$tmp/SHA256SUMS"

expected="$(awk -v name="$asset" '{ n = $2; sub(/^[.]\//, "", n); if (n == name) { print $1; exit } }' "$tmp/SHA256SUMS")"
if [ -z "$expected" ]; then
	echo "no checksum for $asset in SHA256SUMS" >&2
	exit 1
fi
actual="$(sha256sum "$tmp/$asset" | awk '{ print $1 }')"
if [ "$actual" != "$expected" ]; then
	echo "checksum mismatch for $asset" >&2
	exit 1
fi

mkdir -p "$PREFIX/lib" "$PREFIX/bin"
rm -rf "$PREFIX/lib/zollybot"
mkdir -p "$PREFIX/lib/zollybot"
tar -xzf "$tmp/$asset" -C "$PREFIX/lib/zollybot"

app="$PREFIX/lib/zollybot/zollybot"
if [ ! -x "$app" ]; then
	echo "the archive carried no zollybot binary" >&2
	exit 1
fi
ln -sf "$app" "$PREFIX/bin/zollybot"
echo "Installed $PREFIX/bin/zollybot ($VERSION, files in $PREFIX/lib/zollybot)"

if [ "$CLI" -eq 1 ] && [ -f "$PREFIX/lib/zollybot/zollybot-cli" ]; then
	install -m 0755 "$PREFIX/lib/zollybot/zollybot-cli" "$PREFIX/bin/zollybot-cli"
	echo "Installed $PREFIX/bin/zollybot-cli ($VERSION)"
fi

if [ "$DESKTOP" -eq 1 ]; then
	data="${XDG_DATA_HOME:-$HOME/.local/share}"
	mkdir -p "$data/applications"
	if [ -f "$PREFIX/lib/zollybot/zollybot.png" ]; then
		mkdir -p "$data/icons"
		install -m 0644 "$PREFIX/lib/zollybot/zollybot.png" "$data/icons/zollybot.png"
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
	echo "Added desktop entry"
fi

case ":$PATH:" in
	*":$PREFIX/bin:"*) ;;
	*) echo "Add $PREFIX/bin to PATH to run 'zollybot' from a terminal." ;;
esac

echo "Run 'zollybot' to start."
