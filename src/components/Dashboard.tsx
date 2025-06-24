import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Mock data for the last 6 months of expenses
const expenseHistory = [
  { month: 'Apr', total: 4500 },
  { month: 'May', total: 4700 },
  { month: 'Jun', total: 4300 },
  { month: 'Jul', total: 4800 },
  { month: 'Aug', total: 5000 },
  { month: 'Sep', total: 5100 },
];

const monthlyIncome = 6000; // Mock monthly income

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const Dashboard: React.FC = () => {
  const currentMonthlyExpenses =
    expenseHistory[expenseHistory.length - 1].total;
  const totalAnnualExpenses = currentMonthlyExpenses * 12;
  const netCashFlow = monthlyIncome - currentMonthlyExpenses;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentMonthlyExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Annual Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAnnualExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(netCashFlow)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Expenses - Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
