import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string | number;
    direction: "up" | "down";
    label: string;
  };
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-0 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} strokeWidth={1.5} />
          </div>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          <p className="text-muted-foreground text-sm mt-1">{title}</p>
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium", 
            trend.direction === "up" 
              ? "bg-emerald-50 text-emerald-600" 
              : "bg-red-50 text-red-600"
          )}>
            {trend.direction === "up" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center">
            <span>{trend.label}</span>
            <span className={cn(
              "ml-auto px-1.5 py-0.5 rounded text-xs",
              trend.direction === "up" ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.direction === "up" ? "Increasing" : "Decreasing"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
