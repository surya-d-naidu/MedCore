import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/ui/stats-card";
import { Users, CalendarClock, Stethoscope, Hospital } from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
  availableRooms: number;
}

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border-0">
            <div className="flex flex-col">
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-4 w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Patients"
        value={stats.totalPatients}
        icon={Users}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
        trend={{
          value: "4.75%",
          direction: "up",
          label: "vs last month"
        }}
      />
      
      <StatsCard
        title="Today's Appointments"
        value={stats.todayAppointments}
        icon={CalendarClock}
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-100"
        trend={{
          value: "2.15%",
          direction: "down",
          label: "vs yesterday"
        }}
      />
      
      <StatsCard
        title="Available Doctors"
        value={stats.availableDoctors}
        icon={Stethoscope}
        iconColor="text-secondary"
        iconBgColor="bg-secondary/10"
        trend={{
          value: "2",
          direction: "up",
          label: "more than yesterday"
        }}
      />
      
      <StatsCard
        title="Available Rooms"
        value={stats.availableRooms}
        icon={Hospital}
        iconColor="text-violet-600"
        iconBgColor="bg-violet-100"
        trend={{
          value: "3",
          direction: "down",
          label: "less than yesterday"
        }}
      />
    </div>
  );
}
