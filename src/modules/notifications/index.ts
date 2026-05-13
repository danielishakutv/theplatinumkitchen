// Public surface of the notifications module.
export {
  sendPasswordResetEmail,
  sendEmailChangeVerification,
} from "./service";
export { isConfigured as isEmailConfigured } from "./client";
