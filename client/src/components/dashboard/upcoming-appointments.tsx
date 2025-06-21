import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MoreHorizontal } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { Appointment, Patient, Doctor } from "@shared/schema";
import { format } from "date-fns";

interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor & { user: { fullName: string } };
}

export default function UpcomingAppointments() {
  const { data: appointments, isLoading, error } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Today's scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Today's scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load appointments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter for today's appointments and upcoming ones
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const upcomingAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= today && appointment.status === 'scheduled';
  }).slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Today's scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{appointment.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dr. {appointment.doctor?.user?.fullName || 'Unknown'} - {appointment.reason}
                  </p>
                </div>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming appointments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
