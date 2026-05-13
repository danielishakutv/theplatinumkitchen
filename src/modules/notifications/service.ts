import "server-only";

import { getFromAddress, getResendClient, isConfigured } from "./client";
import {
  renderEmailChangeVerification,
  renderOrderReceived,
  renderPasswordReset,
  type OrderEmailLine,
} from "./templates";

interface SendResult {
  delivered: boolean;
  // Only populated in dev/no-key environments — the raw URL is also logged so
  // a human can click it during local testing.
  loggedToConsole?: boolean;
}

async function send(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SendResult> {
  if (!isConfigured()) {
    console.log(`[notifications] (no RESEND_API_KEY) Would send to ${to}: ${subject}`);
    console.log(`[notifications] text body:\n${text}`);
    return { delivered: false, loggedToConsole: true };
  }

  const client = getResendClient();
  if (!client) {
    return { delivered: false, loggedToConsole: true };
  }

  const { error } = await client.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[notifications] Resend error", error);
    throw new Error(`Failed to send email: ${error.message ?? "unknown error"}`);
  }

  return { delivered: true };
}

export async function sendPasswordResetEmail(args: {
  to: string;
  resetUrl: string;
  ttlMinutes: number;
}): Promise<SendResult> {
  const { subject, html, text } = renderPasswordReset({
    resetUrl: args.resetUrl,
    ttlMinutes: args.ttlMinutes,
  });
  return send(args.to, subject, html, text);
}

export async function sendOrderReceivedEmail(args: {
  to: string;
  customerFirstName: string;
  orderNumber: string;
  totalFormatted: string;
  fulfilmentLabel: string;
  paymentLabel: string;
  trackingUrl: string;
  lines: OrderEmailLine[];
}): Promise<SendResult> {
  const { subject, html, text } = renderOrderReceived({
    customerFirstName: args.customerFirstName,
    orderNumber: args.orderNumber,
    totalFormatted: args.totalFormatted,
    fulfilmentLabel: args.fulfilmentLabel,
    paymentLabel: args.paymentLabel,
    trackingUrl: args.trackingUrl,
    lines: args.lines,
  });
  return send(args.to, subject, html, text);
}

export async function sendEmailChangeVerification(args: {
  to: string;
  verifyUrl: string;
  ttlMinutes: number;
}): Promise<SendResult> {
  const { subject, html, text } = renderEmailChangeVerification({
    verifyUrl: args.verifyUrl,
    ttlMinutes: args.ttlMinutes,
  });
  return send(args.to, subject, html, text);
}
