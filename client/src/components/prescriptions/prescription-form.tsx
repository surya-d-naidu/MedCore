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
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Prescription, Doctor, Patient, insertPrescriptionSchema } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PrescriptionFormProps {
  prescription?: Prescription;
  onSuccess: () => void;
}

// Extended schema for the form with date handling and arrays for medications
const prescriptionFormSchema = z.object({
  patientId: z.number({
    required_error: "Patient is required",
  }),
  doctorId: z.number({
    required_error: "Doctor is required",
  }),
  prescriptionDate: z.date({
    required_error: "Prescription date is required",
  }),
  medications: z.array(
    z.object({
      name: z.string().min(1, "Medicine name is required"),
      dosage: z.string().min(1, "Dosage is required"),
      duration: z.string().min(1, "Duration is required"),
    })
  ).min(1, "At least one medication is required"),
  notes: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export default function PrescriptionForm({ prescription, onSuccess }: PrescriptionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch patients for dropdown
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Fetch doctors for dropdown
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<(Doctor & { user: { fullName: string } })[]>({
    queryKey: ["/api/doctors"],
  });

  // Default values for the form
  const defaultValues: PrescriptionFormValues = {
    patientId: prescription?.patientId || 0,
    doctorId: prescription?.doctorId || 0,
    prescriptionDate: prescription ? new Date(prescription.prescriptionDate) : new Date(),
    medications: [{ name: "", dosage: "", duration: "" }],
    notes: prescription?.notes || "",
  };

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues,
  });

  // Field array for medications
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  // Set existing medications when prescription data is available
  useEffect(() => {
    if (prescription && patients && doctors) {
      // Extract medications from prescription
      let medications: { name: string, dosage: string, duration: string }[] = [];
      
      if (prescription.medicines && prescription.dosage && prescription.duration) {
        const medicinesArray = Array.isArray(prescription.medicines) 
          ? prescription.medicines 
          : [prescription.medicines];
        
        const dosageArray = Array.isArray(prescription.dosage) 
          ? prescription.dosage 
          : [prescription.dosage];
          
        const durationArray = Array.isArray(prescription.duration) 
          ? prescription.duration 
          : [prescription.duration];
        
        // Create medication objects
        medications = medicinesArray.map((medicine, index) => ({
          name: medicine.toString(),
          dosage: dosageArray[index]?.toString() || "",
          duration: durationArray[index]?.toString() || "",
        }));
      }
      
      // Reset form with prescription data
      form.reset({
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        prescriptionDate: new Date(prescription.prescriptionDate),
        medications: medications.length > 0 ? medications : [{ name: "", dosage: "", duration: "" }],
        notes: prescription.notes || "",
      });
    }
  }, [prescription, patients, doctors, form]);

  const onSubmit = async (data: PrescriptionFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform the data to match the expected API format
      const formattedData = {
        patientId: data.patientId,
        doctorId: data.doctorId,
        prescriptionDate: data.prescriptionDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        medicines: data.medications.map(med => med.name),
        dosage: data.medications.map(med => med.dosage),
        duration: data.medications.map(med => med.duration),
        notes: data.notes,
      };
      
      if (prescription) {
        // Update existing prescription
        await apiRequest("PUT", `/api/prescriptions/${prescription.id}`, formattedData);
        toast({
          title: "Success",
          description: "Prescription updated successfully",
        });
      } else {
        // Create new prescription
        await apiRequest("POST", "/api/prescriptions", formattedData);
        toast({
          title: "Success",
          description: "Prescription created successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save prescription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingPatients || isLoadingDoctors;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <Select
                  value={field.value ? field.value.toString() : ""}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.user?.fullName} ({doctor.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="prescriptionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prescription Date</FormLabel>
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Medications</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", dosage: "", duration: "" })}
              className="flex items-center text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Medication
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-4 p-4 border border-neutral-200 rounded-md">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Medication {index + 1}</h4>
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
              
              <FormField
                control={form.control}
                name={`medications.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Medicine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medication name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`medications.${index}.dosage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., 500mg twice daily" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`medications.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., 7 days" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
          {form.formState.errors.medications?.root?.message && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.medications.root.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special instructions or notes"
                  className="resize-none min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {prescription ? "Update Prescription" : "Create Prescription"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
