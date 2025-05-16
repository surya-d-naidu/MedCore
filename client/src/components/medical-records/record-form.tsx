import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
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
import { CalendarIcon, Loader2, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MedicalRecord, Patient, insertMedicalRecordSchema } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RecordFormProps {
  record?: MedicalRecord;
  onSuccess: () => void;
}

// Extended schema for the form with date and attachments handling
const recordFormSchema = insertMedicalRecordSchema
  .extend({
    visitDate: z.date({
      required_error: "Visit date is required",
    }),
    // We'll handle attachments separately in the component
  })
  .transform((data) => ({
    ...data,
    visitDate: data.visitDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
  }));

type RecordFormValues = z.input<typeof recordFormSchema>;

interface Attachment {
  name: string;
  type: string;
  size: number;
}

export default function RecordForm({ record, onSuccess }: RecordFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Fetch patients for dropdown
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      patientId: record?.patientId || 0,
      diagnosis: record?.diagnosis || "",
      treatment: record?.treatment || "",
      visitDate: record ? new Date(record.visitDate) : new Date(),
      notes: record?.notes || "",
    },
  });

  // Set default values once data is loaded and handle attachments
  useEffect(() => {
    if (record && patients) {
      form.reset({
        patientId: record.patientId,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        visitDate: new Date(record.visitDate),
        notes: record.notes || "",
      });

      // Handle existing attachments
      if (record.attachments) {
        const existingAttachments = Array.isArray(record.attachments) 
          ? record.attachments 
          : [record.attachments];
        
        setAttachments(existingAttachments.map((att: any) => ({
          name: att.name || "Attachment",
          type: att.type || "application/octet-stream",
          size: att.size || 0,
        })));
      }
    }
  }, [record, patients, form]);

  const handleAttachmentAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        newAttachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }
      
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleAttachmentRemove = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: RecordFormValues) => {
    // Validate patient is selected
    if (!data.patientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add attachments to the data
      const formData = {
        ...data,
        attachments: attachments.length > 0 ? attachments : null,
      };
      
      if (record) {
        // Update existing record
        await apiRequest("PUT", `/api/medical-records/${record.id}`, formData);
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
      } else {
        // Create new record
        await apiRequest("POST", "/api/medical-records", formData);
        toast({
          title: "Success",
          description: "Medical record created successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save medical record",
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

        <FormField
          control={form.control}
          name="visitDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Visit Date</FormLabel>
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
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter diagnosis details"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter treatment details"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes or observations"
                  className="resize-none min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attachments section */}
        <div className="space-y-2">
          <FormLabel>Attachments (Optional)</FormLabel>
          <div className="border border-dashed border-neutral-300 rounded-md p-4">
            <div className="flex items-center justify-center">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Paperclip className="h-6 w-6 text-neutral-500 mb-2" />
                <span className="text-sm text-neutral-600">Upload files</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleAttachmentAdd}
                />
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Attached files:</p>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-neutral-50 p-2 rounded-md"
                    >
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 text-neutral-500 mr-2" />
                        <span className="text-sm truncate max-w-[200px]">
                          {attachment.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                        onClick={() => handleAttachmentRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {record ? "Update Medical Record" : "Create Medical Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
