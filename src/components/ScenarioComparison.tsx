
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WealthProjection } from '@/pages/Index';
import { Scenario } from '@/services/ScenarioService';

interface ScenarioComparisonProps {
  scenarios: Scenario[];
  getProjectionsForScenario: (scenarioId: string) => WealthProjection[];
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  getProjectionsForScenario
}) => {
  const [scenario1Id, setScenario1Id] = useState(scenarios[0]?.id || '');
  const [scenario2Id, setScenario2Id] = useState(scenarios[1]?.id || '');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const scenario1 = scenarios.find(s => s.id === scenario1Id);
  const scenario2 = scenarios.find(s => s.id === scenario2Id);
  
  const projections1 = scenario1Id ? getProjectionsForScenario(scenario1Id) : [];
  const projections2 = scenario2Id ? getProjectionsForScenario(scenario2Id) : [];

  // Combine data for comparison chart
  const comparisonData = projections1.map((p1, index) => {
    const p2 = projections2[index];
    return {
      year: p1.year,
      [`${scenario1?.name} Net Worth`]: p1.cumulativeWealth,
      [`${scenario2?.name} Net Worth`]: p2?.cumulativeWealth || 0,
      [`${scenario1?.name} Savings`]: p1.savings,
      [`${scenario2?.name} Savings`]: p2?.savings || 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">First Scenario</label>
          <Select value={scenario1Id} onValueChange={setScenario1Id}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map(scenario => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-slate-700">Second Scenario</label>
          <Select value={scenario2Id} onValueChange={setScenario2Id}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map(scenario => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net Worth Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey={`${scenario1?.name} Net Worth`}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={`${scenario2?.name} Net Worth`}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annual Savings Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey={`${scenario1?.name} Savings`}
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={`${scenario2?.name} Savings`}
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
