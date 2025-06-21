import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Plus, Calendar as CalendarIcon, User, FileText, Receipt, BedDouble, Pill } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

import { queryClient } from "@/lib/queryClient";
import PatientForm from "@/components/patients/patient-form";
import AppointmentForm from "@/components/appointments/appointment-form";
import BillingForm from "@/components/billing/billing-form";

interface QuickActionsMenuProps {
  children: React.ReactNode;
}

export function QuickActionsMenu({ children }: QuickActionsMenuProps) {
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (type: string) => {
    setIsNewPatientOpen(false);
    setIsNewAppointmentOpen(false);
    setIsNewBillOpen(false);

    toast({
      title: "Success",
      description: `${type} has been created successfully.`,
    });

    if (type === "Patient") {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    }
    if (type === "Appointment") {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    }
    if (type === "Bill") {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/patients" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>View All Patients</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/appointments" className="flex items-center cursor-pointer">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>View All Appointments</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing" className="flex items-center cursor-pointer">
              <Receipt className="mr-2 h-4 w-4" />
              <span>View All Bills</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsNewPatientOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Patient</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsNewAppointmentOpen(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Schedule Appointment</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsNewBillOpen(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Create Bill</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/medical-records" className="flex items-center cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <span>Medical Records</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/prescriptions" className="flex items-center cursor-pointer">
              <Pill className="mr-2 h-4 w-4" />
              <span>Prescriptions</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wards" className="flex items-center cursor-pointer">
              <BedDouble className="mr-2 h-4 w-4" />
              <span>Wards & Rooms</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Add Patient Dialog */}
      <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add New Patient
            </DialogTitle>
            <DialogDescription>
              Add a new patient to the system.
            </DialogDescription>
          </DialogHeader>
          <PatientForm onSuccess={() => handleSuccess("Patient")} />
        </DialogContent>
      </Dialog>

      {/* Quick Schedule Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schedule New Appointment
            </DialogTitle>
            <DialogDescription>
              Schedule a new appointment for a patient.
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm onSuccess={() => handleSuccess("Appointment")} />
        </DialogContent>
      </Dialog>

      {/* Quick Create Bill Dialog */}
      <Dialog open={isNewBillOpen} onOpenChange={setIsNewBillOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Create New Bill
            </DialogTitle>
            <DialogDescription>
              Create a new bill for a patient.
            </DialogDescription>
          </DialogHeader>
          <BillingForm onSuccess={() => handleSuccess("Bill")} />
        </DialogContent>
      </Dialog>
    </>
  );
} 