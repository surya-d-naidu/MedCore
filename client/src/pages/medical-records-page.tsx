import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit, Eye, File, FileText, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecordForm from "@/components/medical-records/record-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { MedicalRecord, Patient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MedicalRecordWithPatient extends MedicalRecord {
  patient: Patient;
}

export default function MedicalRecordsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecordWithPatient | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecordWithPatient | null>(null);

  const { data: records, isLoading } = useQuery<MedicalRecordWithPatient[]>({
    queryKey: ["/api/medical-records"],
  });

  const filteredRecords = records?.filter(record => {
    // Search by patient name or diagnosis
    const matchesSearch = 
      `${record.patient?.firstName} ${record.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.treatment.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by visit date
    const matchesDate = !dateFilter || 
      new Date(record.visitDate).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesDate;
  }) || [];

  const deleteRecord = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/medical-records/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      cell: (record: MedicalRecordWithPatient) => {
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-primary-700 font-medium text-xs">
                {record.patient?.firstName?.[0] || ''}
                {record.patient?.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-800">
                {record.patient?.firstName} {record.patient?.lastName}
              </div>
              <div className="text-xs text-neutral-500">ID: P-{String(record.patientId).padStart(4, '0')}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      cell: (record: MedicalRecordWithPatient) => (
        <span className="text-sm text-neutral-600 line-clamp-2">{record.diagnosis}</span>
      )
    },
    {
      key: "treatment",
      header: "Treatment",
      cell: (record: MedicalRecordWithPatient) => (
        <span className="text-sm text-neutral-600 line-clamp-2">{record.treatment}</span>
      )
    },
    {
      key: "visitDate",
      header: "Visit Date",
      cell: (record: MedicalRecordWithPatient) => {
        const visitDate = new Date(record.visitDate);
        return (
          <div className="text-sm text-neutral-600">{format(visitDate, "PPP")}</div>
        );
      }
    },
    {
      key: "attachments",
      header: "Attachments",
      cell: (record: MedicalRecordWithPatient) => {
        const attachments = record.attachments ? 
          (Array.isArray(record.attachments) ? record.attachments.length : 1) : 
          0;
        
        return (
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-neutral-400 mr-1" />
            <span className="text-sm text-neutral-600">{attachments}</span>
          </div>
        );
      }
    },
  ];

  const actions = (record: MedicalRecordWithPatient) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setViewingRecord(record)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingRecord(record)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this medical record?")) {
            deleteRecord(record.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Medical Records">
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative sm:w-64">
                <Input
                  type="text"
                  placeholder="Search records..."
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
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by visit date"}
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
              Add Medical Record
            </Button>
          </div>
        </div>
        
        {/* Medical Records Table */}
        <DataTable
          data={filteredRecords}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
        />
      </div>

      {/* Add Medical Record Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Medical Record</DialogTitle>
          </DialogHeader>
          <RecordForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Medical Record Modal */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <RecordForm 
              record={editingRecord}
              onSuccess={() => {
                setEditingRecord(null);
                queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Medical Record Modal */}
      <Dialog open={!!viewingRecord} onOpenChange={(open) => !open && setViewingRecord(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      {viewingRecord.patient?.firstName} {viewingRecord.patient?.lastName}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                      Visit Date: {format(new Date(viewingRecord.visitDate), "PPP")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Record ID: #{viewingRecord.id}</p>
                    <p className="text-sm text-neutral-500">
                      Created: {format(new Date(viewingRecord.createdAt), "PPP")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Diagnosis</h4>
                  <div className="bg-white border border-neutral-200 rounded-md p-3 min-h-[100px]">
                    {viewingRecord.diagnosis}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Treatment</h4>
                  <div className="bg-white border border-neutral-200 rounded-md p-3 min-h-[100px]">
                    {viewingRecord.treatment}
                  </div>
                </div>
              </div>

              {viewingRecord.notes && (
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Notes</h4>
                  <div className="bg-white border border-neutral-200 rounded-md p-3">
                    {viewingRecord.notes}
                  </div>
                </div>
              )}

              {viewingRecord.attachments && (
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Attachments</h4>
                  <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap gap-2">
                    {Array.isArray(viewingRecord.attachments) ? (
                      viewingRecord.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center bg-neutral-50 p-2 rounded-md">
                          <File className="h-4 w-4 text-neutral-500 mr-2" />
                          <span className="text-sm">{attachment.name || `Attachment ${index + 1}`}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center bg-neutral-50 p-2 rounded-md">
                        <File className="h-4 w-4 text-neutral-500 mr-2" />
                        <span className="text-sm">Attachment</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingRecord(null)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-primary-800 text-white hover:bg-primary-700"
                  onClick={() => {
                    setEditingRecord(viewingRecord);
                    setViewingRecord(null);
                  }}
                >
                  Edit Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
