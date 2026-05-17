import type { Metadata } from "next";
import { getSettings } from "@/modules/settings";
import { auth } from "@/lib/auth";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your order with Platinum Kitchen.",
};

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getSettings(), auth()]);
  // Pre-fill name/email from the signed-in account when present. Customers
  // sign in to the same Auth.js session, so this lets them skip retyping the
  // basics — phone still has to be entered since it isn't on the user record.
  const account = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }
    : null;
  return (
    <CheckoutClient
      account={account}
      bank={{
        name: settings.bankName,
        accountName: settings.bankAccountName,
        accountNumber: settings.bankAccountNumber,
        note: settings.bankTransferNote,
      }}
    />
  );
}
