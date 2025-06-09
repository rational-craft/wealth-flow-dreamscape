
import React, { useState } from 'react';
import { WealthDashboard } from '@/components/WealthDashboard';
import { IncomeManager } from '@/components/IncomeManager';
import { ExpenseManager } from '@/components/ExpenseManager';
import { ForecastChart } from '@/components/ForecastChart';
import { TaxCalculator } from '@/components/TaxCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calculator, PieChart } from 'lucide-react';

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'freelance' | 'investment' | 'equity' | 'other';
  amount: number;
  frequency: 'monthly' | 'annually';
  growthRate: number;
  taxRate: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annually';
  growthRate: number;
  isFixed: boolean;
}

export interface WealthProjection {
  year: number;
  grossIncome: number;
  netIncome: number;
  totalExpenses: number;
  savings: number;
  cumulativeWealth: number;
  taxes: number;
}

const Index = () => {
  const [incomes, setIncomes] = useState<IncomeSource[]>([
    {
      id: '1',
      name: 'Base Salary',
      type: 'salary',
      amount: 120000,
      frequency: 'annually',
      growthRate: 3,
      taxRate: 22
    }
  ]);

  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    {
      id: '1',
      name: 'Housing',
      amount: 2500,
      frequency: 'monthly',
      growthRate: 2,
      isFixed: false
    },
    {
      id: '2',
      name: 'Food',
      amount: 800,
      frequency: 'monthly',
      growthRate: 3,
      isFixed: false
    },
    {
      id: '3',
      name: 'Transportation',
      amount: 600,
      frequency: 'monthly',
      growthRate: 2,
      isFixed: false
    }
  ]);

  const [initialWealth, setInitialWealth] = useState(50000);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [projectionYears, setProjectionYears] = useState(10);

  const calculateProjections = (): WealthProjection[] => {
    const projections: WealthProjection[] = [];
    let cumulativeWealth = initialWealth;

    for (let year = 1; year <= projectionYears; year++) {
      let grossIncome = 0;
      let taxes = 0;

      // Calculate total income and taxes
      incomes.forEach(income => {
        const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
        grossIncome += adjustedAmount;
        taxes += adjustedAmount * (income.taxRate / 100);
      });

      const netIncome = grossIncome - taxes;

      // Calculate total expenses
      let totalExpenses = 0;
      expenses.forEach(expense => {
        const annualAmount = expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + expense.growthRate / 100, year - 1);
        totalExpenses += adjustedAmount;
      });

      const savings = netIncome - totalExpenses;
      cumulativeWealth = (cumulativeWealth * (1 + investmentReturn / 100)) + savings;

      projections.push({
        year,
        grossIncome,
        netIncome,
        totalExpenses,
        savings,
        cumulativeWealth,
        taxes
      });
    }

    return projections;
  };

  const projections = calculateProjections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <TrendingUp className="text-green-600" />
            Wealth Forecaster
          </h1>
          <p className="text-lg text-slate-600">
            Plan your financial future with comprehensive income, expense, and tax modeling
          </p>
        </div>

        <div className="mb-6">
          <WealthDashboard 
            projections={projections}
            initialWealth={initialWealth}
            setInitialWealth={setInitialWealth}
            investmentReturn={investmentReturn}
            setInvestmentReturn={setInvestmentReturn}
            projectionYears={projectionYears}
            setProjectionYears={setProjectionYears}
          />
        </div>

        <Tabs defaultValue="income" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="income" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Income Sources
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="taxes" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Tax Planning
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Projections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-6">
            <Card className="p-6">
              <IncomeManager incomes={incomes} setIncomes={setIncomes} />
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="p-6">
              <ExpenseManager expenses={expenses} setExpenses={setExpenses} />
            </Card>
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <Card className="p-6">
              <TaxCalculator incomes={incomes} projections={projections} />
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card className="p-6">
              <ForecastChart projections={projections} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
