"use client";
import { useState, useEffect } from "react";
import { useStore, type ClinicSettings } from "@/lib/store";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Building2,
  Users,
  MapPin,
  Clock,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClinicSettings() {
  const { clinicSettings, setClinicSettings } = useStore();
  const [newDoctorName, setNewDoctorName] = useState("");
  const [localSettings, setLocalSettings] =
    useState<ClinicSettings>(clinicSettings);
  const { toast } = useToast();

  // Initialize local settings only on mount
  useEffect(() => {
    setLocalSettings(clinicSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDoctor = () => {
    if (newDoctorName.trim()) {
      setLocalSettings((prev) => ({
        ...prev,
        doctors: [
          ...prev.doctors,
          { id: Date.now().toString(), name: newDoctorName.trim() },
        ],
      }));
      setNewDoctorName("");
    }
  };

  const handleRemoveDoctor = (id: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      doctors: prev.doctors.filter((d) => d.id !== id),
    }));
  };

  const handleSave = () => {
    // Validate required fields
    const errors: string[] = [];

    if (!localSettings.clinicName.trim()) {
      errors.push("Clinic Name is required");
    }

    if (localSettings.doctors.length === 0) {
      errors.push("At least one Doctor is required");
    }

    if (!localSettings.address.trim()) {
      errors.push("Address is required");
    }

    if (!localSettings.phone.trim()) {
      errors.push("Phone Number is required");
    }

    if (!localSettings.email.trim()) {
      errors.push("Email is required");
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive",
      });
      return;
    }

    setClinicSettings(localSettings);
    toast({
      title: "Settings Saved",
      description: "Your clinic settings have been saved successfully.",
    });
  };

  const handleReset = () => {
    setLocalSettings(clinicSettings);
    setNewDoctorName("");
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded.",
    });
  };

  const hasChanges =
    JSON.stringify(localSettings) !== JSON.stringify(clinicSettings);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Clinic Information
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Basic details that appear on invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="clinicName" className="text-sm">
                Clinic Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clinicName"
                value={localSettings.clinicName}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    clinicName: e.target.value,
                  }))
                }
                placeholder="Enter clinic name"
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="tagline" className="text-sm">
                Tagline
              </Label>
              <Input
                id="tagline"
                value={localSettings.tagline}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    tagline: e.target.value,
                  }))
                }
                placeholder="Enter tagline"
                className="h-9 sm:h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Doctors <span className="text-destructive">*</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage clinic doctors (At least one required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {localSettings.doctors.map((doctor) => (
              <Badge
                key={doctor.id}
                variant="secondary"
                className="py-1 px-2 sm:py-1.5 sm:px-3 text-xs sm:text-sm"
              >
                {doctor.name}
                <button
                  onClick={() => handleRemoveDoctor(doctor.id)}
                  className="ml-1.5 sm:ml-2 hover:text-destructive"
                  aria-label={`Remove ${doctor.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              placeholder="Add new doctor"
              onKeyDown={(e) => e.key === "Enter" && handleAddDoctor()}
              className="h-9 sm:h-10 text-sm"
            />
            <Button
              onClick={handleAddDoctor}
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add doctor</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Contact Information
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Address and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="address" className="text-sm">
              Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              value={localSettings.address}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="Enter clinic address"
              rows={2}
              className="text-sm min-h-[60px] sm:min-h-[80px]"
            />
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="phone" className="text-sm">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={localSettings.phone}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={localSettings.email}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Enter email address"
                className="h-9 sm:h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Operating Hours
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Displayed in invoice footer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="clinicHours" className="text-sm">
              Clinic Hours
            </Label>
            <Input
              id="clinicHours"
              value={localSettings.clinicHours}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  clinicHours: e.target.value,
                }))
              }
              placeholder="e.g., Mon - Sat: 9 AM - 6 PM"
              className="h-9 sm:h-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
        >
          <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Save Settings
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges}
          className="h-10 sm:h-11 text-sm sm:text-base bg-transparent"
        >
          <RotateCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Discard Changes
        </Button>
      </div>
    </div>
  );
}
