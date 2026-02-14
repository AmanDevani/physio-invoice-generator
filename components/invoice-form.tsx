"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  User,
  Stethoscope,
  CalendarDays,
  Calculator,
  Download,
  RotateCcw,
  CalendarRange,
  CalendarPlus,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ValidationErrors {
  patientName?: string;
  age?: string;
  gender?: string;
  billDate?: string;
  condition?: string;
  treatment?: string;
  selectedDates?: string;
  chargePerSession?: string;
}

export function InvoiceForm() {
  const {
    clinicSettings,
    patientInvoice,
    setPatientInvoice,
    resetPatientInvoice,
    addPatientRecord,
  } = useStore();
  const { toast } = useToast();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const isUpdatingRef = useRef(false);

  const isClinicConfigured = useMemo(() => {
    return (
      clinicSettings.clinicName.trim() !== "" &&
      clinicSettings.doctors.length > 0 &&
      clinicSettings.doctors.some((doc) => doc.name.trim() !== "") &&
      clinicSettings.address.trim() !== "" &&
      clinicSettings.phone.trim() !== ""
    );
  }, [clinicSettings]);

  // Helper function to format date as YYYY-MM-DD using local timezone
  const formatDateLocal = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const generateDateRange = useCallback(
    (start: string, end: string): string[] => {
      if (!start || !end) return [];
      const dates: string[] = [];

      // Parse dates and sort them
      const date1 = new Date(start + "T00:00:00");
      const date2 = new Date(end + "T00:00:00");

      const startDate = date1 <= date2 ? date1 : date2;
      const endDate = date1 <= date2 ? date2 : date1;

      const current = new Date(startDate);
      while (current <= endDate) {
        dates.push(formatDateLocal(current));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    },
    [formatDateLocal],
  );

  useEffect(() => {
    if (isUpdatingRef.current) return;
    if (patientInvoice.dateSelectionMode !== "range") return;
    if (!patientInvoice.startDate || !patientInvoice.endDate) return;

    const dates = generateDateRange(
      patientInvoice.startDate,
      patientInvoice.endDate,
    );
    if (dates.length === 0) return;

    const sortedStart = dates[0];
    const sortedEnd = dates[dates.length - 1];

    // Only update if dates actually changed
    const currentDatesStr = patientInvoice.selectedDates.join(",");
    const newDatesStr = dates.join(",");

    if (
      currentDatesStr !== newDatesStr ||
      patientInvoice.startDate !== sortedStart ||
      patientInvoice.endDate !== sortedEnd
    ) {
      isUpdatingRef.current = true;
      setPatientInvoice({
        selectedDates: dates,
        startDate: sortedStart,
        endDate: sortedEnd,
      });
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [
    patientInvoice.startDate,
    patientInvoice.endDate,
    patientInvoice.dateSelectionMode,
    patientInvoice.selectedDates,
    generateDateRange,
    setPatientInvoice,
  ]);

  const calculations = useMemo(() => {
    const totalSessions =
      patientInvoice.selectedDates.length * patientInvoice.sessionsPerDay;
    const totalAmount = totalSessions * patientInvoice.chargePerSession;
    return { totalSessions, totalAmount };
  }, [
    patientInvoice.selectedDates.length,
    patientInvoice.sessionsPerDay,
    patientInvoice.chargePerSession,
  ]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!patientInvoice.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }

    if (!patientInvoice.age.trim()) {
      newErrors.age = "Age is required";
    } else if (
      isNaN(Number(patientInvoice.age)) ||
      Number(patientInvoice.age) <= 0
    ) {
      newErrors.age = "Please enter a valid age";
    }

    if (!patientInvoice.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!patientInvoice.billDate) {
      newErrors.billDate = "Bill date is required";
    }

    if (patientInvoice.selectedDates.length === 0) {
      newErrors.selectedDates = "Please select treatment dates";
    }

    if (patientInvoice.chargePerSession <= 0) {
      newErrors.chargePerSession = "Charge per session must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDownload = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addPatientRecord({
      patientName: patientInvoice.patientName,
      age: patientInvoice.age,
      gender: patientInvoice.gender,
      referredBy: patientInvoice.referredBy,
      billDate: patientInvoice.billDate,
      condition: patientInvoice.condition,
      treatment: patientInvoice.treatment,
      totalSessions: calculations.totalSessions,
      totalAmount: calculations.totalAmount,
      selectedDates: patientInvoice.selectedDates,
      sessionsPerDay: patientInvoice.sessionsPerDay,
      chargePerSession: patientInvoice.chargePerSession,
      startDate: patientInvoice.startDate,
      endDate: patientInvoice.endDate,
    });

    generateInvoicePDF(clinicSettings, patientInvoice);
    toast({
      title: "Invoice Generated",
      description:
        "Your PDF invoice has been downloaded and patient added to records.",
    });
  };

  const handleReset = () => {
    resetPatientInvoice();
    setErrors({});
    toast({
      title: "Form Reset",
      description: "All patient information has been cleared.",
    });
  };

  const handleModeChange = (mode: "range" | "individual") => {
    setPatientInvoice({
      dateSelectionMode: mode,
      selectedDates: [],
      startDate: "",
      endDate: "",
    });
    clearError("selectedDates");
  };

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range || !range.from) {
      setPatientInvoice({
        startDate: "",
        endDate: "",
        selectedDates: [],
      });
      clearError("selectedDates");
      return;
    }

    const startDate = formatDateLocal(range.from);
    const endDate = range.to ? formatDateLocal(range.to) : startDate;

    // Generate dates array for the range
    const dates = generateDateRange(startDate, endDate);

    setPatientInvoice({
      startDate,
      endDate,
      selectedDates: dates,
    });
    clearError("selectedDates");
  };

  // Get the range object for Calendar component
  const selectedRange = useMemo(() => {
    if (!patientInvoice.startDate) return undefined;
    const from = new Date(patientInvoice.startDate + "T00:00:00");
    const to = patientInvoice.endDate
      ? new Date(patientInvoice.endDate + "T00:00:00")
      : undefined;
    return { from, to };
  }, [patientInvoice.startDate, patientInvoice.endDate]);

  // If clinic settings are not configured, show error component instead of form
  if (!isClinicConfigured) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">
              Clinic Settings Required
            </AlertTitle>
            <AlertDescription className="mt-2 text-base">
              <p className="mb-4">
                Please configure your clinic settings before creating invoices.
                You need to set up:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 text-sm">
                <li>Clinic Name</li>
                <li>At least one Doctor</li>
                <li>Clinic Address</li>
                <li>Phone Number</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Navigate to the <strong>Settings</strong> tab to configure your
                clinic information.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Patient Details
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter patient's personal information (* Required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="patientName" className="text-sm">
                Patient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patientName"
                value={patientInvoice.patientName}
                onChange={(e) => {
                  setPatientInvoice({ patientName: e.target.value });
                  clearError("patientName");
                }}
                placeholder="Enter patient name"
                className={`h-9 sm:h-10 ${errors.patientName ? "border-destructive" : ""}`}
              />
              {errors.patientName && (
                <p className="text-xs text-destructive">{errors.patientName}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="referredBy" className="text-sm">
                Referred By
              </Label>
              <Input
                id="referredBy"
                value={patientInvoice.referredBy}
                onChange={(e) =>
                  setPatientInvoice({ referredBy: e.target.value })
                }
                placeholder="Referring doctor"
                className="h-9 sm:h-10"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="age" className="text-sm">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                value={patientInvoice.age}
                onChange={(e) => {
                  setPatientInvoice({ age: e.target.value });
                  clearError("age");
                }}
                placeholder="Age"
                className={`h-9 sm:h-10 ${errors.age ? "border-destructive" : ""}`}
              />
              {errors.age && (
                <p className="text-xs text-destructive">{errors.age}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="gender" className="text-sm">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={patientInvoice.gender}
                onValueChange={(value) => {
                  setPatientInvoice({ gender: value });
                  clearError("gender");
                }}
              >
                <SelectTrigger
                  id="gender"
                  className={`h-9 sm:h-10 ${errors.gender ? "border-destructive" : ""}`}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="billDate" className="text-sm">
                Bill Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billDate"
                type="date"
                value={patientInvoice.billDate}
                onChange={(e) => {
                  setPatientInvoice({ billDate: e.target.value });
                  clearError("billDate");
                }}
                className={`h-9 sm:h-10 ${errors.billDate ? "border-destructive" : ""}`}
              />
              {errors.billDate && (
                <p className="text-xs text-destructive">{errors.billDate}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="referenceDate" className="text-sm">
                Reference Date
              </Label>
              <Input
                id="referenceDate"
                type="date"
                value={patientInvoice.referenceDate}
                onChange={(e) =>
                  setPatientInvoice({ referenceDate: e.target.value })
                }
                className="h-9 sm:h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Medical Information
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Diagnosis and treatment details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="condition" className="text-sm">
              Condition / Diagnosis
            </Label>
            <Textarea
              id="condition"
              value={patientInvoice.condition}
              onChange={(e) => {
                setPatientInvoice({ condition: e.target.value });
                clearError("condition");
              }}
              placeholder="Enter patient's condition..."
              rows={2}
              className={`text-sm min-h-[60px] sm:min-h-[80px] ${errors.condition ? "border-destructive" : ""}`}
            />
            {errors.condition && (
              <p className="text-xs text-destructive">{errors.condition}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="treatment" className="text-sm">
              Treatment Given
            </Label>
            <Textarea
              id="treatment"
              value={patientInvoice.treatment}
              onChange={(e) => {
                setPatientInvoice({ treatment: e.target.value });
                clearError("treatment");
              }}
              placeholder="e.g., TENS, Ultrasound, Manual Therapy..."
              rows={2}
              className={`text-sm min-h-[60px] sm:min-h-[80px] ${errors.treatment ? "border-destructive" : ""}`}
            />
            {errors.treatment && (
              <p className="text-xs text-destructive">{errors.treatment}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Session Calculator
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Select dates and set charges (* Required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm">
              Date Selection Method <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={patientInvoice.dateSelectionMode}
              onValueChange={(value) =>
                handleModeChange(value as "range" | "individual")
              }
              className="flex flex-col xs:flex-row gap-3 xs:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="range" id="range" />
                <Label
                  htmlFor="range"
                  className="flex items-center gap-2 cursor-pointer font-normal text-sm"
                >
                  <CalendarRange className="h-4 w-4" />
                  Date Range
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label
                  htmlFor="individual"
                  className="flex items-center gap-2 cursor-pointer font-normal text-sm"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Individual Days
                </Label>
              </div>
            </RadioGroup>
          </div>

          {patientInvoice.dateSelectionMode === "range" ? (
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">
                Select Date Range <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-transparent h-9 sm:h-10 text-sm ${errors.selectedDates ? "border-destructive" : ""}`}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {patientInvoice.startDate && patientInvoice.endDate
                      ? `${format(new Date(patientInvoice.startDate), "dd MMM yyyy")} - ${format(new Date(patientInvoice.endDate), "dd MMM yyyy")}`
                      : patientInvoice.startDate
                        ? `${format(new Date(patientInvoice.startDate), "dd MMM yyyy")} - Select end date`
                        : "Click to select date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleRangeSelect}
                    numberOfMonths={2}
                    className="rounded-md border"
                    classNames={{
                      months: "flex flex-col sm:flex-row gap-4",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">
                Select Individual Treatment Dates{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-transparent h-9 sm:h-10 text-sm ${errors.selectedDates ? "border-destructive" : ""}`}
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    {patientInvoice.selectedDates.length > 0
                      ? `${patientInvoice.selectedDates.length} date(s) selected`
                      : "Click to pick dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={patientInvoice.selectedDates.map(
                      (d) => new Date(d),
                    )}
                    onSelect={(dates) => {
                      if (dates) {
                        const dateStrings = dates
                          .map((d) => formatDateLocal(d))
                          .sort();
                        setPatientInvoice({
                          selectedDates: dateStrings,
                          startDate:
                            dateStrings.length > 0 ? dateStrings[0] : "",
                          endDate:
                            dateStrings.length > 0
                              ? dateStrings[dateStrings.length - 1]
                              : "",
                        });
                        clearError("selectedDates");
                      }
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {errors.selectedDates && (
            <p className="text-xs text-destructive">{errors.selectedDates}</p>
          )}

          {patientInvoice.selectedDates.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm text-muted-foreground">
                Selected Dates ({patientInvoice.selectedDates.length}{" "}
                {patientInvoice.selectedDates.length === 1 ? "day" : "days"})
              </Label>
              <div className="flex flex-wrap gap-1 sm:gap-1.5 p-2 sm:p-3 bg-muted rounded-lg min-h-[60px] max-h-32 sm:max-h-40 overflow-y-auto overflow-x-hidden">
                {patientInvoice.selectedDates.map((date) => (
                  <Badge
                    key={date}
                    variant="secondary"
                    className="text-xs whitespace-nowrap"
                  >
                    {format(new Date(date), "dd MMM")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:gap-4 grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="sessionsPerDay" className="text-sm">
                Sessions Per Day <span className="text-destructive">*</span>
              </Label>
              <Select
                value={patientInvoice.sessionsPerDay.toString()}
                onValueChange={(value) =>
                  setPatientInvoice({ sessionsPerDay: Number.parseInt(value) })
                }
              >
                <SelectTrigger id="sessionsPerDay" className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Session" : "Sessions"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="chargePerSession" className="text-sm">
                Charge Per Session (Rs.){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chargePerSession"
                type="number"
                value={patientInvoice.chargePerSession || ""}
                onChange={(e) => {
                  setPatientInvoice({
                    chargePerSession: Number.parseFloat(e.target.value) || 0,
                  });
                  clearError("chargePerSession");
                }}
                placeholder="Enter amount"
                className={`h-9 sm:h-10 ${errors.chargePerSession ? "border-destructive" : ""}`}
              />
              {errors.chargePerSession && (
                <p className="text-xs text-destructive">
                  {errors.chargePerSession}
                </p>
              )}
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h4 className="font-semibold text-sm sm:text-base text-primary">
                  Calculation Summary
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Total Days</p>
                  <p className="font-semibold">
                    {patientInvoice.selectedDates.length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sessions/Day</p>
                  <p className="font-semibold">
                    {patientInvoice.sessionsPerDay}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Sessions</p>
                  <p className="font-semibold">{calculations.totalSessions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-primary">
                    Rs. {calculations.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleDownload}
          className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
          disabled={patientInvoice.selectedDates.length === 0}
        >
          <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Generate Invoice
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-10 sm:h-11 text-sm sm:text-base bg-transparent"
        >
          <RotateCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Reset Form
        </Button>
      </div>
    </div>
  );
}
