import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Doctor } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, UserSquare, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AppointmentForm from "@/components/appointments/appointment-form";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DoctorSelectionProps {
  patientId: number;
}

export default function DoctorSelection({ patientId }: DoctorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<(Doctor & { user: { fullName: string } }) | null>(null);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);

  // Fetch all doctors
  const { data: doctors, isLoading } = useQuery<(Doctor & { user: { fullName: string } })[]>({
    queryKey: ["/api/doctors"],
  });

  // Fetch specializations for the filter
  const { data: specializations } = useQuery<string[]>({
    queryKey: ["/api/specializations"],
    queryFn: async () => {
      // Extract unique specializations from doctors
      if (!doctors) return [];
      return Array.from(new Set(doctors.map(doctor => doctor.specialization)));
    },
    enabled: !!doctors,
  });

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = searchTerm.trim() === "" || 
      doctor.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSpecialization = specialization === "all" || specialization === "" || doctor.specialization === specialization;
    
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Find a Doctor</h2>
          <p className="text-muted-foreground">Select a doctor and book your appointment</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or specialization..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations?.map((spec) => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredDoctors && filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={doctor.status === "available" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-amber-100 text-amber-800"}>
                    {doctor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/75 text-white text-xl">
                    {doctor.user?.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">Dr. {doctor.user?.fullName}</h3>
                <p className="text-muted-foreground text-sm mb-2">{doctor.specialization}</p>
                <div className="text-sm text-muted-foreground mb-2">Experience: {doctor.experience} years</div>
                <Badge variant="outline" className="mb-3">{doctor.qualification}</Badge>
                <div className="flex flex-col w-full mt-2">
                  <div className="text-sm flex justify-between border-t border-muted pt-2">
                    <span>Phone:</span>
                    <span>{doctor.phone}</span>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="p-4">
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setOpenAppointmentDialog(true);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <UserSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">No Doctors Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No doctors match your search criteria. Try adjusting your filters.
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSpecialization("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Appointment Dialog */}
      <Dialog open={openAppointmentDialog} onOpenChange={setOpenAppointmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book Appointment with Dr. {selectedDoctor?.user?.fullName}</DialogTitle>
            <DialogDescription>
              Fill in the details below to schedule your appointment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && patientId && (
            <AppointmentForm 
              onSuccess={() => {
                setOpenAppointmentDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/patient-appointments"] });
              }}
              patientId={patientId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
