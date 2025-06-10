
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncomeSource } from '@/pages/Index';
import { Plus, Trash2, DollarSign, Info } from 'lucide-react';
import { getEffectiveTaxRate } from '@/utils/taxCalculator';

interface IncomeManagerProps {
  incomes: IncomeSource[];
  setIncomes: (incomes: IncomeSource[]) => void;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({ incomes, setIncomes }) => {
  const [newIncome, setNewIncome] = useState<Partial<IncomeSource>>({
    name: '',
    type: 'salary',
    amount: 0,
    frequency: 'annually',
    growthRate: 3,
    taxRate: 0 // Will be calculated automatically
  });

  const addIncome = () => {
    if (newIncome.name && newIncome.amount) {
      const annualAmount = newIncome.frequency === 'monthly' ? newIncome.amount * 12 : newIncome.amount;
      const calculatedTaxRate = getEffectiveTaxRate(annualAmount, newIncome.type || 'salary');
      
      const income: IncomeSource = {
        id: Date.now().toString(),
        name: newIncome.name,
        type: newIncome.type || 'salary',
        amount: newIncome.amount,
        frequency: newIncome.frequency || 'annually',
        growthRate: newIncome.growthRate || 3,
        taxRate: calculatedTaxRate
      };
      setIncomes([...incomes, income]);
      setNewIncome({
        name: '',
        type: 'salary',
        amount: 0,
        frequency: 'annually',
        growthRate: 3,
        taxRate: 0
      });
    }
  };

  const updateIncome = (id: string, updates: Partial<IncomeSource>) => {
    setIncomes(incomes.map(income => {
      if (income.id === id) {
        const updatedIncome = { ...income, ...updates };
        // Recalculate tax rate if amount or type changes
        if (updates.amount !== undefined || updates.type !== undefined || updates.frequency !== undefined) {
          const annualAmount = updatedIncome.frequency === 'monthly' ? updatedIncome.amount * 12 : updatedIncome.amount;
          updatedIncome.taxRate = getEffectiveTaxRate(annualAmount, updatedIncome.type);
        }
        return updatedIncome;
      }
      return income;
    }));
  };

  const removeIncome = (id: string) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIncomeTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      salary: 'Progressive federal + state income tax',
      freelance: 'Progressive tax + 14.13% self-employment tax',
      investment: '15% capital gains + state tax',
      equity: 'Progressive tax (treated as ordinary income)',
      other: 'Progressive federal + state income tax'
    };
    return descriptions[type] || 'Standard progressive taxation';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="text-green-600" />
        <h3 className="text-xl font-semibold text-slate-800">Income Sources</h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
          <Info className="w-4 h-4" />
          Taxes calculated automatically based on 2024 rates
        </div>
      </div>

      {/* Add New Income Form */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Add New Income Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="income-name">Income Source Name</Label>
              <Input
                id="income-name"
                value={newIncome.name}
                onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                placeholder="e.g., Base Salary, Freelance"
              />
            </div>

            <div>
              <Label htmlFor="income-type">Type</Label>
              <Select
                value={newIncome.type}
                onValueChange={(value: any) => setNewIncome({ ...newIncome, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="equity">Equity Compensation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {getIncomeTypeDescription(newIncome.type || 'salary')}
              </p>
            </div>

            <div>
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                type="number"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="income-frequency">Frequency</Label>
              <Select
                value={newIncome.frequency}
                onValueChange={(value: any) => setNewIncome({ ...newIncome, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="income-growth">Growth Rate (%)</Label>
              <Input
                id="income-growth"
                type="number"
                step="0.1"
                value={newIncome.growthRate}
                onChange={(e) => setNewIncome({ ...newIncome, growthRate: Number(e.target.value) })}
                placeholder="3"
              />
            </div>

            <div>
              <Label>Estimated Tax Rate</Label>
              <div className="p-2 bg-slate-100 rounded text-sm font-medium">
                {newIncome.amount && newIncome.type ? 
                  `${getEffectiveTaxRate(
                    newIncome.frequency === 'monthly' ? newIncome.amount * 12 : newIncome.amount,
                    newIncome.type
                  ).toFixed(1)}%` : 
                  '0.0%'
                }
              </div>
              <p className="text-xs text-slate-500 mt-1">Auto-calculated</p>
            </div>
          </div>

          <Button onClick={addIncome} className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Income Source
          </Button>
        </CardContent>
      </Card>

      {/* Existing Income Sources */}
      <div className="space-y-4">
        {incomes.map((income) => (
          <Card key={income.id} className="border-slate-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={income.name}
                    onChange={(e) => updateIncome(income.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  <Select
                    value={income.type}
                    onValueChange={(value: any) => updateIncome(income.id, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="equity">Equity Compensation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    {getIncomeTypeDescription(income.type)}
                  </p>
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={income.amount}
                    onChange={(e) => updateIncome(income.id, { amount: Number(e.target.value) })}
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {income.frequency === 'monthly' 
                      ? `${formatCurrency(income.amount * 12)}/year`
                      : `${formatCurrency(income.amount / 12)}/month`
                    }
                  </div>
                </div>

                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={income.frequency}
                    onValueChange={(value: any) => updateIncome(income.id, { frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Growth Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={income.growthRate}
                    onChange={(e) => updateIncome(income.id, { growthRate: Number(e.target.value) })}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Tax Rate (%)</Label>
                    <div className="p-2 bg-slate-100 rounded text-sm font-medium">
                      {income.taxRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Auto-calculated</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeIncome(income.id)}
                    className="mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
