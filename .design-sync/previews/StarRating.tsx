import React from "react";
import { StarRating } from "@bodology/design-system";

export const Default = () => <StarRating rating={4.8} />;

export const PartialFill = () => <StarRating rating={3.5} />;

export const StarsOnly = () => <StarRating rating={4.8} showLabel={false} size={24} />;
