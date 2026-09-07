import React from "react";
import { Price } from "@bodology/design-system";

export const OneTime = () => <Price price="$65.00" unit="$1.44 / day" />;

export const Subscription = () => (
  <Price price="$52.00" compareAt="$65.00" unit="$1.16 / day" badge="Save 20%" />
);
