import React from "react";
import { BuyBox } from "@bodology/design-system";

const PLANS = [
  {
    name: "Subscribe & Save",
    price: "$52.00",
    note: "45-day supply. Cancel anytime.",
    badge: "Save 20%",
  },
  { name: "One-time purchase", price: "$65.00", note: "45-day supply" },
];

export const SubscriptionSelected = () => (
  <BuyBox
    title="Myo + D-Chiro Inositol"
    rating={4.8}
    plans={PLANS}
    note="60-Day Money-Back Guarantee"
  />
);

export const OneTimeSelected = () => (
  <BuyBox
    title="Myo + D-Chiro Inositol"
    rating={4.8}
    plans={PLANS}
    selectedIndex={1}
    note="60-Day Money-Back Guarantee"
  />
);
