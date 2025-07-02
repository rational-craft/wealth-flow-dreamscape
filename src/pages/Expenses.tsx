import React, { useState } from 'react';
import { ExpenseManager } from '@/components/ExpenseManager';
import { ExpenseCategory } from '@/pages/Index';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    {
      id: '1',
      name: 'Housing',
      amount: 2500,
      frequency: 'monthly',
      growthRate: 2,
      isFixed: false,
    },
  ]);

  return (
    <div>
      <ExpenseManager expenses={expenses} setExpenses={setExpenses} />
    </div>
  );
};

export default Expenses;
