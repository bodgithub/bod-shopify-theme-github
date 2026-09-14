import React from "react";
import { Pill } from "@bodology/design-system";

export const Eyebrow = () => <Pill>Inositol: The studies</Pill>;

export const Badge = () => <Pill variant="badge">Myo + D-Chiro Inositol</Pill>;

export const Together = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <Pill>60-Day Guarantee</Pill>
    <Pill variant="badge">40:1 Ratio</Pill>
  </div>
);
