import React from "react";
import { Footnote } from "@bodology/design-system";

export const StudyFootnote = () => (
  <Footnote>
    <p>
      †Based on a [duration], randomized, double-blind, placebo-controlled
      clinical study, when taken daily.
    </p>
  </Footnote>
);

export const FdaDisclaimer = () => (
  <Footnote>
    <p>
      *These statements have not been evaluated by the Food and Drug
      Administration. This product is not intended to diagnose, treat, cure, or
      prevent any disease.
    </p>
  </Footnote>
);
