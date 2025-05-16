import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import AppointmentStats from "@/components/dashboard/appointment-stats";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import RecentPatients from "@/components/dashboard/recent-patients";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useState } from "react";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
  availableRooms: number;
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("week");

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-neutral-800">Dashboard</h2>
            <p className="text-neutral-500 mt-1">Welcome to MedCore Hospital Management System</p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center space-x-3">
            <Select 
              defaultValue="week" 
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="pl-3 pr-8 py-2 border border-neutral-300 rounded-md text-sm bg-white w-[140px]">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="default" 
              className="bg-primary-800 text-white hover:bg-primary-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <StatsCards stats={dashboardStats} isLoading={isLoadingStats} />
        
        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments Chart */}
          <AppointmentStats timeRange={timeRange} />
          
          {/* Upcoming Appointments */}
          <UpcomingAppointments />
        </div>
        
        {/* Recent Patients Table */}
        <RecentPatients />
      </div>
    </DashboardLayout>
  );
}
