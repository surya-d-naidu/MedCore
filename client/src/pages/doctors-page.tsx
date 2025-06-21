import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoctorForm from "@/components/doctors/doctor-form";
import type { Doctor, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DoctorWithUser extends Doctor {
  user: User;
}

export default function DoctorsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorWithUser | null>(null);

  const { data: doctors, isLoading } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/doctors"],
  });

  const filteredDoctors = doctors?.filter(doctor => 
    doctor.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const deleteDoctor = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/doctors/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (doctor: DoctorWithUser) => {
        const initials = doctor.user?.fullName
          ? doctor.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
          : "DR";
        
        return (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-primary-100 mr-3">
              <AvatarFallback className="text-primary-700">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-neutral-800">{doctor.user?.fullName}</div>
              <div className="text-xs text-neutral-500">{doctor.user?.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "id",
      header: "ID",
      cell: (doctor: DoctorWithUser) => (
        <span className="text-sm text-neutral-500">D-{String(doctor.id).padStart(4, '0')}</span>
      )
    },
    {
      key: "specialization",
      header: "Specialization",
      cell: (doctor: DoctorWithUser) => (
        <span className="text-sm text-neutral-600">{doctor.specialization}</span>
      )
    },
    {
      key: "qualification",
      header: "Qualification",
      cell: (doctor: DoctorWithUser) => (
        <span className="text-sm text-neutral-600">{doctor.qualification}</span>
      )
    },
    {
      key: "experience",
      header: "Experience",
      cell: (doctor: DoctorWithUser) => (
        <span className="text-sm text-neutral-600">{doctor.experience} years</span>
      )
    },
    {
      key: "phone",
      header: "Contact",
      cell: (doctor: DoctorWithUser) => (
        <span className="text-sm text-neutral-600">{doctor.phone}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (doctor: DoctorWithUser) => {
        const statusConfig = {
          available: { className: "bg-green-100 text-green-800", label: "Available" },
          unavailable: { className: "bg-red-100 text-red-800", label: "Unavailable" },
          "on-leave": { className: "bg-yellow-100 text-yellow-800", label: "On Leave" },
        };
        
        const config = statusConfig[doctor.status as keyof typeof statusConfig] || 
          statusConfig.available;
        
        return (
          <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs rounded-full`}>
            {config.label}
          </Badge>
        );
      }
    },
  ];

  const actions = (doctor: DoctorWithUser) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingDoctor(doctor)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this doctor?")) {
            deleteDoctor(doctor.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Doctors Management">
      <div className="space-y-6">
        {/* Search and Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative md:w-64">
              <Input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            </div>
            
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-800 text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </div>
        
        {/* Doctors Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            data={filteredDoctors}
            columns={columns}
            actions={actions}
          />
        )}
      </div>

      {/* Add Doctor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <DoctorForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
              queryClient.invalidateQueries({ queryKey: ["/api/users"] });
              queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Modal */}
      <Dialog open={!!editingDoctor} onOpenChange={(open) => !open && setEditingDoctor(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          {editingDoctor && (
            <DoctorForm 
              doctor={editingDoctor}
              onSuccess={() => {
                setEditingDoctor(null);
                queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
                queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
