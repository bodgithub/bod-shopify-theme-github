import React from "react";
import { StatCard } from "@bodology/design-system";

export const Single = () => (
  <StatCard value="XX%" text="saw a positive impact on [marker]*†" />
);

export const Stack = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
    <StatCard value="XX%" text="saw a positive impact on [marker]*†" />
    <StatCard value="XX%" text="reported [outcome] after [duration]*†" />
  </div>
);
