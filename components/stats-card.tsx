import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  children?: ReactNode
}

export function StatsCard({ title, value, description, icon: Icon, trend, children }: StatsCardProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#7f6e62]">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-[#88957d]" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#7f6e62]">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}% em relação ao período anterior
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
