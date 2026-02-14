"use client";

import { useState } from "react";
import { Activity, Menu, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BugReportModal } from "@/components/bug-report-modal";

interface DashboardHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function DashboardHeader({
  activeTab,
  onTabChange,
}: DashboardHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
    setSheetOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  PhysioInvoice
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                  Practice Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setBugReportOpen(true)}
                title="Report Bug"
              >
                <Bug className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Report Bug</span>
              </Button>

              {onTabChange && (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="sm:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[250px]">
                    <SheetHeader>
                      <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-2">
                      <Button
                        variant={
                          activeTab === "invoice" ? "secondary" : "ghost"
                        }
                        className="justify-start"
                        onClick={() => handleTabChange("invoice")}
                      >
                        Create Invoice
                      </Button>
                      <Button
                        variant={
                          activeTab === "patients" ? "secondary" : "ghost"
                        }
                        className="justify-start"
                        onClick={() => handleTabChange("patients")}
                      >
                        Patients
                      </Button>
                      <Button
                        variant={
                          activeTab === "settings" ? "secondary" : "ghost"
                        }
                        className="justify-start"
                        onClick={() => handleTabChange("settings")}
                      >
                        Settings
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>
      <BugReportModal open={bugReportOpen} onOpenChange={setBugReportOpen} />
    </>
  );
}
