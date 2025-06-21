import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, Download, Edit, Eye, Plus, Search, Trash2, UserRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrescriptionForm from "@/components/prescriptions/prescription-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Prescription, Patient, Doctor } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PrescriptionWithDetails extends Prescription {
  patient: Patient;
  doctor: Doctor & { user: { fullName: string } };
}

export default function PrescriptionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<PrescriptionWithDetails | null>(null);

  const { data: prescriptions, isLoading } = useQuery<PrescriptionWithDetails[]>({
    queryKey: ["/api/prescriptions"],
  });

  const filteredPrescriptions = prescriptions?.filter(prescription => {
    // Search by patient name or doctor name
    const matchesSearch = 
      `${prescription.patient?.firstName} ${prescription.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctor?.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by prescription date
    const matchesDate = !dateFilter || 
      new Date(prescription.prescriptionDate).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesDate;
  }) || [];

  const deletePrescription = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/prescriptions/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      cell: (prescription: PrescriptionWithDetails) => {
        const initials = `${prescription.patient?.firstName?.[0] || ''}${prescription.patient?.lastName?.[0] || ''}`;
        
        return (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-blue-100 mr-3">
              <AvatarFallback className="text-primary-700">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-neutral-800">
                {prescription.patient?.firstName} {prescription.patient?.lastName}
              </div>
              <div className="text-xs text-neutral-500">ID: P-{String(prescription.patientId).padStart(4, '0')}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (prescription: PrescriptionWithDetails) => {
        return (
          <div className="flex items-center">
            <UserRound className="h-5 w-5 text-neutral-500 mr-2" />
            <div className="text-sm text-neutral-600">
              {prescription.doctor?.user?.fullName}
            </div>
          </div>
        );
      }
    },
    {
      key: "prescriptionDate",
      header: "Date",
      cell: (prescription: PrescriptionWithDetails) => {
        const prescriptionDate = new Date(prescription.prescriptionDate);
        return (
          <div className="text-sm text-neutral-600">{format(prescriptionDate, "PPP")}</div>
        );
      }
    },
    {
      key: "medicines",
      header: "Medicines",
      cell: (prescription: PrescriptionWithDetails) => {
        const medicines = Array.isArray(prescription.medicines) 
          ? prescription.medicines 
          : [prescription.medicines];
        
        const medicineCount = medicines.length;
        
        return (
          <div className="text-sm text-neutral-600">
            {medicineCount} {medicineCount === 1 ? 'medicine' : 'medicines'}
          </div>
        );
      }
    },
    {
      key: "notes",
      header: "Notes",
      cell: (prescription: PrescriptionWithDetails) => (
        <span className="text-sm text-neutral-600 line-clamp-2">
          {prescription.notes || "No additional notes"}
        </span>
      )
    },
  ];

  const actions = (prescription: PrescriptionWithDetails) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setViewingPrescription(prescription)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingPrescription(prescription)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this prescription?")) {
            deletePrescription(prescription.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const actionButton = (
    <Button
      onClick={() => setIsAddModalOpen(true)}
      size="sm"
      className="btn-gradient rounded-lg h-9"
    >
      <Plus className="h-4 w-4 mr-2" />
      New Prescription
    </Button>
  );

  return (
    <DashboardLayout title="Prescriptions" actionButton={actionButton}>
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative sm:w-64">
                <Input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              </div>
              
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
          </div>
        </div>
        
        {/* Prescriptions Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            data={filteredPrescriptions}
            columns={columns}
            actions={actions}
          />
        )}
      </div>

      {/* Add Prescription Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
          </DialogHeader>
          <PrescriptionForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Prescription Modal */}
      <Dialog open={!!editingPrescription} onOpenChange={(open) => !open && setEditingPrescription(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Prescription</DialogTitle>
          </DialogHeader>
          {editingPrescription && (
            <PrescriptionForm 
              prescription={editingPrescription}
              onSuccess={() => {
                setEditingPrescription(null);
                queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Prescription Modal */}
      <Dialog open={!!viewingPrescription} onOpenChange={(open) => !open && setViewingPrescription(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {viewingPrescription && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 bg-blue-100 mr-3">
                    <AvatarFallback className="text-primary-700">
                      {viewingPrescription.patient?.firstName?.[0] || ''}
                      {viewingPrescription.patient?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">
                      {viewingPrescription.patient?.firstName} {viewingPrescription.patient?.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Date: {format(new Date(viewingPrescription.prescriptionDate), "PPP")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Print
                </Button>
              </div>

              <div className="bg-neutral-50 p-4 rounded-md flex justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Prescribed By</p>
                  <p className="font-medium">{viewingPrescription.doctor?.user?.fullName}</p>
                  <p className="text-sm text-neutral-500">{viewingPrescription.doctor?.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Prescription #</p>
                  <p className="font-medium">RX-{String(viewingPrescription.id).padStart(4, '0')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-neutral-800">Medications</h4>
                <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Medicine</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dosage</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {Array.isArray(viewingPrescription.medicines) && 
                       Array.isArray(viewingPrescription.dosage) &&
                       Array.isArray(viewingPrescription.duration) ? (
                        (viewingPrescription.medicines as any[]).map((medicine, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">{medicine}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                              {(viewingPrescription.dosage as any[])[index] || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                              {(viewingPrescription.duration as any[])[index] || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                            {viewingPrescription.medicines as any}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                            {viewingPrescription.dosage as any}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                            {viewingPrescription.duration as any}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewingPrescription.notes && (
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Notes</h4>
                  <div className="bg-white border border-neutral-200 rounded-md p-3">
                    {viewingPrescription.notes}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingPrescription(null)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-primary-800 text-white hover:bg-primary-700"
                  onClick={() => {
                    setEditingPrescription(viewingPrescription);
                    setViewingPrescription(null);
                  }}
                >
                  Edit Prescription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
