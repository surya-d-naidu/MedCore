import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/ui/stats-card";
import { Users, CalendarCheck, UserRound, Bed } from "lucide-react";

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
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
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
        iconColor="text-primary-700"
        iconBgColor="bg-blue-50"
        trend={{
          value: "4.75%",
          direction: "up",
          label: "vs last month"
        }}
      />
      
      <StatsCard
        title="Today's Appointments"
        value={stats.todayAppointments}
        icon={CalendarCheck}
        iconColor="text-accent-600"
        iconBgColor="bg-indigo-50"
        trend={{
          value: "2.15%",
          direction: "down",
          label: "vs yesterday"
        }}
      />
      
      <StatsCard
        title="Available Doctors"
        value={stats.availableDoctors}
        icon={UserRound}
        iconColor="text-secondary-700"
        iconBgColor="bg-green-50"
        trend={{
          value: "2",
          direction: "up",
          label: "more than yesterday"
        }}
      />
      
      <StatsCard
        title="Available Rooms"
        value={stats.availableRooms}
        icon={Bed}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-50"
        trend={{
          value: "3",
          direction: "down",
          label: "less than yesterday"
        }}
      />
    </div>
  );
}
