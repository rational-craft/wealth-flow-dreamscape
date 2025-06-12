
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { MonteCarloParams, MonteCarloResult } from '@/workers/MonteCarloWorker';
import { Loader2 } from 'lucide-react';

export const MonteCarloSimulation: React.FC = () => {
  const [params, setParams] = useState<MonteCarloParams>({
    initialWealth: 50000,
    annualContribution: 12000,
    expectedReturn: 7,
    volatility: 15,
    years: 30,
    simulations: 1000
  });
  
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = () => {
    setIsRunning(true);
    const worker = new Worker(new URL('@/workers/MonteCarloWorker.ts', import.meta.url), { type: 'module' });
    
    worker.postMessage(params);
    worker.onmessage = (e: MessageEvent<MonteCarloResult>) => {
      setResult(e.data);
      setIsRunning(false);
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = result ? result.percentiles.p10.map((_, index) => ({
    year: index + 1,
    p10: result.percentiles.p10[index],
    p25: result.percentiles.p25[index],
    p50: result.percentiles.p50[index],
    p75: result.percentiles.p75[index],
    p90: result.percentiles.p90[index]
  })) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monte Carlo Simulation Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="initialWealth">Initial Wealth ($)</Label>
              <Input
                id="initialWealth"
                type="number"
                value={params.initialWealth}
                onChange={(e) => setParams({...params, initialWealth: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="annualContribution">Annual Contribution ($)</Label>
              <Input
                id="annualContribution"
                type="number"
                value={params.annualContribution}
                onChange={(e) => setParams({...params, annualContribution: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="expectedReturn">Expected Return (%)</Label>
              <Input
                id="expectedReturn"
                type="number"
                step="0.1"
                value={params.expectedReturn}
                onChange={(e) => setParams({...params, expectedReturn: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="volatility">Volatility (%)</Label>
              <Input
                id="volatility"
                type="number"
                step="0.1"
                value={params.volatility}
                onChange={(e) => setParams({...params, volatility: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="years">Years</Label>
              <Input
                id="years"
                type="number"
                value={params.years}
                onChange={(e) => setParams({...params, years: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="simulations">Simulations</Label>
              <Input
                id="simulations"
                type="number"
                value={params.simulations}
                onChange={(e) => setParams({...params, simulations: Number(e.target.value)})}
              />
            </div>
          </div>
          <Button 
            onClick={runSimulation} 
            disabled={isRunning}
            className="mt-4"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Simulation...
              </>
            ) : (
              'Run Monte Carlo Simulation'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.percentiles.p50[result.percentiles.p50.length - 1])}
                  </div>
                  <div className="text-sm text-slate-600">Median Final Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(result.percentiles.p90[result.percentiles.p90.length - 1])}
                  </div>
                  <div className="text-sm text-slate-600">90th Percentile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(result.percentiles.p10[result.percentiles.p10.length - 1])}
                  </div>
                  <div className="text-sm text-slate-600">10th Percentile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(result.successRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="p10" stackId="1" stroke="#f97316" fill="#fed7aa" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="p25" stackId="1" stroke="#eab308" fill="#fef3c7" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="p50" stackId="1" stroke="#22c55e" fill="#bbf7d0" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="p75" stackId="1" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="p90" stackId="1" stroke="#8b5cf6" fill="#ddd6fe" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
