import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bill, Patient, insertBillSchema } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BillingFormProps {
  bill?: Bill;
  onSuccess: () => void;
}

// Service item in the bill
interface ServiceItem {
  name: string;
  description: string;
  amount: number;
}

// Extended schema for the form with date handling and services array
const billingFormSchema = z.object({
  patientId: z.number({
    required_error: "Patient is required",
  }),
  billDate: z.date({
    required_error: "Bill date is required",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  services: z.array(
    z.object({
      name: z.string().min(1, "Service name is required"),
      description: z.string().optional(),
      amount: z.coerce.number().positive("Amount must be greater than 0"),
    })
  ).min(1, "At least one service is required"),
  status: z.enum(["pending", "paid", "partially-paid", "overdue"]),
  paidAmount: z.coerce.number().min(0, "Paid amount cannot be negative"),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

export default function BillingForm({ bill, onSuccess }: BillingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch patients for dropdown
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Default due date (14 days from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  };

  // Default values for the form
  const defaultValues: BillingFormValues = {
    patientId: bill?.patientId || 0,
    billDate: bill ? new Date(bill.billDate) : new Date(),
    dueDate: bill ? new Date(bill.dueDate) : getDefaultDueDate(),
    services: [{ name: "", description: "", amount: 0 }],
    status: bill?.status as any || "pending",
    paidAmount: bill ? parseFloat(bill.paidAmount.toString()) : 0,
  };

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues,
  });

  // Field array for services
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  // Calculate total amount when services change
  const watchServices = form.watch("services");
  
  useEffect(() => {
    const total = watchServices.reduce((sum, service) => sum + (service.amount || 0), 0);
    setTotalAmount(total);
  }, [watchServices]);

  // Set existing services when bill data is available
  useEffect(() => {
    if (bill && patients) {
      // Extract services from bill
      let services: ServiceItem[] = [];
      
      if (bill.services) {
        services = Array.isArray(bill.services) 
          ? bill.services as ServiceItem[] 
          : [bill.services as unknown as ServiceItem];
      }
      
      // Reset form with bill data
      form.reset({
        patientId: bill.patientId,
        billDate: new Date(bill.billDate),
        dueDate: new Date(bill.dueDate),
        services: services.length > 0 ? services : [{ name: "", description: "", amount: 0 }],
        status: bill.status as any,
        paidAmount: parseFloat(bill.paidAmount.toString()),
      });
    }
  }, [bill, patients, form]);

  const onSubmit = async (data: BillingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Calculate total amount
      const total = data.services.reduce((sum, service) => sum + (service.amount || 0), 0);
      
      // Validate paid amount
      if (data.paidAmount > total) {
        toast({
          title: "Error",
          description: "Paid amount cannot exceed total amount",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Set status based on payment
      let status = data.status;
      if (data.paidAmount === 0) {
        status = "pending";
      } else if (data.paidAmount === total) {
        status = "paid";
      } else if (data.paidAmount > 0 && data.paidAmount < total) {
        status = "partially-paid";
      }
      
      // Transform the data to match the expected API format
      const formattedData = {
        patientId: data.patientId,
        billDate: data.billDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        dueDate: data.dueDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        services: data.services,
        totalAmount: total,
        paidAmount: data.paidAmount,
        status,
      };
      
      if (bill) {
        // Update existing bill
        await apiRequest("PUT", `/api/bills/${bill.id}`, formattedData);
        toast({
          title: "Success",
          description: "Bill updated successfully",
        });
      } else {
        // Create new bill
        await apiRequest("POST", "/api/bills", formattedData);
        toast({
          title: "Success",
          description: "Bill created successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save bill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPatients) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select
                value={field.value ? field.value.toString() : ""}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Bill Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < (form.getValues().billDate || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Services</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", description: "", amount: 0 })}
              className="flex items-center text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Service
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-4 p-4 border border-neutral-200 rounded-md">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Service {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`services.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter service name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`services.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name={`services.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          {form.formState.errors.services?.root?.message && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.services.root.message}
            </p>
          )}
        </div>

        <div className="bg-neutral-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total Amount:</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paidAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partially-paid">Partially Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary-800 text-white hover:bg-primary-700"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {bill ? "Update Bill" : "Create Bill"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
