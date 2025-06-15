
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WealthProjection, IncomeSource, ExpenseCategory, EquityPayout, RealEstateProperty } from '@/pages/Index';

// Utility for $, commas, no decimals
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
  // --- INCOME ---
  // Group all incomes by type+name+vesting/trainch year (for RSUs)
  const incomeRowsByYear: Record<number, IncomeSource[]> = {};
  const rsuRowsByYear: Record<number, number> = {};

  incomes.forEach((inc) => {
    if (inc.type === 'rsu' && inc.vestingStartYear) {
      rsuRowsByYear[inc.vestingStartYear] =
        (rsuRowsByYear[inc.vestingStartYear] || 0) + (inc.amount || 0);
      if (!incomeRowsByYear[inc.vestingStartYear]) incomeRowsByYear[inc.vestingStartYear] = [];
      incomeRowsByYear[inc.vestingStartYear].push(inc);
    } else {
      // For other income, assume annual across all years
      for (let year = 1; year <= projectionYears; year++) {
        if (!incomeRowsByYear[year]) incomeRowsByYear[year] = [];
        incomeRowsByYear[year].push(inc);
      }
    }
  });

  // --- EXPENSES ---
  const expenseRowsByYear: Record<number, ExpenseCategory[]> = {};
  expenses.forEach((exp) => {
    for (let year = 1; year <= projectionYears; year++) {
      if (!expenseRowsByYear[year]) expenseRowsByYear[year] = [];
      expenseRowsByYear[year].push(exp);
    }
  });

  // --- Equity payouts ---
  const equityPayoutsByYear: Record<number, EquityPayout[]> = {};
  equityPayouts.forEach((eq) => {
    if (!equityPayoutsByYear[eq.year]) equityPayoutsByYear[eq.year] = [];
    equityPayoutsByYear[eq.year].push(eq);
  });

  // --- Real estate values per year ---
  const propertiesByYear: Record<number, RealEstateProperty[]> = {};
  properties.forEach((prop) => {
    for (let year = prop.purchaseYear; year <= projectionYears; year++) {
      if (!propertiesByYear[year]) propertiesByYear[year] = [];
      propertiesByYear[year].push(prop);
    }
  });

  return (
    <div className="space-y-8">
      {/* INCOME SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Income Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Year</th>
                <th className="text-left p-2">Total Income</th>
                <th className="text-left p-2">- RSUs</th>
                <th className="text-left p-2">- Other</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: projectionYears }, (_, i) => {
                const year = i + 1;
                const yearInc = incomeRowsByYear[year] || [];
                const total =
                  yearInc.reduce(
                    (sum, inc) => sum + (inc.frequency === 'monthly' ? inc.amount * 12 : inc.amount),
                    0
                  ) +
                  (equityPayoutsByYear[year]?.reduce((sum, p) => sum + p.amount, 0) || 0);
                const rsuAmount = rsuRowsByYear[year] || 0;
                const otherIncome =
                  total - rsuAmount - (equityPayoutsByYear[year]?.reduce((sum, p) => sum + p.amount, 0) || 0);
                return (
                  <tr key={year} className="border-b last:border-none">
                    <td className="p-2 font-semibold text-slate-800">{year}</td>
                    <td className="p-2">{formatCurrency(total)}</td>
                    <td className="p-2">{formatCurrency(rsuAmount)}</td>
                    <td className="p-2">{formatCurrency(otherIncome)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* EXPENSES SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Year</th>
                <th className="text-left p-2">Total Expenses</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: projectionYears }, (_, i) => {
                const year = i + 1;
                // Get total from projection, which includes all expenses
                const proj = projections.find((p) => p.year === year);
                return (
                  <tr key={year} className="border-b last:border-none">
                    <td className="p-2 font-semibold text-slate-800">{year}</td>
                    <td className="p-2">{formatCurrency(proj?.totalExpenses || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* EQUITY PAYOUTS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Year</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: projectionYears }, (_, i) => {
                const year = i + 1;
                const eqList = equityPayoutsByYear[year] || [];
                return (
                  <tr key={year} className="border-b last:border-none">
                    <td className="p-2 font-semibold text-slate-800">{year}</td>
                    <td className="p-2">
                      {formatCurrency(eqList.reduce((sum, pay) => sum + pay.amount, 0))}
                    </td>
                    <td className="p-2 text-xs">
                      {eqList.map((p) => (
                        <div key={p.id}>{p.description}: {formatCurrency(p.amount)}</div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* REAL ESTATE / PROPERTY */}
      <Card>
        <CardHeader>
          <CardTitle>Real Estate Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Year</th>
                <th className="text-left p-2">Properties Owned</th>
                <th className="text-left p-2">Gross Value</th>
                <th className="text-left p-2">Loan Balance</th>
                <th className="text-left p-2">Equity</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: projectionYears }, (_, i) => {
                const year = i + 1;
                const proj = projections.find((p) => p.year === year);
                return (
                  <tr key={year} className="border-b last:border-none">
                    <td className="p-2 font-semibold text-slate-800">{year}</td>
                    <td className="p-2">{propertiesByYear[year]?.length || 0}</td>
                    <td className="p-2">{formatCurrency(proj?.realEstateValue || 0)}</td>
                    <td className="p-2">{formatCurrency(proj?.loanBalance || 0)}</td>
                    <td className="p-2">{formatCurrency(proj?.realEateEquity || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* TAXES */}
      <Card>
        <CardHeader>
          <CardTitle>Taxes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Year</th>
                <th className="text-left p-2">Taxes Paid</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.year} className="border-b last:border-none">
                  <td className="p-2 font-semibold text-slate-800">{p.year}</td>
                  <td className="p-2">{formatCurrency(p.taxes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* HOUSEHOLD "INCOME STATEMENT" STYLE, with growth / investment line */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Net Worth & Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Year</th>
                <th className="text-left p-2">Net Worth at Year End</th>
                <th className="text-left p-2">Annual Savings</th>
                <th className="text-left p-2">Net Worth Growth</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, idx) => (
                <tr key={p.year} className="border-b last:border-none">
                  <td className="p-2 font-semibold text-slate-800">{p.year}</td>
                  <td className="p-2">{formatCurrency(p.cumulativeWealth)}</td>
                  <td className="p-2">{formatCurrency(p.savings)}</td>
                  <td className="p-2">
                    {idx === 0
                      ? '-'
                      : formatCurrency(p.cumulativeWealth - projections[idx - 1].cumulativeWealth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryDashboard;
