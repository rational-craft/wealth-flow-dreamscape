import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ExpenseCategory } from '@/pages/Index';
import { Plus, Trash2, PieChart } from 'lucide-react';

interface ExpenseManagerProps {
  expenses: ExpenseCategory[];
  setExpenses: (expenses: ExpenseCategory[]) => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, setExpenses }) => {
  const [newExpense, setNewExpense] = useState<Partial<ExpenseCategory>>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    growthRate: 2,
    isFixed: false
  });

  const addExpense = () => {
    if (newExpense.name && newExpense.amount) {
      const expense: ExpenseCategory = {
        id: Date.now().toString(),
        name: newExpense.name,
        amount: newExpense.amount,
        frequency: newExpense.frequency || 'monthly',
        growthRate: newExpense.growthRate || 2,
        isFixed: newExpense.isFixed || false
      };
      setExpenses([...expenses, expense]);
      setNewExpense({
        name: '',
        amount: 0,
        frequency: 'monthly',
        growthRate: 2,
        isFixed: false
      });
    }
  };

  const updateExpense = (id: string, updates: Partial<ExpenseCategory>) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalAnnualExpenses = () => {
    return expenses.reduce((total, expense) => {
      const annualAmount = expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount;
      return total + annualAmount;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-800">Expense Budget</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Total Annual Expenses</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(getTotalAnnualExpenses())}
          </div>
        </div>
      </div>

      {/* Add New Expense Form */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Add New Expense Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="expense-name">Expense Category</Label>
              <Input
                id="expense-name"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                placeholder="e.g., Housing, Food, Transportation"
              />
            </div>

            <div>
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="expense-frequency">Frequency</Label>
              <Select
                value={newExpense.frequency}
                onValueChange={(value: any) => setNewExpense({ ...newExpense, frequency: value })}
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
              <Label htmlFor="expense-growth">Growth Rate (%)</Label>
              <Input
                id="expense-growth"
                type="number"
                step="0.1"
                value={newExpense.growthRate}
                onChange={(e) => setNewExpense({ ...newExpense, growthRate: Number(e.target.value) })}
                placeholder="2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="fixed-expense"
              checked={newExpense.isFixed}
              onCheckedChange={(checked) => setNewExpense({ ...newExpense, isFixed: checked })}
            />
            <Label htmlFor="fixed-expense">Fixed Expense (no inflation adjustment)</Label>
          </div>

          <Button onClick={addExpense} className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense Category
          </Button>
        </CardContent>
      </Card>

      {/* Existing Expenses */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="border-slate-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={expense.name}
                    onChange={(e) => updateExpense(expense.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => updateExpense(expense.id, { amount: Number(e.target.value) })}
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {expense.frequency === 'monthly' 
                      ? `${formatCurrency(expense.amount * 12)}/year`
                      : `${formatCurrency(expense.amount / 12)}/month`
                    }
                  </div>
                </div>

                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={expense.frequency}
                    onValueChange={(value: any) => updateExpense(expense.id, { frequency: value })}
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
                    value={expense.growthRate}
                    onChange={(e) => updateExpense(expense.id, { growthRate: Number(e.target.value) })}
                    disabled={expense.isFixed}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={expense.isFixed}
                      onCheckedChange={(checked) => updateExpense(expense.id, { isFixed: checked })}
                    />
                    <Label className="text-xs">Fixed</Label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExpense(expense.id)}
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
