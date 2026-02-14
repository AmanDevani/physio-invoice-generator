"use client";

import { useStore, type PatientRecord } from "@/lib/store";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Trash2, IndianRupee, Calendar, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function PatientList() {
  const { patientRecords, deletePatientRecord, clinicSettings } = useStore();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totals = patientRecords.reduce(
    (acc, record) => ({
      patients: acc.patients + 1,
      sessions: acc.sessions + record.totalSessions,
      revenue: acc.revenue + record.totalAmount,
    }),
    { patients: 0, sessions: 0, revenue: 0 },
  );

  const handleDownloadPDF = (record: PatientRecord) => {
    // Check if clinic settings are configured
    if (!clinicSettings.clinicName || clinicSettings.doctors.length === 0) {
      toast({
        title: "Clinic Settings Required",
        description:
          "Please configure your clinic details in Settings before downloading invoices.",
        variant: "destructive",
      });
      return;
    }

    // Reconstruct patient invoice from record
    const patientInvoice = {
      patientName: record.patientName,
      age: record.age,
      gender: record.gender,
      referredBy: record.referredBy,
      billDate: record.billDate,
      referenceDate: "",
      condition: record.condition,
      treatment: record.treatment,
      startDate: record.startDate || "",
      endDate: record.endDate || "",
      selectedDates: record.selectedDates || [],
      chargePerSession: record.chargePerSession || 0,
      sessionsPerDay: record.sessionsPerDay || 1,
      dateSelectionMode: "range" as const,
    };

    generateInvoicePDF(clinicSettings, patientInvoice);
    toast({
      title: "Invoice Downloaded",
      description: `Invoice for ${record.patientName} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0 text-center sm:text-left">
              <div>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  Patients
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  {totals.patients}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-80 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0 text-center sm:text-left">
              <div>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  Sessions
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  {totals.sessions}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-80 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0 text-center sm:text-left">
              <div>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  Revenue
                </p>
                <p className="text-base sm:text-2xl font-bold">
                  {formatCurrency(totals.revenue)}
                </p>
              </div>
              <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-80 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Patient Records
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            List of all generated invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientRecords.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium">
                No patient records yet
              </p>
              <p className="text-xs sm:text-sm">
                Generate an invoice to add a patient.
              </p>
            </div>
          ) : (
            <>
              <div className="sm:hidden space-y-3">
                {patientRecords.map((record: PatientRecord) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {record.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.age && record.gender
                            ? `${record.age} yrs / ${record.gender}`
                            : record.age || record.gender || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-primary hover:text-primary/80"
                          onClick={() => handleDownloadPDF(record)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Patient Record
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{record.patientName}</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePatientRecord(record.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {record.condition && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {record.condition}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {record.totalSessions} sessions
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(record.billDate)}
                        </span>
                      </div>
                      <span className="font-semibold text-sm text-primary">
                        {formatCurrency(record.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Patient Name</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Bill Date</TableHead>
                      <TableHead className="text-center">Sessions</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[80px] text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientRecords.map((record: PatientRecord) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.patientName}
                        </TableCell>
                        <TableCell>
                          {record.age && record.gender
                            ? `${record.age} yrs / ${record.gender}`
                            : record.age || record.gender || "-"}
                        </TableCell>
                        <TableCell>{record.referredBy || "-"}</TableCell>
                        <TableCell className="max-w-[180px]">
                          <span className="line-clamp-2 text-sm">
                            {record.condition || "-"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(record.billDate)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {record.totalSessions}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(record.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-accent-foreground"
                              onClick={() => handleDownloadPDF(record)}
                              title="Download Invoice"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  title="Delete Record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Patient Record
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the record
                                    for <strong>{record.patientName}</strong>?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deletePatientRecord(record.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
