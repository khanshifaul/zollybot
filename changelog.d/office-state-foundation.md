### Added

- Office registration now writes `.agents/zollybot/office.json` and `agents.json` snapshots, using ZollyBot's own state folder instead of the separate `zolly` application's `.agents/zolly/` marker.
- Added the atomic office-state writer and per-writer event log that later phases use to restore channels, memory, and the ledger from the office repository.
