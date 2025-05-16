import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Ward, insertWardSchema } from "@shared/schema";

interface WardFormProps {
  ward?: Ward;
  onSuccess: () => void;
}

// Extended schema for the form with numeric validation
const wardFormSchema = insertWardSchema
  .extend({
    capacity: z.coerce.number().int().positive("Capacity must be a positive number"),
    occupiedBeds: z.coerce.number().int().min(0, "Occupied beds cannot be negative"),
    floor: z.coerce.number().int("Floor must be a whole number"),
  })
  .refine(data => data.occupiedBeds <= data.capacity, {
    message: "Occupied beds cannot exceed capacity",
    path: ["occupiedBeds"],
  });

type WardFormValues = z.infer<typeof wardFormSchema>;

export default function WardForm({ ward, onSuccess }: WardFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WardFormValues>({
    resolver: zodResolver(wardFormSchema),
    defaultValues: {
      wardNumber: ward?.wardNumber || "",
      wardType: ward?.wardType || "general",
      capacity: ward?.capacity || 10,
      occupiedBeds: ward?.occupiedBeds || 0,
      floor: ward?.floor || 1,
      status: ward?.status || "available",
    },
  });

  const onSubmit = async (data: WardFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (ward) {
        // Update existing ward
        await apiRequest("PUT", `/api/wards/${ward.id}`, data);
        toast({
          title: "Success",
          description: "Ward updated successfully",
        });
      } else {
        // Create new ward
        await apiRequest("POST", "/api/wards", data);
        toast({
          title: "Success",
          description: "Ward created successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save ward information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="wardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward Number</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., W-101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="wardType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="semi-private">Semi-Private</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (Beds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
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
            name="occupiedBeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupied Beds</FormLabel>
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
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
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
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
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
            {ward ? "Update Ward" : "Create Ward"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
