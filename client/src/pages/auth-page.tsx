import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if user is already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-800 mb-2">MedCore</h2>
            <p className="text-neutral-500">Hospital Management System</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="login">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-primary-800 to-primary-900 text-white p-10 items-center justify-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-6">Streamlined Hospital Management</h1>
          <p className="text-lg mb-8 text-primary-100">
            A comprehensive solution for managing doctor profiles, patient records, appointments, and billing all in one place.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-700 p-2 rounded-md mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Patient Management</h3>
                <p className="text-primary-100">Efficiently manage patient records, appointments, and medical history.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-700 p-2 rounded-md mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Appointment Scheduling</h3>
                <p className="text-primary-100">Streamline the scheduling process for both patients and doctors.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-700 p-2 rounded-md mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Billing & Reporting</h3>
                <p className="text-primary-100">Simplified billing process with detailed financial reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
