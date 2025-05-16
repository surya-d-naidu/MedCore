import { ReactNode, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Bell, ChevronDown, Search, User, LogOut, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

function MainLayout({ children, title }: DashboardLayoutProps) {
  const { toggle } = useSidebar();
  const { user, logoutMutation } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || "US";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="lg:hidden mr-3 text-muted-foreground hover:text-foreground rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold gradient-text lg:hidden">
              MedCore
            </h1>
          </div>

          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="form-input-clean pl-10 h-10 w-44 md:w-72 rounded-full bg-muted/30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-in fade-in">
                    3
                  </span>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 rounded-full p-1 pr-4">
                    <Avatar className="h-8 w-8 bg-gradient-to-tr from-primary to-secondary text-white border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start justify-center">
                      <span className="text-sm font-medium leading-none">
                        {user?.fullName || user?.username}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <div className="flex items-center justify-start p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center cursor-pointer rounded-lg focus:bg-muted p-2">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer rounded-lg focus:bg-muted text-destructive focus:text-destructive p-2"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <main className="py-8 px-6 sm:px-8 lg:px-10 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="rounded-lg h-9">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button size="sm" className="btn-gradient rounded-lg h-9">
                  New Entry
                </Button>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayout {...props} />
    </SidebarProvider>
  );
}
