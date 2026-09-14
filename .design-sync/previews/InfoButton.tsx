import React from "react";
import { InfoButton } from "@bodology/design-system";

export const Default = () => (
  <InfoButton
    label="What is the 40:1 Ratio"
    popupTitle="The 40:1 Ratio"
    popupContent={
      <p>
        Each serving delivers 4,000mg of Myo-Inositol and 100mg of
        D-Chiro-Inositol — a 40:1 ratio.
      </p>
    }
  />
);

export const Row = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <InfoButton label="What are HOMA-IR Levels" />
    <InfoButton label="What is SHBG" />
  </div>
);
