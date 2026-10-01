import { createGoogle } from "@ai-sdk/google";
import { serverEnv } from "@/lib/server-env";

const google = createGoogle({ apiKey: serverEnv.AI_API_KEY });

// Every AI feature imports this. To switch providers (for example to
// Claude), only this file needs to change.
export const aiModel = google(serverEnv.AI_MODEL);