# openWakeWord models

Bundled from [openWakeWord v0.5.1](https://github.com/dscripka/openWakeWord/releases/tag/v0.5.1),
which is Apache-2.0.

| File                     | Purpose                        |
| ------------------------ | ------------------------------ |
| `melspectrogram.tflite`  | Shared audio feature extractor |
| `embedding_model.tflite` | Shared speech embedding model  |
| `hey_jarvis_v0.1.tflite` | "Hey Jarvis" classifier        |

The native runtime is `react-native-openwakeword`. It loads all three files; the two shared models
are reused for every wake phrase.
