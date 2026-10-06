import { createGoogle } from "@ai-sdk/google";
import type { LanguageModelV4Middleware } from "@ai-sdk/provider";
import { APICallError, wrapLanguageModel } from "ai";
import { serverEnv } from "@/lib/server-env";

const google = createGoogle({ apiKey: serverEnv.AI_API_KEY });

const mainModel = google(serverEnv.AI_MODEL);
const backupModel = google(serverEnv.AI_BACKUP_MODEL);

// 429 = too many requests, 500 = server error, 503 = overloaded.
// These mean "try somewhere else", not "your request was wrong".
const BUSY_STATUS_CODES = new Set([429, 500, 503]);

function isBusyError(error: unknown) {
  return (
    APICallError.isInstance(error) &&
    error.statusCode !== undefined &&
    BUSY_STATUS_CODES.has(error.statusCode)
  );
}

// Middleware sits between our app and the AI model. This one sends the
// request to the backup model whenever the main model is busy.
const useBackupWhenBusy: LanguageModelV4Middleware = {
  specificationVersion: "v4",
  wrapGenerate: async ({ doGenerate, params }) => {
    try {
      return await doGenerate();
    } catch (error) {
      if (!isBusyError(error)) {
        throw error;
      }
      console.warn(
        `AI model "${serverEnv.AI_MODEL}" is busy. Trying "${serverEnv.AI_BACKUP_MODEL}" instead.`,
      );
      return backupModel.doGenerate(params);
    }
  },
};

// Every AI feature imports this. To switch providers (for example to
// Claude), only this file needs to change.
export const aiModel = wrapLanguageModel({
  model: mainModel,
  middleware: useBackupWhenBusy,
});