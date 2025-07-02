/**
 * Extracts salary, growth rate, and year from natural language input
 */
export function extractSalaryInfo(input: string) {
  const salaryMatch = input.match(/salary (of)?[ $]*([\d,]+)/i);
  const growthMatch = input.match(/(\d+(\.\d+)?)% growth/i);
  const yearMatch = input.match(/year (\d+)/i);

  const salary = salaryMatch
    ? parseInt(salaryMatch[2].replace(/,/g, ""))
    : undefined;
  const growthRate = growthMatch ? parseFloat(growthMatch[1]) : undefined;
  const year = yearMatch ? parseInt(yearMatch[1]) : 1;

  return { salary, growthRate, year };
}
