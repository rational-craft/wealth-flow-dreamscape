
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  WealthProjection,
  IncomeSource,
  ExpenseCategory,
  EquityPayout,
  RealEstateProperty,
} from "@/pages/Index";

// Utility for $, commas, no decimals
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

type Props = {
  incomes: IncomeSource[];
  expenses: ExpenseCategory[];
  equityPayouts: EquityPayout[];
  properties: RealEstateProperty[];
  projections: WealthProjection[];
  projectionYears: number;
};

export const SummaryDashboard: React.FC<Props> = ({
  incomes,
  expenses,
  equityPayouts,
  properties,
  projections,
  projectionYears,
}) => {
  // INCOME: group by year/type
  const annualIncomeByType: Record<string, number[]> = {};
  const incomeTypes: Record<string, string> = {};
  const years = Array.from({ length: projectionYears }, (_, i) => i + 1);

  incomes.forEach((inc) => {
    // Example: Salary, RSU, etc
    const key =
      inc.type === "rsu" && inc.vestingStartYear
        ? `RSU: ${inc.name} [Grant ${inc.vestingStartYear}]`
        : inc.name;
    if (!annualIncomeByType[key]) annualIncomeByType[key] = Array(projectionYears).fill(0);
    incomeTypes[key] = inc.type;

    if (inc.type === "rsu" && inc.vestingStartYear && inc.vestingLength) {
      // Split into traunches per vesting rule
      const traunch = (inc.amount || 0) / inc.vestingLength;
      for (let i = 0; i < inc.vestingLength; i++) {
        const y = inc.vestingStartYear - 1 + i;
        if (y >= 0 && y < projectionYears) {
          annualIncomeByType[key][y] += traunch;
        }
      }
    } else {
      // Regular: spread across all years
      years.forEach((year, idx) => {
        const amt = inc.frequency === "monthly" ? inc.amount * 12 : inc.amount;
        annualIncomeByType[key][idx] += amt;
      });
    }
  });

  // Equity Payouts (summed separately from income - e.g. option/RSU sales)
  const equityByYear = Array(projectionYears).fill(0);
  equityPayouts.forEach((ep) => {
    if (ep.year && ep.year <= projectionYears) equityByYear[ep.year - 1] += ep.amount;
  });

  // EXPENSES
  const annualExpenseByName: Record<string, number[]> = {};
  expenses.forEach((exp) => {
    if (!annualExpenseByName[exp.name]) annualExpenseByName[exp.name] = Array(projectionYears).fill(0);
    years.forEach((year, idx) => {
      const amt = exp.frequency === "monthly" ? exp.amount * 12 : exp.amount;
      annualExpenseByName[exp.name][idx] += amt;
    });
  });

  // TAXES
  const taxesByYear = projections.map((p) => p.taxes);

  // INVESTMENT GAINS
  const invGainsByYear = projections.map((p, idx) =>
    idx === 0 ? 0 : p.cumulativeWealth - projections[idx - 1].cumulativeWealth - p.savings
  );

  // REAL ESTATE & DEBT
  const realEstateValueByYear = projections.map((p) => p.realEstateValue);
  const loanBalanceByYear = projections.map((p) => p.loanBalance);
  const realEstateEquityByYear = projections.map((p) => p.realEstateEquity);

  // Only use the final year's values when showing summaries
  const latestRealEstateValue = realEstateValueByYear[realEstateValueByYear.length - 1] || 0;
  const latestLoanBalance = loanBalanceByYear[loanBalanceByYear.length - 1] || 0;
  const latestRealEstateEquity = realEstateEquityByYear[realEstateEquityByYear.length - 1] || 0;

  // NET WORTH
  const netWorthByYear = projections.map((p) => p.cumulativeWealth);

  return (
    <Accordion type="multiple" className="w-full space-y-3">
      {/* INCOME */}
      <AccordionItem value="income">
        <AccordionTrigger>
          <div className="flex justify-between w-full pr-6">
            <span className="font-medium text-lg">Income</span>
            <span className="font-semibold text-green-700">
              {formatCurrency(
                years.reduce(
                  (tot, yearIdx) =>
                    tot +
                    Object.values(annualIncomeByType).reduce(
                      (sum, arr) => sum + arr[yearIdx],
                      0
                    ),
                  0
                )
              )}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-2 overflow-x-auto">
            <table className="min-w-full text-sm mb-3">
              <thead>
                <tr>
                  <th className="p-2 text-left">Type</th>
                  {years.map((y) => (
                    <th key={y} className="p-2">{y}</th>
                  ))}
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(annualIncomeByType).map(([key, arr]) => (
                  <tr key={key} className="border-t">
                    <td className="p-2">{key}</td>
                    {arr.map((v, i) => (
                      <td key={i} className="p-2">{formatCurrency(v)}</td>
                    ))}
                    <td className="p-2 font-semibold">{formatCurrency(arr.reduce((a, b) => a + b, 0))}</td>
                  </tr>
                ))}
                {/* Equity payout row */}
                {!!equityPayouts.length && (
                  <tr>
                    <td className="p-2 text-blue-800">Equity Payout(s)</td>
                    {equityByYear.map((v, i) => (
                      <td key={i} className="p-2">{formatCurrency(v)}</td>
                    ))}
                    <td className="p-2 font-semibold">{formatCurrency(equityByYear.reduce((a, b) => a + b, 0))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* EXPENSES */}
      <AccordionItem value="expenses">
        <AccordionTrigger>
          <div className="flex justify-between w-full pr-6">
            <span className="font-medium text-lg">Expenses</span>
            <span className="font-semibold text-red-700">
              {formatCurrency(
                years.reduce(
                  (tot, yearIdx) =>
                    tot +
                    Object.values(annualExpenseByName).reduce(
                      (sum, arr) => sum + arr[yearIdx],
                      0
                    ),
                  0
                )
              )}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-2 overflow-x-auto">
            <table className="min-w-full text-sm mb-3">
              <thead>
                <tr>
                  <th className="p-2 text-left">Category</th>
                  {years.map((y) => (
                    <th key={y} className="p-2">{y}</th>
                  ))}
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(annualExpenseByName).map(([key, arr]) => (
                  <tr key={key} className="border-t">
                    <td className="p-2">{key}</td>
                    {arr.map((v, i) => (
                      <td key={i} className="p-2">{formatCurrency(v)}</td>
                    ))}
                    <td className="p-2 font-semibold">{formatCurrency(arr.reduce((a, b) => a + b, 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* TAXES */}
      <AccordionItem value="taxes">
        <AccordionTrigger>
          <div className="flex justify-between w-full pr-6">
            <span className="font-medium text-lg">Taxes</span>
            <span className="font-semibold text-yellow-700">
              {formatCurrency(taxesByYear.reduce((a, b) => a + b, 0))}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-2 overflow-x-auto">
            <table className="min-w-full text-sm mb-3">
              <thead>
                <tr>
                  <th className="p-2 text-left">Year</th>
                  {years.map((y) => (
                    <th key={y} className="p-2">{y}</th>
                  ))}
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">Taxes Paid</td>
                  {taxesByYear.map((t, i) => (
                    <td key={i} className="p-2">{formatCurrency(t)}</td>
                  ))}
                  <td className="p-2 font-semibold">{formatCurrency(taxesByYear.reduce((a, b) => a + b, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* INVESTMENT GAINS */}
      <AccordionItem value="investments">
        <AccordionTrigger>
          <div className="flex justify-between w-full pr-6">
            <span className="font-medium text-lg">Investment Gains</span>
            <span className="font-semibold text-blue-700">
              {formatCurrency(invGainsByYear.reduce((a, b) => a + b, 0))}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-2 overflow-x-auto">
            <table className="min-w-full text-sm mb-3">
              <thead>
                <tr>
                  <th className="p-2 text-left">Year</th>
                  {years.map((y) => (
                    <th key={y} className="p-2">{y}</th>
                  ))}
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">Investment Gain</td>
                  {invGainsByYear.map((g, i) => (
                    <td key={i} className="p-2">{formatCurrency(g)}</td>
                  ))}
                  <td className="p-2 font-semibold">{formatCurrency(invGainsByYear.reduce((a, b) => a + b, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* REAL ESTATE & DEBT */}
      <AccordionItem value="realestate">
        <AccordionTrigger>
          <div className="flex justify-between w-full pr-6">
            <span className="font-medium text-lg">Real Estate & Debt</span>
            <span className="font-semibold text-purple-700">
              Net Property: {formatCurrency(latestRealEstateValue - latestLoanBalance)}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-2 overflow-x-auto">
            <table className="min-w-full text-sm mb-3">
              <thead>
                <tr>
                  <th className="p-2 text-left">Year</th>
                  {years.map((y) => (
                    <th key={y} className="p-2">{y}</th>
                  ))}
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Real Estate Value</td>
                  {realEstateValueByYear.map((v, i) => (
                    <td key={i} className="p-2">{formatCurrency(v)}</td>
                  ))}
                  <td className="p-2 font-semibold">{formatCurrency(latestRealEstateValue)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-red-700">Loan Balance</td>
                  {loanBalanceByYear.map((l, i) => (
                    <td key={i} className="p-2">{formatCurrency(l)}</td>
                  ))}
                  <td className="p-2 font-semibold">{formatCurrency(latestLoanBalance)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-green-700">Real Estate Equity</td>
                  {realEstateEquityByYear.map((e, i) => (
                    <td key={i} className="p-2">{formatCurrency(e)}</td>
                  ))}
                  <td className="p-2 font-semibold">{formatCurrency(latestRealEstateEquity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* NET WORTH */}
      <AccordionItem value="networth">
        <AccordionTrigger>
          <div className="flex justify-between w-full pr-6">
            <span className="font-medium text-lg">Net Worth (End of Year)</span>
            <span className="font-semibold text-emerald-800">
              {formatCurrency(netWorthByYear[netWorthByYear.length - 1] || 0)}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-2 overflow-x-auto">
            <table className="min-w-full text-sm mb-3">
              <thead>
                <tr>
                  <th className="p-2 text-left">Year</th>
                  {years.map((y) => (
                    <th key={y} className="p-2">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Net Worth</td>
                  {netWorthByYear.map((n, i) => (
                    <td key={i} className="p-2 font-semibold">{formatCurrency(n)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SummaryDashboard;

