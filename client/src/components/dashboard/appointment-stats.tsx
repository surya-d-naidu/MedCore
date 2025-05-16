import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface AppointmentStatsProps {
  timeRange: string;
}

// Sample data
const weekData = [
  { name: "Mon", appointments: 20 },
  { name: "Tue", appointments: 35 },
  { name: "Wed", appointments: 42 },
  { name: "Thu", appointments: 28 },
  { name: "Fri", appointments: 38 },
  { name: "Sat", appointments: 15 },
  { name: "Sun", appointments: 8 },
];

const monthData = [
  { name: "Week 1", appointments: 95 },
  { name: "Week 2", appointments: 120 },
  { name: "Week 3", appointments: 107 },
  { name: "Week 4", appointments: 85 },
];

const yearData = [
  { name: "Jan", appointments: 380 },
  { name: "Feb", appointments: 420 },
  { name: "Mar", appointments: 510 },
  { name: "Apr", appointments: 450 },
  { name: "May", appointments: 480 },
  { name: "Jun", appointments: 520 },
  { name: "Jul", appointments: 570 },
  { name: "Aug", appointments: 490 },
  { name: "Sep", appointments: 530 },
  { name: "Oct", appointments: 490 },
  { name: "Nov", appointments: 420 },
  { name: "Dec", appointments: 320 },
];

export default function AppointmentStats({ timeRange }: AppointmentStatsProps) {
  // In a real implementation, we would fetch data based on the timeRange
  const [activeRange, setActiveRange] = useState("week");
  
  const data = activeRange === "week" 
    ? weekData 
    : activeRange === "month" 
      ? monthData 
      : yearData;

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold">Appointment Statistics</h3>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 text-xs rounded-full ${activeRange === "week" ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-neutral-50"}`}
            onClick={() => setActiveRange("week")}
          >
            Weekly
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-full ${activeRange === "month" ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-neutral-50"}`}
            onClick={() => setActiveRange("month")}
          >
            Monthly
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-full ${activeRange === "year" ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-neutral-50"}`}
            onClick={() => setActiveRange("year")}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} appointments`, 'Appointments']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb' 
              }}
            />
            <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
