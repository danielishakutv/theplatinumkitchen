// Public surface of the settings module. Server-only — client components must
// import types only (or deep-import from @/modules/settings/types).
// See [[feedback_client_imports]].
import "server-only";

export type { Settings } from "./types";
export { SettingsError } from "./types";
export {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from "./validation";
export { getSettings, updateSettings } from "./service";
export { settings } from "./schema";
