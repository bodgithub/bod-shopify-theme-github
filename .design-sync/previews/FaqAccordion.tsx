import React from "react";
import { FaqAccordion } from "@bodology/design-system";

export const Default = () => (
  <FaqAccordion
    items={[
      {
        question: "How do I take it?",
        answer: (
          <p>
            One serving is 2 scoops daily — 4,000mg Myo-Inositol + 100mg
            D-Chiro-Inositol. It's unflavored, so mix it into water, coffee, or
            a smoothie.
          </p>
        ),
        open: true,
      },
      {
        question: "What is the 40:1 ratio?",
        answer: (
          <p>
            Each serving delivers Myo-Inositol and D-Chiro-Inositol at a 40:1
            ratio — the full clinically studied daily dose in a single serving.
          </p>
        ),
      },
      {
        question: "What if it's not for me?",
        answer: (
          <p>
            Every first order is covered by our 60-day money-back guarantee.
          </p>
        ),
      },
    ]}
  />
);
