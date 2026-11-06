#!/bin/sh
# Publish build artifacts into the release directory the tunnel serves.
#
#   scripts/publish-release.sh 0.62.0 dist/ZollyBot-0.62.0-x86_64.AppImage [...]
#
# Copies each artifact into ~/zollybot-release/releases/<version>/, regenerates
# SHA256SUMS for that version, and points ~/zollybot-release/latest at it.
# Restart nothing: the static server reads the directory per request.

set -eu

ROOT="${ZOLLYBOT_RELEASE_DIR:-$HOME/zollybot-release}"
VERSION="${1:-}"
[ -n "$VERSION" ] || { echo "usage: $0 <version> <artifact>..." >&2; exit 2; }
shift

[ "$#" -gt 0 ] || { echo "no artifacts given" >&2; exit 2; }

dir="$ROOT/releases/$VERSION"
mkdir -p "$dir"

for artifact in "$@"; do
	[ -f "$artifact" ] || { echo "missing artifact: $artifact" >&2; exit 1; }
	install -m 0644 "$artifact" "$dir/$(basename "$artifact")"
	echo "published $(basename "$artifact")"
done

(cd "$dir" && rm -f SHA256SUMS && sha256sum ./* | awk '{ n = $2; sub("^\./", "", n); print $1 "  " n }' > SHA256SUMS)
echo "$VERSION" > "$ROOT/latest"
cp "$(dirname "$0")/../site/install.sh" "$ROOT/install.sh"

echo "release $VERSION ready at $dir"
ls -lh "$dir"
