import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CreditCard, Download, Edit, Eye, FilePlus, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BillingForm from "@/components/billing/billing-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Bill, Patient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BillWithPatient extends Bill {
  patient: Patient;
}

export default function BillingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<BillWithPatient | null>(null);
  const [editingBill, setEditingBill] = useState<BillWithPatient | null>(null);

  const { data: bills, isLoading } = useQuery<BillWithPatient[]>({
    queryKey: ["/api/bills"],
  });

  const filteredBills = bills?.filter(bill => {
    // Search by patient name or bill ID
    const matchesSearch = 
      `${bill.patient?.firstName} ${bill.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${bill.id}`.includes(searchQuery);
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    
    // Filter by bill date
    const matchesDate = !dateFilter || 
      new Date(bill.billDate).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const deleteBill = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/bills/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const columns = [
    {
      key: "id",
      header: "Bill #",
      cell: (bill: BillWithPatient) => (
        <span className="text-sm font-medium text-neutral-800">#{String(bill.id).padStart(4, '0')}</span>
      )
    },
    {
      key: "patient",
      header: "Patient",
      cell: (bill: BillWithPatient) => {
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-primary-700 font-medium text-xs">
                {bill.patient?.firstName?.[0] || ''}
                {bill.patient?.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-800">
                {bill.patient?.firstName} {bill.patient?.lastName}
              </div>
              <div className="text-xs text-neutral-500">ID: P-{String(bill.patientId).padStart(4, '0')}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "billDate",
      header: "Bill Date",
      cell: (bill: BillWithPatient) => {
        const billDate = new Date(bill.billDate);
        return (
          <div className="text-sm text-neutral-600">{format(billDate, "MMM dd, yyyy")}</div>
        );
      }
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (bill: BillWithPatient) => {
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const isPastDue = today > dueDate && bill.status !== "paid";
        
        return (
          <div className={cn("text-sm", isPastDue ? "text-red-600 font-medium" : "text-neutral-600")}>
            {format(dueDate, "MMM dd, yyyy")}
            {isPastDue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Overdue</span>}
          </div>
        );
      }
    },
    {
      key: "amount",
      header: "Amount",
      cell: (bill: BillWithPatient) => {
        return (
          <div>
            <div className="text-sm font-medium text-neutral-800">{formatCurrency(parseFloat(bill.totalAmount.toString()))}</div>
            {bill.status === "partially-paid" && (
              <div className="text-xs text-green-600">
                Paid: {formatCurrency(parseFloat(bill.paidAmount.toString()))}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: "status",
      header: "Status",
      cell: (bill: BillWithPatient) => {
        const statusConfig = {
          pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
          paid: { className: "bg-green-100 text-green-800", label: "Paid" },
          "partially-paid": { className: "bg-blue-100 text-blue-800", label: "Partially Paid" },
          overdue: { className: "bg-red-100 text-red-800", label: "Overdue" },
        };
        
        const config = statusConfig[bill.status as keyof typeof statusConfig] || 
          statusConfig.pending;
        
        return (
          <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs rounded-full`}>
            {config.label}
          </Badge>
        );
      }
    },
  ];

  const actions = (bill: BillWithPatient) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setViewingBill(bill)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingBill(bill)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this bill?")) {
            deleteBill(bill.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative sm:w-64">
                <Input
                  type="text"
                  placeholder="Search bills..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
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
            
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-800 text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Bill
            </Button>
          </div>
        </div>
        
        {/* Bills Table */}
        <DataTable
          data={filteredBills}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
        />
      </div>

      {/* Add Bill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
          </DialogHeader>
          <BillingForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Bill Modal */}
      <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {editingBill && (
            <BillingForm 
              bill={editingBill}
              onSuccess={() => {
                setEditingBill(null);
                queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Bill Modal */}
      <Dialog open={!!viewingBill} onOpenChange={(open) => !open && setViewingBill(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-primary-700 font-medium text-sm">
                      {viewingBill.patient?.firstName?.[0] || ''}
                      {viewingBill.patient?.lastName?.[0] || ''}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-neutral-800">
                      {viewingBill.patient?.firstName} {viewingBill.patient?.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">Patient ID: P-{String(viewingBill.patientId).padStart(4, '0')}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-md flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Bill Number</p>
                  <p className="text-lg font-medium">#{String(viewingBill.id).padStart(4, '0')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Issue Date</p>
                  <p className="text-base">{format(new Date(viewingBill.billDate), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Due Date</p>
                  <p className="text-base">{format(new Date(viewingBill.dueDate), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Status</p>
                  <Badge variant="outline" className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    viewingBill.status === "paid" ? "bg-green-100 text-green-800" :
                    viewingBill.status === "partially-paid" ? "bg-blue-100 text-blue-800" :
                    viewingBill.status === "overdue" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  )}>
                    {viewingBill.status === "partially-paid" ? "Partially Paid" :
                     viewingBill.status.charAt(0).toUpperCase() + viewingBill.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-neutral-800">Services</h4>
                <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Service</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {viewingBill.services && Array.isArray(viewingBill.services) ? (
                        viewingBill.services.map((service: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">{service.name}</td>
                            <td className="px-4 py-3 text-sm text-neutral-600">{service.description}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-800">{formatCurrency(service.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-center text-sm text-neutral-500">No service details available</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-neutral-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Total:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-neutral-900">{formatCurrency(parseFloat(viewingBill.totalAmount.toString()))}</td>
                      </tr>
                      {viewingBill.status === "partially-paid" && (
                        <>
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Paid Amount:</td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-green-600">{formatCurrency(parseFloat(viewingBill.paidAmount.toString()))}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Balance Due:</td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                              {formatCurrency(parseFloat(viewingBill.totalAmount.toString()) - parseFloat(viewingBill.paidAmount.toString()))}
                            </td>
                          </tr>
                        </>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>

              {viewingBill.status !== "paid" && (
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2">
                    <FilePlus className="h-4 w-4" />
                    Send Reminder
                  </Button>
                  <Button className="bg-primary-800 text-white hover:bg-primary-700 gap-2">
                    <CreditCard className="h-4 w-4" />
                    Record Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
