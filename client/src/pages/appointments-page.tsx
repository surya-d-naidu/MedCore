import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Edit, Plus, Search, Trash2, User, UserRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "@/components/appointments/appointment-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Appointment, Doctor, Patient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor & { user: { fullName: string } };
}

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);

  const { data: appointments, isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  const filteredAppointments = appointments?.filter(appointment => {
    // Search by patient name or reason
    const matchesSearch = 
      `${appointment.patient?.firstName} ${appointment.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctor?.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    // Filter by date
    const matchesDate = !dateFilter || 
      new Date(appointment.date).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const deleteAppointment = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/appointments/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      cell: (appointment: AppointmentWithDetails) => {
        return (
          <div className="flex items-center">
            <User className="h-5 w-5 text-neutral-500 mr-2" />
            <div className="text-sm font-medium text-neutral-800">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </div>
          </div>
        );
      }
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (appointment: AppointmentWithDetails) => {
        return (
          <div className="flex items-center">
            <UserRound className="h-5 w-5 text-neutral-500 mr-2" />
            <div className="text-sm font-medium text-neutral-800">
              {appointment.doctor?.user?.fullName}
            </div>
          </div>
        );
      }
    },
    {
      key: "datetime",
      header: "Date & Time",
      cell: (appointment: AppointmentWithDetails) => {
        const appointmentDate = new Date(appointment.date);
        const formattedTime = appointment.time.slice(0, 5); // Format HH:MM from time string
        
        return (
          <div>
            <div className="text-sm text-neutral-800">{format(appointmentDate, "PPP")}</div>
            <div className="text-xs text-neutral-500">{formattedTime}</div>
          </div>
        );
      }
    },
    {
      key: "reason",
      header: "Reason",
      cell: (appointment: AppointmentWithDetails) => (
        <span className="text-sm text-neutral-600">{appointment.reason}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (appointment: AppointmentWithDetails) => {
        const statusConfig = {
          scheduled: { className: "bg-blue-100 text-blue-800", label: "Scheduled" },
          completed: { className: "bg-green-100 text-green-800", label: "Completed" },
          cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
        };
        
        const config = statusConfig[appointment.status as keyof typeof statusConfig] || 
          statusConfig.scheduled;
        
        return (
          <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs rounded-full`}>
            {config.label}
          </Badge>
        );
      }
    },
  ];

  const actions = (appointment: AppointmentWithDetails) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingAppointment(appointment)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this appointment?")) {
            deleteAppointment(appointment.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Appointments">
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative sm:w-64">
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                  {dateFilter && (
                    <div className="p-3 border-t border-border">
                      <Button
                        variant="ghost"
                        className="w-full justify-center text-center"
                        onClick={() => setDateFilter(undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-800 text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
        
        {/* Appointments Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            data={filteredAppointments}
            columns={columns}
            actions={actions}
          />
        )}
      </div>

      {/* Add Appointment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? "Edit" : "New"} Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            key={editingAppointment ? editingAppointment.id : "new"}
            appointment={editingAppointment ?? undefined}
            onSuccess={() => {
              setIsAddModalOpen(false);
              setEditingAppointment(null);
              queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
              queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && setEditingAppointment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <AppointmentForm 
              appointment={editingAppointment}
              onSuccess={() => {
                setEditingAppointment(null);
                queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
