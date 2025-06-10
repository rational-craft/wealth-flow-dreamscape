
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IncomeSource, ExpenseCategory, EquityPayout, RealEstateProperty, WealthProjection } from '@/pages/Index';
import { Database } from 'lucide-react';

interface DataTableProps {
  incomes: IncomeSource[];
  expenses: ExpenseCategory[];
  equityPayouts: EquityPayout[];
  properties: RealEstateProperty[];
  projections: WealthProjection[];
  projectionYears: number;
}

export const DataTable: React.FC<DataTableProps> = ({
  incomes,
  expenses,
  equityPayouts,
  properties,
  projections,
  projectionYears
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIncomeByYear = (income: IncomeSource, year: number) => {
    const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
    return annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
  };

  const getExpenseByYear = (expense: ExpenseCategory, year: number) => {
    const annualAmount = expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount;
    return annualAmount * Math.pow(1 + expense.growthRate / 100, year - 1);
  };

  const getPropertyValueByYear = (property: RealEstateProperty, year: number) => {
    if (year < property.purchaseYear) return 0;
    const yearsOwned = year - property.purchaseYear + 1;
    return property.purchasePrice * Math.pow(1 + property.appreciationRate / 100, yearsOwned - 1);
  };

  const getPropertyLoanBalanceByYear = (property: RealEstateProperty, year: number) => {
    if (year < property.purchaseYear) return 0;
    
    const monthlyRate = property.interestRate / 100 / 12;
    const numPayments = property.loanTermYears * 12;
    const monthsOwned = (year - property.purchaseYear) * 12;
    
    if (monthsOwned >= numPayments) return 0;
    
    const remainingBalance = property.loanAmount * 
      (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, monthsOwned)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return Math.max(0, remainingBalance);
  };

  const years = Array.from({ length: projectionYears }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="text-blue-600" />
        <h3 className="text-xl font-semibold text-slate-800">Year-by-Year Data</h3>
        <div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
          Complete dataset with growth applied
        </div>
      </div>

      {/* Income Sources Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income Sources by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Income Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Growth Rate</TableHead>
                {years.map(year => (
                  <TableHead key={year} className="text-center">Year {year}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.name}</TableCell>
                  <TableCell className="capitalize">{income.type}</TableCell>
                  <TableCell>{income.growthRate}%</TableCell>
                  {years.map(year => (
                    <TableCell key={year} className="text-center">
                      {formatCurrency(getIncomeByYear(income, year))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expenses Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expenses by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Growth Rate</TableHead>
                {years.map(year => (
                  <TableHead key={year} className="text-center">Year {year}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${expense.isFixed ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {expense.isFixed ? 'Fixed' : 'Variable'}
                    </span>
                  </TableCell>
                  <TableCell>{expense.growthRate}%</TableCell>
                  {years.map(year => (
                    <TableCell key={year} className="text-center">
                      {formatCurrency(getExpenseByYear(expense, year))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Equity Payouts Data */}
      {equityPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equity Payouts by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  {years.map(year => (
                    <TableHead key={year} className="text-center">Year {year}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equityPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.description}</TableCell>
                    {years.map(year => (
                      <TableCell key={year} className="text-center">
                        {payout.year === year ? formatCurrency(payout.amount) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Real Estate Data */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real Estate Values by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Metric</TableHead>
                  {years.map(year => (
                    <TableHead key={year} className="text-center">Year {year}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <React.Fragment key={property.id}>
                    <TableRow>
                      <TableCell className="font-medium" rowSpan={3}>{property.name}</TableCell>
                      <TableCell className="text-green-700">Property Value</TableCell>
                      {years.map(year => (
                        <TableCell key={year} className="text-center">
                          {year >= property.purchaseYear ? formatCurrency(getPropertyValueByYear(property, year)) : '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-red-700">Loan Balance</TableCell>
                      {years.map(year => (
                        <TableCell key={year} className="text-center">
                          {year >= property.purchaseYear ? formatCurrency(getPropertyLoanBalanceByYear(property, year)) : '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-blue-700">Equity</TableCell>
                      {years.map(year => (
                        <TableCell key={year} className="text-center">
                          {year >= property.purchaseYear ? 
                            formatCurrency(getPropertyValueByYear(property, year) - getPropertyLoanBalanceByYear(property, year)) : '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary Projections by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {years.map(year => (
                  <TableHead key={year} className="text-center">Year {year}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Gross Income</TableCell>
                {projections.map((projection, index) => (
                  <TableCell key={index} className="text-center">
                    {formatCurrency(projection.grossIncome)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Taxes</TableCell>
                {projections.map((projection, index) => (
                  <TableCell key={index} className="text-center">
                    {formatCurrency(projection.taxes)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Income</TableCell>
                {projections.map((projection, index) => (
                  <TableCell key={index} className="text-center">
                    {formatCurrency(projection.netIncome)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Expenses</TableCell>
                {projections.map((projection, index) => (
                  <TableCell key={index} className="text-center">
                    {formatCurrency(projection.totalExpenses)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Annual Savings</TableCell>
                {projections.map((projection, index) => (
                  <TableCell key={index} className="text-center">
                    {formatCurrency(projection.savings)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cumulative Wealth</TableCell>
                {projections.map((projection, index) => (
                  <TableCell key={index} className="text-center">
                    {formatCurrency(projection.cumulativeWealth)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
