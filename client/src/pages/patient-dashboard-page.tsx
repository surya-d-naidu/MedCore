import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Clock, FileText, Heart, User, UserSquare, Activity, Pill, CalendarClock, Search, Filter, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Doctor, Patient, Appointment, MedicalRecord, Prescription } from "@shared/schema";
import AppointmentForm from "@/components/appointments/appointment-form";
import DoctorSelection from "@/components/patients/doctor-selection";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [confirmCancelDialog, setConfirmCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Get patient information if user exists
  const { data: patientData, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["/api/patient-profile"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", `/api/patient-profile/${user.id}`);
      return await res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (patientData) {
      setPatientInfo(patientData);
    }
  }, [patientData]);

  // Get upcoming appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/patient-appointments"],
    queryFn: async () => {
      if (!patientInfo) return [];
      const res = await apiRequest("GET", `/api/patient-appointments/${patientInfo.id}`);
      return await res.json();
    },
    enabled: !!patientInfo,
  });

  // Get medical records
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/patient-medical-records"],
    queryFn: async () => {
      if (!patientInfo) return [];
      const res = await apiRequest("GET", `/api/patient-medical-records/${patientInfo.id}`);
      return await res.json();
    },
    enabled: !!patientInfo,
  });

  // Get prescriptions
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["/api/patient-prescriptions"],
    queryFn: async () => {
      if (!patientInfo) return [];
      const res = await apiRequest("GET", `/api/patient-prescriptions/${patientInfo.id}`);
      return await res.json();
    },
    enabled: !!patientInfo,
  });

  // Get all doctors for booking
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Cancel appointment mutation
  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest("DELETE", `/api/appointments/${appointmentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled",
        variant: "default",
      });
      setConfirmCancelDialog(false);
      setAppointmentToCancel(null);
      // Invalidate queries to refresh the appointments list
      queryClient.invalidateQueries({ queryKey: ["/api/patient-appointments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setConfirmCancelDialog(true);
  };

  const upcomingAppointments = appointments?.filter((app: Appointment) => 
    new Date(app.date) >= new Date() && app.status !== "cancelled"
  ) || [];

  const pastAppointments = appointments?.filter((app: Appointment) => 
    new Date(app.date) < new Date() || app.status === "completed"
  ) || [];

  if (isLoadingPatient) {
    return (
      <DashboardLayout title="Patient Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="text-muted-foreground">Loading patient information...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patient Dashboard">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white">
            <Calendar className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="find-doctor" className="rounded-lg data-[state=active]:bg-white">
            <UserSquare className="w-4 h-4 mr-2" />
            Find Doctor
          </TabsTrigger>
          <TabsTrigger value="medical-records" className="rounded-lg data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-2" />
            Medical Records
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-lg data-[state=active]:bg-white">
            <Pill className="w-4 h-4 mr-2" />
            Prescriptions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Patient Profile Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Patient Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/75 text-white text-xl">
                      {patientInfo?.firstName?.[0]}{patientInfo?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{patientInfo?.firstName} {patientInfo?.lastName}</h3>
                  <p className="text-muted-foreground text-sm">Patient ID: P-{String(patientInfo?.id || 0).padStart(4, '0')}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-muted pb-2">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">{patientInfo?.dateOfBirth ? format(new Date(patientInfo.dateOfBirth), 'MMMM d, yyyy') : '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-muted pb-2">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium capitalize">{patientInfo?.gender || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-muted pb-2">
                    <span className="text-muted-foreground">Blood Group:</span>
                    <span className="font-medium">{patientInfo?.bloodGroup || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-muted pb-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{patientInfo?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{patientInfo?.email || '-'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            {/* Health Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Health Status</CardTitle>
                <CardDescription>Your current health information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={cn(
                      "capitalize",
                      patientInfo?.status === "active" ? "bg-green-100 text-green-800" :
                      patientInfo?.status === "critical" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    )}>
                      {patientInfo?.status || "Active"}
                    </Badge>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Alert>
                      <Heart className="h-4 w-4 text-primary" />
                      <AlertTitle>Health Alerts</AlertTitle>
                      <AlertDescription>
                        No active health alerts at the moment.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                  {isLoadingAppointments ? (
                    <div className="h-24 flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : upcomingAppointments?.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 2).map((appointment: any) => (
                        <div key={appointment.id} className="border rounded-lg p-3 bg-muted/50">
                          <div className="flex items-center mb-2">
                            <CalendarClock className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {appointment.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-6">
                      No recent activity found
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setOpenAppointmentDialog(true)}
                  className="w-full bg-primary-800 hover:bg-primary-700 text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedTab("appointments")}>
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  View All Appointments
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedTab("medical-records")}>
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  View Medical Records
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedTab("prescriptions")}>
                  <Pill className="h-4 w-4 mr-2 text-primary" />
                  View Prescriptions
                </Button>
                <Separator />
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">Have Questions?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our healthcare team for assistance with any health concerns.
                  </p>
                  <Button size="sm" className="w-full">Contact Support</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedTab("appointments")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : upcomingAppointments?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingAppointments.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center mb-3">
                        <Badge className={cn(
                          appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                          appointment.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {appointment.status}
                        </Badge>
                        <div className="ml-auto text-sm text-muted-foreground">
                          ID: #{String(appointment.id).padStart(4, '0')}
                        </div>
                      </div>
                      <div className="flex items-start mb-2">
                        <UserSquare className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{appointment.doctor?.user?.fullName || 'Dr. Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{appointment.doctor?.specialization || 'Specialist'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{format(new Date(appointment.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-sm mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{appointment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {appointment.reason}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appointment)}>Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have any scheduled appointments at the moment.
                  </p>
                  <Button 
                    onClick={() => setOpenAppointmentDialog(true)}
                    className="bg-primary-800 hover:bg-primary-700 text-white"
                  >
                    Book New Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Your Appointments</h2>
              <p className="text-muted-foreground">Manage your scheduled and past appointments</p>
            </div>
            <Button 
              onClick={() => setOpenAppointmentDialog(true)}
              className="bg-primary-800 hover:bg-primary-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {isLoadingAppointments ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : upcomingAppointments?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center mb-3">
                        <Badge className={cn(
                          appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                          appointment.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {appointment.status}
                        </Badge>
                        <div className="ml-auto text-sm text-muted-foreground">
                          ID: #{String(appointment.id).padStart(4, '0')}
                        </div>
                      </div>
                      <div className="flex items-start mb-2">
                        <UserSquare className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{appointment.doctor?.user?.fullName || 'Dr. Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{appointment.doctor?.specialization || 'Specialist'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{format(new Date(appointment.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-sm mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{appointment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {appointment.reason}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appointment)}>Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have any scheduled appointments at the moment.
                  </p>
                  <Button 
                    onClick={() => setOpenAppointmentDialog(true)}
                    className="bg-primary-800 hover:bg-primary-700 text-white"
                  >
                    Book New Appointment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {isLoadingAppointments ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : pastAppointments?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center mb-3">
                        <Badge variant="outline" className={
                          appointment.status === "completed" ? "bg-green-100 text-green-800" : 
                          appointment.status === "cancelled" ? "bg-red-100 text-red-800" : 
                          "bg-muted text-muted-foreground"}>
                          {appointment.status}
                        </Badge>
                        <div className="ml-auto text-sm text-muted-foreground">
                          ID: #{String(appointment.id).padStart(4, '0')}
                        </div>
                      </div>
                      <div className="flex items-start mb-2">
                        <UserSquare className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{appointment.doctor?.user?.fullName || 'Dr. Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{appointment.doctor?.specialization || 'Specialist'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{format(new Date(appointment.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-sm mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{appointment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {appointment.reason}
                      </p>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          Book Similar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Past Appointments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have any past appointment records.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Find Doctor Tab */}
        <TabsContent value="find-doctor" className="space-y-6">
          {patientInfo && (
            <DoctorSelection patientId={patientInfo.id} />
          )}
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="medical-records" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Medical Records</h2>
              <p className="text-muted-foreground">Access your medical history and records</p>
            </div>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Request Records
            </Button>
          </div>

          {isLoadingRecords ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : medicalRecords?.length > 0 ? (
            <div className="space-y-4">
              {medicalRecords.map((record: any) => (
                <Card key={record.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base">Medical Record #{String(record.id).padStart(4, '0')}</CardTitle>
                        <CardDescription>{format(new Date(record.visitDate), 'MMMM d, yyyy')}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Diagnosis</h4>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Treatment</h4>
                        <p className="text-sm text-muted-foreground">{record.treatment}</p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                      </div>
                    )}
                    {record.attachments && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Attachments</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(record.attachments) ? 
                            record.attachments.map((attachment, index) => (
                              <Badge key={index} variant="outline" className="bg-muted">
                                Document {index + 1}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="bg-muted">
                                Document
                              </Badge>
                            )
                          }
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">No Medical Records</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any medical records in our system.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Prescriptions</h2>
              <p className="text-muted-foreground">View and manage your medication prescriptions</p>
            </div>
            <Button variant="outline">
              <Pill className="h-4 w-4 mr-2" />
              Request Refill
            </Button>
          </div>

          {isLoadingPrescriptions ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : prescriptions?.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription: any) => (
                <Card key={prescription.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base">Prescription #{String(prescription.id).padStart(4, '0')}</CardTitle>
                        <CardDescription>{format(new Date(prescription.prescriptionDate), 'MMMM d, yyyy')}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Pill className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-start mb-2">
                        <UserSquare className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{prescription.doctor?.user?.fullName || 'Dr. Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{prescription.doctor?.specialization || 'Specialist'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Medications</h4>
                      {Array.isArray(prescription.medicines) ? (
                        prescription.medicines.map((medicine: string, index: number) => (
                          <div key={index} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{medicine}</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="mr-2">Dosage: {Array.isArray(prescription.dosage) ? prescription.dosage[index] : 'As directed'}</span>
                              <span>Duration: {Array.isArray(prescription.duration) ? prescription.duration[index] : 'As needed'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Medication information not available</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {prescription.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">No Prescriptions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any prescriptions in our system.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Appointment Dialog */}
      <Dialog open={openAppointmentDialog} onOpenChange={setOpenAppointmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment with one of our healthcare providers.
            </DialogDescription>
          </DialogHeader>
          {patientInfo && (
            <AppointmentForm 
              onSuccess={() => {
                setOpenAppointmentDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/patient-appointments"] });
              }}
              patientId={patientInfo.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel Appointment Dialog */}
      <Dialog open={confirmCancelDialog} onOpenChange={setConfirmCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancelDialog(false)}>
              No, Keep Appointment
            </Button>
            <Button variant="destructive" onClick={() => appointmentToCancel && cancelAppointment.mutate(appointmentToCancel.id)}>
              Yes, Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
