"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A bar chart"

const chartConfig = {
  calls: {
    label: "API Calls",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarDefault({ 
  data = [], 
  trendText = "Trending up by 5.2% this month", 
  isUp = true 
}: { 
  data?: { month: string; calls: number }[],
  trendText?: string,
  isUp?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Requests Over Time</CardTitle>
        <CardDescription>Last 6 Months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="calls" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendText} <TrendingUp className={`h-4 w-4 ${!isUp && 'rotate-180 text-red-500'}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total API requests for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
