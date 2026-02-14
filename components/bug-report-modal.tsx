"use client";

import { useState } from "react";
import { Bug, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface BugReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BugReportModal({ open, onOpenChange }: BugReportModalProps) {
  const [bugDescription, setBugDescription] = useState("");
  const [bugEmail, setBugEmail] = useState("");
  const { toast } = useToast();
  const bugReportEmail = process.env.NEXT_PUBLIC_BUG_REPORT_EMAIL;

  const generateBugReport = () => {
    const systemInfo = {
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : "Unknown",
      platform: typeof window !== "undefined" ? navigator.platform : "Unknown",
      timestamp: new Date().toISOString(),
      appVersion: "1.0.0",
    };

    return `Bug Report - PhysioInvoice

Description:
${bugDescription}

Contact Email: ${bugEmail || "Not provided"}

System Information:
- User Agent: ${systemInfo.userAgent}
- Platform: ${systemInfo.platform}
- Timestamp: ${systemInfo.timestamp}
- App Version: ${systemInfo.appVersion}
`;
  };

  const handleCopyReport = () => {
    if (!bugDescription.trim()) {
      toast({
        title: "Bug Description Required",
        description: "Please describe the bug you encountered.",
        variant: "destructive",
      });
      return;
    }

    const bugReport = generateBugReport();

    // Copy to clipboard
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(bugReport)
        .then(() => {
          toast({
            title: "Bug Report Copied!",
            description:
              "The bug report has been copied to your clipboard. Please send it to support@physioinvoice.com",
          });
          setBugDescription("");
          setBugEmail("");
          onOpenChange(false);
        })
        .catch(() => {
          toast({
            title: "Failed to Copy",
            description: "Please manually copy the bug report.",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Clipboard Not Available",
        description: "Please manually copy the bug report.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEmail = () => {
    if (!bugDescription.trim()) {
      toast({
        title: "Bug Description Required",
        description: "Please describe the bug you encountered.",
        variant: "destructive",
      });
      return;
    }

    const bugReport = generateBugReport();
    const subject = encodeURIComponent("Bug Report - PhysioInvoice");
    const body = encodeURIComponent(bugReport);
    window.location.href = `mailto:${bugReportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Report Bug
          </DialogTitle>
          <DialogDescription>
            Found an issue? Let us know and we'll fix it as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bugDescription" className="text-sm">
              Bug Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="bugDescription"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              placeholder="Describe the bug you encountered. Include steps to reproduce if possible..."
              rows={5}
              className="text-sm min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bugEmail" className="text-sm">
              Your Email (Optional)
            </Label>
            <Input
              id="bugEmail"
              type="email"
              value={bugEmail}
              onChange={(e) => setBugEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="h-9 sm:h-10"
            />
            <p className="text-xs text-muted-foreground">
              Provide your email if you'd like us to follow up with you about
              this bug.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleCopyReport}
            disabled={!bugDescription.trim()}
            className="flex-1 sm:flex-initial"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Bug Report
          </Button>
          {
            bugReportEmail && (

          <Button
            variant="outline"
            onClick={handleOpenEmail}
            disabled={!bugDescription.trim()}
            className="flex-1 sm:flex-initial"
          >
            <Mail className="mr-2 h-4 w-4" />
            Open Email
          </Button>
            )
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
