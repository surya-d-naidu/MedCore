import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentPatients from "@/components/dashboard/recent-patients";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import { QuickActionsMenu } from "@/components/ui/quick-actions-menu";
import { ExportReportDialog } from "@/components/ui/export-report-dialog";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards />

        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <p className="text-muted-foreground">Common tasks and shortcuts</p>
          </div>
          <div className="flex gap-2">
            <ExportReportDialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </ExportReportDialog>
            <QuickActionsMenu>
              <Button>
                Quick Actions
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </QuickActionsMenu>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <UpcomingAppointments />
          <RecentPatients />
        </div>
      </div>
    </DashboardLayout>
  );
}
