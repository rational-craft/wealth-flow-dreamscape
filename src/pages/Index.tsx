import React, { useState } from 'react';
import { WealthDashboard } from '@/components/WealthDashboard';
import { IncomeManager } from '@/components/IncomeManager';
import { ExpenseManager } from '@/components/ExpenseManager';
import { ForecastChart } from '@/components/ForecastChart';
import { TaxCalculator } from '@/components/TaxCalculator';
import { EquityManager } from '@/components/EquityManager';
import { RealEstateManager } from '@/components/RealEstateManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calculator, PieChart, Home } from 'lucide-react';
import { calculateTotalTax, getEffectiveTaxRate } from '@/utils/taxCalculator';
import { DataTable } from '@/components/DataTable';

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

export interface EquityPayout {
  id: string;
  description: string;
  amount: number;
  year: number;
  taxRate: number;
}

export interface RealEstateProperty {
  id: string;
  name: string;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  purchaseYear: number;
  appreciationRate: number;
  maintenanceRate: number;
  propertyTaxRate: number;
}

export interface WealthProjection {
  year: number;
  grossIncome: number;
  netIncome: number;
  totalExpenses: number;
  savings: number;
  cumulativeWealth: number;
  taxes: number;
  realEstateValue: number;
  realEstateEquity: number;
  loanBalance: number;
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
      taxRate: getEffectiveTaxRate(120000, 'salary')
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

  const [equityPayouts, setEquityPayouts] = useState<EquityPayout[]>([]);
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [initialWealth, setInitialWealth] = useState(50000);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [projectionYears, setProjectionYears] = useState(10);

  const calculateProjections = (): WealthProjection[] => {
    const projections: WealthProjection[] = [];
    let cumulativeWealth = initialWealth;

    for (let year = 1; year <= projectionYears; year++) {
      let grossIncome = 0;
      let taxes = 0;

      // Calculate regular income and taxes using new tax system
      incomes.forEach(income => {
        const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
        grossIncome += adjustedAmount;
        taxes += calculateTotalTax(adjustedAmount, income.type);
      });

      // Add equity payouts for this year
      const yearlyEquityPayouts = equityPayouts.filter(payout => payout.year === year);
      yearlyEquityPayouts.forEach(payout => {
        grossIncome += payout.amount;
        taxes += calculateTotalTax(payout.amount, 'equity');
      });

      const netIncome = grossIncome - taxes;

      // Calculate total expenses including real estate
      let totalExpenses = 0;
      expenses.forEach(expense => {
        const annualAmount = expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + expense.growthRate / 100, year - 1);
        totalExpenses += adjustedAmount;
      });

      // Calculate real estate metrics
      let realEstateValue = 0;
      let realEstateEquity = 0;
      let totalLoanBalance = 0;
      let realEstateExpenses = 0;

      properties.forEach(property => {
        if (year >= property.purchaseYear) {
          const yearsOwned = year - property.purchaseYear + 1;
          const currentValue = property.purchasePrice * Math.pow(1 + property.appreciationRate / 100, yearsOwned - 1);
          realEstateValue += currentValue;

          // Calculate loan balance
          const monthlyRate = property.interestRate / 100 / 12;
          const numPayments = property.loanTermYears * 12;
          const monthsOwned = (yearsOwned - 1) * 12;
          
          if (monthsOwned < numPayments) {
            const monthlyPayment = property.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            const remainingBalance = property.loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, monthsOwned)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            totalLoanBalance += Math.max(0, remainingBalance);
            
            // Add mortgage payments to expenses
            realEstateExpenses += monthlyPayment * 12;
          }

          // Add maintenance and property taxes
          realEstateExpenses += currentValue * (property.maintenanceRate / 100);
          realEstateExpenses += currentValue * (property.propertyTaxRate / 100);

          realEstateEquity += currentValue - Math.max(0, totalLoanBalance);
        }
      });

      totalExpenses += realEstateExpenses;

      const savings = netIncome - totalExpenses;
      cumulativeWealth = (cumulativeWealth * (1 + investmentReturn / 100)) + savings + realEstateEquity;

      projections.push({
        year,
        grossIncome,
        netIncome,
        totalExpenses,
        savings,
        cumulativeWealth,
        taxes,
        realEstateValue,
        realEstateEquity,
        loanBalance: totalLoanBalance
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
            Plan your financial future with comprehensive income, expense, tax, and real estate modeling
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
            incomes={incomes}
            setIncomes={setIncomes}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        </div>

        <Tabs defaultValue="income" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm">
            <TabsTrigger value="income" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="equity" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Equity
            </TabsTrigger>
            <TabsTrigger value="realestate" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Real Estate
            </TabsTrigger>
            <TabsTrigger value="taxes" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Taxes
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Data
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

          <TabsContent value="equity" className="space-y-6">
            <Card className="p-6">
              <EquityManager equityPayouts={equityPayouts} setEquityPayouts={setEquityPayouts} />
            </Card>
          </TabsContent>

          <TabsContent value="realestate" className="space-y-6">
            <Card className="p-6">
              <RealEstateManager properties={properties} setProperties={setProperties} />
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

          <TabsContent value="data" className="space-y-6">
            <Card className="p-6">
              <DataTable 
                incomes={incomes}
                expenses={expenses}
                equityPayouts={equityPayouts}
                properties={properties}
                projections={projections}
                projectionYears={projectionYears}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
