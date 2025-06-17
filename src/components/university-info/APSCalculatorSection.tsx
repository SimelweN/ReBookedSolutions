import React from "react";
import ModernAPSCalculator from "./ModernAPSCalculator";
import APSErrorBoundary from "./APSErrorBoundary";

const APSCalculatorSection = () => {
  return (
    <APSErrorBoundary>
      <ModernAPSCalculator />
    </APSErrorBoundary>
  );
};

export default APSCalculatorSection;
