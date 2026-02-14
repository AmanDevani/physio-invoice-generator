"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { ClinicSettings } from "@/components/clinic-settings";
import { InvoiceForm } from "@/components/invoice-form";
import { PatientList } from "@/components/patient-list";
import { Settings, FileText, Users } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("invoice");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="hidden sm:grid w-full max-w-lg grid-cols-3">
            <TabsTrigger
              value="invoice"
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Invoice</span>
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <Users className="h-4 w-4" />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="mt-4 sm:mt-6">
            <div className="max-w-3xl mx-auto">
              <InvoiceForm />
            </div>
          </TabsContent>

          <TabsContent value="patients" className="mt-4 sm:mt-6">
            <div className="max-w-4xl mx-auto">
              <PatientList />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 sm:mt-6">
            <div className="max-w-3xl mx-auto">
              <ClinicSettings />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
