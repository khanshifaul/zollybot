### Fixed

- Run local EAS mobile builds from work/temp directories outside the repo by default to avoid `eas-cli --local` copy failures, and write artifacts under `out/mobile/{ios,android}` (with `EAS_LOCAL_BUILD_WORKDIR_BASE`/`EAS_LOCAL_BUILD_ARTIFACT` overrides).
- Add `mobile:android:build:apk:local` (`production-apk`) for local Android APK builds.
- Include host CLI build in Linux x64 package/dist scripts and harden remote-desktop runtime source bootstrap (miniupnpc layout/link discovery, glad Python venv with `GLAD_SKIP_PIP_INSTALL`, and build-environment propagation to Sunshine build/test steps).
- Resolve desktop/node typecheck issues in office-task, routine, schema migration, auth credential, server-mode, and contracts export wiring.
