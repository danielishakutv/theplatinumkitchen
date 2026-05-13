// Public surface of the notifications module.
export {
  sendPasswordResetEmail,
  sendEmailChangeVerification,
  sendOrderReceivedEmail,
} from "./service";
export { isConfigured as isEmailConfigured } from "./client";
