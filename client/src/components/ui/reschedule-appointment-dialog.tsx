import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Appointment {
  id: number;
  patient: {
    firstName: string;
    lastName: string;
  };
  doctor: {
    user: {
      fullName: string;
    };
  };
  date: string;
  time: string;
  reason: string;
}

interface RescheduleAppointmentDialogProps {
  children: React.ReactNode;
  appointment?: Appointment;
}

export function RescheduleAppointmentDialog({ children, appointment }: RescheduleAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState(appointment?.reason || "");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    setIsRescheduling(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would call the API to reschedule the appointment
    console.log('Rescheduling appointment:', {
      appointmentId: appointment?.id,
      newDate: selectedDate,
      newTime: selectedTime,
      reason
    });
    
    setIsRescheduling(false);
    setIsOpen(false);
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            {appointment ? (
              <>
                Reschedule appointment for <strong>{appointment.patient.firstName} {appointment.patient.lastName}</strong> 
                with <strong>{appointment.doctor.user.fullName}</strong>
              </>
            ) : (
              "Select a new date and time for the appointment."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Appointment Info */}
          {appointment && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Current Appointment</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Date:</strong> {format(new Date(appointment.date), "PPP")}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><strong>Reason:</strong> {appointment.reason}</p>
              </div>
            </div>
          )}

          {/* New Date */}
          <div className="space-y-2">
            <Label>New Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a new date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* New Time */}
          <div className="space-y-2">
            <Label>New Appointment Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new time" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Rescheduling */}
          <div className="space-y-2">
            <Label htmlFor="rescheduleReason">Reason for Rescheduling (Optional)</Label>
            <Textarea
              id="rescheduleReason"
              placeholder="Please provide a reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Confirmation */}
          {selectedDate && selectedTime && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">New Appointment Details</h4>
              <div className="text-sm text-green-700">
                <p><strong>Date:</strong> {format(selectedDate, "PPP")}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime || isRescheduling}
            className="gap-2"
          >
            {isRescheduling ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Rescheduling...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Reschedule Appointment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 