export interface Member {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  bloodGroup: string;
  medicalHistory: string;
  feesStatus: "PAID" | "UNPAID";
  attendance: { date: string; status: boolean }[];
  profileImage?: string;
  emergencyContact: {
    name: string;
    email: string;
    phone: string;
    countryCode?: string;
  };
  healthData?: {
    hr: number;
    spo2: number;
  };
  additionalHealth?: {
    bp: string;
    diabetes: string;
    other: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
