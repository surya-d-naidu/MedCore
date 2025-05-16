import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Doctor, User, insertDoctorSchema } from "@shared/schema";

interface DoctorFormProps {
  doctor?: Doctor & { user?: User };
  onSuccess: () => void;
}

// Extended schema for the form
const doctorFormSchema = z.object({
  userId: z.number().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Please enter a valid email").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.coerce.number().int().positive("Experience must be a positive number"),
  phone: z.string().min(5, "Phone number is required"),
  status: z.enum(["available", "unavailable", "on-leave"]),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export default function DoctorForm({ doctor, onSuccess }: DoctorFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!doctor;

  // If editing, load users for selection
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !isEditing, // Only fetch users when creating a new doctor
  });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      userId: doctor?.userId || undefined,
      username: doctor?.user?.username || "",
      email: doctor?.user?.email || "",
      fullName: doctor?.user?.fullName || "",
      specialization: doctor?.specialization || "",
      qualification: doctor?.qualification || "",
      experience: doctor?.experience || 0,
      phone: doctor?.phone || "",
      status: doctor?.status as any || "available",
    },
  });

  const onSubmit = async (data: DoctorFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        // Update existing doctor
        const doctorData = {
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          phone: data.phone,
          status: data.status,
        };
        
        await apiRequest("PUT", `/api/doctors/${doctor.id}`, doctorData);
        toast({
          title: "Success",
          description: "Doctor information updated successfully",
        });
      } else {
        // Create new doctor and user if needed
        let userId = data.userId;
        
        if (!userId) {
          // First create a user
          const userResponse = await apiRequest("POST", "/api/register", {
            username: data.username,
            password: data.password,
            email: data.email,
            fullName: data.fullName,
            role: "doctor",
          });
          const userData = await userResponse.json();
          userId = userData.id;
        }
        
        // Then create the doctor with the user ID
        const doctorData = {
          userId,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          phone: data.phone,
          status: data.status,
        };
        
        await apiRequest("POST", "/api/doctors", doctorData);
        toast({
          title: "Success",
          description: "Doctor created successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save doctor information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if we need to show user creation fields
  const showUserFields = !isEditing && !form.watch("userId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isEditing && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-neutral-700">Doctor User Account</div>
            
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Existing User (Optional)</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      field.onChange(value ? parseInt(value) : undefined);
                      
                      // If a user is selected, populate related fields
                      if (value) {
                        const selectedUser = users?.find(u => u.id === parseInt(value));
                        if (selectedUser) {
                          form.setValue("fullName", selectedUser.fullName);
                          form.setValue("email", selectedUser.email);
                        }
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an existing user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Create New User</SelectItem>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                        </div>
                      ) : (
                        users?.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName} ({user.username})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showUserFields && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Doctor Information */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-neutral-700">Professional Information</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
            {isEditing ? "Update Doctor" : "Create Doctor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
