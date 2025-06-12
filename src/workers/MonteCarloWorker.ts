
interface MonteCarloParams {
  expectedReturn: number;
  volatility: number;
  trials: number;
  years: number;
  initialWealth: number;
  annualSavings: number[];
}

interface MonteCarloResult {
  percentiles: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  finalValues: number[];
  probabilityTable: { target: number; probability: number }[];
}

self.onmessage = function(e: MessageEvent<MonteCarloParams>) {
  const { expectedReturn, volatility, trials, years, initialWealth, annualSavings } = e.data;
  
  const results: number[][] = [];
  
  // Run Monte Carlo simulation
  for (let trial = 0; trial < trials; trial++) {
    const yearlyWealth: number[] = [initialWealth];
    let currentWealth = initialWealth;
    
    for (let year = 1; year <= years; year++) {
      // Generate random return using normal distribution approximation
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const annualReturn = (expectedReturn / 100) + (volatility / 100) * z0;
      
      currentWealth = currentWealth * (1 + annualReturn) + (annualSavings[year - 1] || 0);
      yearlyWealth.push(Math.max(0, currentWealth));
    }
    
    results.push(yearlyWealth);
  }
  
  // Calculate percentiles for each year
  const percentiles = {
    p10: [] as number[],
    p50: [] as number[],
    p90: [] as number[]
  };
  
  for (let year = 0; year <= years; year++) {
    const yearValues = results.map(trial => trial[year]).sort((a, b) => a - b);
    percentiles.p10.push(yearValues[Math.floor(trials * 0.1)]);
    percentiles.p50.push(yearValues[Math.floor(trials * 0.5)]);
    percentiles.p90.push(yearValues[Math.floor(trials * 0.9)]);
  }
  
  // Calculate probability table for common targets
  const finalValues = results.map(trial => trial[trial.length - 1]);
  const targets = [500000, 1000000, 2000000, 5000000];
  const probabilityTable = targets.map(target => ({
    target,
    probability: finalValues.filter(value => value >= target).length / trials * 100
  }));
  
  const result: MonteCarloResult = {
    percentiles,
    finalValues,
    probabilityTable
  };
  
  self.postMessage(result);
};
