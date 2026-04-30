import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Member, AuthState, User } from "../types";

interface AppContextType {
  authState: AuthState;
  members: Member[];
  dismissedIds: Set<string>;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchMembers: () => Promise<void>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addMember: (data: Omit<Member, "id" | "attendance" | "healthData">) => Promise<void>;
  markAttendance: (memberId: string, date: string, status: boolean) => Promise<void>;
  sendFeesReminder: (memberId: string, pendingFees: number, dueDate: string) => Promise<void>;
  dismissAlert: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [alertedIds, setAlertedIds] = useState<Map<string, number>>(new Map()); // id -> lastAlertTime
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const login = (token: string, user: User) => {
    const state = { token, user };
    setAuthState(state);
    localStorage.setItem("auth", JSON.stringify(state));
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
    localStorage.removeItem("auth");
    setAlertedIds(new Map());
    setDismissedIds(new Set());
  };

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  }, []);

  const addMember = async (data: Omit<Member, "id" | "attendance" | "healthData">) => {
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchMembers();
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    await fetch(`/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchMembers();
  };

  const deleteMember = async (id: string) => {
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    await fetchMembers();
  };

  const markAttendance = async (memberId: string, date: string, status: boolean) => {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, date, status }),
    });
    await fetchMembers();
  };

  const sendFeesReminder = async (memberId: string, pendingFees: number, dueDate: string) => {
    const res = await fetch("/api/fees/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, pendingFees, dueDate }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to send fees reminder");
    }
    return data;
  };

  // Real-time Pulse Simulation (Interval-based)
  useEffect(() => {
    if (!authState.token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/health-pulse");
        const updates = await res.json();
        const now = Date.now();
        const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

        setMembers(prev => prev.map(m => {
          const update = updates.find((u: any) => u.id === m.id);
          if (update) {
            const newHr = update.healthData.hr;
            const newSpo2 = update.healthData.spo2;

            // Emergency logic: Check if critical
            if (newHr > 105 || newHr < 50 || newSpo2 < 93) {
              const lastAlert = alertedIds.get(m.id) || 0;
              if (now - lastAlert > ALERT_COOLDOWN) {
                console.warn(`CRITICAL ALERT: ${m.name} HR: ${newHr} SpO2: ${newSpo2}`);
                // Trigger emergency alert on server
                fetch("/api/emergency/alert", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ memberId: m.id, hr: newHr, spo2: newSpo2 })
                }).catch(e => console.error("Alert failed", e));
                
                setAlertedIds(prevIds => {
                  const next = new Map(prevIds);
                  next.set(m.id, now);
                  return next;
                });
              }
            } else {
              // Reset dismissal if they return to normal
              if (dismissedIds.has(m.id)) {
                setDismissedIds(prev => {
                  const next = new Set(prev);
                  next.delete(m.id);
                  return next;
                });
              }
            }

            return { ...m, healthData: update.healthData };
          }
          return m;
        }));
      } catch (err) {
        console.error("Pulse error", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [authState.token, alertedIds, dismissedIds]);

  useEffect(() => {
    if (authState.token) {
      fetchMembers();
    }
  }, [authState.token, fetchMembers]);

  return (
    <AppContext.Provider
      value={{
        authState,
        members,
        dismissedIds,
        login,
        logout,
        fetchMembers,
        updateMember,
        deleteMember,
        addMember,
        markAttendance,
        sendFeesReminder,
        dismissAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
