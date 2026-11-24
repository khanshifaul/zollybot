### Added

- Jarvis answers with the selected on-device GGUF model through llama.cpp instead of always sending the prompt to the server Butler.
- Local Jarvis keeps the chat history, speaks its replies, includes screen context, and unloads the model when the screen closes.
- Jarvis switches from the orb to a chat transcript after the first turn, and the composer shows a microphone button for dictation.
- A right sidebar keeps local conversations across launches; Jarvis settings moved to its bottom.
- Device commands run locally with confirmation: timers, opening apps, dialing, and opening system settings.
- Local Jarvis reads text files and images on the phone; camera, photo, file, and screen context stay offline.
- Butler is contacted only when the user explicitly asks Jarvis to ask, tell, message, or contact Butler.

### Changed

- Settings show the active downloaded GGUF and link to the single local-model catalog, replacing the separate built-in model list.

### Fixed

- Hugging Face GGUF downloads now read the checksum from `lfs.sha256` as well as the older `lfs.oid`, so LFM and other current repositories can be downloaded.
