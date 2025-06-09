
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WealthProjection } from '@/pages/Index';
import { TrendingUp, DollarSign, PiggyBank, Target } from 'lucide-react';

interface WealthDashboardProps {
  projections: WealthProjection[];
  initialWealth: number;
  setInitialWealth: (value: number) => void;
  investmentReturn: number;
  setInvestmentReturn: (value: number) => void;
  projectionYears: number;
  setProjectionYears: (value: number) => void;
}

export const WealthDashboard: React.FC<WealthDashboardProps> = ({
  projections,
  initialWealth,
  setInitialWealth,
  investmentReturn,
  setInvestmentReturn,
  projectionYears,
  setProjectionYears
}) => {
  const currentYear = projections[0] || { grossIncome: 0, netIncome: 0, savings: 0, taxes: 0 };
  const finalYear = projections[projections.length - 1] || { cumulativeWealth: initialWealth };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <Label htmlFor="initial-wealth" className="text-sm font-medium text-slate-700">
              Current Net Worth
            </Label>
          </CardHeader>
          <CardContent>
            <Input
              id="initial-wealth"
              type="number"
              value={initialWealth}
              onChange={(e) => setInitialWealth(Number(e.target.value))}
              className="text-lg font-semibold"
            />
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <Label htmlFor="investment-return" className="text-sm font-medium text-slate-700">
              Expected Annual Return (%)
            </Label>
          </CardHeader>
          <CardContent>
            <Input
              id="investment-return"
              type="number"
              step="0.1"
              value={investmentReturn}
              onChange={(e) => setInvestmentReturn(Number(e.target.value))}
              className="text-lg font-semibold"
            />
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <Label htmlFor="projection-years" className="text-sm font-medium text-slate-700">
              Projection Years
            </Label>
          </CardHeader>
          <CardContent>
            <Input
              id="projection-years"
              type="number"
              min="1"
              max="50"
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
              className="text-lg font-semibold"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Annual Gross Income
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(currentYear.grossIncome)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Before taxes and deductions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Annual Net Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(currentYear.netIncome)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              After taxes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Annual Savings
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(currentYear.savings)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Net income minus expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Projected Net Worth
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {formatCurrency(finalYear.cumulativeWealth)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              In {projectionYears} years
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
