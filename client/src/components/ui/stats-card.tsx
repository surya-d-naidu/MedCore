import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
    <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          {trend && (
            <p className={cn(
              "text-sm mt-1",
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            )}>
              <span className="inline-block mr-1">
                {trend.direction === "up" ? "↑" : "↓"}
              </span>
              <span>{trend.value}</span>
              <span className="text-neutral-500 ml-1">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          iconBgColor
        )}>
          <Icon className={cn("text-xl", iconColor)} />
        </div>
      </div>
    </div>
  );
}
