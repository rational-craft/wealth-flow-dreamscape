export interface MonteCarloParams {
  initialWealth: number;
  annualContribution: number;
  expectedReturn: number;
  volatility: number;
  years: number;
  simulations: number;
}

export interface MonteCarloResult {
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  finalValues: number[];
  successRate: number;
}

self.onmessage = function (e: MessageEvent<MonteCarloParams>) {
  const {
    initialWealth,
    annualContribution,
    expectedReturn,
    volatility,
    years,
    simulations,
  } = e.data;

  const results: number[][] = [];
  const finalValues: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    const yearlyValues: number[] = [];
    let wealth = initialWealth;

    for (let year = 0; year < years; year++) {
      // Generate random return using normal distribution approximation
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const randomReturn = expectedReturn + volatility * z0;

      wealth = wealth * (1 + randomReturn / 100) + annualContribution;
      yearlyValues.push(wealth);
    }

    results.push(yearlyValues);
    finalValues.push(wealth);
  }

  // Calculate percentiles for each year
  const percentiles = {
    p10: Array(years).fill(0),
    p25: Array(years).fill(0),
    p50: Array(years).fill(0),
    p75: Array(years).fill(0),
    p90: Array(years).fill(0),
  };

  for (let year = 0; year < years; year++) {
    const yearValues = results.map((sim) => sim[year]).sort((a, b) => a - b);
    percentiles.p10[year] = yearValues[Math.floor(simulations * 0.1)];
    percentiles.p25[year] = yearValues[Math.floor(simulations * 0.25)];
    percentiles.p50[year] = yearValues[Math.floor(simulations * 0.5)];
    percentiles.p75[year] = yearValues[Math.floor(simulations * 0.75)];
    percentiles.p90[year] = yearValues[Math.floor(simulations * 0.9)];
  }

  const successRate =
    finalValues.filter((v) => v > initialWealth * 2).length / simulations;

  const result: MonteCarloResult = {
    percentiles,
    finalValues,
    successRate,
  };

  self.postMessage(result);
};
