import React, { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeSource as BaseIncomeSource } from "@/pages/Index";
import { Plus, Trash2, DollarSign, Info } from "lucide-react";
import { getEffectiveTaxRate } from "@/utils/taxCalculator";

interface IncomeManagerProps {
  incomes: BaseIncomeSource[];
  setIncomes: (incomes: BaseIncomeSource[]) => void;
}

// Helper to generate vesting rows for display only; does not modify incomes state
function getRSUVestings(grant: BaseIncomeSource) {
  if (grant.type !== "rsu" || !grant.vestingLength || !grant.vestingStartYear)
    return [];
  const perYear = Math.round(grant.amount / grant.vestingLength);
  return Array.from({ length: grant.vestingLength }, (_, i) => ({
    id: `${grant.id}-vested-${i + 1}`,
    name: `${grant.name} (Vested Year ${grant.vestingStartYear + i})`,
    amount: perYear,
    vestingYear: grant.vestingStartYear + i,
  }));
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({
  incomes,
  setIncomes,
}) => {
  const [newIncome, setNewIncome] = useState<Partial<BaseIncomeSource>>({
    name: "",
    type: "salary",
    amount: 0,
    frequency: "annually",
    growthRate: 3,
    taxRate: 0,
    // For bonuses
    bonusYear: undefined,
    linkedSalaryId: undefined,
    // For RSU
    vestingLength: 4,
    vestingStartYear: undefined,
  });

  const resetNewIncome = () =>
    setNewIncome({
      name: "",
      type: "salary",
      amount: 0,
      frequency: "annually",
      growthRate: 3,
      taxRate: 0,
      bonusYear: undefined,
      linkedSalaryId: undefined,
      vestingLength: 4,
      vestingStartYear: undefined,
    });

  const addIncome = () => {
    if (newIncome.name && newIncome.amount) {
      // RSU logic: Create a row for each vesting year as an income
      if (
        newIncome.type === "rsu" &&
        newIncome.vestingLength &&
        newIncome.vestingStartYear
      ) {
        const perYear = Math.round(newIncome.amount / newIncome.vestingLength);
        const rows: BaseIncomeSource[] = [];
        for (let i = 0; i < newIncome.vestingLength; i++) {
          const vestYear = newIncome.vestingStartYear + i;
          rows.push({
            id: `${Date.now()}-rsu-${i}-${Math.floor(Math.random() * 10000)}`,
            name: `${newIncome.name} (Vesting Year ${vestYear})`,
            type: "rsu",
            amount: perYear,
            frequency: "annually",
            growthRate: 0,
            taxRate: getEffectiveTaxRate(perYear, "rsu"),
            vestingLength: 1, // Each row covers 1 year
            vestingStartYear: vestYear,
          });
        }
        setIncomes([...incomes, ...rows]);
        resetNewIncome();
        return;
      }

      // ... keep existing code (other income types logic) the same ...
      const annualAmount =
        newIncome.frequency === "monthly"
          ? newIncome.amount * 12
          : newIncome.amount;
      const calculatedTaxRate = getEffectiveTaxRate(
        annualAmount,
        newIncome.type || "salary",
      );

      const income: BaseIncomeSource = {
        id: Date.now().toString(),
        name: newIncome.name,
        type: newIncome.type as BaseIncomeSource["type"],
        amount: newIncome.amount,
        frequency: newIncome.frequency || "annually",
        growthRate: newIncome.growthRate || 3,
        taxRate: calculatedTaxRate,
        ...(newIncome.type === "bonus" && {
          bonusYear: newIncome.bonusYear,
          linkedSalaryId: newIncome.linkedSalaryId,
        }),
        ...(newIncome.type === "rsu" && {
          vestingLength: newIncome.vestingLength,
          vestingStartYear: newIncome.vestingStartYear,
        }),
      };
      setIncomes([...incomes, income]);
      resetNewIncome();
    }
  };

  const updateIncome = (id: string, updates: Partial<BaseIncomeSource>) => {
    setIncomes(
      incomes.map((income) => {
        if (income.id === id) {
          const updatedIncome = { ...income, ...updates } as BaseIncomeSource;
          // Recalculate tax rate if amount or type changes
          if (
            updates.amount !== undefined ||
            updates.type !== undefined ||
            updates.frequency !== undefined
          ) {
            const annualAmount =
              updatedIncome.frequency === "monthly"
                ? updatedIncome.amount * 12
                : updatedIncome.amount;
            updatedIncome.taxRate = getEffectiveTaxRate(
              annualAmount,
              updatedIncome.type as BaseIncomeSource["type"],
            );
          }
          return updatedIncome;
        }
        return income;
      }),
    );
  };

  const removeIncome = (id: string) => {
    setIncomes(incomes.filter((i) => i.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIncomeTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      salary: "Progressive federal + state income tax",
      freelance: "Progressive tax + 14.13% self-employment tax",
      investment: "15% capital gains + state tax",
      equity: "Progressive tax (treated as ordinary income)",
      rsu: "RSU vesting - progressive tax, set vesting schedule below",
      bonus: "One-off bonus, assign salary to link for taxes",
      other: "Progressive federal + state income tax",
    };
    return descriptions[type] || "Standard progressive taxation";
  };

  const getSalaryIncomes = (
    incomes: BaseIncomeSource[],
  ): BaseIncomeSource[] => {
    return incomes.filter((i): i is BaseIncomeSource => i.type === "salary");
  };

  // This filtered list previously checked for "rsu_vested" for exclusion.
  // Remove the unnecessary filter since 'rsu_vested' can never be included in state.
  const displayIncomes = incomes; // No filter needed, since all are correct type

  const renderRows = (income: BaseIncomeSource) => {
    const rows = [
      <Card key={income.id} className="border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div>
              <Label>Name</Label>
              <Input
                value={income.name}
                onChange={(e) =>
                  updateIncome(income.id, { name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={income.type}
                onValueChange={(value: BaseIncomeSource["type"]) =>
                  updateIncome(income.id, { type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="equity">Equity Compensation</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="rsu">RSU</SelectItem>
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
                onChange={(e) =>
                  updateIncome(income.id, { amount: Number(e.target.value) })
                }
              />
              <div className="text-xs text-slate-500 mt-1">
                {income.frequency === "monthly"
                  ? `${formatCurrency(income.amount * 12)}/year`
                  : `${formatCurrency(income.amount / 12)}/month`}
              </div>
            </div>
            {/* For bonus: pick salary & year */}
            {income.type === "bonus" && (
              <>
                <div>
                  <Label>Linked Salary</Label>
                  <Select
                    value={income.linkedSalaryId ?? ""}
                    onValueChange={(val) =>
                      updateIncome(income.id, { linkedSalaryId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSalaryIncomes(incomes).map((salary) => (
                        <SelectItem value={salary.id} key={salary.id}>
                          {salary.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bonus Year</Label>
                  <Input
                    type="number"
                    min={1}
                    value={income.bonusYear ?? ""}
                    onChange={(e) =>
                      updateIncome(income.id, {
                        bonusYear: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}
            {/* RSU fields: vesting length & start year */}
            {income.type === "rsu" && (
              <>
                <div>
                  <Label>Vesting Length (years)</Label>
                  <Select
                    value={String(income.vestingLength ?? 4)}
                    onValueChange={(value: string) =>
                      updateIncome(income.id, { vestingLength: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vesting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="4">4 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vesting Start Year</Label>
                  <Input
                    type="number"
                    min={1}
                    value={income.vestingStartYear ?? ""}
                    onChange={(e) =>
                      updateIncome(income.id, {
                        vestingStartYear: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}
            {/* Normal frequency and growth rate fields for non-bonus/investment */}
            {income.type !== "bonus" && income.type !== "rsu" && (
              <>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={income.frequency}
                    onValueChange={(value: "monthly" | "annually") =>
                      updateIncome(income.id, { frequency: value })
                    }
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
                    onChange={(e) =>
                      updateIncome(income.id, {
                        growthRate: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}
            {/* Tax Rate & Delete */}
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
      </Card>,
    ];
    // If RSU, only display vestings (for UI); they are virtual, not in state.
    if (income.type === "rsu") {
      const vestings = getRSUVestings(income);
      vestings.forEach((v) => {
        rows.push(
          <Card
            key={v.id}
            className="ml-4 border-l-4 border-dashed border-green-300 bg-green-50 opacity-90"
          >
            <CardContent className="py-3 px-6 flex flex-row items-center gap-4">
              <div className="flex-1 text-sm text-green-800">
                <span className="font-medium">{v.name}</span>
                <span className="ml-2">
                  — {formatCurrency(v.amount)} vested in {v.vestingYear}
                </span>
              </div>
            </CardContent>
          </Card>,
        );
      });
    }
    return rows;
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
          <CardTitle className="text-lg text-green-800">
            Add New Income Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <Label htmlFor="income-name">Income Source Name</Label>
              <Input
                id="income-name"
                value={newIncome.name}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, name: e.target.value })
                }
                placeholder="e.g., Bonus 2025, RSUs"
              />
            </div>
            {/* Type */}
            <div>
              <Label htmlFor="income-type">Type</Label>
              <Select
                value={newIncome.type}
                onValueChange={(value: BaseIncomeSource["type"]) =>
                  setNewIncome({ ...newIncome, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="equity">Equity Compensation</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="rsu">RSU</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {getIncomeTypeDescription(newIncome.type || "salary")}
              </p>
            </div>
            {/* Amount */}
            <div>
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                type="number"
                value={newIncome.amount}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, amount: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
            {/* Frequency */}
            {newIncome.type !== "bonus" && newIncome.type !== "rsu" && (
              <div>
                <Label htmlFor="income-frequency">Frequency</Label>
                <Select
                  value={newIncome.frequency}
                  onValueChange={(value: "monthly" | "annually") =>
                    setNewIncome({ ...newIncome, frequency: value })
                  }
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
            )}

            {/* Growth rate - not for bonus */}
            {newIncome.type !== "bonus" && (
              <div>
                <Label htmlFor="income-growth">Growth Rate (%)</Label>
                <Input
                  id="income-growth"
                  type="number"
                  step="0.1"
                  value={newIncome.growthRate}
                  onChange={(e) =>
                    setNewIncome({
                      ...newIncome,
                      growthRate: Number(e.target.value),
                    })
                  }
                  placeholder="3"
                />
              </div>
            )}

            {/* For bonus pick associated salary and year */}
            {newIncome.type === "bonus" && (
              <>
                <div>
                  <Label htmlFor="bonus-salary">Linked Salary</Label>
                  <Select
                    value={newIncome.linkedSalaryId ?? ""}
                    onValueChange={(val) =>
                      setNewIncome({ ...newIncome, linkedSalaryId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSalaryIncomes(incomes).map((salary) => (
                        <SelectItem value={salary.id} key={salary.id}>
                          {salary.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Tie bonus to a salary for modeling
                  </p>
                </div>
                <div>
                  <Label htmlFor="bonus-year">Bonus Year</Label>
                  <Input
                    id="bonus-year"
                    type="number"
                    min={1}
                    value={newIncome.bonusYear ?? ""}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        bonusYear: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 2025"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Year the bonus is paid
                  </p>
                </div>
              </>
            )}

            {/* RSU fields */}
            {newIncome.type === "rsu" && (
              <>
                <div>
                  <Label htmlFor="rsu-vesting-length">
                    Vesting Length (years)
                  </Label>
                  <Select
                    value={String(newIncome.vestingLength ?? 4)}
                    onValueChange={(value: string) =>
                      setNewIncome({
                        ...newIncome,
                        vestingLength: Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vesting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="4">4 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rsu-vesting-start-year">
                    Vesting Start Year
                  </Label>
                  <Input
                    id="rsu-vesting-start-year"
                    type="number"
                    min={1}
                    value={newIncome.vestingStartYear ?? ""}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        vestingStartYear: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 2025"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Vesting schedule starts in this year
                  </p>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={addIncome}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Income Source
          </Button>
        </CardContent>
      </Card>

      {/* Existing Income Sources */}
      <div className="space-y-4">
        {incomes.map((income) => renderRows(income))}
      </div>
    </div>
  );
};
