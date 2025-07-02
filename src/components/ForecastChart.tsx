import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { WealthProjection } from '@/pages/Index';
import { TrendingUp, BarChart3, LineChart as LineChartIcon, PieChart, Layers } from 'lucide-react';
import NetWorthStackedChart from "@/components/NetWorthStackedChart";
import { Slider } from '@/components/ui/slider';

interface ForecastChartProps {
  projections: WealthProjection[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ projections }) => {
  const [chartType, setChartType] = React.useState<'wealth' | 'income' | 'breakdown' | 'stacked'>('wealth');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatYear = (year: number) => {
    const currentYear = new Date().getFullYear();
    return (currentYear + year - 1).toString();
  };

  const chartData = projections.map(p => ({
    ...p,
    yearLabel: formatYear(p.year)
  }));

  const renderWealthChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="yearLabel" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
          labelStyle={{ color: '#1e293b' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Area
          type="monotone"
          dataKey="cumulativeWealth"
          stroke="#10b981"
          fill="url(#wealthGradient)"
          strokeWidth={3}
        />
        <defs>
          <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderIncomeChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="yearLabel" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          labelStyle={{ color: '#1e293b' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="grossIncome"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Gross Income"
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="netIncome"
          stroke="#10b981"
          strokeWidth={2}
          name="Net Income"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="totalExpenses"
          stroke="#ef4444"
          strokeWidth={2}
          name="Expenses"
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBreakdownChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="yearLabel" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          labelStyle={{ color: '#1e293b' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="netIncome" fill="#10b981" name="Net Income" />
        <Bar dataKey="totalExpenses" fill="#ef4444" name="Expenses" />
        <Bar dataKey="savings" fill="#8b5cf6" name="Savings" />
        <Bar dataKey="taxes" fill="#f59e0b" name="Taxes" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-purple-600" />
        <h3 className="text-xl font-semibold text-slate-800">Wealth Projections</h3>
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={chartType === 'wealth' ? 'default' : 'outline'}
          onClick={() => setChartType('wealth')}
          className="flex items-center gap-2"
        >
          <LineChartIcon className="w-4 h-4" />
          Net Worth Growth
        </Button>
        <Button
          variant={chartType === 'income' ? 'default' : 'outline'}
          onClick={() => setChartType('income')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Income & Expenses
        </Button>
        <Button
          variant={chartType === 'breakdown' ? 'default' : 'outline'}
          onClick={() => setChartType('breakdown')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Annual Breakdown
        </Button>
        <Button onClick={() => setChartType('stacked')} className="flex items-center gap-2">
          <Layers size={16}/> Net-Worth Layers
        </Button>
      </div>

      {/* Chart Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {chartType === 'wealth' && (
              <>
                <LineChartIcon className="w-5 h-5 text-green-600" />
                Net Worth Projection
              </>
            )}
            {chartType === 'income' && (
              <>
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Income vs Expenses Over Time
              </>
            )}
            {chartType === 'breakdown' && (
              <>
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Annual Financial Breakdown
              </>
            )}
            {chartType === 'stacked' && (
              <>
                <Layers className="w-5 h-5 text-blue-600" />
                Net-Worth Composition Over Time
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartType === 'wealth' && renderWealthChart()}
          {chartType === 'income' && renderIncomeChart()}
          {chartType === 'breakdown' && renderBreakdownChart()}
          {chartType === 'stacked' && (
            <>
              <h3 className="text-lg font-semibold my-2">
                Net-Worth Composition Over Time
              </h3>
              <NetWorthStackedChart data={chartData} currencyFmt={formatCurrency} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-green-700">Final Net Worth</div>
            <div className="text-xl font-bold text-green-800">
              {formatCurrency(projections[projections.length - 1]?.cumulativeWealth || 0)}
            </div>
            <div className="text-xs text-green-600">
              After {projections.length} years
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-blue-700">Average Annual Savings</div>
            <div className="text-xl font-bold text-blue-800">
              {formatCurrency(projections.reduce((sum, p) => sum + p.savings, 0) / projections.length)}
            </div>
            <div className="text-xs text-blue-600">
              Per year average
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-purple-700">Total Wealth Growth</div>
            <div className="text-xl font-bold text-purple-800">
              {formatCurrency((projections[projections.length - 1]?.cumulativeWealth || 0) - (projections[0]?.cumulativeWealth || 0))}
            </div>
            <div className="text-xs text-purple-600">
              Net increase
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-orange-700">Total Taxes Paid</div>
            <div className="text-xl font-bold text-orange-800">
              {formatCurrency(projections.reduce((sum, p) => sum + p.taxes, 0))}
            </div>
            <div className="text-xs text-orange-600">
              Over {projections.length} years
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
