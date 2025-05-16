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
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function SidebarItem({ href, icon, label }: SidebarItemProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const { close } = useSidebar();

  return (
    <Link href={href} onClick={close}>
      <div
        className={cn(
          "sidebar-link flex items-center px-3 py-2.5 text-sm font-medium rounded-md w-full",
          isActive
            ? "bg-primary-50 text-primary-800 border-l-3 border-primary-800"
            : "text-neutral-600 hover:bg-neutral-50"
        )}
      >
        <div className={cn("w-5 h-5 mr-3", isActive ? "text-primary-800" : "text-neutral-500")}>
          {icon}
        </div>
        <span>{label}</span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { isOpen } = useSidebar();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside
      className={cn(
        "sidebar fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-neutral-200 pt-16 pb-4 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-center py-4 border-b border-neutral-100 mb-4">
        <h1 className="text-2xl font-bold text-primary-800">MedCore</h1>
      </div>

      <nav className="px-3 space-y-1">
        <SidebarItem href="/" icon={<HomeIcon />} label="Dashboard" />
        <SidebarItem href="/doctors" icon={<UserSquare />} label="Doctors" />
        <SidebarItem href="/patients" icon={<Users />} label="Patients" />
        <SidebarItem href="/appointments" icon={<Calendar />} label="Appointments" />
        <SidebarItem href="/medical-records" icon={<FileText />} label="Medical Records" />
        <SidebarItem href="/prescriptions" icon={<ClipboardList />} label="Prescriptions" />
        <SidebarItem href="/wards" icon={<BedDouble />} label="Wards/Rooms" />
        <SidebarItem href="/billing" icon={<Receipt />} label="Billing" />

        <hr className="my-4 border-neutral-200" />

        <SidebarItem href="/settings" icon={<Settings />} label="Settings" />

        <div
          onClick={handleLogout}
          className="flex items-center px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-md w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3 text-neutral-500" />
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  );
}
