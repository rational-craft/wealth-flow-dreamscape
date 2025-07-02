import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal, GoalType, goalChecker } from "@/services/GoalChecker";
import { Plus, Target, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoalManagerProps {
  netWorth: number;
  savingsRate: number;
  totalDebt: number;
}

export const GoalManager: React.FC<GoalManagerProps> = ({
  netWorth,
  savingsRate,
  totalDebt,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    type: "netWorth" as GoalType,
    targetValue: 0,
    emailNotification: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up goal achievement callback
    goalChecker.setGoalAchievedCallback((goal: Goal) => {
      toast({
        title: "🎉 Goal Achieved!",
        description: `Congratulations! You've achieved your goal: ${goal.name}`,
        duration: 5000,
      });
    });

    // Load existing goals
    setGoals(goalChecker.getAllGoals());
  }, [toast]);

  useEffect(() => {
    // Check goals whenever financial data changes
    goalChecker.checkGoals(netWorth, savingsRate, totalDebt);
    setGoals(goalChecker.getAllGoals());
  }, [netWorth, savingsRate, totalDebt]);

  const addGoal = () => {
    if (newGoal.name && newGoal.targetValue > 0) {
      goalChecker.addGoal({
        name: newGoal.name,
        type: newGoal.type,
        targetValue: newGoal.targetValue,
        currentValue: getCurrentValue(newGoal.type),
        emailNotification: newGoal.emailNotification,
      });
      setGoals(goalChecker.getAllGoals());
      setNewGoal({
        name: "",
        type: "netWorth",
        targetValue: 0,
        emailNotification: false,
      });
      setShowAddForm(false);
    }
  };

  const deleteGoal = (id: string) => {
    goalChecker.deleteGoal(id);
    setGoals(goalChecker.getAllGoals());
  };

  const getCurrentValue = (type: GoalType) => {
    switch (type) {
      case "netWorth":
        return netWorth;
      case "savingsRate":
        return savingsRate;
      case "debtBalance":
        return totalDebt;
      default:
        return 0;
    }
  };

  const getProgress = (goal: Goal) => {
    if (goal.type === "debtBalance") {
      // For debt, progress is inverse (lower is better)
      const progress =
        goal.targetValue > 0
          ? Math.max(0, 100 - (goal.currentValue / goal.targetValue) * 100)
          : 0;
      return Math.min(100, progress);
    } else {
      const progress =
        goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
      return Math.min(100, progress);
    }
  };

  const formatValue = (value: number, type: GoalType) => {
    if (type === "savingsRate") {
      return `${value.toFixed(1)}%`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeLabel = (type: GoalType) => {
    switch (type) {
      case "netWorth":
        return "Net Worth";
      case "savingsRate":
        return "Savings Rate";
      case "debtBalance":
        return "Debt Balance";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Financial Goals
            </span>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="space-y-4 p-4 border rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input
                    id="goalName"
                    value={newGoal.name}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, name: e.target.value })
                    }
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div>
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select
                    value={newGoal.type}
                    onValueChange={(value) =>
                      setNewGoal({ ...newGoal, type: value as GoalType })
                    }
                  >
                    <SelectTrigger id="goalType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="netWorth">Net Worth</SelectItem>
                      <SelectItem value="savingsRate">Savings Rate</SelectItem>
                      <SelectItem value="debtBalance">
                        Debt Balance (Target Lower)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetValue">
                    Target Value{" "}
                    {newGoal.type === "savingsRate" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        targetValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotification"
                    checked={newGoal.emailNotification}
                    onCheckedChange={(checked) =>
                      setNewGoal({ ...newGoal, emailNotification: checked })
                    }
                  />
                  <Label htmlFor="emailNotification">Email notifications</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addGoal}>Add Goal</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No goals set yet. Add your first financial goal!</p>
              </div>
            ) : (
              goals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`${goal.achieved ? "border-green-200 bg-green-50" : "border-slate-200"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {goal.achieved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          <p className="text-sm text-slate-600">
                            {getTypeLabel(goal.type)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.achieved && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Achieved
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{getProgress(goal).toFixed(1)}%</span>
                      </div>
                      <Progress value={getProgress(goal)} className="h-2" />
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>
                          Current: {formatValue(goal.currentValue, goal.type)}
                        </span>
                        <span>
                          Target: {formatValue(goal.targetValue, goal.type)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
