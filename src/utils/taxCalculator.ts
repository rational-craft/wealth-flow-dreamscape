
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
    { min: 578125, max: Infinity, rate: 37 }
  ],
  marriedFilingJointly: [
    { min: 0, max: 22000, rate: 10 },
    { min: 22000, max: 89450, rate: 12 },
    { min: 89450, max: 190750, rate: 22 },
    { min: 190750, max: 364200, rate: 24 },
    { min: 364200, max: 462500, rate: 32 },
    { min: 462500, max: 693750, rate: 35 },
    { min: 693750, max: Infinity, rate: 37 }
  ],
  marriedFilingSeparately: [
    { min: 0, max: 11000, rate: 10 },
    { min: 11000, max: 44725, rate: 12 },
    { min: 44725, max: 95375, rate: 22 },
    { min: 95375, max: 182050, rate: 24 },
    { min: 182050, max: 231250, rate: 32 },
    { min: 231250, max: 346875, rate: 35 },
    { min: 346875, max: Infinity, rate: 37 }
  ],
  headOfHousehold: [
    { min: 0, max: 15700, rate: 10 },
    { min: 15700, max: 59850, rate: 12 },
    { min: 59850, max: 95350, rate: 22 },
    { min: 95350, max: 182050, rate: 24 },
    { min: 182050, max: 231250, rate: 32 },
    { min: 231250, max: 578100, rate: 35 },
    { min: 578100, max: Infinity, rate: 37 }
  ]
};

// State tax rates by state
export const STATE_TAX_RATES = {
  'Alabama': 5.0,
  'Alaska': 0.0,
  'Arizona': 4.5,
  'Arkansas': 5.5,
  'California': 9.3,
  'Colorado': 4.4,
  'Connecticut': 5.5,
  'Delaware': 6.0,
  'Florida': 0.0,
  'Georgia': 5.75,
  'Hawaii': 8.25,
  'Idaho': 6.0,
  'Illinois': 4.95,
  'Indiana': 3.23,
  'Iowa': 6.0,
  'Kansas': 5.7,
  'Kentucky': 5.0,
  'Louisiana': 4.25,
  'Maine': 7.15,
  'Maryland': 5.75,
  'Massachusetts': 5.0,
  'Michigan': 4.25,
  'Minnesota': 9.85,
  'Mississippi': 5.0,
  'Missouri': 5.4,
  'Montana': 6.75,
  'Nebraska': 6.84,
  'Nevada': 0.0,
  'New Hampshire': 0.0,
  'New Jersey': 8.97,
  'New Mexico': 5.9,
  'New York': 8.82,
  'North Carolina': 4.75,
  'North Dakota': 2.9,
  'Ohio': 3.99,
  'Oklahoma': 5.0,
  'Oregon': 9.9,
  'Pennsylvania': 3.07,
  'Rhode Island': 5.99,
  'South Carolina': 7.0,
  'South Dakota': 0.0,
  'Tennessee': 0.0,
  'Texas': 0.0,
  'Utah': 4.85,
  'Vermont': 8.75,
  'Virginia': 5.75,
  'Washington': 0.0,
  'West Virginia': 6.5,
  'Wisconsin': 7.65,
  'Wyoming': 0.0
};

export const FILING_STATUSES = {
  single: 'Single',
  marriedFilingJointly: 'Married Filing Jointly',
  marriedFilingSeparately: 'Married Filing Separately',
  headOfHousehold: 'Head of Household'
};

export const calculateFederalTax = (income: number, incomeType: string, filingStatus: keyof typeof FEDERAL_TAX_BRACKETS): number => {
  if (incomeType === 'investment') {
    // Simplified capital gains tax (15% for most earners)
    return income * 0.15;
  }

  // Progressive tax calculation for ordinary income
  let tax = 0;
  let remainingIncome = income;
  const brackets = FEDERAL_TAX_BRACKETS[filingStatus] || FEDERAL_TAX_BRACKETS.single;

  for (const bracket of brackets) {
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

export const calculateStateTax = (income: number, incomeType: string, state: keyof typeof STATE_TAX_RATES): number => {
  const rate = STATE_TAX_RATES[state] || 0;
  return income * (rate / 100);
};

export const calculateTotalTax = (income: number, incomeType: string, state?: keyof typeof STATE_TAX_RATES, filingStatus?: keyof typeof FEDERAL_TAX_BRACKETS): number => {
  const federalTax = calculateFederalTax(income, incomeType, filingStatus || 'single');
  const stateTax = calculateStateTax(income, incomeType, state || 'California');
  return federalTax + stateTax;
};

export const getEffectiveTaxRate = (income: number, incomeType: string, state?: keyof typeof STATE_TAX_RATES, filingStatus?: keyof typeof FEDERAL_TAX_BRACKETS): number => {
  if (income === 0) return 0;
  const totalTax = calculateTotalTax(income, incomeType, state, filingStatus);
  return (totalTax / income) * 100;
};
