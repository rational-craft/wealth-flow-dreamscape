import React, { useState, useEffect } from 'react';
import { WealthDashboard } from '@/components/WealthDashboard';
import { IncomeManager } from '@/components/IncomeManager';
import { ExpenseManager } from '@/components/ExpenseManager';
import { ForecastChart } from '@/components/ForecastChart';
import { TaxCalculator } from '@/components/TaxCalculator';
import { EquityManager } from '@/components/EquityManager';
import { RealEstateManager } from '@/components/RealEstateManager';
import { ScenarioManager } from '@/components/ScenarioManager';
import { ScenarioComparison } from '@/components/ScenarioComparison';
import { MonteCarloSimulation } from '@/components/MonteCarloSimulation';
import { DebtManager } from '@/components/DebtManager';
import { GoalManager } from '@/components/GoalManager';
import { RetirementSettings } from '@/components/RetirementSettings';
import { ExportButtons } from '@/components/ExportButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calculator, PieChart, Home, Target, CreditCard, BarChart3, Settings, FileSpreadsheet } from 'lucide-react';
import { calculateTotalTax, getEffectiveTaxRate, STATE_TAX_RATES, FEDERAL_TAX_BRACKETS, FILING_STATUSES } from '@/utils/taxCalculator';
import { DataTable } from '@/components/DataTable';
import { scenarioService } from '@/services/ScenarioService';
import { NLPChatBox } from "@/components/NLPChatBox";
import { ConditionalLogicChat } from "@/components/ConditionalLogicChat";
import SummaryDashboard from '@/components/SummaryDashboard';

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'freelance' | 'investment' | 'equity' | 'other' | 'bonus' | 'rsu';
  amount: number;
  frequency: 'monthly' | 'annually';
  growthRate: number;
  taxRate: number;
  // For bonus:
  bonusYear?: number;
  linkedSalaryId?: string;
  // For RSU:
  vestingLength?: number; // in years, eg 4, 1
  vestingStartYear?: number;
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
  downPaymentSource?: string; // <-- Added
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
  realEateEquity: number;
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
  const [state, setState] = useState<keyof typeof STATE_TAX_RATES>('California');
  const [filingStatus, setFilingStatus] = useState<keyof typeof FEDERAL_TAX_BRACKETS>('single');
  const [currentScenarioId, setCurrentScenarioId] = useState('base');
  const [retirementAge, setRetirementAge] = useState(65);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [enableRetirementMode, setEnableRetirementMode] = useState(false);

  // Generate real estate expenses automatically
  const generateRealEstateExpenses = (): ExpenseCategory[] => {
    const realEstateExpenses: ExpenseCategory[] = [];
    
    properties.forEach(property => {
      // Generate mortgage payment expense if there's a loan
      if (property.loanAmount > 0 && property.interestRate > 0) {
        const monthlyRate = property.interestRate / 100 / 12;
        const numPayments = property.loanTermYears * 12;
        const monthlyPayment = property.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        realEstateExpenses.push({
          id: `mortgage-${property.id}`,
          name: `Mortgage Payment - ${property.name}`,
          amount: monthlyPayment,
          frequency: 'monthly',
          growthRate: 0, // Mortgage payments are typically fixed
          isFixed: true
        });
      }
      
      // Generate property tax expense
      const annualPropertyTax = property.purchasePrice * (property.propertyTaxRate / 100);
      realEstateExpenses.push({
        id: `property-tax-${property.id}`,
        name: `Property Tax - ${property.name}`,
        amount: annualPropertyTax,
        frequency: 'annually',
        growthRate: 2, // Property taxes typically grow with inflation
        isFixed: false
      });
      
      // Generate maintenance expense
      const annualMaintenance = property.purchasePrice * (property.maintenanceRate / 100);
      realEstateExpenses.push({
        id: `maintenance-${property.id}`,
        name: `Maintenance - ${property.name}`,
        amount: annualMaintenance,
        frequency: 'annually',
        growthRate: 3, // Maintenance costs typically grow faster than inflation
        isFixed: false
      });
    });
    
    return realEstateExpenses;
  };

  // Combine user expenses with generated real estate expenses
  const getAllExpenses = (): ExpenseCategory[] => {
    const userExpenses = expenses.filter(expense => 
      !expense.id.startsWith('mortgage-') && 
      !expense.id.startsWith('property-tax-') && 
      !expense.id.startsWith('maintenance-')
    );
    const realEstateExpenses = generateRealEstateExpenses();
    return [...userExpenses, ...realEstateExpenses];
  };

  // SCENARIO DATA LOADING/SAVING
  React.useEffect(() => {
    // On scenario change, load scenario data into the UI state.
    const scenarioData = scenarioService.getCurrentScenario().data;
    setIncomes(scenarioData.incomes ?? []);
    setExpenses(scenarioData.expenses ?? []);
    setEquityPayouts(scenarioData.equityPayouts ?? []);
    setProperties(scenarioData.properties ?? []);
    setInitialWealth(scenarioData.initialWealth ?? 50000);
    setInvestmentReturn(scenarioData.investmentReturn ?? 7);
    setProjectionYears(scenarioData.projectionYears ?? 10);
    setState((scenarioData.state as keyof typeof STATE_TAX_RATES) ?? 'California');
    setFilingStatus((scenarioData.filingStatus as keyof typeof FEDERAL_TAX_BRACKETS) ?? 'single');
  }, [currentScenarioId]);

  React.useEffect(() => {
    scenarioService.updateScenario(currentScenarioId, {
      incomes,
      expenses,
      equityPayouts,
      properties,
      initialWealth,
      investmentReturn,
      projectionYears,
      state,
      filingStatus,
    });
  }, [
    incomes,
    expenses,
    equityPayouts,
    properties,
    initialWealth,
    investmentReturn,
    projectionYears,
    state,
    filingStatus,
    currentScenarioId,
  ]);

  // Updated tax calculation to work with subtotals by income type
  const calculateTaxesByIncomeType = (year: number) => {
    // Group income by type and calculate subtotals
    const incomeSubtotals: Record<string, number> = {};
    
    incomes.forEach(income => {
      const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
      let adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
      
      // Handle RSU vesting logic
      if (income.type === 'rsu' && income.vestingStartYear && income.vestingLength) {
        const traunchSize = (income.amount || 0) / income.vestingLength;
        const vestingYear = income.vestingStartYear;
        if (year >= vestingYear && year < vestingYear + income.vestingLength) {
          adjustedAmount = traunchSize;
        } else {
          adjustedAmount = 0;
        }
      }
      
      if (!incomeSubtotals[income.type]) {
        incomeSubtotals[income.type] = 0;
      }
      incomeSubtotals[income.type] += adjustedAmount;
    });

    // Add equity payouts for this year
    const yearlyEquityPayouts = equityPayouts.filter(payout => payout.year === year);
    yearlyEquityPayouts.forEach(payout => {
      if (!incomeSubtotals['equity']) {
        incomeSubtotals['equity'] = 0;
      }
      incomeSubtotals['equity'] += payout.amount;
    });

    // Calculate taxes based on subtotals
    let totalTaxes = 0;
    Object.entries(incomeSubtotals).forEach(([type, amount]) => {
      if (amount > 0) {
        const taxValue = calculateTotalTax(amount, type, state, filingStatus);
        const tax = typeof taxValue === "number" ? taxValue : (taxValue.federal + taxValue.state);
        totalTaxes += tax;
      }
    });

    return totalTaxes;
  };

  // Updated projection calculations
  const calculateProjections = (): WealthProjection[] => {
    const projections: WealthProjection[] = [];
    let cumulativeWealth = initialWealth;
    const allExpenses = getAllExpenses();

    for (let year = 1; year <= projectionYears; year++) {
      let grossIncome = 0;
      
      // Retirement Mode check
      const currentAge = 30 + year;
      const isRetired = enableRetirementMode && currentAge >= retirementAge;

      if (!isRetired) {
        // Calculate gross income
        incomes.forEach(income => {
          const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
          let adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
          
          // Handle RSU vesting logic
          if (income.type === 'rsu' && income.vestingStartYear && income.vestingLength) {
            const traunchSize = (income.amount || 0) / income.vestingLength;
            const vestingYear = income.vestingStartYear;
            if (year >= vestingYear && year < vestingYear + income.vestingLength) {
              adjustedAmount = traunchSize;
            } else {
              adjustedAmount = 0;
            }
          }
          
          grossIncome += adjustedAmount;
        });

        // Add equity payouts
        const yearlyEquityPayouts = equityPayouts.filter(payout => payout.year === year);
        yearlyEquityPayouts.forEach(payout => {
          grossIncome += payout.amount;
        });
      }

      // Calculate taxes using the new subtotal method
      const taxes = isRetired ? 0 : calculateTaxesByIncomeType(year);
      const netIncome = grossIncome - taxes;

      // Calculate expenses including auto-generated real estate expenses
      let totalExpenses = 0;
      allExpenses.forEach(expense => {
        // Skip real estate expenses that haven't started yet
        if (expense.id.includes('mortgage-') || expense.id.includes('property-tax-') || expense.id.includes('maintenance-')) {
          const propertyId = expense.id.split('-')[1];
          const property = properties.find(p => p.id === propertyId);
          if (property && year < property.purchaseYear) {
            return; // Skip this expense if property hasn't been purchased yet
          }
        }
        
        const annualAmount = expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + expense.growthRate / 100, year - 1);
        totalExpenses += adjustedAmount;
      });

      // Calculate real estate value and equity
      let realEstateValue = 0;
      let realEstateEquity = 0;
      let totalLoanBalance = 0;
      let realEstateExpenses = 0;

      properties.forEach(property => {
        if (year >= property.purchaseYear) {
          const yearsOwned = year - property.purchaseYear + 1;
          const currentValue = property.purchasePrice * Math.pow(1 + property.appreciationRate / 100, yearsOwned - 1);
          realEstateValue += currentValue;

          const monthlyRate = property.interestRate / 100 / 12;
          const numPayments = property.loanTermYears * 12;
          const monthsOwned = (yearsOwned - 1) * 12;
          if (monthsOwned < numPayments) {
            const monthlyPayment = property.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            const remainingBalance = property.loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, monthsOwned)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            totalLoanBalance += Math.max(0, remainingBalance);
            realEstateExpenses += monthlyPayment * 12;
          }
          realEstateExpenses += currentValue * (property.maintenanceRate / 100);
          realEstateExpenses += currentValue * (property.propertyTaxRate / 100);
          realEstateEquity += currentValue - Math.max(0, totalLoanBalance);
        }
      });

      let savings = netIncome - totalExpenses;
      if (isRetired && enableRetirementMode) {
        savings = -((cumulativeWealth + realEstateEquity) * (withdrawalRate / 100));
      }

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
        realEateEquity: realEstateEquity,
        loanBalance: totalLoanBalance
      });
    }

    return projections;
  };

  const projections = calculateProjections();

  // Add fallback values so goal manager always renders (actual computation can be improved later)
  const currentNetWorth = projections[0]?.cumulativeWealth || 0;
  const currentSavingsRate = projections[0]
    ? (projections[0].savings / projections[0].grossIncome) * 100
    : 0;
  const totalDebt = projections[0]?.loanBalance || 0;

  const handleScenarioChange = (scenarioId: string) => {
    setCurrentScenarioId(scenarioId);
    scenarioService.setCurrentScenario(scenarioId);
  };

  // FIX: scenario projection calculations and tax destructuring
  const getProjectionsForScenario = (scenarioId: string) => {
    const scenario = scenarioService.getAllScenarios().find((s) => s.id === scenarioId);
    if (!scenario) return [];
    const s = scenario.data;
    let cumulativeWealth = s.initialWealth ?? 50000;
    const projections: WealthProjection[] = [];
    for (let year = 1; year <= (s.projectionYears ?? 10); year++) {
      let grossIncome = 0;
      let taxes = 0;
      let fedTaxes = 0;
      let stateTaxes = 0;

      const incomesArr = s.incomes ?? [];
      const equityArr = s.equityPayouts ?? [];
      const propsArr = s.properties ?? [];

      incomesArr.forEach((income:any) => {
        const annualAmount = income.frequency === 'monthly' ? income.amount * 12 : income.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
        grossIncome += adjustedAmount;
        const taxValue = calculateTotalTax(adjustedAmount, income.type, s.state as keyof typeof STATE_TAX_RATES, s.filingStatus as keyof typeof FEDERAL_TAX_BRACKETS, { split: true });
        let federal = 0, stateTax = 0;
        if (typeof taxValue === "number") {
          federal = taxValue;
        } else {
          federal = taxValue.federal ?? 0;
          stateTax = taxValue.state ?? 0;
        }
        fedTaxes += federal;
        stateTaxes += stateTax;
        taxes += federal + stateTax;
      });
      const yearlyEquityPayouts = equityArr.filter((p:any) => p.year === year);
      yearlyEquityPayouts.forEach((payout:any) => {
        grossIncome += payout.amount;
        const taxValue = calculateTotalTax(payout.amount, 'equity', s.state as keyof typeof STATE_TAX_RATES, s.filingStatus as keyof typeof FEDERAL_TAX_BRACKETS, { split: true });
        let federal = 0, stateTax = 0;
        if (typeof taxValue === "number") {
          federal = taxValue;
        } else {
          federal = taxValue.federal ?? 0;
          stateTax = taxValue.state ?? 0;
        }
        fedTaxes += federal;
        stateTaxes += stateTax;
        taxes += federal + stateTax;
      });

      const netIncome = grossIncome - taxes;
      // EXPENSES
      let totalExpenses = 0;
      (s.expenses ?? []).forEach((expense:any) => {
        const annualAmount = expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount;
        const adjustedAmount = annualAmount * Math.pow(1 + expense.growthRate / 100, year - 1);
        totalExpenses += adjustedAmount;
      });

      let realEstateValue = 0;
      let realEstateEquity = 0;
      let totalLoanBalance = 0;
      let realEstateExpenses = 0;

      propsArr.forEach((property:any) => {
        if (year >= property.purchaseYear) {
          const yearsOwned = year - property.purchaseYear + 1;
          const currentValue = property.purchasePrice * Math.pow(1 + property.appreciationRate / 100, yearsOwned - 1);
          realEstateValue += currentValue;
          const monthlyRate = property.interestRate / 100 / 12;
          const numPayments = property.loanTermYears * 12;
          const monthsOwned = (yearsOwned - 1) * 12;
          if (monthsOwned < numPayments) {
            const monthlyPayment = property.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            const remainingBalance = property.loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, monthsOwned)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            totalLoanBalance += Math.max(0, remainingBalance);
            realEstateExpenses += monthlyPayment * 12;
          }
          realEstateExpenses += currentValue * (property.maintenanceRate / 100);
          realEstateExpenses += currentValue * (property.propertyTaxRate / 100);
          realEstateEquity += currentValue - Math.max(0, totalLoanBalance);
        }
      });

      totalExpenses += realEstateExpenses;
      let savings = netIncome - totalExpenses;
      cumulativeWealth = (cumulativeWealth * (1 + (s.investmentReturn ?? 7) / 100)) + savings + realEstateEquity;

      projections.push({
        year,
        grossIncome,
        netIncome,
        totalExpenses,
        savings,
        cumulativeWealth,
        taxes,
        realEstateValue,
        realEateEquity: realEstateEquity,
        loanBalance: totalLoanBalance,
      });
    }
    return projections;
  };

  const exportData = {
    incomes,
    expenses,
    equityPayouts,
    properties,
    projections,
    scenarioName: scenarioService.getCurrentScenario().name
  };

  // Handler for NLPChatBox actions
  const handleNLPAction = (action: { type: string; data: any }) => {
    if (action.type === "set-salary") {
      let { salary, growthRate, year } = action.data;
      if (!salary) return;
      // Try to find an existing salary for year 1, otherwise add new
      setIncomes((prev) => {
        // For MVP, only update year 1 "salary" row
        let found = false;
        const newArr = prev.map((inc) => {
          if (inc.type === "salary" && (!inc.bonusYear || inc.bonusYear === year)) {
            found = true;
            return {
              ...inc,
              amount: salary,
              growthRate: growthRate !== undefined ? growthRate : inc.growthRate
            };
          }
          return inc;
        });
        // If not found, add
        if (!found) {
          return [
            ...newArr,
            {
              id: Date.now().toString(),
              name: "Salary",
              type: "salary",
              amount: salary,
              frequency: "annually",
              growthRate: growthRate || 0,
              taxRate: 0
            }
          ];
        }
        return newArr;
      });
    }
  };

  // Handler for logic builder actions
  const handleLogicSubmit = (logicJSON: any) => {
    // For proto/dev: just log to console and show a notification
    console.log("Logic submitted:", logicJSON);

    // Show a toast for user feedback (using shadcn's useToast)
    // (import useToast from hooks, as shadcn moved it)
    // Avoid error if not in UI context
    try {
      // eslint-disable-next-line
      // @ts-ignore
      import("@/hooks/use-toast").then(({ toast }) => {
        toast({
          title: "Logic submitted!",
          description: (
            <pre className="text-xs whitespace-pre-wrap max-w-xs">{JSON.stringify(logicJSON, null, 2)}</pre>
          ),
        });
      });
    } catch (err) {
      /* best effort */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ---- FORECAST CHART FRONT/AND/CENTER ---- */}
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

        {/* Place the forecast chart at the top of the home page */}
        <div className="mb-8">
          <ForecastChart projections={projections} />
        </div>

        <ScenarioManager
          currentScenarioId={currentScenarioId}
          onScenarioChange={handleScenarioChange}
          onScenarioUpdate={() => {}}
        />

        <div className="mb-6">
          <WealthDashboard 
            projections={projections}
            initialWealth={initialWealth}
            setInitialWealth={setInitialWealth}
            investmentReturn={investmentReturn}
            setInvestmentReturn={setInvestmentReturn}
            projectionYears={projectionYears}
            setProjectionYears={setProjectionYears}
            state={state}
            setState={setState}
            filingStatus={filingStatus}
            setFilingStatus={setFilingStatus}
            incomes={incomes}
            setIncomes={setIncomes}
            expenses={getAllExpenses()}
            setExpenses={setExpenses}
          />
        </div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12 bg-white shadow-sm">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Summary
            </TabsTrigger>
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
            <TabsTrigger value="debt" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Debt
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="taxes" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Taxes
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="retirement" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Retirement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <Card className="p-6">
              <SummaryDashboard
                incomes={incomes}
                expenses={getAllExpenses()}
                equityPayouts={equityPayouts}
                properties={properties}
                projections={projections}
                projectionYears={projectionYears}
              />
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <Card className="p-6">
              <IncomeManager incomes={incomes} setIncomes={setIncomes} />
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="p-6">
              <ExpenseManager expenses={getAllExpenses()} setExpenses={setExpenses} />
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

          <TabsContent value="debt" className="space-y-6">
            <Card className="p-6">
              <DebtManager />
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="p-6">
              <GoalManager 
                netWorth={currentNetWorth}
                savingsRate={currentSavingsRate}
                totalDebt={totalDebt}
              />
            </Card>
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <Card className="p-6">
              <TaxCalculator 
                incomes={incomes} 
                projections={projections} 
                state={state}
                filingStatus={filingStatus}
              />
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Wealth Forecast</h2>
                  <ExportButtons data={exportData} elementId="forecast-chart" />
                </div>
                <div id="forecast-chart">
                  <ForecastChart projections={projections} />
                </div>
              </Card>
              <Card className="p-6">
                <MonteCarloSimulation />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <Card className="p-6">
              <ScenarioComparison 
                scenarios={scenarioService.getAllScenarios()}
                getProjectionsForScenario={getProjectionsForScenario}
              />
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Export</h2>
                <ExportButtons data={exportData} elementId="data-table" />
              </div>
              <div id="data-table">
                <DataTable 
                  incomes={incomes}
                  expenses={getAllExpenses()}
                  equityPayouts={equityPayouts}
                  properties={properties}
                  projections={projections}
                  projectionYears={projectionYears}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="retirement" className="space-y-6">
            <Card className="p-6">
              <RetirementSettings
                retirementAge={retirementAge}
                setRetirementAge={setRetirementAge}
                withdrawalRate={withdrawalRate}
                setWithdrawalRate={setWithdrawalRate}
                enableRetirementMode={enableRetirementMode}
                setEnableRetirementMode={setEnableRetirementMode}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* --- BEGIN: Model Assumptions & Forecast Summary --- */}
      <section className="container mx-auto pb-16 pt-8">
        <div className="bg-white p-7 md:p-10 rounded-xl shadow-lg border border-slate-200 max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Model Assumptions & Forecast Summary</h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-800">Overview:</span><br />
            This financial model provides a comprehensive 10,000-foot view of your personal wealth trajectory, integrating all relevant sources of income, expenses, taxes, investments, real estate, and scenario planning. The outcome: year-by-year projections of your net worth, savings, and cash flow under various user-defined assumptions, helping you visualize the impact of your financial decisions.
          </p>
          <p className="mb-2 text-slate-700">
            <span className="font-semibold">Key Inputs Analyzed:</span>
            <ul className="list-disc list-inside ml-2 mt-1 text-slate-700">
              <li>
                <span className="font-semibold">Initial Net Worth:</span> The model starts with your provided net worth of <span className="font-mono">{new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(initialWealth)}</span>.
              </li>
              <li>
                <span className="font-semibold">Income Streams:</span> All defined sources of income—including salaries, freelancing, investments, equity, real estate, or other categories—are incorporated with their own growth rates, frequencies, and tax treatments.
              </li>
              <li>
                <span className="font-semibold">Expense Categories:</span> All user-entered expense categories are modeled with projected inflation or growth and are accounted for monthly or annually as specified.
              </li>
              <li>
                <span className="font-semibold">Investment Return:</span> Every year, your growing net worth is compounded by your selected expected annual investment return (<span className="font-mono">{investmentReturn}%</span>), reflecting asset growth.
              </li>
              <li>
                <span className="font-semibold">Projection Horizon:</span> The model spans <span className="font-mono">{projectionYears}</span> years, visualizing long-term outcomes.
              </li>
              <li>
                <span className="font-semibold">Taxation:</span> Federal and state tax calculations apply to each income source annually, using the filing status of <span className="font-mono">{FILING_STATUSES[filingStatus]}</span> and selected state (<span className="font-mono">{state}</span>), incorporating progressive bracket rules where appropriate.
              </li>
              <li>
                <span className="font-semibold">Real Estate & Loans:</span> Any properties and their associated debt, maintenance, tax rates, and home appreciation are fully integrated. Mortgage amortization and real estate equity are dynamically calculated over time.
              </li>
              <li>
                <span className="font-semibold">Scenario Planning:</span> All forecasts are scenario-driven, supporting side-by-side comparisons for alternate assumptions (e.g., life stages, job changes, market shocks).
              </li>
            </ul>
          </p>
          <p className="mt-4 mb-2 text-slate-700">
            <span className="font-semibold">Forecast Methodology & Assumptions:</span>
            <ul className="list-disc list-inside ml-2 mt-1 text-slate-700">
              <li>
                <span className="font-semibold">Compound Growth:</span> Wealth growth is governed by the reinvestment of annual savings, compounded at the selected rate. Negative savings (i.e., spending more than you make) are subtracted from assets.
              </li>
              <li>
                <span className="font-semibold">Tax Modeling:</span> The model fully applies federal and state tax brackets annually. Investment income assumes capital gains treatment where applicable, while self-employment and equity are modeled per IRS guidelines.
              </li>
              <li>
                <span className="font-semibold">Expense & Income Growth:</span> User-defined growth rates (such as inflation or merit increases) are applied automatically to each input every year.
              </li>
              <li>
                <span className="font-semibold">Real Estate:</span> If you add properties, the model tracks equity accrual, loan payoff, home appreciation, and all annual carrying costs, for true net worth accuracy.
              </li>
              <li>
                <span className="font-semibold">No Market Crash Modeling:</span> Base forecasts assume steady growth and do not model black swan market downturns; however, the Monte Carlo feature can be used for probabilistic scenarios.
              </li>
              <li>
                <span className="font-semibold">Retirement Mode:</span> If enabled, the model switches from income accumulation to systematic withdrawals based on your chosen rate, with spending drawn from assets beyond your retirement age.
              </li>
              <li>
                <span className="font-semibold">Debt & Other Factors:</span> Debt payments, if modeled, are factored into annual outflows.
              </li>
            </ul>
          </p>
          <p className="mt-4 text-slate-700">
            <span className="font-semibold">Expert Interpretation:</span> These forecasts provide an illustrative, directional roadmap based on the information you provide. Outcomes depend critically on actual returns, spending discipline, unplanned life events, tax law changes, and market volatility. The tool is ideal for scenario analysis, long-term goal setting, and understanding which variables most influence your wealth trajectory—but it is not a guarantee of future results.
          </p>
          <p className="mt-5 text-slate-500 text-xs">
            <span className="font-semibold">Limitations & Disclaimers:</span> This model is for educational use and planning support. For legal, tax, or investment decisions, please consult with an independent professional advisor.
          </p>
        </div>
      </section>
      {/* --- END: Model Assumptions & Forecast Summary --- */}
    </div>
  );
};

export default Index;
