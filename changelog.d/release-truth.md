### Fixed

- Desktop updates now check the newest published release instead of the frozen 0.62.10 path, and hosted-server release checks accept the actual `zollybot-gui-*` asset names.
- The Linux installer reads the release's own update manifest and verifies the published checksum, so it no longer asks for an AppImage name that the release does not publish.
- The download page links to the assets that the current release publishes, including the arm64 APK, x86_64 AppImage, and arm64 macOS DMG.

### Changed

- Release commands now fail in preflight when a `package.json` script points at a missing file or an unknown `bun run` target.
- The macOS release workflow publishes the merged `latest-mac.yml` that electron-updater reads for both architectures.
