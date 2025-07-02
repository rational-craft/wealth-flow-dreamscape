import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { WealthProjection } from "@/pages/Index";

interface Props {
  data: WealthProjection[];
  currencyFmt?: (n: number) => string;
}

const NetWorthStackedChart: React.FC<Props> = ({ data, currencyFmt }) => {
  const chartData = data.map(d => ({
    yearLabel: `${new Date().getFullYear() + d.year - 1}`,
    liquid: d.liquidWealth,
    realEstate: d.realEstateEquity
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="realEstate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="yearLabel" />
        <YAxis tickFormatter={currencyFmt}/>
        <Tooltip formatter={currencyFmt}/>
        <Legend />
        <Area
          type="monotone"
          dataKey="liquid"
          stackId="1"
          stroke="#2563eb"
          fill="url(#liquid)"
          name="Liquid / Investments"
        />
        <Area
          type="monotone"
          dataKey="realEstate"
          stackId="1"
          stroke="#059669"
          fill="url(#realEstate)"
          name="Real-Estate Equity"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default NetWorthStackedChart;
