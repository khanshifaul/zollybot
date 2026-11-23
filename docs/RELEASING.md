# Releasing ZollyBot

The repository releases three artifacts from one tag:

- desktop installers and updater manifests for Linux, macOS, and Windows;
- the Android APK and iOS build;
- the public site, which must route every download against the assets that the tag published.

A release is not “the workflow finished”. It is done when a clean install and an existing install can
both reach the new version.

## Release notes

Every user-visible change adds a fragment:

- `changelog.d/<branch>.md` for the desktop app and web client;
- `apps/mobile/changelog.d/<branch>.md` for the mobile app.

The fragment format and its gate are in `scripts/release-notes.ts` and
`scripts/check-release-notes.ts`. A release section uses the groups `Added`, `Changed`,
`Deprecated`, `Removed`, `Fixed`, and `Security`; a TODO or empty section stops the release.

## Desktop and web release

1. Prepare the version:

   ```bash
   bun run release:patch    # or release:minor, release:major
   ```

   This moves `Unreleased` and `changelog.d` entries into the new section, bumps `package.json`,
   and removes the consumed fragments. Review the diff.

2. Run the preflight:

   ```bash
   bun run release:preflight
   ```

   The preflight checks the version, release notes, public package commands, clean main, secrets,
   and that the tag does not exist.

3. Commit and push `main`, wait for green CI, then create the tag and GitHub release:

   ```bash
   git tag vX.Y.Z
   git push origin main vX.Y.Z
   gh release create vX.Y.Z --verify-tag --title vX.Y.Z --notes-file /tmp/release-notes.md
   ```

   Publishing the release triggers `release.yml`, `release-desktop-linux.yml`,
   `release-desktop-macos.yml`, `release-desktop-windows.yml`, and `release-mobile-android.yml`.
   The macOS workflow also merges the ARM64 and x64 manifests into the one `latest-mac.yml` that
   electron-updater reads.

4. Verify the published assets:

   ```bash
   gh release view vX.Y.Z --json assets
   ```

   The release must include the manifest for each published platform and the exact artifact name
   that manifest lists. Do not publish a download link until the asset exists.

## Mobile release

1. Prepare the next mobile version:

   ```bash
   bun run mobile:release:patch   # or minor, major
   ```

   The new section says `In review`, and `/changelog` hides it until a store publishes it.

2. Build and upload through the store profile. Local builds are useful for smoke tests, but the
   store build is the release.

3. When a store makes the version available, record the store date:

   ```bash
   bun run mobile:release:published ios
   bun run mobile:release:published android
   ```

   `--date YYYY-MM-DD` records the store's actual day. The command updates the heading in
   `apps/mobile/CHANGELOG.md`; it does not upload a build.

4. The Discord announcement runs after the live account service lists the new version. Do not
   announce before `/v1/mobile/features` reports it.

## Update compatibility

- New desktop builds publish through
  `electron-updater` to `https://github.com/khanshifaul/zollybot/releases/latest/download`.
  The manifest name is per platform, and every artifact name comes from the release manifest.
- `site/install.sh` reads `latest-linux.yml` or `latest-linux-arm64.yml` for the version and the
  artifact path. Do not hard-code a release asset name in the installer.
- Existing clients built with the old versioned feed (`/releases/0.62.10`) need a compatibility
  bridge until they have installed a newer build. Do not change DNS or retire the old host before
  that bridge is verified.
- The release page, installer, updater, and `HostReleaseService` share
  `packages/contracts/src/release-assets.ts`. Change that map first, then run:

  ```bash
  bun run check:commands
  bun run typecheck
  bun run test:desktop -- src/main/host-release-service.test.ts
  ```

## Rollback

A bad release is not repaired by editing the tag. Publish a new patch release with the fix. If an
artifact is wrong, delete that asset and upload a corrected one only when the manifest is corrected
in the same operation; otherwise every running updater sees a manifest that names a different file.
