import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RetirementSettingsProps {
  retirementAge: number;
  setRetirementAge: (age: number) => void;
  withdrawalRate: number;
  setWithdrawalRate: (rate: number) => void;
  enableRetirementMode: boolean;
  setEnableRetirementMode: (enabled: boolean) => void;
}

export const RetirementSettings: React.FC<RetirementSettingsProps> = ({
  retirementAge,
  setRetirementAge,
  withdrawalRate,
  setWithdrawalRate,
  enableRetirementMode,
  setEnableRetirementMode,
}) => {
  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="text-lg text-purple-700">
          Retirement Planning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="retirementMode"
              checked={enableRetirementMode}
              onCheckedChange={setEnableRetirementMode}
            />
            <Label htmlFor="retirementMode">Enable Retirement Mode</Label>
          </div>

          {enableRetirementMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retirementAge">Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  min="50"
                  max="80"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="withdrawalRate">
                  Annual Withdrawal Rate (%)
                </Label>
                <Input
                  id="withdrawalRate"
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={withdrawalRate}
                  onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {enableRetirementMode && (
            <div className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
              <p>
                <strong>Retirement Mode:</strong> After age {retirementAge},
                income will stop and you'll withdraw {withdrawalRate}% of your
                wealth annually.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
