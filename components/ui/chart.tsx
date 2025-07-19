"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type LegendProps,
  type TooltipProps,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                 TYPES                                      */
/* -------------------------------------------------------------------------- */

export type ChartType = "bar" | "line" | "pie"

export interface ChartProps {
  data: Record<string, any>[]
  type: ChartType
  /* eixo-X (bar/line) ou rótulo (pie) */
  dataKey?: string
  /* valor numérico (bar/line/pie)         */
  valueKey?: string
  /* nome (pie) – caso diferente de dataKey */
  nameKey?: string
  title?: React.ReactNode
  description?: React.ReactNode
  colors?: string[]
}

/* -------------------------------------------------------------------------- */
/*                         SHARED “WRAPPER” CSS                               */
/* -------------------------------------------------------------------------- */

export interface ChartContainerProps extends React.ComponentProps<"div"> {}
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("w-full h-full flex items-center justify-center", className)} {...props}>
      {children}
    </div>
  ),
)
ChartContainer.displayName = "ChartContainer"

/* ------------------------------- TOOLTIP ---------------------------------- */

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, TooltipProps["payload"] & { label?: unknown }>(
  function ChartTooltip({ active, payload, label }, ref) {
    if (!active || !payload?.length) return null

    return (
      <div ref={ref} className="rounded-md border border-border/40 bg-background px-3 py-2 text-xs shadow-lg space-y-1">
        {label && <p className="font-medium">{String(label)}</p>}
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color || entry.fill }} />
            <span>{entry.name ?? entry.dataKey}:</span>
            <span className="font-mono tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

/* ------------------------------- LEGEND ----------------------------------- */

export const ChartLegendContent = React.forwardRef<HTMLDivElement, LegendProps>(({ payload, ...rest }, ref) => {
  if (!payload?.length) return null
  return (
    <div ref={ref} className="flex flex-wrap items-center gap-3 text-xs" {...rest}>
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.value}
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

/* -------------------------------------------------------------------------- */
/*                                   CHART                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1919"]

export function Chart({
  data,
  type,
  dataKey = "name",
  valueKey = "value",
  nameKey,
  title,
  description,
  colors = DEFAULT_COLORS,
}: ChartProps) {
  /* Cells color helper for PieChart */
  const renderPieCells = (entries: Record<string, any>[]) =>
    entries.map((_, idx) => <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />)

  const chartJSX = (
    <ResponsiveContainer width="100%" height={300}>
      {type === "bar" && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={dataKey} />
          <YAxis />
          <RechartsTooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey={valueKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      )}

      {type === "line" && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={dataKey} />
          <YAxis />
          <RechartsTooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey={valueKey} stroke={colors[0]} activeDot={{ r: 6 }} />
        </LineChart>
      )}

      {type === "pie" && (
        <PieChart>
          <RechartsTooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Pie
            dataKey={valueKey}
            nameKey={nameKey ?? dataKey}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
            fill={colors[0]}
          >
            {renderPieCells(data)}
          </Pie>
        </PieChart>
      )}
    </ResponsiveContainer>
  )

  /* Card wrapper opcional */
  return title || description ? (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <ChartContainer>{chartJSX}</ChartContainer>
      </CardContent>
    </Card>
  ) : (
    <ChartContainer>{chartJSX}</ChartContainer>
  )
}

/* -------------------------- RE-EXPORTS ÚTEIS ------------------------------ */

export { Legend as ChartLegend, RechartsTooltip as ChartTooltip }
