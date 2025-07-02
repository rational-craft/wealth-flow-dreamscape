import React, { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Debt, DebtOptimizer, PayoffStrategy } from "@/services/DebtOptimizer";
import { Plus, Trash2 } from "lucide-react";

interface DebtManagerProps {
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
}

export const DebtManager: React.FC<DebtManagerProps> = ({
  debts,
  setDebts,
}) => {
  const [extraPayment, setExtraPayment] = useState(0);
  const [strategy, setStrategy] = useState<PayoffStrategy>("avalanche");
  const [showComparison, setShowComparison] = useState(false);

  const addDebt = () => {
    const newDebt: Debt = {
      id: `debt_${Date.now()}`,
      name: "New Debt",
      balance: 0,
      apr: 0,
      minimumPayment: 0,
      loanTermYears: 5,
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(
      debts.map((debt) => {
        if (debt.id !== id) return debt;
        const updated = { ...debt, ...updates };
        if (
          updates.balance !== undefined ||
          updates.apr !== undefined ||
          updates.loanTermYears !== undefined
        ) {
          const r = updated.apr / 100 / 12;
          const n = (updated.loanTermYears || 0) * 12;
          updated.minimumPayment =
            n > 0
              ? (updated.balance * r * Math.pow(1 + r, n)) /
                (Math.pow(1 + r, n) - 1)
              : 0;
        }
        return updated;
      }),
    );
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  const comparison =
    debts.length > 0
      ? DebtOptimizer.compareStrategies(debts, extraPayment)
      : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debt Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={addDebt} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Debt
            </Button>

            {debts.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>APR (%)</TableHead>
                    <TableHead>Term (Years)</TableHead>
                    <TableHead>Min Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell>
                        <Input
                          value={debt.name}
                          onChange={(e) =>
                            updateDebt(debt.id, { name: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={debt.balance}
                          onChange={(e) =>
                            updateDebt(debt.id, {
                              balance: Number(e.target.value),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={debt.apr}
                          onChange={(e) =>
                            updateDebt(debt.id, { apr: Number(e.target.value) })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={debt.loanTermYears}
                          onChange={(e) =>
                            updateDebt(debt.id, {
                              loanTermYears: Number(e.target.value),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={Math.round(debt.minimumPayment)}
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDebt(debt.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {debts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="extraPayment">
                    Extra Monthly Payment ($)
                  </Label>
                  <Input
                    id="extraPayment"
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="strategy">Payoff Strategy</Label>
                  <Select
                    value={strategy}
                    onValueChange={(value) =>
                      setStrategy(value as PayoffStrategy)
                    }
                  >
                    <SelectTrigger id="strategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">
                        Debt Avalanche (Highest Interest First)
                      </SelectItem>
                      <SelectItem value="snowball">
                        Debt Snowball (Smallest Balance First)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {debts.length > 0 && (
              <Button onClick={() => setShowComparison(!showComparison)}>
                {showComparison ? "Hide" : "Show"} Strategy Comparison
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {comparison && showComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Strategy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  Debt Avalanche
                </h3>
                <div className="space-y-2">
                  <div>
                    Total Interest:{" "}
                    {formatCurrency(comparison.avalanche.totalInterest)}
                  </div>
                  <div>
                    Payoff Time: {comparison.avalanche.payoffMonths} months
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">
                  Debt Snowball
                </h3>
                <div className="space-y-2">
                  <div>
                    Total Interest:{" "}
                    {formatCurrency(comparison.snowball.totalInterest)}
                  </div>
                  <div>
                    Payoff Time: {comparison.snowball.payoffMonths} months
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-sm">
                <strong>Avalanche vs Snowball:</strong>
                <br />
                Interest Saved:{" "}
                {formatCurrency(Math.abs(comparison.interestSaved))}
                <br />
                Time Difference: {Math.abs(comparison.timeSaved)} months
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
