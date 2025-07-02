import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  IncomeSource,
  ExpenseCategory,
  EquityPayout,
  RealEstateProperty,
  WealthProjection,
} from "@/pages/Index";
import { Database } from "lucide-react";

interface DataTableProps {
  incomes: IncomeSource[];
  expenses: ExpenseCategory[];
  equityPayouts: EquityPayout[];
  properties: RealEstateProperty[];
  projections: WealthProjection[];
  projectionYears: number;
}

interface EditedValue {
  id: string;
  year: number;
  type:
    | "income"
    | "expense"
    | "equity"
    | "property-value"
    | "property-loan"
    | "projection";
  field: string;
  value: number;
}

export const DataTable: React.FC<DataTableProps> = ({
  incomes,
  expenses,
  equityPayouts,
  properties,
  projections,
  projectionYears,
}) => {
  const [editedValues, setEditedValues] = useState<EditedValue[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[$,]/g, "")) || 0;
  };

  const getEditedValue = (
    id: string,
    year: number,
    type: string,
    field: string,
  ): number | null => {
    const edited = editedValues.find(
      (e) =>
        e.id === id && e.year === year && e.type === type && e.field === field,
    );
    return edited ? edited.value : null;
  };

  const updateEditedValue = useCallback(
    (
      id: string,
      year: number,
      type: EditedValue["type"],
      field: string,
      value: number,
    ) => {
      setEditedValues((prev) => {
        const existing = prev.findIndex(
          (e) =>
            e.id === id &&
            e.year === year &&
            e.type === type &&
            e.field === field,
        );

        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { id, year, type, field, value };
          return updated;
        }
        return [...prev, { id, year, type, field, value }];
      });
    },
    [],
  );

  const getIncomeByYear = (income: IncomeSource, year: number) => {
    const editedValue = getEditedValue(income.id, year, "income", "amount");
    if (editedValue !== null) return editedValue;

    const annualAmount =
      income.frequency === "monthly" ? income.amount * 12 : income.amount;
    return annualAmount * Math.pow(1 + income.growthRate / 100, year - 1);
  };

  const getExpenseByYear = (expense: ExpenseCategory, year: number) => {
    const editedValue = getEditedValue(expense.id, year, "expense", "amount");
    if (editedValue !== null) return editedValue;

    const annualAmount =
      expense.frequency === "monthly" ? expense.amount * 12 : expense.amount;
    return annualAmount * Math.pow(1 + expense.growthRate / 100, year - 1);
  };

  const getPropertyValueByYear = (
    property: RealEstateProperty,
    year: number,
  ) => {
    if (year < property.purchaseYear) return 0;

    const editedValue = getEditedValue(
      property.id,
      year,
      "property-value",
      "value",
    );
    if (editedValue !== null) return editedValue;

    const yearsOwned = year - property.purchaseYear + 1;
    return (
      property.purchasePrice *
      Math.pow(1 + property.appreciationRate / 100, yearsOwned - 1)
    );
  };

  const getPropertyLoanBalanceByYear = (
    property: RealEstateProperty,
    year: number,
  ) => {
    if (year < property.purchaseYear) return 0;

    const editedValue = getEditedValue(
      property.id,
      year,
      "property-loan",
      "balance",
    );
    if (editedValue !== null) return editedValue;

    const monthlyRate = property.interestRate / 100 / 12;
    const numPayments = property.loanTermYears * 12;
    const monthsOwned = (year - property.purchaseYear) * 12;

    if (monthsOwned >= numPayments) return 0;

    const remainingBalance =
      (property.loanAmount *
        (Math.pow(1 + monthlyRate, numPayments) -
          Math.pow(1 + monthlyRate, monthsOwned))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return Math.max(0, remainingBalance);
  };

  const getProjectionValue = (projection: WealthProjection, field: string) => {
    const editedValue = getEditedValue(
      "projection",
      projection.year,
      "projection",
      field,
    );
    if (editedValue !== null) return editedValue;

    return projection[field as keyof WealthProjection] as number;
  };

  const EditableCell: React.FC<{
    value: number;
    id: string;
    year: number;
    type: string;
    field: string;
    isEdited?: boolean;
  }> = ({ value, id, year, type, field, isEdited = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(formatCurrency(value));

    const handleSave = () => {
      const newValue = parseCurrency(inputValue);
      updateEditedValue(id, year, type, field, newValue);
      setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setInputValue(formatCurrency(value));
        setIsEditing(false);
      }
    };

    if (isEditing) {
      return (
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          className="h-8 text-center"
          autoFocus
        />
      );
    }

    return (
      <div
        className={`cursor-pointer hover:bg-slate-50 p-1 rounded text-center ${
          isEdited ? "text-orange-600 font-semibold" : ""
        }`}
        onClick={() => {
          setInputValue(formatCurrency(value));
          setIsEditing(true);
        }}
      >
        {formatCurrency(value)}
      </div>
    );
  };

  const years = Array.from({ length: projectionYears }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="text-blue-600" />
        <h3 className="text-xl font-semibold text-slate-800">
          Year-by-Year Data
        </h3>
        <div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
          Complete editable dataset with growth applied
        </div>
        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          Click any value to edit • Orange = manually edited
        </div>
      </div>

      {/* Income Sources Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income Sources by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Income Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Growth Rate</TableHead>
                {years.map((year) => (
                  <TableHead key={year} className="text-center">
                    Year {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.name}</TableCell>
                  <TableCell className="capitalize">{income.type}</TableCell>
                  <TableCell>{income.growthRate}%</TableCell>
                  {years.map((year) => (
                    <TableCell key={year} className="text-center p-1">
                      <EditableCell
                        value={getIncomeByYear(income, year)}
                        id={income.id}
                        year={year}
                        type="income"
                        field="amount"
                        isEdited={
                          getEditedValue(
                            income.id,
                            year,
                            "income",
                            "amount",
                          ) !== null
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expenses Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expenses by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Growth Rate</TableHead>
                {years.map((year) => (
                  <TableHead key={year} className="text-center">
                    Year {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded ${expense.isFixed ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                    >
                      {expense.isFixed ? "Fixed" : "Variable"}
                    </span>
                  </TableCell>
                  <TableCell>{expense.growthRate}%</TableCell>
                  {years.map((year) => (
                    <TableCell key={year} className="text-center p-1">
                      <EditableCell
                        value={getExpenseByYear(expense, year)}
                        id={expense.id}
                        year={year}
                        type="expense"
                        field="amount"
                        isEdited={
                          getEditedValue(
                            expense.id,
                            year,
                            "expense",
                            "amount",
                          ) !== null
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Equity Payouts Data */}
      {equityPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equity Payouts by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  {years.map((year) => (
                    <TableHead key={year} className="text-center">
                      Year {year}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equityPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">
                      {payout.description}
                    </TableCell>
                    {years.map((year) => (
                      <TableCell key={year} className="text-center p-1">
                        {payout.year === year ? (
                          <EditableCell
                            value={payout.amount}
                            id={payout.id}
                            year={year}
                            type="equity"
                            field="amount"
                            isEdited={
                              getEditedValue(
                                payout.id,
                                year,
                                "equity",
                                "amount",
                              ) !== null
                            }
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Real Estate Data */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Real Estate Values by Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Metric</TableHead>
                  {years.map((year) => (
                    <TableHead key={year} className="text-center">
                      Year {year}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <React.Fragment key={property.id}>
                    <TableRow>
                      <TableCell className="font-medium" rowSpan={3}>
                        {property.name}
                      </TableCell>
                      <TableCell className="text-green-700">
                        Property Value
                      </TableCell>
                      {years.map((year) => (
                        <TableCell key={year} className="text-center p-1">
                          {year >= property.purchaseYear ? (
                            <EditableCell
                              value={getPropertyValueByYear(property, year)}
                              id={property.id}
                              year={year}
                              type="property-value"
                              field="value"
                              isEdited={
                                getEditedValue(
                                  property.id,
                                  year,
                                  "property-value",
                                  "value",
                                ) !== null
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-red-700">
                        Loan Balance
                      </TableCell>
                      {years.map((year) => (
                        <TableCell key={year} className="text-center p-1">
                          {year >= property.purchaseYear ? (
                            <EditableCell
                              value={getPropertyLoanBalanceByYear(
                                property,
                                year,
                              )}
                              id={property.id}
                              year={year}
                              type="property-loan"
                              field="balance"
                              isEdited={
                                getEditedValue(
                                  property.id,
                                  year,
                                  "property-loan",
                                  "balance",
                                ) !== null
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-blue-700">Equity</TableCell>
                      {years.map((year) => (
                        <TableCell key={year} className="text-center">
                          {year >= property.purchaseYear
                            ? formatCurrency(
                                getPropertyValueByYear(property, year) -
                                  getPropertyLoanBalanceByYear(property, year),
                              )
                            : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary Projections by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {years.map((year) => (
                  <TableHead key={year} className="text-center">
                    Year {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                "grossIncome",
                "taxes",
                "netIncome",
                "totalExpenses",
                "savings",
                "cumulativeWealth",
              ].map((field) => (
                <TableRow key={field}>
                  <TableCell className="font-medium">
                    {field === "grossIncome"
                      ? "Gross Income"
                      : field === "taxes"
                        ? "Total Taxes"
                        : field === "netIncome"
                          ? "Net Income"
                          : field === "totalExpenses"
                            ? "Total Expenses"
                            : field === "savings"
                              ? "Annual Savings"
                              : "Cumulative Wealth"}
                  </TableCell>
                  {projections.map((projection, index) => (
                    <TableCell key={index} className="text-center p-1">
                      <EditableCell
                        value={getProjectionValue(projection, field)}
                        id="projection"
                        year={projection.year}
                        type="projection"
                        field={field}
                        isEdited={
                          getEditedValue(
                            "projection",
                            projection.year,
                            "projection",
                            field,
                          ) !== null
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
