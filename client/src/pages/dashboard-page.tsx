import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import AppointmentStats from "@/components/dashboard/appointment-stats";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import RecentPatients from "@/components/dashboard/recent-patients";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ChevronDown, Calendar, BarChart2, PieChart, ArrowRightCircle } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        {/* Welcome Section */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold gradient-text mb-1">Hospital Overview</h2>
                <p className="text-muted-foreground">Welcome back to MedCore Hospital Management System</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
                <Select 
                  defaultValue="week" 
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="pl-3 pr-8 py-2 h-10 form-input-clean rounded-lg w-[140px] flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select Range" />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline"
                  className="rounded-lg h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                
                <Button 
                  className="btn-gradient rounded-lg h-10"
                >
                  Quick Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <StatsCards stats={dashboardStats} isLoading={isLoadingStats} />
        
        {/* Analytics Section */}
        <Tabs defaultValue="appointments" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analytics Overview</h3>
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="appointments" className="rounded-md text-xs px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="patients" className="rounded-md text-xs px-3 py-1.5">
                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-md text-xs px-3 py-1.5">
                <PieChart className="h-3.5 w-3.5 mr-1.5" />
                Revenue
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="appointments" className="mt-0">
            {/* Charts and Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Appointments Chart */}
              <Card className="lg:col-span-8 border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Appointment Statistics</CardTitle>
                  <CardDescription>Overview of hospital appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentStats timeRange={timeRange} />
                </CardContent>
              </Card>
              
              {/* Upcoming Appointments */}
              <Card className="lg:col-span-4 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div>
                    <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                    <CardDescription>Today's scheduled visits</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
                    <ArrowRightCircle className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <UpcomingAppointments />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Patient Statistics</CardTitle>
                  <CardDescription>Number of patients over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">Patient analytics visualization<br/>(Placeholder for chart)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Overview</CardTitle>
                  <CardDescription>Financial performance analytics</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">Revenue analytics visualization<br/>(Placeholder for chart)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Recent Patients Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Patients</CardTitle>
                <CardDescription>Latest patient activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg h-8">
                <ArrowRightCircle className="h-4 w-4 mr-1" />
                View All Patients
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentPatients />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
