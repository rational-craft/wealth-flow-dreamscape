
export type GoalType = 'netWorth' | 'savingsRate' | 'debtBalance';

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  achieved: boolean;
  achievedDate?: Date;
  emailNotification: boolean;
  createdAt: Date;
}

export interface GoalAlert {
  goalId: string;
  goalName: string;
  message: string;
  timestamp: Date;
}

export class GoalChecker {
  private goals: Map<string, Goal> = new Map();
  private alerts: GoalAlert[] = [];
  private onGoalAchieved?: (goal: Goal) => void;

  setGoalAchievedCallback(callback: (goal: Goal) => void) {
    this.onGoalAchieved = callback;
  }

  addGoal(goal: Omit<Goal, 'id' | 'achieved' | 'createdAt'>): string {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newGoal: Goal = {
      ...goal,
      id,
      achieved: false,
      createdAt: new Date()
    };
    
    this.goals.set(id, newGoal);
    return id;
  }

  updateGoal(id: string, updates: Partial<Goal>) {
    const goal = this.goals.get(id);
    if (goal) {
      Object.assign(goal, updates);
    }
  }

  deleteGoal(id: string) {
    this.goals.delete(id);
  }

  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  checkGoals(netWorth: number, savingsRate: number, totalDebt: number) {
    this.goals.forEach(goal => {
      if (goal.achieved) return;

      let isAchieved = false;
      let currentValue = 0;

      switch (goal.type) {
        case 'netWorth':
          currentValue = netWorth;
          isAchieved = netWorth >= goal.targetValue;
          break;
        case 'savingsRate':
          currentValue = savingsRate;
          isAchieved = savingsRate >= goal.targetValue;
          break;
        case 'debtBalance':
          currentValue = totalDebt;
          isAchieved = totalDebt <= goal.targetValue;
          break;
      }

      goal.currentValue = currentValue;

      if (isAchieved && !goal.achieved) {
        goal.achieved = true;
        goal.achievedDate = new Date();
        
        const alert: GoalAlert = {
          goalId: goal.id,
          goalName: goal.name,
          message: `Congratulations! You've achieved your goal: ${goal.name}`,
          timestamp: new Date()
        };
        
        this.alerts.push(alert);
        
        if (this.onGoalAchieved) {
          this.onGoalAchieved(goal);
        }
      }
    });
  }

  getRecentAlerts(limit: number = 10): GoalAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  clearAlert(goalId: string) {
    this.alerts = this.alerts.filter(alert => alert.goalId !== goalId);
  }
}

export const goalChecker = new GoalChecker();
