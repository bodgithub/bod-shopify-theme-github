import React from "react";
import { StudyCard } from "@bodology/design-system";

export const Default = () => (
  <StudyCard
    title="Study 1 · [Study title]"
    subtitle="Study background"
    chips={["Randomized", "Double-blind", "Placebo-controlled", "[n participants]"]}
  >
    <p>
      [Replace with the study summary: who was studied, what was measured, and
      over what duration — sourced from the study itself.]
    </p>
  </StudyCard>
);
