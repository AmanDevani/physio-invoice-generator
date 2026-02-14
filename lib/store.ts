"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Doctor {
  id: string;
  name: string;
}

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  doctors: Doctor[];
  address: string;
  phone: string;
  email: string;
  clinicHours: string;
}

export interface PatientInvoice {
  patientName: string;
  age: string;
  gender: string;
  referredBy: string;
  billDate: string;
  referenceDate: string;
  condition: string;
  treatment: string;
  startDate: string;
  endDate: string;
  selectedDates: string[];
  chargePerSession: number;
  sessionsPerDay: number;
  dateSelectionMode: "range" | "individual";
}

export interface PatientRecord {
  id: string;
  patientName: string;
  age: string;
  gender: string;
  referredBy: string;
  billDate: string;
  condition: string;
  treatment: string;
  totalSessions: number;
  totalAmount: number;
  createdAt: string;
  selectedDates: string[];
  sessionsPerDay: number;
  chargePerSession: number;
  startDate: string;
  endDate: string;
}

interface StoreState {
  clinicSettings: ClinicSettings;
  patientInvoice: PatientInvoice;
  patientRecords: PatientRecord[];
  setClinicSettings: (settings: Partial<ClinicSettings>) => void;
  setPatientInvoice: (invoice: Partial<PatientInvoice>) => void;
  addDoctor: (name: string) => void;
  removeDoctor: (id: string) => void;
  resetPatientInvoice: () => void;
  addPatientRecord: (record: Omit<PatientRecord, "id" | "createdAt">) => void;
  deletePatientRecord: (id: string) => void;
}

const defaultClinicSettings: ClinicSettings = {
  clinicName: "",
  tagline: "",
  doctors: [],
  address: "",
  phone: "",
  email: "",
  clinicHours: "",
};

const defaultPatientInvoice: PatientInvoice = {
  patientName: "",
  age: "",
  gender: "",
  referredBy: "",
  billDate: new Date().toISOString().split("T")[0],
  referenceDate: "",
  condition: "",
  treatment: "",
  startDate: "",
  endDate: "",
  selectedDates: [],
  chargePerSession: 800,
  sessionsPerDay: 1,
  dateSelectionMode: "range",
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      clinicSettings: defaultClinicSettings,
      patientInvoice: defaultPatientInvoice,
      patientRecords: [],
      setClinicSettings: (settings) =>
        set((state) => ({
          clinicSettings: { ...state.clinicSettings, ...settings },
        })),
      setPatientInvoice: (invoice) =>
        set((state) => ({
          patientInvoice: { ...state.patientInvoice, ...invoice },
        })),
      addDoctor: (name) =>
        set((state) => ({
          clinicSettings: {
            ...state.clinicSettings,
            doctors: [
              ...state.clinicSettings.doctors,
              { id: Date.now().toString(), name },
            ],
          },
        })),
      removeDoctor: (id) =>
        set((state) => ({
          clinicSettings: {
            ...state.clinicSettings,
            doctors: state.clinicSettings.doctors.filter((d) => d.id !== id),
          },
        })),
      resetPatientInvoice: () => set({ patientInvoice: defaultPatientInvoice }),
      addPatientRecord: (record) =>
        set((state) => ({
          patientRecords: [
            {
              ...record,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
            ...state.patientRecords,
          ],
        })),
      deletePatientRecord: (id) =>
        set((state) => ({
          patientRecords: state.patientRecords.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "physio-invoice-storage",
    },
  ),
);
