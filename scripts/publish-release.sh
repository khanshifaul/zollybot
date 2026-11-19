#!/bin/sh
# Publish build artifacts into the release directory the tunnel serves.
#
#   scripts/publish-release.sh 0.62.0 out/desktop/dist/ZollyBot-0.62.0-x86_64.AppImage [...]
#
# Copies each artifact into ~/zollybot-release/releases/<version>/, regenerates
# SHA256SUMS for that version, and points ~/zollybot-release/latest at it.
# If standalone CLI binaries exist under out/cli/<os-arch>/, they are copied as
# zollybot-cli-<os-arch>[.exe] unless already provided.

set -eu

ROOT="${ZOLLYBOT_RELEASE_DIR:-$HOME/zollybot-release}"
VERSION="${1:-}"
[ -n "$VERSION" ] || { echo "usage: $0 <version> <artifact>..." >&2; exit 2; }
shift

[ "$#" -gt 0 ] || { echo "no artifacts given" >&2; exit 2; }

dir="$ROOT/releases/$VERSION"
mkdir -p "$dir"

copy_if() {
	src="$1"
	dst="$2"
	[ -f "$src" ] || return 0
	install -m 0644 "$src" "$dir/$dst"
	echo "published $dst"
}

for artifact in "$@"; do
	[ -f "$artifact" ] || { echo "missing artifact: $artifact" >&2; exit 1; }
	install -m 0644 "$artifact" "$dir/$(basename "$artifact")"
	echo "published $(basename "$artifact")"
done

# collect standalone CLI binaries from out/cli (if produced)
for p in out/cli/linux-x64/zollybot-cli out/cli/linux-arm64/zollybot-cli out/cli/darwin-x64/zollybot-cli out/cli/darwin-arm64/zollybot-cli; do
	[ -f "$p" ] || continue
	name="zollybot-cli-$(basename "$(dirname "$p")")"
	[ -f "$dir/$name" ] || copy_if "$p" "$name"
done
if [ -f out/cli/windows-x64/zollybot-cli.exe ] && [ ! -f "$dir/zollybot-cli-windows-x64.exe" ]; then
	copy_if out/cli/windows-x64/zollybot-cli.exe zollybot-cli-windows-x64.exe
fi

(cd "$dir" && rm -f SHA256SUMS && sha256sum ./* | awk '{ n = $2; sub("^\./", "", n); print $1 "  " n }' > SHA256SUMS)
echo "$VERSION" > "$ROOT/latest"
cp "$(dirname "$0")/../site/install.sh" "$ROOT/install.sh"

echo "release $VERSION ready at $dir"
ls -lh "$dir"
