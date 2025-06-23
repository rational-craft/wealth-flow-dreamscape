
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IncomeSource, WealthProjection } from '@/pages/Index';
import { Calculator, TrendingDown, Info } from 'lucide-react';
import { calculateTotalTax, calculateLTCGTax, FEDERAL_TAX_BRACKETS, FILING_STATUSES, STATE_TAX_RATES } from '@/utils/taxCalculator';

interface TaxCalculatorProps {
  incomes: IncomeSource[];
  projections: WealthProjection[];
  state: keyof typeof STATE_TAX_RATES;
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ incomes, projections, state, filingStatus }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getTaxByIncomeType = (year: number) => {
    const taxBreakdown: Record<string, { amount: number; percentage: number; grossIncome: number; federal: number; state: number; ltcg: number }> = {};

    incomes.forEach(income => {
      const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
      let adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
      
      // Handle RSU vesting logic
      if (income.type === 'rsu' && income.vestingStartYear && income.vestingLength) {
        const traunchSize = (income.amount || 0) / income.vestingLength;
        const vestingYear = income.vestingStartYear;
        if (year >= vestingYear && year < vestingYear + income.vestingLength) {
          adjustedAmount = traunchSize;
        } else {
          adjustedAmount = 0;
        }
      }

      if (adjustedAmount > 0) {
        const split = calculateTotalTax(adjustedAmount, income.type, state, filingStatus, { split: true });

        let federal = 0;
        let stateTax = 0;
        if (typeof split === "number") {
          federal = split;
        } else if (split && typeof split === "object" && "federal" in split && "state" in split) {
          federal = split.federal;
          stateTax = split.state;
        }

        let ltcg = 0;
        if (income.type === 'investment') {
          ltcg = calculateLTCGTax(adjustedAmount);
          federal = 0;
        }

        if (!taxBreakdown[income.type]) {
          taxBreakdown[income.type] = { amount: 0, percentage: 0, grossIncome: 0, federal: 0, state: 0, ltcg: 0 };
        }

        const total = federal + stateTax + ltcg;
        taxBreakdown[income.type].amount += total;
        taxBreakdown[income.type].federal += federal;
        taxBreakdown[income.type].state += stateTax;
        taxBreakdown[income.type].ltcg += ltcg;
        taxBreakdown[income.type].grossIncome += adjustedAmount;
        taxBreakdown[income.type].percentage = (taxBreakdown[income.type].amount / taxBreakdown[income.type].grossIncome) * 100;
      }
    });

    return taxBreakdown;
  };

  const getFederalStateTax = (year: number) => {
    let fed = 0, stateTax = 0, ltcg = 0;
    incomes.forEach(income => {
      const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
      let adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
      
      // Handle RSU vesting logic
      if (income.type === 'rsu' && income.vestingStartYear && income.vestingLength) {
        const traunchSize = (income.amount || 0) / income.vestingLength;
        const vestingYear = income.vestingStartYear;
        if (year >= vestingYear && year < vestingYear + income.vestingLength) {
          adjustedAmount = traunchSize;
        } else {
          adjustedAmount = 0;
        }
      }

      if (adjustedAmount > 0) {
        const split = calculateTotalTax(adjustedAmount, income.type, state, filingStatus, { split: true });

        let federal = 0;
        let statePart = 0;
        if (typeof split === "number") {
          federal = split;
        } else if (split && typeof split === "object" && "federal" in split && "state" in split) {
          federal = split.federal;
          statePart = split.state;
        }

        if (income.type === 'investment') {
          ltcg += calculateLTCGTax(adjustedAmount);
          federal = 0;
        }

        fed += federal;
        stateTax += statePart;
      }
    });
    return { fed, state: stateTax, ltcg };
  };

  const year1TaxSplit = getFederalStateTax(1);

  const sumFedState = Array.from({ length: 10 }, (_, i) => getFederalStateTax(i + 1)).reduce(
    (acc, val) => ({
      fed: acc.fed + val.fed,
      state: acc.state + val.state,
      ltcg: acc.ltcg + val.ltcg,
    }),
    { fed: 0, state: 0, ltcg: 0 }
  );

  const currentYearTaxes = getTaxByIncomeType(1);
  const totalCurrentTax = Object.values(currentYearTaxes).reduce(
    (sum, tax) => sum + tax.federal + tax.state + tax.ltcg,
    0
  );
  const totalCurrentIncome = Object.values(currentYearTaxes).reduce((sum, tax) => sum + tax.grossIncome, 0);
  const effectiveTaxRate = totalCurrentIncome > 0 ? (totalCurrentTax / totalCurrentIncome) * 100 : 0;

  const getIncomeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      salary: 'Salary Income',
      freelance: 'Freelance Income',
      investment: 'Investment Income',
      equity: 'Equity Compensation',
      rsu: 'RSU Income',
      bonus: 'Bonus Income',
      other: 'Other Income'
    };
    return labels[type] || type;
  };

  const getIncomeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      salary: 'bg-blue-500',
      freelance: 'bg-green-500',
      investment: 'bg-purple-500',
      equity: 'bg-orange-500',
      rsu: 'bg-pink-500',
      bonus: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getTaxExplanation = (type: string) => {
    const explanations: Record<string, string> = {
      salary: 'Progressive federal tax brackets + state tax',
      freelance: 'Progressive federal tax + 14.13% self-employment tax + state tax',
      investment: '15% long-term capital gains rate (for most earners)',
      equity: 'Progressive tax brackets (treated as ordinary income)',
      rsu: 'Progressive tax brackets (treated as ordinary income)',
      bonus: 'Progressive tax brackets (treated as ordinary income)',
      other: 'Progressive federal tax brackets + state tax'
    };
    return explanations[type] || 'Standard progressive taxation';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="text-red-600" />
        <h3 className="text-xl font-semibold text-slate-800">Tax Analysis</h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
          <Info className="w-4 h-4" />
          Filing Status: {FILING_STATUSES[filingStatus]} | State: {state}
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Total Annual Taxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(year1TaxSplit.fed + year1TaxSplit.state + year1TaxSplit.ltcg)}
            </div>
            <div className="text-xs text-red-600 mt-1 flex flex-col gap-0.5">
              <span>Federal: {formatCurrency(year1TaxSplit.fed)}</span>
              <span>State: {formatCurrency(year1TaxSplit.state)}</span>
              <span>LTCG: {formatCurrency(year1TaxSplit.ltcg)}</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Current year calculation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700">
              Effective Tax Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {formatPercentage(effectiveTaxRate)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Of gross income
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-700">
              10-Year Federal Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">
              {formatCurrency(sumFedState.fed)}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Total projected federal taxes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">
              10-Year State Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(sumFedState.state)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Total projected state taxes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown by Income Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax Breakdown by Income Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Federal</TableHead>
                <TableHead className="text-right">State</TableHead>
                <TableHead className="text-right">LTCG</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(currentYearTaxes).map(([type, tax]) => (
                <TableRow key={type}>
                  <TableCell className="capitalize font-medium">{getIncomeTypeLabel(type)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tax.federal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tax.state)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tax.ltcg)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(tax.federal + tax.state + tax.ltcg)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Brackets Reference */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">2024 Federal Tax Brackets ({FILING_STATUSES[filingStatus]})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEDERAL_TAX_BRACKETS[filingStatus].map((bracket, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="text-sm">
                  {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                </span>
                <span className="font-semibold text-slate-800">{bracket.rate}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Planning Tips */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Tax Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            <div>
              <h4 className="font-medium">Maximize Retirement Contributions</h4>
              <p className="text-sm text-slate-600">
                401(k) limit: $23,000, IRA limit: $7,000 (2024) - reduces taxable income
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <h4 className="font-medium">Tax-Loss Harvesting</h4>
              <p className="text-sm text-slate-600">
                Offset investment gains with losses to reduce capital gains taxes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
            <div>
              <h4 className="font-medium">Health Savings Account (HSA)</h4>
              <p className="text-sm text-slate-600">
                2024 limit: $4,150 individual, $8,300 family - triple tax advantage
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
            <div>
              <h4 className="font-medium">Timing Equity Compensation</h4>
              <p className="text-sm text-slate-600">
                Consider spreading large equity payouts across tax years to avoid higher brackets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
