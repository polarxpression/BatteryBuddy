"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { Battery } from "@/lib/types";
import { useMemo } from "react";

export function InventorySummary({ batteries }: { batteries: Battery[] }) {
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    batteries.forEach((battery) => {
      const currentQuantity = dataMap.get(battery.type) || 0;
      dataMap.set(battery.type, currentQuantity + battery.quantity);
    });
    return Array.from(dataMap.entries()).map(([type, quantity]) => ({
      type,
      quantity,
    })).sort((a, b) => b.quantity - a.quantity);
  }, [batteries]);

  const chartConfig = {
    quantity: {
      label: "Quantidade",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Resumo do Inventário</CardTitle>
        <CardDescription>Quantidade total de cada tipo de bateria.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
