"use client";

import { useMemo } from "react";
import { type Battery, type AppSettings } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useMobile } from "@/hooks/use-mobile";

interface InventorySummaryProps {
  batteries: Battery[];
  appSettings: AppSettings | null;
}

export function InventorySummary({ batteries, appSettings }: InventorySummaryProps) {
  const isMobile = useMobile();
  const { data, chartConfig } = useMemo(() => {
    const typeMap = new Map<string, { total: number; quantity: number }>();
    batteries.forEach((battery) => {
      const total = battery.quantity * battery.packSize;
      const existing = typeMap.get(battery.type) || { total: 0, quantity: 0 };
      typeMap.set(battery.type, {
        total: existing.total + total,
        quantity: existing.quantity + battery.quantity,
      });
    });

    const sortedData = Array.from(typeMap.entries())
      .map(([type, { total, quantity }]) => ({ type, total, quantity }))
      .sort((a, b) => b.total - a.total);

    const chartConfig: ChartConfig = {};
    sortedData.forEach((item) => {
      const lowStockThreshold = appSettings?.lowStockThreshold ?? 5;
      let color = "hsl(var(--primary))"; // Default purple
      if (item.quantity <= 0) {
        color = "hsl(var(--destructive))"; // Red
      } else if (item.quantity <= lowStockThreshold) {
        color = "hsl(var(--warning))"; // Yellow
      }

      chartConfig[item.type] = {
        label: item.type,
        color: color,
      };
    });

    return { data: sortedData, chartConfig };
  }, [batteries, appSettings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Inventário</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              accessibilityLayer
              data={data}
              layout={isMobile ? "vertical" : "horizontal"}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: isMobile ? 0 : -10,
              }}
            >
              <CartesianGrid vertical={false} />
              {isMobile ? (
                <>
                  <YAxis
                    dataKey="type"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <XAxis dataKey="total" type="number" hide />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="type"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <YAxis dataKey="total" type="number" />
                </>
              )}
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="total" radius={8}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig[entry.type]?.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}