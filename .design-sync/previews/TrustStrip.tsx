import React from "react";
import { TrustStrip } from "@bodology/design-system";

const ITEMS = [
  { icon: "flask" as const, title: "3rd-Party Tested", sub: "COA Published" },
  { icon: "usa" as const, title: "Made in the USA", sub: "GMP Facility" },
  { icon: "leaf" as const, title: "Vegan & Non-GMO", sub: "Gluten-Free" },
  { icon: "shield" as const, title: "60-Day Guarantee", sub: "Money Back" },
];

export const GradientFrame = () => (
  <TrustStrip headline="Why women choose Bodology" items={ITEMS} />
);

export const Solid = () => <TrustStrip variant="solid" items={ITEMS} />;

export const TwoColumns = () => (
  <div style={{ maxWidth: 380 }}>
    <TrustStrip columns={2} items={ITEMS} />
  </div>
);
