import type { Metadata } from "next";
import { getSettings } from "@/modules/settings";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your order with Platinum Kitchen.",
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <CheckoutClient
      bank={{
        name: settings.bankName,
        accountName: settings.bankAccountName,
        accountNumber: settings.bankAccountNumber,
        note: settings.bankTransferNote,
      }}
    />
  );
}
