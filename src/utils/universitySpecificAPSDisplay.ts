/**
 * University-Specific APS Display Utility
 * Formats APS requirements based on each university's unique calculation method
 */

export interface UniversityAPSDisplay {
  displayText: string;
  explanation: string;
  isSpecialCalculation: boolean;
}

/**
 * Get the display format for APS requirements based on university's calculation method
 */
export function getUniversitySpecificAPSDisplay(
  universityId: string,
  standardAPS: number,
): UniversityAPSDisplay {
  const id = universityId.toLowerCase();

  switch (id) {
    case "uct":
      // UCT uses Faculty Points Score (FPS) - 9-point scale for top 6 subjects
      const uctFPS = Math.round((standardAPS / 42) * 54); // Convert 42-point to 54-point scale
      return {
        displayText: `FPS ${uctFPS}`,
        explanation:
          "UCT uses Faculty Points Score (FPS) instead of standard APS",
        isSpecialCalculation: true,
      };

    case "wits":
      // Wits uses Composite Score based on subject percentages
      const witsComposite = Math.round((standardAPS / 42) * 100); // Convert to percentage-based score
      return {
        displayText: `Composite ${witsComposite}%`,
        explanation: "Wits uses Composite Score based on subject percentages",
        isSpecialCalculation: true,
      };

    case "stellenbosch":
      // Stellenbosch uses TPT (Admission Score) based on key subject percentages
      const stellenboschTPT = Math.round((standardAPS / 42) * 100); // Convert to percentage-based score
      return {
        displayText: `TPT ${stellenboschTPT}%`,
        explanation:
          "Stellenbosch uses TPT (Admission Score) based on Language, Maths, and best 4 other subjects",
        isSpecialCalculation: true,
      };

    case "rhodes":
      // Rhodes uses average percentage across all subjects
      const rhodesAverage = Math.round((standardAPS / 42) * 100); // Convert to percentage average
      return {
        displayText: `Avg ${rhodesAverage}%`,
        explanation: "Rhodes uses average percentage across all subjects",
        isSpecialCalculation: true,
      };

    case "unisa":
      // UNISA uses custom ranking system with minimum requirements
      const unisaScore = Math.round((standardAPS / 42) * 100); // Convert to percentage-based ranking
      return {
        displayText: `Ranking ${unisaScore}%`,
        explanation:
          "UNISA uses custom ranking based on subject minimums and space availability",
        isSpecialCalculation: true,
      };

    default:
      // Standard APS for all other universities
      return {
        displayText: `APS ${standardAPS}`,
        explanation: "Standard APS calculation used",
        isSpecialCalculation: false,
      };
  }
}

/**
 * Get the methodology explanation for a university's APS calculation
 */
export function getUniversityAPSMethodology(universityId: string): string {
  const id = universityId.toLowerCase();

  switch (id) {
    case "uct":
      return "UCT Faculty Points Score (FPS): Uses a 9-point scale for your top 6 subjects excluding Life Orientation. Each subject converts to points based on percentage bands.";

    case "wits":
      return "Wits Composite Score: Calculates a weighted average based on your subject percentages, with different weights for different programs (e.g., Maths weighted higher for Engineering).";

    case "stellenbosch":
      return "Stellenbosch TPT (Admission Score): Weighted calculation using Language (25%), Mathematics (25%), and average of best 4 other subjects (50%).";

    case "rhodes":
      return "Rhodes Average Score: Simple average of all your subject percentages, with additional consideration for key subjects depending on the program.";

    case "unisa":
      return "UNISA Ranking System: Custom evaluation based on meeting minimum subject requirements (typically 50%+) and ranking based on space availability.";

    default:
      return "Standard APS: Traditional 42-point system where each subject's symbol rating (A=7, B=6, C=5, D=4, E=3, F=2, G=1) contributes to the total score.";
  }
}

/**
 * Check if a university uses special APS calculation
 */
export function usesSpecialAPSCalculation(universityId: string): boolean {
  const specialUniversities = [
    "uct",
    "wits",
    "stellenbosch",
    "rhodes",
    "unisa",
  ];
  return specialUniversities.includes(universityId.toLowerCase());
}
