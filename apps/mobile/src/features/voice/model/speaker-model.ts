import { SPEAKER_MODEL_DIRECTORY, SPEAKER_MODEL_FILES } from "@zollybot/contracts/speech-models";
import { createModelDownload } from "./model-download";
import { speechNative } from "./speech-native";

/** NeMo Titanet Small, the local speaker-embedding model for Jarvis Voice match. */
export const speakerModel = createModelDownload({
  directory: SPEAKER_MODEL_DIRECTORY,
  files: SPEAKER_MODEL_FILES,
  unload: async () => {
    await speechNative?.unloadSpeakerModel?.();
  },
});

export const useSpeakerModel = speakerModel.useModel;
