import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Search, Trash2, BedDouble, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WardForm from "@/components/wards/ward-form";
import type { Ward, Room } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface RoomWithPatient extends Room {
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export default function WardsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddWardModalOpen, setIsAddWardModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [activeTab, setActiveTab] = useState("wards");

  const { data: wards, isLoading: isLoadingWards } = useQuery<Ward[]>({
    queryKey: ["/api/wards"],
  });

  const { data: rooms, isLoading: isLoadingRooms } = useQuery<RoomWithPatient[]>({
    queryKey: ["/api/rooms"],
  });

  const filteredWards = wards?.filter(ward => 
    ward.wardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ward.wardType.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredRooms = rooms?.filter(room => 
    room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomType.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const deleteWard = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/wards/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/wards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Ward deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ward. Make sure it has no associated rooms.",
        variant: "destructive",
      });
    }
  };

  const deleteRoom = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/rooms/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room. Make sure it is not occupied.",
        variant: "destructive",
      });
    }
  };

  const wardColumns = [
    {
      key: "wardNumber",
      header: "Ward Number",
      cell: (ward: Ward) => (
        <span className="text-sm font-medium text-neutral-800">{ward.wardNumber}</span>
      )
    },
    {
      key: "wardType",
      header: "Ward Type",
      cell: (ward: Ward) => (
        <span className="text-sm text-neutral-600 capitalize">{ward.wardType}</span>
      )
    },
    {
      key: "capacity",
      header: "Capacity",
      cell: (ward: Ward) => (
        <span className="text-sm text-neutral-600">{ward.capacity} beds</span>
      )
    },
    {
      key: "occupancy",
      header: "Occupancy",
      cell: (ward: Ward) => (
        <div className="flex items-center">
          <div className="h-2 w-24 bg-neutral-200 rounded-full overflow-hidden mr-2">
            <div 
              className={`h-full ${getOccupancyColor(ward.occupiedBeds, ward.capacity)}`}
              style={{ width: `${(ward.occupiedBeds / ward.capacity) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-neutral-600">{ward.occupiedBeds}/{ward.capacity}</span>
        </div>
      )
    },
    {
      key: "floor",
      header: "Floor",
      cell: (ward: Ward) => (
        <span className="text-sm text-neutral-600">Floor {ward.floor}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (ward: Ward) => {
        const statusConfig = {
          available: { className: "bg-green-100 text-green-800", label: "Available" },
          full: { className: "bg-red-100 text-red-800", label: "Full" },
          maintenance: { className: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
        };
        
        const config = statusConfig[ward.status as keyof typeof statusConfig] || 
          statusConfig.available;
        
        return (
          <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs rounded-full`}>
            {config.label}
          </Badge>
        );
      }
    },
  ];

  const roomColumns = [
    {
      key: "roomNumber",
      header: "Room Number",
      cell: (room: RoomWithPatient) => (
        <span className="text-sm font-medium text-neutral-800">{room.roomNumber}</span>
      )
    },
    {
      key: "ward",
      header: "Ward",
      cell: (room: RoomWithPatient) => {
        const ward = wards?.find(w => w.id === room.wardId);
        return (
          <span className="text-sm text-neutral-600">{ward?.wardNumber || `Ward #${room.wardId}`}</span>
        );
      }
    },
    {
      key: "roomType",
      header: "Room Type",
      cell: (room: RoomWithPatient) => (
        <span className="text-sm text-neutral-600 capitalize">{room.roomType}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (room: RoomWithPatient) => {
        return (
          <Badge variant="outline" className={`${room.occupied ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} px-2 py-1 text-xs rounded-full`}>
            {room.occupied ? "Occupied" : "Available"}
          </Badge>
        );
      }
    },
    {
      key: "patient",
      header: "Patient",
      cell: (room: RoomWithPatient) => {
        if (!room.occupied || !room.patient) {
          return <span className="text-sm text-neutral-400">-</span>;
        }
        
        return (
          <div className="flex items-center">
            <BedDouble className="h-4 w-4 text-primary-600 mr-2" />
            <span className="text-sm text-neutral-600">
              {room.patient.firstName} {room.patient.lastName}
            </span>
          </div>
        );
      }
    },
  ];

  const wardActions = (ward: Ward) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => setEditingWard(ward)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this ward?")) {
            deleteWard(ward.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const roomActions = (room: Room) => (
    <div className="flex space-x-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-600 hover:text-primary-900"
        onClick={() => {
          toast({
            title: "Edit Room",
            description: "Room editing functionality would be implemented here",
          });
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-600 hover:text-red-900"
        onClick={() => {
          if (confirm("Are you sure you want to delete this room?")) {
            deleteRoom(room.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Wards & Rooms Management">
      <div className="space-y-6">
        {/* Tabs for Wards and Rooms */}
        <Tabs defaultValue="wards" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="wards">Wards</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-[230px]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              </div>
              
              <Button
                onClick={() => activeTab === "wards" ? setIsAddWardModalOpen(true) : setIsAddRoomModalOpen(true)}
                className="bg-primary-800 text-white hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === "wards" ? "Ward" : "Room"}
              </Button>
            </div>
          </div>

          <TabsContent value="wards">
            {isLoadingWards ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={filteredWards}
                columns={wardColumns}
                actions={wardActions}
              />
            )}
          </TabsContent>

          <TabsContent value="rooms">
            {isLoadingRooms ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={filteredRooms}
                columns={roomColumns}
                actions={roomActions}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Ward Modal */}
      <Dialog open={isAddWardModalOpen} onOpenChange={setIsAddWardModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Ward</DialogTitle>
          </DialogHeader>
          <WardForm 
            onSuccess={() => {
              setIsAddWardModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/wards"] });
              queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Ward Modal */}
      <Dialog open={!!editingWard} onOpenChange={(open) => !open && setEditingWard(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Ward</DialogTitle>
          </DialogHeader>
          {editingWard && (
            <WardForm 
              ward={editingWard}
              onSuccess={() => {
                setEditingWard(null);
                queryClient.invalidateQueries({ queryKey: ["/api/wards"] });
                queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Room Modal */}
      <Dialog open={isAddRoomModalOpen} onOpenChange={setIsAddRoomModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Room form would go here */}
            <p className="text-center text-neutral-500">Room creation form would be implemented here</p>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setIsAddRoomModalOpen(false)}
                variant="outline"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsAddRoomModalOpen(false);
                  toast({
                    title: "Room Creation",
                    description: "Room creation functionality would be implemented here",
                  });
                }}
                className="bg-primary-800 text-white hover:bg-primary-700"
              >
                Create Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Helper function to get occupancy color
function getOccupancyColor(occupied: number, total: number): string {
  const ratio = occupied / total;
  if (ratio >= 0.9) return "bg-red-500";
  if (ratio >= 0.7) return "bg-yellow-500";
  return "bg-green-500";
}
