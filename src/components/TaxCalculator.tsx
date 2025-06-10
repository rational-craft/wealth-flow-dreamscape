import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IncomeSource, WealthProjection } from '@/pages/Index';
import { Calculator, TrendingDown, Info } from 'lucide-react';
import { calculateTotalTax, FEDERAL_TAX_BRACKETS } from '@/utils/taxCalculator';

interface TaxCalculatorProps {
  incomes: IncomeSource[];
  projections: WealthProjection[];
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ incomes, projections }) => {
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
    const taxBreakdown: Record<string, { amount: number; percentage: number }> = {};
    
    incomes.forEach(income => {
      const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
      const adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
      const taxAmount = calculateTotalTax(adjustedAmount, income.type);
      
      if (!taxBreakdown[income.type]) {
        taxBreakdown[income.type] = { amount: 0, percentage: 0 };
      }
      
      taxBreakdown[income.type].amount += taxAmount;
      taxBreakdown[income.type].percentage = adjustedAmount > 0 ? (taxAmount / adjustedAmount) * 100 : 0;
    });
    
    return taxBreakdown;
  };

  const currentYearTaxes = getTaxByIncomeType(1);
  const totalCurrentTax = Object.values(currentYearTaxes).reduce((sum, tax) => sum + tax.amount, 0);
  const totalCurrentIncome = projections[0]?.grossIncome || 0;
  const effectiveTaxRate = totalCurrentIncome > 0 ? (totalCurrentTax / totalCurrentIncome) * 100 : 0;

  const getIncomeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      salary: 'Salary Income',
      freelance: 'Freelance Income',
      investment: 'Investment Income',
      equity: 'Equity Compensation',
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
      other: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getTaxExplanation = (type: string) => {
    const explanations: Record<string, string> = {
      salary: 'Progressive federal tax brackets + ~5% average state tax',
      freelance: 'Progressive federal tax + 14.13% self-employment tax + state tax',
      investment: '15% long-term capital gains rate (for most earners)',
      equity: 'Progressive tax brackets (treated as ordinary income)',
      other: 'Progressive federal tax brackets + average state tax'
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
          Based on 2024 tax brackets & rates
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Total Annual Taxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(totalCurrentTax)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Auto-calculated current year
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
              10-Year Tax Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">
              {formatCurrency(projections.reduce((sum, p) => sum + p.taxes, 0))}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Total projected taxes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown by Income Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax Breakdown by Income Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(currentYearTaxes).map(([type, tax]) => (
            <div key={type} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getIncomeTypeColor(type)}`} />
                  <span className="font-medium">{getIncomeTypeLabel(type)}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(tax.amount)}</div>
                  <div className="text-sm text-slate-500">{formatPercentage(tax.percentage)} effective rate</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 ml-6">{getTaxExplanation(type)}</p>
              <Progress 
                value={(tax.amount / totalCurrentTax) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2024 Tax Brackets Reference */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">2024 Federal Tax Brackets (Single Filer)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEDERAL_TAX_BRACKETS.single.map((bracket, index) => (
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
