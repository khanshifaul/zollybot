### Added

- GGUF downloads now pause, resume, and cancel; progress shows bytes, speed, and ETA, and an interrupted download resumes after the app restarts.
- Downloads check free space and verify the file size, GGUF header, and SHA-256 checksum before the model appears in Downloaded models.

### Fixed

- Hugging Face GGUF downloads now read the checksum from `lfs.sha256` as well as the older `lfs.oid`, so LFM and other current repositories can be downloaded.
