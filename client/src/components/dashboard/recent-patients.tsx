import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PatientData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  age: number;
  phone: string;
  lastVisit: string;
  status: "healthy" | "treatment" | "critical" | "checkup";
}

// For demo purposes - would be replaced with actual API call
const mockPatients: PatientData[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    gender: "Male",
    age: 42,
    phone: "+1 234 567 890",
    lastVisit: "Jun 12, 2023",
    status: "healthy",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    gender: "Female",
    age: 35,
    phone: "+1 234 567 891",
    lastVisit: "Jun 15, 2023",
    status: "treatment",
  },
  {
    id: 3,
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.j@example.com",
    gender: "Male",
    age: 50,
    phone: "+1 234 567 892",
    lastVisit: "Jun 17, 2023",
    status: "critical",
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Wilson",
    email: "e.wilson@example.com",
    gender: "Female",
    age: 28,
    phone: "+1 234 567 893",
    lastVisit: "Jun 20, 2023",
    status: "checkup",
  },
];

export default function RecentPatients() {
  const { toast } = useToast();

  // In a real implementation, we would use:
  // const { data: patients, isLoading } = useQuery<PatientData[]>({
  //   queryKey: ['/api/patients/recent'],
  // });

  // For now, using mock data
  const isLoading = false;
  const patients = mockPatients;

  const columns = [
    {
      key: "patient",
      header: "Patient",
      cell: (patient: PatientData) => {
        const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
        const colorClass = getAvatarColorClass(patient.id);
        
        return (
          <div className="flex items-center">
            <Avatar className={`flex-shrink-0 h-8 w-8 rounded-full ${colorClass.bg} mr-3`}>
              <AvatarFallback className={`text-xs ${colorClass.text}`}>{initials}</AvatarFallback>
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
      cell: (patient: PatientData) => <span className="text-sm text-neutral-500">P-{String(patient.id).padStart(4, '0')}</span>
    },
    {
      key: "gender",
      header: "Gender",
      cell: (patient: PatientData) => <span className="text-sm text-neutral-500">{patient.gender}</span>
    },
    {
      key: "age",
      header: "Age",
      cell: (patient: PatientData) => <span className="text-sm text-neutral-500">{patient.age}</span>
    },
    {
      key: "phone",
      header: "Phone",
      cell: (patient: PatientData) => <span className="text-sm text-neutral-500">{patient.phone}</span>
    },
    {
      key: "lastVisit",
      header: "Last Visit",
      cell: (patient: PatientData) => <span className="text-sm text-neutral-500">{patient.lastVisit}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (patient: PatientData) => {
        const statusConfig = {
          healthy: { color: "bg-green-100 text-green-800", label: "Healthy" },
          treatment: { color: "bg-yellow-100 text-yellow-800", label: "Treatment" },
          critical: { color: "bg-red-100 text-red-800", label: "Critical" },
          checkup: { color: "bg-blue-100 text-blue-800", label: "Checkup" },
        };
        
        const config = statusConfig[patient.status];
        
        return (
          <Badge variant="outline" className={`${config.color} px-2 py-1 text-xs rounded-full`}>
            {config.label}
          </Badge>
        );
      }
    },
  ];

  const actions = (patient: PatientData) => (
    <div className="flex space-x-3">
      <Button variant="ghost" size="icon" className="text-primary-600 hover:text-primary-900">
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          toast({
            title: "This is a demo action",
            description: `You attempted to delete patient ${patient.firstName} ${patient.lastName}`,
          });
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h3 className="font-semibold">Recent Patients</h3>
        <Link href="/patients" className="text-primary-700 text-sm hover:underline">
          View All
        </Link>
      </div>
      
      <DataTable
        data={patients || []}
        columns={columns}
        actions={actions}
        onRowClick={(patient) => {
          toast({
            title: "Patient Details",
            description: `Viewing details for ${patient.firstName} ${patient.lastName}`,
          });
        }}
      />
    </div>
  );
}

// Helper function to get avatar color classes
function getAvatarColorClass(id: number): { bg: string; text: string } {
  const options = [
    { bg: "bg-purple-100", text: "text-accent-600" },
    { bg: "bg-blue-100", text: "text-primary-700" },
    { bg: "bg-green-100", text: "text-secondary-700" },
    { bg: "bg-red-100", text: "text-red-700" },
  ];
  
  return options[id % options.length];
}
