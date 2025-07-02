export const BASE_SUGGESTIONS = [
  "Input a salary of $200,000 for year 1 with a 2% growth rate",
  "Set initial wealth to $50,000",
  "Change projection years to 20",
  "Set bonus of $15,000 in year 2",
  "Update expected annual return to 8%",
  "Add an expense called Housing for $2,000 per month",
];

export function getContextSuggestions(input: string): string[] {
  const lowered = input.toLowerCase();

  // Return suggestions based on some simple keyword heuristics
  if (lowered.includes("income") || lowered.includes("salary")) {
    return [
      "Input a salary of $200,000 for year 1 with a 2% growth rate",
      "Add a freelance income of $10,000 per year",
      "Set bonus of $15,000 in year 2",
    ];
  }
  if (lowered.includes("bonus")) {
    return [
      "Set bonus of $15,000 in year 2",
      "Update bonus payout for year 3",
      "Remove all bonus entries",
    ];
  }
  if (lowered.includes("expense")) {
    return [
      "Add an expense called Housing for $2,000 per month",
      "Set a new monthly food expense of $400",
      "Update growth rate for expenses to 3%",
    ];
  }
  if (lowered.includes("wealth") || lowered.includes("net worth")) {
    return ["Set initial wealth to $50,000", "Change projection years to 20"];
  }
  // Fallback: filter from BASE_SUGGESTIONS
  return BASE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(lowered));
}
