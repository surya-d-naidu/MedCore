import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Clock, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AppointmentWithPatient {
  id: number;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
  };
  reason: string;
  time: string;
}

// Mock data for visual purposes - this would be replaced by real API call
const mockUpcomingAppointments: AppointmentWithPatient[] = [
  {
    id: 1,
    patient: { id: 1, firstName: "Patricia", lastName: "Adams" },
    reason: "General Checkup",
    time: "10:30 AM",
  },
  {
    id: 2,
    patient: { id: 2, firstName: "Michael", lastName: "Thompson" },
    reason: "Follow-up Consultation",
    time: "11:45 AM",
  },
  {
    id: 3,
    patient: { id: 3, firstName: "Sarah", lastName: "Johnson" },
    reason: "Dental Checkup",
    time: "2:15 PM",
  },
  {
    id: 4,
    patient: { id: 4, firstName: "Robert", lastName: "Barnes" },
    reason: "X-Ray Results",
    time: "3:30 PM",
  },
];

export default function UpcomingAppointments() {
  // In a real implementation, we would use this:
  // const { data: appointments, isLoading } = useQuery<AppointmentWithPatient[]>({
  //   queryKey: ['/api/appointments/today'],
  // });

  // For now, using mock data:
  const isLoading = false;
  const appointments = mockUpcomingAppointments;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
          <Link href="/appointments" className="text-primary-700 text-sm hover:underline">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-60 overflow-y-auto">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-start p-3 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : appointments && appointments.length > 0 ? (
          appointments.map((appointment) => {
            const initials = `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`;
            const colorClasses = getAvatarColorClasses(appointment.id);
            
            return (
              <div key={appointment.id} className="flex items-start p-3 hover:bg-neutral-50 rounded-lg transition">
                <Avatar className={`mr-3 ${colorClasses.bg}`}>
                  <AvatarFallback className={colorClasses.text}>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">{appointment.reason}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="text-xs text-neutral-400 mr-1 h-3 w-3" />
                    <span className="text-xs text-neutral-500">{appointment.time}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center">
            <p className="text-neutral-500">No upcoming appointments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get different colors for avatars
function getAvatarColorClasses(id: number): { bg: string; text: string } {
  const options = [
    { bg: "bg-blue-100", text: "text-primary-700" },
    { bg: "bg-green-100", text: "text-secondary-700" },
    { bg: "bg-purple-100", text: "text-accent-600" },
    { bg: "bg-red-100", text: "text-red-700" },
  ];
  
  return options[id % options.length];
}
