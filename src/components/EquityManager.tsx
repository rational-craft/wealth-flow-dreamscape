import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EquityPayout } from "@/pages/Index";
import { Plus, Trash2, TrendingUp } from "lucide-react";

interface EquityManagerProps {
  equityPayouts: EquityPayout[];
  setEquityPayouts: (payouts: EquityPayout[]) => void;
}

export const EquityManager: React.FC<EquityManagerProps> = ({
  equityPayouts,
  setEquityPayouts,
}) => {
  const [newPayout, setNewPayout] = useState<Partial<EquityPayout>>({
    description: "",
    amount: 0,
    year: 1,
    taxRate: 20,
  });

  const addPayout = () => {
    if (newPayout.description && newPayout.amount && newPayout.year) {
      const payout: EquityPayout = {
        id: Date.now().toString(),
        description: newPayout.description,
        amount: newPayout.amount,
        year: newPayout.year,
        taxRate: newPayout.taxRate || 20,
      };
      setEquityPayouts([...equityPayouts, payout]);
      setNewPayout({
        description: "",
        amount: 0,
        year: 1,
        taxRate: 20,
      });
    }
  };

  const updatePayout = (id: string, updates: Partial<EquityPayout>) => {
    setEquityPayouts(
      equityPayouts.map((payout) =>
        payout.id === id ? { ...payout, ...updates } : payout,
      ),
    );
  };

  const removePayout = (id: string) => {
    setEquityPayouts(equityPayouts.filter((payout) => payout.id !== id));
  };

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
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-purple-600" />
        <h3 className="text-xl font-semibold text-slate-800">
          One-Time Equity Payouts
        </h3>
      </div>

      {/* Add New Payout Form */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg text-purple-800">
            Add New Equity Payout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="payout-description">Description</Label>
              <Input
                id="payout-description"
                value={newPayout.description}
                onChange={(e) =>
                  setNewPayout({ ...newPayout, description: e.target.value })
                }
                placeholder="e.g., Stock Option Exercise, IPO Payout"
              />
            </div>

            <div>
              <Label htmlFor="payout-amount">Amount</Label>
              <Input
                id="payout-amount"
                type="number"
                value={newPayout.amount}
                onChange={(e) =>
                  setNewPayout({ ...newPayout, amount: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="payout-year">Year</Label>
              <Input
                id="payout-year"
                type="number"
                min="1"
                max="50"
                value={newPayout.year}
                onChange={(e) =>
                  setNewPayout({ ...newPayout, year: Number(e.target.value) })
                }
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="payout-tax">Tax Rate (%)</Label>
              <Input
                id="payout-tax"
                type="number"
                step="0.1"
                value={newPayout.taxRate}
                onChange={(e) =>
                  setNewPayout({
                    ...newPayout,
                    taxRate: Number(e.target.value),
                  })
                }
                placeholder="20"
              />
            </div>
          </div>

          <Button
            onClick={addPayout}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equity Payout
          </Button>
        </CardContent>
      </Card>

      {/* Existing Payouts Table */}
      {equityPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Equity Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equityPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <Input
                        value={payout.description}
                        onChange={(e) =>
                          updatePayout(payout.id, {
                            description: e.target.value,
                          })
                        }
                        className="min-w-[150px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={payout.amount}
                        onChange={(e) =>
                          updatePayout(payout.id, {
                            amount: Number(e.target.value),
                          })
                        }
                        className="min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={payout.year}
                        onChange={(e) =>
                          updatePayout(payout.id, {
                            year: Number(e.target.value),
                          })
                        }
                        className="min-w-[80px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={payout.taxRate}
                        onChange={(e) =>
                          updatePayout(payout.id, {
                            taxRate: Number(e.target.value),
                          })
                        }
                        className="min-w-[80px]"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(
                        payout.amount * (1 - payout.taxRate / 100),
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePayout(payout.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
