import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WealthProjection, IncomeSource, ExpenseCategory } from "@/pages/Index";
import { TrendingUp, DollarSign, PiggyBank, Target } from "lucide-react";
import {
  STATE_TAX_RATES,
  FILING_STATUSES,
  FEDERAL_TAX_BRACKETS,
} from "@/utils/taxCalculator";

const STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

interface WealthDashboardProps {
  projections: WealthProjection[];
  initialWealth: number;
  setInitialWealth: (value: number) => void;
  investmentReturn: number;
  setInvestmentReturn: (value: number) => void;
  projectionYears: number;
  setProjectionYears: (value: number) => void;
  state: keyof typeof STATE_TAX_RATES;
  setState: (state: keyof typeof STATE_TAX_RATES) => void;
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS;
  setFilingStatus: (status: keyof typeof FEDERAL_TAX_BRACKETS) => void;
  incomes: IncomeSource[];
  setIncomes: (incomes: IncomeSource[]) => void;
  expenses: ExpenseCategory[];
  setExpenses: (expenses: ExpenseCategory[]) => void;
}

export const WealthDashboard: React.FC<WealthDashboardProps> = ({
  projections,
  initialWealth,
  setInitialWealth,
  investmentReturn,
  setInvestmentReturn,
  projectionYears,
  setProjectionYears,
  state,
  setState,
  filingStatus,
  setFilingStatus,
  incomes,
  setIncomes,
  expenses,
  setExpenses,
}) => {
  const [selectedYear, setSelectedYear] = useState(1);

  // Get data for the selected year, fallback to year 1 if not available
  const selectedYearData = projections.find((p) => p.year === selectedYear) ||
    projections[0] || {
      grossIncome: 0,
      netIncome: 0,
      savings: 0,
      cumulativeWealth: initialWealth,
      taxes: 0,
    };

  const updateIncome = (id: string, updates: Partial<IncomeSource>) => {
    setIncomes(
      incomes.map((income) =>
        income.id === id ? { ...income, ...updates } : income,
      ),
    );
  };

  const updateExpense = (id: string, updates: Partial<ExpenseCategory>) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense,
      ),
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleYearChange = (value: number[]) => {
    setSelectedYear(value[0]);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {/* Current Net Worth */}
        <Card className="border-blue-200 p-0">
          <CardHeader className="pb-1 px-3 pt-2">
            <Label
              htmlFor="initial-wealth"
              className="text-xs font-semibold text-slate-700"
            >
              Current Net Worth
            </Label>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-3">
            <Input
              id="initial-wealth"
              type="number"
              value={initialWealth}
              onChange={(e) => setInitialWealth(Number(e.target.value))}
              className="text-base font-semibold h-8 px-2 py-1"
            />
          </CardContent>
        </Card>

        {/* Expected Annual Return (%) */}
        <Card className="border-green-200 p-0">
          <CardHeader className="pb-1 px-3 pt-2">
            <Label
              htmlFor="investment-return"
              className="text-xs font-semibold text-slate-700"
            >
              Expected Annual Return (%)
            </Label>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-3">
            <Input
              id="investment-return"
              type="number"
              step="0.1"
              value={investmentReturn}
              onChange={(e) => setInvestmentReturn(Number(e.target.value))}
              className="text-base font-semibold h-8 px-2 py-1"
            />
          </CardContent>
        </Card>

        {/* Projection Years */}
        <Card className="border-purple-200 p-0">
          <CardHeader className="pb-1 px-3 pt-2">
            <Label
              htmlFor="projection-years"
              className="text-xs font-semibold text-slate-700"
            >
              Projection Years
            </Label>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-3">
            <Input
              id="projection-years"
              type="number"
              min="1"
              max="50"
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
              className="text-base font-semibold h-8 px-2 py-1"
            />
          </CardContent>
        </Card>

        {/* State */}
        <Card className="border-orange-200 p-0">
          <CardHeader className="pb-1 px-3 pt-2">
            <Label className="text-xs font-semibold text-slate-700">
              State
            </Label>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-3">
            <Select
              value={state}
              onValueChange={(value) =>
                setState(value as keyof typeof STATE_TAX_RATES)
              }
            >
              <SelectTrigger className="text-base font-semibold h-8 px-2 py-1">
                <SelectValue>
                  {STATE_ABBREVIATIONS[state as string] ?? state}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STATE_TAX_RATES).map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {STATE_ABBREVIATIONS[stateName] ?? stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Filing Status */}
        <Card className="border-indigo-200 p-0">
          <CardHeader className="pb-1 px-3 pt-2">
            <Label className="text-xs font-semibold text-slate-700">
              Filing Status
            </Label>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-3">
            <Select
              value={filingStatus}
              onValueChange={(value) =>
                setFilingStatus(value as keyof typeof FEDERAL_TAX_BRACKETS)
              }
            >
              <SelectTrigger className="text-base font-semibold h-8 px-2 py-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILING_STATUSES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Year Slider */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-700 flex items-center justify-between">
            Year Selection
            <span className="text-2xl font-bold text-slate-800">
              Year {selectedYear}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[selectedYear]}
              onValueChange={handleYearChange}
              max={projectionYears}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500">
              <span>Year 1</span>
              <span>Year {projectionYears}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year-specific Financial Metrics */}
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
              {formatCurrency(selectedYearData.grossIncome)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Year {selectedYear} - Before taxes
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
              {formatCurrency(selectedYearData.netIncome)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Year {selectedYear} - After taxes
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
              {formatCurrency(selectedYearData.savings)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Year {selectedYear} - Net income minus expenses
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
              {formatCurrency(selectedYearData.cumulativeWealth)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              End of Year {selectedYear}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
