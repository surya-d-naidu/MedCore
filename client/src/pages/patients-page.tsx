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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PatientForm from "@/components/patients/patient-form";
import type { Patient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PatientsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const deletePatient = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/patients/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Patient",
      cell: (patient: Patient) => {
        const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
        
        return (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-blue-100 mr-3">
              <AvatarFallback className="text-primary-700">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-neutral-800">{`${patient.firstName} ${patient.lastName}`}</div>
              <div className="text-xs text-neutral-500">{patient.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "id",
      header: "ID",
      cell: (patient: Patient) => (
        <span className="text-sm text-neutral-500">P-{String(patient.id).padStart(4, '0')}</span>
      )
    },
    {
      key: "gender",
      header: "Gender",
      cell: (patient: Patient) => (
        <span className="text-sm text-neutral-600">{patient.gender}</span>
      )
    },
    {
      key: "dateOfBirth",
      header: "Date of Birth",
      cell: (patient: Patient) => {
        const dob = new Date(patient.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        
        return (
          <div>
            <span className="text-sm text-neutral-600">{dob.toLocaleDateString()}</span>
            <span className="text-xs text-neutral-500 block">{age} years</span>
          </div>
        );
      }
    },
    {
      key: "phone",
      header: "Phone",
      cell: (patient: Patient) => (
        <span className="text-sm text-neutral-600">{patient.phone}</span>
      )
    },
    {
      key: "address",
      header: "Address",
      cell: (patient: Patient) => (
        <span className="text-sm text-neutral-600 truncate max-w-[150px] block">{patient.address}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (patient: Patient) => {
        const statusConfig = {
          active: { className: "bg-green-100 text-green-800", label: "Active" },
          discharged: { className: "bg-blue-100 text-blue-800", label: "Discharged" },
          critical: { className: "bg-red-100 text-red-800", label: "Critical" },
        };
        
        const config = statusConfig[patient.status as keyof typeof statusConfig] || 
          statusConfig.active;
        
        return (
          <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs rounded-full`}>
            {config.label}
          </Badge>
        );
      }
    },
  ];

  const actions = (patient: Patient) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingPatient(patient)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this patient?")) {
            deletePatient(patient.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Patients Management">
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative sm:w-64">
                <Input
                  type="text"
                  placeholder="Search patients..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-800 text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
        
        {/* Patients Table */}
        <DataTable
          data={filteredPatients}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
        />
      </div>

      {/* Add Patient Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <PatientForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <PatientForm 
              patient={editingPatient}
              onSuccess={() => {
                setEditingPatient(null);
                queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
