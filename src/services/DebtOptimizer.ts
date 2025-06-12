
export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

export interface DebtPayoffPlan {
  totalInterest: number;
  payoffMonths: number;
  monthlySchedule: {
    month: number;
    payments: { debtId: string; amount: number }[];
    remainingBalances: { debtId: string; balance: number }[];
  }[];
}

export type PayoffStrategy = 'snowball' | 'avalanche';

export class DebtOptimizer {
  static calculatePayoffPlan(
    debts: Debt[], 
    extraPayment: number, 
    strategy: PayoffStrategy
  ): DebtPayoffPlan {
    const debtsCopy = debts.map(d => ({ ...d }));
    const schedule: DebtPayoffPlan['monthlySchedule'] = [];
    let totalInterest = 0;
    let month = 0;
    
    // Sort debts based on strategy
    if (strategy === 'snowball') {
      debtsCopy.sort((a, b) => a.balance - b.balance);
    } else {
      debtsCopy.sort((a, b) => b.apr - a.apr);
    }
    
    while (debtsCopy.some(d => d.balance > 0)) {
      month++;
      const monthlyPayments: { debtId: string; amount: number }[] = [];
      let remainingExtra = extraPayment;
      
      // Make minimum payments first
      debtsCopy.forEach(debt => {
        if (debt.balance > 0) {
          const payment = Math.min(debt.minimumPayment, debt.balance);
          const interest = (debt.balance * debt.apr / 100) / 12;
          const principal = payment - interest;
          
          debt.balance = Math.max(0, debt.balance - principal);
          totalInterest += interest;
          monthlyPayments.push({ debtId: debt.id, amount: payment });
        }
      });
      
      // Apply extra payment to priority debt
      const priorityDebt = debtsCopy.find(d => d.balance > 0);
      if (priorityDebt && remainingExtra > 0) {
        const extraAmount = Math.min(remainingExtra, priorityDebt.balance);
        priorityDebt.balance -= extraAmount;
        
        const existingPayment = monthlyPayments.find(p => p.debtId === priorityDebt.id);
        if (existingPayment) {
          existingPayment.amount += extraAmount;
        }
      }
      
      schedule.push({
        month,
        payments: monthlyPayments,
        remainingBalances: debtsCopy.map(d => ({ debtId: d.id, balance: d.balance }))
      });
      
      // Safety break to prevent infinite loops
      if (month > 600) break;
    }
    
    return {
      totalInterest,
      payoffMonths: month,
      monthlySchedule: schedule
    };
  }
  
  static compareStrategies(debts: Debt[], extraPayment: number) {
    const snowballPlan = this.calculatePayoffPlan(debts, extraPayment, 'snowball');
    const avalanchePlan = this.calculatePayoffPlan(debts, extraPayment, 'avalanche');
    
    return {
      snowball: snowballPlan,
      avalanche: avalanchePlan,
      interestSaved: snowballPlan.totalInterest - avalanchePlan.totalInterest,
      timeSaved: snowballPlan.payoffMonths - avalanchePlan.payoffMonths
    };
  }
}
