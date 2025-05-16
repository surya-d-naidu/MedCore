import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, CreditCard, Heart, HeartPulse, Shield, Stethoscope, Users } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

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
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary flex items-center justify-center rounded-2xl">
                <Heart className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
            </div>
            <h2 className="text-4xl font-bold gradient-text mb-2">MedCore</h2>
            <p className="text-muted-foreground">Hospital Management System</p>
          </div>

          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <CardContent className="pt-6">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 w-full p-1 bg-muted/50 rounded-lg">
                  <TabsTrigger 
                    value="login" 
                    className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-0 animate-in fade-in">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register" className="mt-0 animate-in fade-in">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              {activeTab === "login" ? (
                <>Don't have an account? <button onClick={() => setActiveTab("register")} className="text-primary hover:underline">Create one</button></>
              ) : (
                <>Already have an account? <button onClick={() => setActiveTab("login")} className="text-primary hover:underline">Sign in</button></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden md:block md:flex-1 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEiIGQ9Ik0yNCA0NEMyMiA0NCA5IDM4IDYgMzZjLTMtMi0zLTQtMy0xNnMxLTE5IDEtMTlsMjAgMHM0IDMgNCAxMC0xIDktMSA5djNoMTJjMiAwIDQgMiA0IDRzMCA0LTIgNWMtMiAxLTcgMi03IDJ2MnM3IDIgOSA0YzIgMi0xIDYtNCA4cy03IDItMTUgMloiLz48L3N2Zz4=')]"></div>
        
        <div className="relative flex items-center justify-center p-10 z-10">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              <span className="block">Modern Healthcare</span>
              <span className="block text-white/90">Management Solution</span>
            </h1>
            <p className="text-lg mb-10 text-white/80 leading-relaxed">
              A comprehensive system for managing healthcare operations, streamlining workflows, and improving patient care through advanced digital tools.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Doctor Management</h3>
                <p className="text-white/80 text-sm mt-2">Effortlessly manage doctor schedules, specialties, and patient assignments</p>
              </div>
              
              <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Patient Records</h3>
                <p className="text-white/80 text-sm mt-2">Secure, organized, and easily accessible patient information at your fingertips</p>
              </div>
              
              <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Smart Scheduling</h3>
                <p className="text-white/80 text-sm mt-2">Intelligent appointment booking system with automated reminders</p>
              </div>
              
              <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Secure Billing</h3>
                <p className="text-white/80 text-sm mt-2">Seamless billing management with detailed financial reporting</p>
              </div>
            </div>
            
            <div className="mt-12 flex items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex -space-x-4 mr-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold border-2 border-white">
                  JD
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white">
                  KM
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold border-2 border-white">
                  TL
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Trusted by 1,000+ healthcare facilities</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-300 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs text-white/90">5.0 (350+ reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
