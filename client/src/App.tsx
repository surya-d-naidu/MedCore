import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import DoctorsPage from "@/pages/doctors-page";
import PatientsPage from "@/pages/patients-page";
import AppointmentsPage from "@/pages/appointments-page";
import MedicalRecordsPage from "@/pages/medical-records-page";
import PrescriptionsPage from "@/pages/prescriptions-page";
import WardsPage from "@/pages/wards-page";
import BillingPage from "@/pages/billing-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={DashboardPage} />
          <ProtectedRoute path="/doctors" component={DoctorsPage} />
          <ProtectedRoute path="/patients" component={PatientsPage} />
          <ProtectedRoute path="/appointments" component={AppointmentsPage} />
          <ProtectedRoute path="/medical-records" component={MedicalRecordsPage} />
          <ProtectedRoute path="/prescriptions" component={PrescriptionsPage} />
          <ProtectedRoute path="/wards" component={WardsPage} />
          <ProtectedRoute path="/billing" component={BillingPage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
