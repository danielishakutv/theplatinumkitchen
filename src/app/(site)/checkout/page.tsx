import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your order with Platinum Kitchen.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
