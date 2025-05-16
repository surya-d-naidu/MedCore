import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import {
  HomeIcon,
  Users,
  UserSquare,
  Calendar,
  FileText,
  ClipboardList,
  BedDouble,
  Receipt,
  Settings,
  LogOut,
  PanelLeft,
  Heart,
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

export function SidebarItem({ href, icon, label, count }: SidebarItemProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const { close } = useSidebar();

  return (
    <Link href={href} onClick={close}>
      <div
        className={cn(
          "sidebar-link flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full my-1 transition-all duration-200",
          isActive
            ? "bg-primary-50 text-primary border-r-4 border-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <div className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-muted-foreground")}>
          {icon}
        </div>
        <span>{label}</span>
        {count && (
          <div className="ml-auto bg-secondary/20 text-secondary text-xs font-semibold rounded-full px-2.5 py-0.5">
            {count}
          </div>
        )}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { isOpen } = useSidebar();
  const { logoutMutation } = useAuth();
  const { user } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside
      className={cn(
        "sidebar fixed inset-y-0 left-0 z-20 w-64 bg-white/80 backdrop-blur-sm border-r border-border pt-16 pb-4 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-sm",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col items-center justify-center py-6 mb-2">
        <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary flex items-center justify-center rounded-xl mb-3 shadow-md">
          <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold gradient-text">MedCore</h1>
        <p className="text-xs text-muted-foreground mt-1">Hospital Management</p>
      </div>

      <div className="px-4 mb-4">
        <div className="w-full h-20 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-3 flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mr-3">
            <UserSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
          Main Menu
        </p>
      </div>

      <nav className="px-3 space-y-0.5">
        <SidebarItem href="/" icon={<HomeIcon />} label="Dashboard" />
        <SidebarItem href="/doctors" icon={<UserSquare />} label="Doctors" />
        <SidebarItem href="/patients" icon={<Users />} label="Patients" count={24} />
        <SidebarItem href="/appointments" icon={<Calendar />} label="Appointments" count={5} />
        <SidebarItem href="/medical-records" icon={<FileText />} label="Medical Records" />
        <SidebarItem href="/prescriptions" icon={<ClipboardList />} label="Prescriptions" />
        <SidebarItem href="/wards" icon={<BedDouble />} label="Wards/Rooms" />
        <SidebarItem href="/billing" icon={<Receipt />} label="Billing" />

        <div className="px-4 my-4">
          <div className="border-t border-border"></div>
        </div>

        <SidebarItem href="/settings" icon={<Settings />} label="Settings" />

        <div
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl w-full cursor-pointer my-1"
        >
          <LogOut className="w-5 h-5 mr-3 text-muted-foreground" />
          <span>Logout</span>
        </div>
      </nav>

      <div className="absolute bottom-6 inset-x-0 px-6">
        <div className="flex items-center rounded-xl bg-muted/60 p-2">
          <button className="flex items-center w-full justify-center text-xs text-muted-foreground">
            <PanelLeft className="h-4 w-4 mr-2" />
            <span>Collapse Sidebar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
