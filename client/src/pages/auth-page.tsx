import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, CreditCard, HeartPulse, Stethoscope, Users } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if user is already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fade-in">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold gradient-text mb-2">MedCore</h2>
            <p className="text-muted-foreground">Hospital Management System</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 w-full">
                  <TabsTrigger value="login" className="text-sm font-medium">Login</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm font-medium">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-0">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register" className="mt-0">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-primary to-secondary text-white p-10 items-center justify-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="block">Modern</span>
            <span className="block">Hospital Management</span>
          </h1>
          <p className="text-lg mb-10 text-white/90">
            A comprehensive solution for managing doctor profiles, patient records, appointments, and billing all in one place.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Doctor Management</h3>
                <p className="text-white/80 text-sm">Track and manage doctor schedules and specialties</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Patient Records</h3>
                <p className="text-white/80 text-sm">Secure and organized patient information</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Appointment Scheduling</h3>
                <p className="text-white/80 text-sm">Streamlined booking and management</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Billing & Reporting</h3>
                <p className="text-white/80 text-sm">Simplified invoicing and financial tracking</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center">
            <div className="flex -space-x-4">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <img 
                src="https://randomuser.me/api/portraits/men/46.jpg" 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <img 
                src="https://randomuser.me/api/portraits/women/45.jpg" 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-white/90">Trusted by healthcare professionals worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
