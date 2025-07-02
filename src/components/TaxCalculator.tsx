import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncomeSource, WealthProjection } from "@/pages/Index";
import { Calculator, TrendingDown, Info } from "lucide-react";
import {
  calculateTotalTax,
  calculateLTCGTax,
  calculatePayrollTaxes,
  FEDERAL_TAX_BRACKETS,
  FILING_STATUSES,
  STATE_TAX_RATES,
  STATE_PROGRESSIVE_BRACKETS,
  getStateBrackets,
  getStateLTCGInfo,
} from "@/utils/taxCalculator";

interface TaxCalculatorProps {
  incomes: IncomeSource[];
  projections: WealthProjection[];
  state: keyof typeof STATE_TAX_RATES;
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  incomes,
  projections,
  state,
  filingStatus,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Aggregate income by tax treatment type
  const getAggregatedIncomeByTaxType = (year: number) => {
    const aggregatedIncome: Record<
      string,
      { amount: number; taxType: string }
    > = {
      ordinaryIncome: { amount: 0, taxType: "salary" },
      investmentIncome: { amount: 0, taxType: "investment" },
      freelanceIncome: { amount: 0, taxType: "freelance" },
    };

    incomes.forEach((income) => {
      const annualAmount =
        income.frequency === "monthly" ? income.amount * 12 : income.amount;
      let adjustedAmount =
        annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);

      // Handle RSU vesting logic
      if (
        income.type === "rsu" &&
        income.vestingStartYear &&
        income.vestingLength
      ) {
        const traunchSize = (income.amount || 0) / income.vestingLength;
        const vestingYear = income.vestingStartYear;
        if (year >= vestingYear && year < vestingYear + income.vestingLength) {
          adjustedAmount = traunchSize;
        } else {
          adjustedAmount = 0;
        }
      }

      if (adjustedAmount > 0) {
        // Group income types by tax treatment
        if (income.type === "investment") {
          aggregatedIncome.investmentIncome.amount += adjustedAmount;
        } else if (income.type === "freelance") {
          aggregatedIncome.freelanceIncome.amount += adjustedAmount;
        } else {
          // salary, equity, rsu, bonus, other all treated as ordinary income
          aggregatedIncome.ordinaryIncome.amount += adjustedAmount;
        }
      }
    });

    return aggregatedIncome;
  };

  const getTaxBreakdownByType = (year: number) => {
    const aggregatedIncome = getAggregatedIncomeByTaxType(year);
    const taxBreakdown: Record<
      string,
      {
        grossIncome: number;
        federal: number;
        state: number;
        socialSecurity: number;
        medicare: number;
        ltcg: number;
        total: number;
        effectiveRate: number;
      }
    > = {};

    Object.entries(aggregatedIncome).forEach(
      ([category, { amount, taxType }]) => {
        if (amount > 0) {
          if (category === "investmentIncome") {
            // Long-term capital gains treatment
            const ltcg = calculateLTCGTax(amount);
            taxBreakdown[category] = {
              grossIncome: amount,
              federal: 0,
              state: 0,
              socialSecurity: 0,
              medicare: 0,
              ltcg: ltcg,
              total: ltcg,
              effectiveRate: (ltcg / amount) * 100,
            };
          } else {
            // Ordinary income treatment (progressive tax)
            const split = calculateTotalTax(
              amount,
              taxType,
              state,
              filingStatus,
              { split: true },
            );
            let federal = 0;
            let stateTax = 0;

            if (typeof split === "number") {
              federal = split;
            } else if (
              split &&
              typeof split === "object" &&
              "federal" in split &&
              "state" in split
            ) {
              federal = split.federal;
              stateTax = split.state;
            }

            const payroll = calculatePayrollTaxes(
              amount,
              taxType,
              filingStatus,
            );
            const total =
              federal + stateTax + payroll.socialSecurity + payroll.medicare;
            taxBreakdown[category] = {
              grossIncome: amount,
              federal: federal,
              state: stateTax,
              socialSecurity: payroll.socialSecurity,
              medicare: payroll.medicare,
              ltcg: 0,
              total: total,
              effectiveRate: (total / amount) * 100,
            };
          }
        }
      },
    );

    return taxBreakdown;
  };

  const getFederalStateTax = (year: number) => {
    const taxBreakdown = getTaxBreakdownByType(year);
    let fed = 0,
      stateTax = 0,
      socialSecurity = 0,
      medicare = 0,
      ltcg = 0;

    Object.values(taxBreakdown).forEach((breakdown) => {
      fed += breakdown.federal;
      stateTax += breakdown.state;
      socialSecurity += breakdown.socialSecurity;
      medicare += breakdown.medicare;
      ltcg += breakdown.ltcg;
    });

    return { fed, state: stateTax, socialSecurity, medicare, ltcg };
  };

  const year1TaxSplit = getFederalStateTax(1);

  const sumFedState = Array.from({ length: 10 }, (_, i) =>
    getFederalStateTax(i + 1),
  ).reduce(
    (acc, val) => ({
      fed: acc.fed + val.fed,
      state: acc.state + val.state,
      socialSecurity: acc.socialSecurity + val.socialSecurity,
      medicare: acc.medicare + val.medicare,
      ltcg: acc.ltcg + val.ltcg,
    }),
    { fed: 0, state: 0, socialSecurity: 0, medicare: 0, ltcg: 0 },
  );

  const currentYearTaxes = getTaxBreakdownByType(1);
  const totalCurrentTax = Object.values(currentYearTaxes).reduce(
    (sum, tax) => sum + tax.total,
    0,
  );
  const totalCurrentIncome = Object.values(currentYearTaxes).reduce(
    (sum, tax) => sum + tax.grossIncome,
    0,
  );
  const effectiveTaxRate =
    totalCurrentIncome > 0 ? (totalCurrentTax / totalCurrentIncome) * 100 : 0;

  const stateBracketInfo = getStateBrackets(state);
  const stateLTCGInfo = getStateLTCGInfo(state);

  const getTaxCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ordinaryIncome: "Ordinary Income",
      investmentIncome: "Long-Term Capital Gains",
      freelanceIncome: "Self-Employment Income",
    };
    return labels[category] || category;
  };

  const getTaxExplanation = (category: string) => {
    const explanations: Record<string, string> = {
      ordinaryIncome:
        "Progressive federal tax brackets + state tax (includes salary, equity, RSU, bonus)",
      investmentIncome: "15% long-term capital gains rate (for most earners)",
      freelanceIncome:
        "Progressive federal tax + 14.13% self-employment tax + state tax",
    };
    return explanations[category] || "Standard progressive taxation";
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Total Annual Taxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(
                year1TaxSplit.fed +
                  year1TaxSplit.state +
                  year1TaxSplit.socialSecurity +
                  year1TaxSplit.medicare +
                  year1TaxSplit.ltcg,
              )}
            </div>
            <div className="text-xs text-red-600 mt-1 flex flex-col gap-0.5">
              <span>Federal: {formatCurrency(year1TaxSplit.fed)}</span>
              <span>State: {formatCurrency(year1TaxSplit.state)}</span>
              <span>
                Social Security: {formatCurrency(year1TaxSplit.socialSecurity)}
              </span>
              <span>Medicare: {formatCurrency(year1TaxSplit.medicare)}</span>
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
            <p className="text-xs text-orange-600 mt-1">Of gross income</p>
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

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">
              10-Year Social Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(sumFedState.socialSecurity)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Total projected Social Security fees
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">
              10-Year Medicare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(sumFedState.medicare)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Total projected Medicare fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown by Income Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Tax Breakdown by Income Category
          </CardTitle>
          <p className="text-sm text-slate-600">
            Taxes calculated on aggregated income subtotals by tax treatment
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Income Category</TableHead>
                <TableHead className="text-right">Gross Income</TableHead>
                <TableHead className="text-right">Federal Tax</TableHead>
                <TableHead className="text-right">State Tax</TableHead>
                <TableHead className="text-right">Social Security</TableHead>
                <TableHead className="text-right">Medicare</TableHead>
                <TableHead className="text-right">LTCG Tax</TableHead>
                <TableHead className="text-right">Total Tax</TableHead>
                <TableHead className="text-right">Effective Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(currentYearTaxes).map(([category, tax]) => (
                <TableRow key={category}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{getTaxCategoryLabel(category)}</div>
                      <div className="text-xs text-slate-500">
                        {getTaxExplanation(category)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(tax.grossIncome)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(tax.federal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(tax.state)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(tax.socialSecurity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(tax.medicare)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(tax.ltcg)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(tax.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(tax.effectiveRate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Brackets Reference */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">
            2024 Federal Tax Brackets ({FILING_STATUSES[filingStatus]})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEDERAL_TAX_BRACKETS[filingStatus].map((bracket, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white rounded border"
              >
                <span className="text-sm">
                  {formatCurrency(bracket.min)} -{" "}
                  {bracket.max === Infinity ? "∞" : formatCurrency(bracket.max)}
                </span>
                <span className="font-semibold text-slate-800">
                  {bracket.rate}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* State Tax Brackets Reference */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">2024 {state} Tax Brackets</CardTitle>
        </CardHeader>
        <CardContent>
          {stateBracketInfo.brackets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stateBracketInfo.brackets.map((bracket, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white rounded border"
                >
                  <span className="text-sm">
                    {formatCurrency(bracket.min)} -{" "}
                    {bracket.max === Infinity
                      ? "∞"
                      : formatCurrency(bracket.max)}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {bracket.rate}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">Flat rate: {stateBracketInfo.rate}%</p>
          )}
          <div className="mt-4">
            <h4 className="text-sm font-medium">Long-Term Capital Gains</h4>
            {stateLTCGInfo.brackets ? (
              <p className="text-sm text-slate-600">
                {stateLTCGInfo.note || "Taxed as ordinary income"}
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                {stateLTCGInfo.note || `Flat rate ${stateLTCGInfo.rate}%`}
              </p>
            )}
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
                401(k) limit: $23,000, IRA limit: $7,000 (2024) - reduces
                taxable income
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <h4 className="font-medium">Tax-Loss Harvesting</h4>
              <p className="text-sm text-slate-600">
                Offset investment gains with losses to reduce capital gains
                taxes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
            <div>
              <h4 className="font-medium">Health Savings Account (HSA)</h4>
              <p className="text-sm text-slate-600">
                2024 limit: $4,150 individual, $8,300 family - triple tax
                advantage
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
            <div>
              <h4 className="font-medium">Timing Equity Compensation</h4>
              <p className="text-sm text-slate-600">
                Consider spreading large equity payouts across tax years to
                avoid higher brackets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
