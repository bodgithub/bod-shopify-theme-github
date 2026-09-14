import React from "react";
import { ClinicalHeader } from "@bodology/design-system";

export const Default = () => (
  <ClinicalHeader
    eyebrow="Inositol: The studies"
    heading={"Bodology:\nThe Studies"}
    subtext="Transparency comes first. Here is the research behind what we make, laid out study by study."
    links={[
      { label: "Study 1 Results", anchor: "study-1" },
      { label: "Study 2 Results", anchor: "study-2" },
    ]}
  />
);
