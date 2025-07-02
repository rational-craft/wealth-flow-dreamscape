export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2024 Federal Tax Brackets by Filing Status
export const FEDERAL_TAX_BRACKETS = {
  single: [
    { min: 0, max: 11000, rate: 10 },
    { min: 11000, max: 44725, rate: 12 },
    { min: 44725, max: 95375, rate: 22 },
    { min: 95375, max: 182050, rate: 24 },
    { min: 182050, max: 231250, rate: 32 },
    { min: 231250, max: 578125, rate: 35 },
    { min: 578125, max: Infinity, rate: 37 },
  ],
  marriedFilingJointly: [
    { min: 0, max: 22000, rate: 10 },
    { min: 22000, max: 89450, rate: 12 },
    { min: 89450, max: 190750, rate: 22 },
    { min: 190750, max: 364200, rate: 24 },
    { min: 364200, max: 462500, rate: 32 },
    { min: 462500, max: 693750, rate: 35 },
    { min: 693750, max: Infinity, rate: 37 },
  ],
  marriedFilingSeparately: [
    { min: 0, max: 11000, rate: 10 },
    { min: 11000, max: 44725, rate: 12 },
    { min: 44725, max: 95375, rate: 22 },
    { min: 95375, max: 182050, rate: 24 },
    { min: 182050, max: 231250, rate: 32 },
    { min: 231250, max: 346875, rate: 35 },
    { min: 346875, max: Infinity, rate: 37 },
  ],
  headOfHousehold: [
    { min: 0, max: 15700, rate: 10 },
    { min: 15700, max: 59850, rate: 12 },
    { min: 59850, max: 95350, rate: 22 },
    { min: 95350, max: 182050, rate: 24 },
    { min: 182050, max: 231250, rate: 32 },
    { min: 231250, max: 578100, rate: 35 },
    { min: 578100, max: Infinity, rate: 37 },
  ],
};

// State tax rates by state
export const STATE_TAX_RATES = {
  Alabama: 5.0,
  Alaska: 0.0,
  Arizona: 4.5,
  Arkansas: 5.5,
  California: 9.3,
  Colorado: 4.4,
  Connecticut: 5.5,
  Delaware: 6.0,
  Florida: 0.0,
  Georgia: 5.75,
  Hawaii: 8.25,
  Idaho: 6.0,
  Illinois: 4.95,
  Indiana: 3.23,
  Iowa: 6.0,
  Kansas: 5.7,
  Kentucky: 5.0,
  Louisiana: 4.25,
  Maine: 7.15,
  Maryland: 5.75,
  Massachusetts: 5.0,
  Michigan: 4.25,
  Minnesota: 9.85,
  Mississippi: 5.0,
  Missouri: 5.4,
  Montana: 6.75,
  Nebraska: 6.84,
  Nevada: 0.0,
  "New Hampshire": 0.0,
  "New Jersey": 8.97,
  "New Mexico": 5.9,
  "New York": 8.82,
  "North Carolina": 4.75,
  "North Dakota": 2.9,
  Ohio: 3.99,
  Oklahoma: 5.0,
  Oregon: 9.9,
  Pennsylvania: 3.07,
  "Rhode Island": 5.99,
  "South Carolina": 7.0,
  "South Dakota": 0.0,
  Tennessee: 0.0,
  Texas: 0.0,
  Utah: 4.85,
  Vermont: 8.75,
  Virginia: 5.75,
  Washington: 0.0,
  "West Virginia": 6.5,
  Wisconsin: 7.65,
  Wyoming: 0.0,
};

// Example progressive state brackets for select states
export const STATE_PROGRESSIVE_BRACKETS: Record<string, TaxBracket[]> = {
  California: [
    { min: 0, max: 10412, rate: 1 },
    { min: 10412, max: 24684, rate: 2 },
    { min: 24684, max: 38959, rate: 4 },
    { min: 38959, max: 54081, rate: 6 },
    { min: 54081, max: 68350, rate: 8 },
    { min: 68350, max: 349137, rate: 9.3 },
    { min: 349137, max: 418961, rate: 10.3 },
    { min: 418961, max: 698271, rate: 11.3 },
    { min: 698271, max: Infinity, rate: 12.3 },
  ],
  NewYork: [
    { min: 0, max: 8500, rate: 4 },
    { min: 8500, max: 11700, rate: 4.5 },
    { min: 11700, max: 13900, rate: 5.25 },
    { min: 13900, max: 21400, rate: 5.9 },
    { min: 21400, max: 80650, rate: 6.33 },
    { min: 80650, max: 215400, rate: 6.85 },
    { min: 215400, max: 1077550, rate: 9.65 },
    { min: 1077550, max: 5000000, rate: 10.3 },
    { min: 5000000, max: Infinity, rate: 10.9 },
  ],
  // add others as needed...
};

// Basic long term capital gains treatment by state
// If a state taxes capital gains the same as ordinary income,
// we simply reference the progressive brackets or flat rate.
export const STATE_LTCG_RATES: Record<
  string,
  { rate?: number; brackets?: TaxBracket[]; note?: string }
> = {
  California: {
    brackets: STATE_PROGRESSIVE_BRACKETS["California"],
    note: "Taxed as ordinary income",
  },
  NewYork: {
    brackets: STATE_PROGRESSIVE_BRACKETS["NewYork"],
    note: "Taxed as ordinary income",
  },
  "New York": {
    brackets: STATE_PROGRESSIVE_BRACKETS["NewYork"],
    note: "Taxed as ordinary income",
  },
  Washington: { rate: 7, note: "7% on gains above $250k" },
  Texas: { rate: 0, note: "No state income tax" },
  Florida: { rate: 0, note: "No state income tax" },
  // other states default to ordinary income treatment
};

// Normalize state key to allow lookup with or without spaces
const normState = (state: string) => state.replace(/\s+/g, "");

export const FILING_STATUSES = {
  single: "Single",
  marriedFilingJointly: "Married Filing Jointly",
  marriedFilingSeparately: "Married Filing Separately",
  headOfHousehold: "Head of Household",
};

export const calculateFederalTax = (
  income: number,
  incomeType: string,
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS,
): number => {
  if (incomeType === "investment") {
    // Simplified capital gains tax (15% for most earners)
    return income * 0.15;
  }

  // Progressive tax calculation for ordinary income
  let tax = 0;
  let remainingIncome = income;
  const brackets =
    FEDERAL_TAX_BRACKETS[filingStatus] || FEDERAL_TAX_BRACKETS.single;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInThisBracket = Math.min(
      remainingIncome,
      bracket.max - bracket.min,
    );
    tax += taxableInThisBracket * (bracket.rate / 100);
    remainingIncome -= taxableInThisBracket;
  }

  return tax;
};

export const calculateStateTax = (
  income: number,
  incomeType: string,
  state: keyof typeof STATE_TAX_RATES,
): number => {
  // Normalize the state key to handle spaces
  const key = (
    STATE_PROGRESSIVE_BRACKETS[state] ? state : normState(state)
  ) as keyof typeof STATE_PROGRESSIVE_BRACKETS;

  // Use progressive for supported states, flat otherwise.
  if (STATE_PROGRESSIVE_BRACKETS[key]) {
    let tax = 0;
    let remaining = income;
    for (const bracket of STATE_PROGRESSIVE_BRACKETS[key]) {
      if (remaining <= 0) break;
      const bracketSize = Math.min(remaining, bracket.max - bracket.min);
      tax += bracketSize * (bracket.rate / 100);
      remaining -= bracketSize;
    }
    return tax;
  } else {
    const rate = STATE_TAX_RATES[state] || 0;
    return income * (rate / 100);
  }
};

// Allow get federal + state tax split
export const calculateTotalTax = (
  income: number,
  incomeType: string,
  state?: keyof typeof STATE_TAX_RATES,
  filingStatus?: keyof typeof FEDERAL_TAX_BRACKETS,
  options?: { split?: boolean },
): number | { federal: number; state: number } => {
  const federal = calculateFederalTax(
    income,
    incomeType,
    filingStatus || "single",
  );
  const stateTax = calculateStateTax(income, incomeType, state || "California");

  if (options && options.split) {
    return { federal, state: stateTax };
  }
  return federal + stateTax;
};

// Payroll tax calculations
export const SOCIAL_SECURITY_WAGE_BASE = 168600;

const getAdditionalMedicareThreshold = (
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS,
) => {
  switch (filingStatus) {
    case "marriedFilingJointly":
      return 250000;
    case "marriedFilingSeparately":
      return 125000;
    default:
      return 200000;
  }
};

export const calculateSocialSecurityTax = (
  income: number,
  incomeType: string,
): number => {
  if (incomeType === "investment") return 0;
  const rate = incomeType === "freelance" ? 0.124 : 0.062;
  return Math.min(income, SOCIAL_SECURITY_WAGE_BASE) * rate;
};

export const calculateMedicareTax = (
  income: number,
  incomeType: string,
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS,
): number => {
  if (incomeType === "investment") return 0;
  const baseRate = incomeType === "freelance" ? 0.029 : 0.0145;
  let tax = income * baseRate;
  const threshold = getAdditionalMedicareThreshold(filingStatus);
  if (income > threshold) {
    tax += (income - threshold) * 0.009;
  }
  return tax;
};

export const calculatePayrollTaxes = (
  income: number,
  incomeType: string,
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS,
) => {
  return {
    socialSecurity: calculateSocialSecurityTax(income, incomeType),
    medicare: calculateMedicareTax(income, incomeType, filingStatus),
  };
};

// Calculate long-term capital gains tax (simplified 15% federal rate)
export const calculateLTCGTax = (income: number): number => {
  return income * 0.15;
};

export const getEffectiveTaxRate = (
  income: number,
  incomeType: string,
  state?: keyof typeof STATE_TAX_RATES,
  filingStatus?: keyof typeof FEDERAL_TAX_BRACKETS,
): number => {
  if (income === 0) return 0;
  const totalTax = calculateTotalTax(income, incomeType, state, filingStatus);
  let totalTaxNumber = 0;
  if (typeof totalTax === "number") {
    totalTaxNumber = totalTax;
  } else if (
    totalTax &&
    typeof totalTax === "object" &&
    "federal" in totalTax &&
    "state" in totalTax
  ) {
    totalTaxNumber = totalTax.federal + totalTax.state;
  }
  return (totalTaxNumber / income) * 100;
};

export const getStateBrackets = (
  state: keyof typeof STATE_TAX_RATES,
): { brackets?: TaxBracket[]; rate?: number } => {
  const key = (
    STATE_PROGRESSIVE_BRACKETS[state] ? state : normState(state)
  ) as keyof typeof STATE_PROGRESSIVE_BRACKETS;
  if (STATE_PROGRESSIVE_BRACKETS[key]) {
    return { brackets: STATE_PROGRESSIVE_BRACKETS[key] };
  }
  return { rate: STATE_TAX_RATES[state] || 0 };
};

export const getStateLTCGInfo = (
  state: keyof typeof STATE_TAX_RATES,
): { brackets?: TaxBracket[]; rate?: number; note?: string } => {
  const key = STATE_LTCG_RATES[state] ? state : normState(state);
  return (
    STATE_LTCG_RATES[key] || {
      rate: STATE_TAX_RATES[state] || 0,
      note: "Taxed as ordinary income",
    }
  );
};
