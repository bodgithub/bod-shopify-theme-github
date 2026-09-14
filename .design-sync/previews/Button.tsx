import React from "react";
import { Button } from "@bodology/design-system";

export const Primary = () => <Button>Add to Cart</Button>;

export const Variants = () => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
    <Button>Add to Cart</Button>
    <Button variant="outline">Learn More</Button>
    <span
      style={{
        display: "inline-flex",
        padding: 16,
        borderRadius: 12,
        background:
          "radial-gradient(140% 165% at 18% 10%, #2e54c8 0%, #1e3fa8 30%, #14307c 65%, #0e2160 100%)",
      }}
    >
      <Button variant="white">Shop Now</Button>
    </span>
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
    <Button>Default</Button>
    <Button size="medium">Medium</Button>
    <Button size="small">Small</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ width: 320 }}>
    <Button fullWidth>Add to Cart — $52.00</Button>
  </div>
);
