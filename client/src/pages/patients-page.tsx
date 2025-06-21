import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PatientForm from "@/components/patients/patient-form";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { getQueryFn, getMutationFn } from "@/lib/queryClient";
import { Patient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: getMutationFn({
      method: "DELETE",
      on401: "redirect",
      on403: "toast",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Patient deleted",
        description: "Patient has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter patients based on search query
  const filteredPatients = patients?.filter(patient =>
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  ) || [];

  const handleDeletePatient = (patient: Patient) => {
    if (confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      deletePatientMutation.mutate(`/api/patients/${patient.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "discharged":
        return "bg-gray-100 text-gray-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (error) {
    return (
      <DashboardLayout title="Patients">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load patients</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage patient information and records</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter the patient's information to create a new record.
                </DialogDescription>
              </DialogHeader>
              <PatientForm
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(patient.firstName, patient.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <CardDescription>
                          {patient.email || patient.phone}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingPatient(patient)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeletePatient(patient)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                    {patient.dateOfBirth && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Age</span>
                        <span className="text-sm">
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                        </span>
                      </div>
                    )}
                    {patient.gender && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Gender</span>
                        <span className="text-sm capitalize">{patient.gender}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No patients found matching your search." : "No patients found."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Patient Dialog */}
      {editingPatient && (
        <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>
                Update the patient's information.
              </DialogDescription>
            </DialogHeader>
            <PatientForm
              patient={editingPatient}
              onSuccess={() => {
                setEditingPatient(null);
                queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
