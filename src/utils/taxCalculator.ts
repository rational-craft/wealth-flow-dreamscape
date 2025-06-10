
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2024 Federal Tax Brackets (Single Filer)
export const FEDERAL_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11000, rate: 10 },
  { min: 11000, max: 44725, rate: 12 },
  { min: 44725, max: 95375, rate: 22 },
  { min: 95375, max: 182050, rate: 24 },
  { min: 182050, max: 231250, rate: 32 },
  { min: 231250, max: 578125, rate: 35 },
  { min: 578125, max: Infinity, rate: 37 }
];

// State tax rates by income type (simplified averages)
export const STATE_TAX_RATES = {
  salary: 5, // Average state income tax
  freelance: 5,
  investment: 0, // Many states don't tax capital gains differently
  equity: 5,
  other: 5
};

// Federal rates by income type
export const FEDERAL_RATES_BY_TYPE = {
  salary: 'progressive', // Uses tax brackets
  freelance: 'progressive', // Uses tax brackets + self-employment tax
  investment: 15, // Long-term capital gains rate for most earners
  equity: 'progressive', // Treated as ordinary income
  other: 'progressive'
};

export const calculateFederalTax = (income: number, incomeType: string): number => {
  if (incomeType === 'investment') {
    // Simplified capital gains tax (15% for most earners)
    return income * 0.15;
  }

  // Progressive tax calculation for ordinary income
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of FEDERAL_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;

    const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInThisBracket * (bracket.rate / 100);
    remainingIncome -= taxableInThisBracket;
  }

  // Add self-employment tax for freelance income
  if (incomeType === 'freelance') {
    tax += income * 0.1413; // 14.13% self-employment tax (employer + employee portion)
  }

  return tax;
};

export const calculateStateTax = (income: number, incomeType: string): number => {
  const rate = STATE_TAX_RATES[incomeType as keyof typeof STATE_TAX_RATES] || 5;
  return income * (rate / 100);
};

export const calculateTotalTax = (income: number, incomeType: string): number => {
  const federalTax = calculateFederalTax(income, incomeType);
  const stateTax = calculateStateTax(income, incomeType);
  return federalTax + stateTax;
};

export const getEffectiveTaxRate = (income: number, incomeType: string): number => {
  if (income === 0) return 0;
  const totalTax = calculateTotalTax(income, incomeType);
  return (totalTax / income) * 100;
};
