export interface EmergencyContact {
  name: string;
  email?: string;
  phone?: string;
}

export interface HealthData {
  hr: number;
  spo2: number;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  status: boolean; // true for present, false for absent
}

export interface AdditionalHealth {
  bp?: string;
  diabetes?: string;
  other?: string;
}

export interface FeeRecord {
  month: string;
  status: "PAID" | "UNPAID";
  paidDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: string;
  bloodGroup: string;
  medicalHistory: string;
  feesStatus: "PAID" | "UNPAID";
  attendance: AttendanceRecord[];
  emergencyContact?: EmergencyContact;
  healthData?: HealthData;
  trainerId?: string; // Optional, if a member can exist without an assigned trainer
  profileImage?: string;
  additionalHealth?: AdditionalHealth;
  feeHistory?: FeeRecord[];
  feePaymentDate?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  password: string; // Hashed password
}

export interface AppData {
  trainers: Trainer[];
  members: Member[];
}