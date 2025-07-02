import React, { useState } from "react";
import ForecastGrid, { GridRow } from "@/components/ForecastGrid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const seed: GridRow[] = [
  { id: "1", label: "Revenue", y1: 100000, y2: "=y1*1.1" },
  { id: "2", label: "COGS", y1: 40000, y2: "=y1*1.05" },
  { id: "3", label: "Profit", y1: "=y1-y2", y2: "=y1-y2" },
];

export default function DataTab() {
  const [scenarios, setScenarios] = useState([
    { id: "budget", name: "Budget", rows: seed, readOnly: true },
    {
      id: "forecast",
      name: "Forecast",
      rows: JSON.parse(JSON.stringify(seed)),
    },
  ]);
  const [active, setActive] = useState("forecast");

  const clone = () => {
    const num =
      scenarios.filter((s) => s.id.startsWith("reforecast")).length + 1;
    const base = scenarios.find((s) => s.id === active)!;
    setScenarios([
      ...scenarios,
      {
        id: `reforecast${num}`,
        name: `Reforecast ${num}`,
        rows: JSON.parse(JSON.stringify(base.rows)),
      },
    ]);
  };

  return (
    <section className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Data & Reforecast</h2>
        <Button onClick={clone}>New Reforecast</Button>
      </div>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          {scenarios.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {scenarios.map((s) => (
          <TabsContent key={s.id} value={s.id}>
            <ForecastGrid initialRows={s.rows} readOnly={s.readOnly} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
