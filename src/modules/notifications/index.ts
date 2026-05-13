// Public surface of the notifications module. Server-only — the whole module
// uses Resend / "server-only" and has no client-safe exports.
// See [[feedback_client_imports]].
import "server-only";

export {
  sendPasswordResetEmail,
  sendEmailChangeVerification,
  sendOrderReceivedEmail,
} from "./service";
export { isConfigured as isEmailConfigured } from "./client";
