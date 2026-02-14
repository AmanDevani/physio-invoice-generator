import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ClinicSettings, PatientInvoice } from "./store";

export async function generateInvoicePDF(
  clinicSettings: ClinicSettings,
  patientInvoice: PatientInvoice,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const totalSessions =
    patientInvoice.selectedDates.length * patientInvoice.sessionsPerDay;
  const totalAmount = totalSessions * patientInvoice.chargePerSession;

  await generatePage1(
    doc,
    clinicSettings,
    patientInvoice,
    totalSessions,
    totalAmount,
    pageWidth,
    pageHeight,
  );

  doc.addPage();
  generatePage2(
    doc,
    clinicSettings,
    patientInvoice,
    totalSessions,
    totalAmount,
    pageWidth,
    pageHeight,
  );

  doc.save(
    `Invoice_${patientInvoice.patientName.replace(/\s+/g, "_")}_${patientInvoice.billDate}.pdf`,
  );
}

async function generatePage1(
  doc: jsPDF,
  clinicSettings: ClinicSettings,
  patientInvoice: PatientInvoice,
  totalSessions: number,
  totalAmount: number,
  pageWidth: number,
  pageHeight: number,
) {
  const primaryColor: [number, number, number] = [0, 128, 128];
  const grayColor: [number, number, number] = [100, 100, 100];
  const darkText: [number, number, number] = [30, 30, 30];

  let yPos = 15;

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(clinicSettings.clinicName || "Your Clinic Name", 15, 18);

  if (clinicSettings.tagline) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(clinicSettings.tagline, 15, 26);
  }

  if (clinicSettings.doctors.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const doctorNames = clinicSettings.doctors.map((d) => d.name).join(" | ");
    doc.text(doctorNames, 15, 34);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let rightY = 15;
  if (clinicSettings.phone) {
    doc.text(`Tel: ${clinicSettings.phone}`, pageWidth - 15, rightY, {
      align: "right",
    });
    rightY += 5;
  }
  if (clinicSettings.email) {
    doc.text(`Email: ${clinicSettings.email}`, pageWidth - 15, rightY, {
      align: "right",
    });
    rightY += 5;
  }
  if (clinicSettings.address) {
    const addressLines = doc.splitTextToSize(clinicSettings.address, 60);
    addressLines.forEach((line: string) => {
      doc.text(line, pageWidth - 15, rightY, { align: "right" });
      rightY += 4;
    });
  }

  yPos = 55;

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 18, 3, 3, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("INVOICE / RECEIPT", 22, yPos + 6);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayColor);
  const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - 22, yPos + 2, {
    align: "right",
  });
  doc.text(
    `Date: ${formatDate(patientInvoice.billDate)}`,
    pageWidth - 22,
    yPos + 8,
    { align: "right" },
  );

  yPos += 22;

  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("PATIENT INFORMATION", 20, yPos + 5.5);
  yPos += 12;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(252, 252, 252);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, pageWidth - 30, 32, 2, 2, "FD");

  const col1X = 22;
  const col2X = pageWidth / 2 + 5;
  const labelWidth = 32;

  doc.setFontSize(9);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Patient Name:", col1X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(patientInvoice.patientName || "-", col1X + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Bill Date:", col2X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(formatDate(patientInvoice.billDate), col2X + 22, yPos);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Age / Gender:", col1X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(
    `${patientInvoice.age || "-"} yrs / ${patientInvoice.gender || "-"}`,
    col1X + labelWidth,
    yPos,
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Ref. Date:", col2X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(formatDate(patientInvoice.referenceDate), col2X + 22, yPos);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Referred By:", col1X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(patientInvoice.referredBy || "Self", col1X + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Period:", col2X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  const period =
    patientInvoice.startDate && patientInvoice.endDate
      ? `${formatDateShort(patientInvoice.startDate)} - ${formatDateShort(patientInvoice.endDate)}`
      : "-";
  doc.text(period, col2X + 22, yPos);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Total Days:", col1X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(
    `${patientInvoice.selectedDates.length} days`,
    col1X + labelWidth,
    yPos,
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayColor);
  doc.text("Sessions/Day:", col2X, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(`${patientInvoice.sessionsPerDay}`, col2X + 28, yPos);

  yPos += 15;

  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("CONDITION / DIAGNOSIS", 20, yPos + 5.5);
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  const conditionText = patientInvoice.condition || "Not specified";
  const conditionLines = doc.splitTextToSize(conditionText, pageWidth - 50);
  doc.text(conditionLines, 20, yPos);
  yPos += Math.max(conditionLines.length * 5, 6) + 6;

  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TREATMENT PROVIDED", 20, yPos + 5.5);
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  const treatmentText = patientInvoice.treatment || "Not specified";
  const treatmentLines = doc.splitTextToSize(treatmentText, pageWidth - 50);
  doc.text(treatmentLines, 20, yPos);
  yPos += Math.max(treatmentLines.length * 5, 6) + 8;

  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BILLING DETAILS", 20, yPos + 5.5);
  yPos += 12;

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Days", "Sessions/Day", "Amount"]],
    body: [
      [
        "Physiotherapy Treatment Sessions",
        patientInvoice.selectedDates.length.toString(),
        patientInvoice.sessionsPerDay.toString(),
        "Rs. " + formatCurrency(totalAmount),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      halign: "center",
      fontSize: 9,
      cellPadding: 5,
      textColor: darkText,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
    },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(
    "Grand Total: Rs. " + formatCurrency(totalAmount),
    pageWidth - 20,
    yPos,
    { align: "right" },
  );

  const footerY = pageHeight - 50;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text("Authorized Signature", pageWidth - 55, footerY + 5, {
    align: "center",
  });
  doc.setDrawColor(...grayColor);
  doc.line(pageWidth - 85, footerY + 22, pageWidth - 25, footerY + 22);

  if (clinicSettings.doctors.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    doc.text(clinicSettings.doctors[0].name, pageWidth - 55, footerY + 28, {
      align: "center",
    });
  }

  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  const hoursText = clinicSettings.clinicHours
    ? `Hours: ${clinicSettings.clinicHours}`
    : "Thank you for choosing us!";
  doc.text(hoursText, pageWidth / 2, pageHeight - 4, { align: "center" });
}

function generatePage2(
  doc: jsPDF,
  clinicSettings: ClinicSettings,
  patientInvoice: PatientInvoice,
  totalSessions: number,
  totalAmount: number,
  pageWidth: number,
  pageHeight: number,
) {
  const primaryColor: [number, number, number] = [0, 128, 128];
  const grayColor: [number, number, number] = [100, 100, 100];
  const darkText: [number, number, number] = [30, 30, 30];

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(clinicSettings.clinicName || "Your Clinic Name", 15, 18);

  if (clinicSettings.tagline) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(clinicSettings.tagline, 15, 26);
  }

  if (clinicSettings.doctors.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const doctorNames = clinicSettings.doctors.map((d) => d.name).join(" | ");
    doc.text(doctorNames, 15, 34);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let rightY = 15;
  if (clinicSettings.phone) {
    doc.text(`Tel: ${clinicSettings.phone}`, pageWidth - 15, rightY, {
      align: "right",
    });
    rightY += 5;
  }
  if (clinicSettings.email) {
    doc.text(`Email: ${clinicSettings.email}`, pageWidth - 15, rightY, {
      align: "right",
    });
    rightY += 5;
  }
  if (clinicSettings.address) {
    const addressLines = doc.splitTextToSize(clinicSettings.address, 60);
    addressLines.forEach((line: string) => {
      doc.text(line, pageWidth - 15, rightY, { align: "right" });
      rightY += 4;
    });
  }

  let yPos = 55;

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 14, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("DETAILED SESSION LOG", 22, yPos + 4);

  yPos += 18;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(`Patient: ${patientInvoice.patientName}`, 15, yPos);

  yPos += 10;

  const tableData = patientInvoice.selectedDates.map((date) => {
    const dayTotal =
      patientInvoice.sessionsPerDay * patientInvoice.chargePerSession;
    return [
      formatDateLong(date),
      getDayOfWeek(date),
      patientInvoice.sessionsPerDay.toString(),
      "Rs. " + formatCurrency(dayTotal),
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Day", "Sessions", "Daily Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      halign: "center",
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
      3: { cellWidth: 50 },
    },
    margin: { left: 15, right: 15 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(`Total Sessions: ${totalSessions}`, pageWidth - 20, yPos, {
    align: "right",
  });

  yPos += 8;
  doc.setFontSize(12);
  doc.text(
    `Final Total: Rs. ${formatCurrency(totalAmount)}`,
    pageWidth - 20,
    yPos,
    { align: "right" },
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateShort(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateLong(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDayOfWeek(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-IN");
}
