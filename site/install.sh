#!/bin/sh
# ZollyBot installer for Linux.
#
#   curl -fsSL https://zollybot.shifaul.dev/install.sh | sh
#
# Options:
#   --prefix <dir>   install root (default: $HOME/.local)
#   --version <v>    install a specific version instead of the latest
#   --no-desktop     skip the desktop entry
#
# The download is verified against the release's SHA256SUMS before anything is
# installed. Nothing is written outside the prefix.

set -eu

BASE_URL="${ZOLLYBOT_BASE_URL:-https://zollybot.shifaul.dev}"
DOWNLOAD_BASE="${ZOLLYBOT_DOWNLOAD_BASE:-https://downloads.zollybot.shifaul.dev}"
PREFIX="${ZOLLYBOT_PREFIX:-$HOME/.local}"
VERSION=""
DESKTOP=1

while [ $# -gt 0 ]; do
	case "$1" in
		--prefix) PREFIX="$2"; shift 2 ;;
		--version) VERSION="$2"; shift 2 ;;
		--no-desktop) DESKTOP=0; shift ;;
		-h|--help) sed -n '2,12p' "$0"; exit 0 ;;
		*) echo "unknown option: $1" >&2; exit 2 ;;
	esac
done

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing dependency: $1" >&2; exit 1; }; }
need curl
need sha256sum

arch="$(uname -m)"
case "$arch" in
	x86_64|amd64) asset_arch="x86_64" ;;
	aarch64|arm64) asset_arch="arm64" ;;
	*) echo "unsupported architecture: $arch" >&2; exit 1 ;;
esac

if [ -z "$VERSION" ]; then
	VERSION="$(curl -fsSL "$BASE_URL/latest")" || { echo "could not read $BASE_URL/latest" >&2; exit 1; }
fi

asset="ZollyBot-${VERSION}-${asset_arch}.AppImage"
release="$DOWNLOAD_BASE/releases/$VERSION"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

echo "Downloading $asset ..."
curl -fsSL "$release/$asset" -o "$tmp/$asset"
curl -fsSL "$release/SHA256SUMS" -o "$tmp/SHA256SUMS"

expected="$(awk -v name="$asset" '$2 == name { print $1 }' "$tmp/SHA256SUMS")"
if [ -z "$expected" ]; then
	echo "no checksum for $asset in SHA256SUMS" >&2
	exit 1
fi
actual="$(sha256sum "$tmp/$asset" | awk '{ print $1 }')"
if [ "$actual" != "$expected" ]; then
	echo "checksum mismatch for $asset" >&2
	echo "  expected $expected" >&2
	echo "  actual   $actual" >&2
	exit 1
fi

mkdir -p "$PREFIX/bin"
install -m 0755 "$tmp/$asset" "$PREFIX/bin/zollybot"
echo "Installed $PREFIX/bin/zollybot ($VERSION)"

if [ "$DESKTOP" -eq 1 ] && [ -d "${XDG_DATA_HOME:-$HOME/.local/share}/applications" ]; then
	icon_dir="${XDG_DATA_HOME:-$HOME/.local/share}/icons"
	mkdir -p "$icon_dir"
	curl -fsSL "$BASE_URL/icon.png" -o "$icon_dir/zollybot.png" || true
	desktop="${XDG_DATA_HOME:-$HOME/.local/share}/applications/zollybot.desktop"
	cat > "$desktop" <<EOF
[Desktop Entry]
Type=Application
Name=ZollyBot
Comment=Governed agent offices for your repositories
Exec=$PREFIX/bin/zollybot %U
Icon=$icon_dir/zollybot.png
Terminal=false
Categories=Development;
EOF
	command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$(dirname "$desktop")" || true
	echo "Added desktop entry"
fi

case ":$PATH:" in
	*":$PREFIX/bin:"*) ;;
	*) echo "Note: add $PREFIX/bin to PATH to run 'zollybot' from a shell." ;;
esac

echo "Run 'zollybot' to start."
