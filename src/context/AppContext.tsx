import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AuthState, Member, User } from "../types";

interface AppContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  members: Member[];
  addMember: (member: Omit<Member, "id" | "attendance" | "healthData" | "feesStatus">) => Promise<void>;
  updateMember: (memberId: string, updatedFields: Partial<Member>) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  markAttendance: (memberId: string, date: string, status: boolean) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  emergencyAlertIds: Set<string>;
  dismissedIds: Set<string>;
  dismissAlert: (memberId: string) => void;
  sendFeesReminder: (memberId: string, pendingFees: number, dueDate: string) => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptyAuthState: AuthState = { user: null, token: null, ready: false };
const AUTH_STORAGE_KEY = "healthsync_auth";

type AuthResponse = {
  token: string;
  user: User;
};

const getStoredAuthState = (): AuthState => {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return { ...emptyAuthState, ready: true };

    const parsed = JSON.parse(stored) as AuthResponse;
    if (!parsed.token || !parsed.user) return { ...emptyAuthState, ready: true };
    return { user: parsed.user, token: parsed.token, ready: true };
  } catch (error) {
    console.error("Could not restore saved login:", error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { ...emptyAuthState, ready: true };
  }
};

const saveAuthState = (authResponse: AuthResponse) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authResponse));
};

const getStoredToken = () => {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return (JSON.parse(stored) as AuthResponse).token || null;
  } catch {
    return null;
  }
};

const apiRequest = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getStoredToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const step = (min: number, max: number) => {
  const direction = Math.random() < 0.5 ? -1 : 1;
  return direction * Math.floor(Math.random() * (max - min + 1) + min);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthStateValue] = useState<AuthState>(emptyAuthState);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeCriticalAlerts, setActiveCriticalAlerts] = useState<Map<string, boolean>>(new Map());
  const [emergencyAlertIds, setEmergencyAlertIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [memberTicks, setMemberTicks] = useState<Record<string, number>>({});
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("healthsync-theme");
      if (saved === "dark" || saved === "light") return saved;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("healthsync-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  }, []);

  // Refs to give the health-pulse interval access to latest state
  // without listing them as useEffect dependencies (which would
  // recreate the interval on every tick and freeze the UI).
  const membersRef = useRef(members);
  membersRef.current = members;

  const memberTicksRef = useRef(memberTicks);
  memberTicksRef.current = memberTicks;

  const activeCriticalAlertsRef = useRef(activeCriticalAlerts);
  activeCriticalAlertsRef.current = activeCriticalAlerts;

  const dismissedIdsRef = useRef(dismissedIds);
  dismissedIdsRef.current = dismissedIds;

  const setAuthState = useCallback((state: AuthState) => {
    setAuthStateValue(state);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authResponse = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveAuthState(authResponse);
    setAuthStateValue({ ...authResponse, ready: true });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const authResponse = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    saveAuthState(authResponse);
    setAuthStateValue({ ...authResponse, ready: true });
  }, []);

  const logout = useCallback(async () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthStateValue({ user: null, token: null, ready: true });
    setMembers([]);
    setDismissedIds(new Set());
    setEmergencyAlertIds(new Set());
    setActiveCriticalAlerts(new Map());
    setMemberTicks({});
  }, []);

  const dismissAlert = useCallback((memberId: string) => {
    setDismissedIds(prev => new Set(prev).add(memberId));
    setEmergencyAlertIds(prev => {
      const next = new Set(prev);
      next.delete(memberId);
      return next;
    });
    setActiveCriticalAlerts(prev => {
      const next = new Map(prev);
      next.delete(memberId);
      return next;
    });
  }, []);

  const sendFeesReminder = useCallback(async (memberId: string, pendingFees: number, dueDate: string) => {
    const member = membersRef.current.find(item => item.id === memberId);
    if (!member) {
      toast.error("Member not found.");
      return;
    }

    try {
      const token = getStoredToken();
      const response = await fetch("/api/fees/remind", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ member, pendingFees, dueDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send fees reminder");
      }

      toast.success("Fees reminder sent successfully!");
    } catch (error) {
      console.error("Error sending fees reminder:", error);
      toast.error(`Failed to send fees reminder: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, []);

  const addMember = useCallback(async (newMemberData: Omit<Member, "id" | "attendance" | "healthData" | "feesStatus">) => {
    if (!getStoredToken()) {
      toast.error("Please sign in first.");
      return;
    }

    try {
      const createdMember = await apiRequest<Member & { _emailStatus?: { memberEmailSent: boolean; emergencyEmailSent: boolean; memberEmailError?: string; emergencyEmailError?: string } }>("/api/members", {
        method: "POST",
        body: JSON.stringify({
          ...newMemberData,
          feesStatus: "UNPAID",
        }),
      });

      // Extract email status and strip it from the member object
      const { _emailStatus, ...memberData } = createdMember as any;
      setMembers(prev => [memberData, ...prev]);
      toast.success("Member registered successfully!");

      // Show email notification toasts
      if (_emailStatus) {
        setTimeout(() => {
          if (_emailStatus.memberEmailSent) {
            toast.success(`📧 Welcome email sent to ${newMemberData.email}`, { duration: 5000 });
          } else if (_emailStatus.memberEmailError) {
            toast.error(`Email to member failed: ${_emailStatus.memberEmailError}`, { duration: 6000 });
          }
        }, 600);

        setTimeout(() => {
          if (_emailStatus.emergencyEmailSent) {
            toast.success(`🛡️ Emergency contact notified at ${newMemberData.emergencyContact?.email}`, { duration: 5000 });
          } else if (_emailStatus.emergencyEmailError) {
            toast.error(`Emergency contact email failed: ${_emailStatus.emergencyEmailError}`, { duration: 6000 });
          }
        }, 1400);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Network error during member registration.");
      throw error;
    }
  }, []);

  const updateMember = useCallback(async (memberId: string, updatedFields: Partial<Member>) => {
    if (!getStoredToken()) {
      toast.error("Please sign in first.");
      return;
    }

    try {
      const updatedMember = await apiRequest<Member>(`/api/members/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(updatedFields),
      });
      setMembers(prev => prev.map(member => member.id === memberId ? updatedMember : member));
      toast.success("Member updated successfully!");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Network error during member update.");
      throw error;
    }
  }, []);

  const deleteMember = useCallback(async (memberId: string) => {
    if (!getStoredToken()) {
      toast.error("Please sign in first.");
      return;
    }

    try {
      await apiRequest<{ success: boolean }>(`/api/members/${memberId}`, {
        method: "DELETE",
      });
      setMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success("Member deleted successfully!");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Network error during member deletion.");
      throw error;
    }
  }, []);

  const markAttendance = useCallback(async (memberId: string, date: string, status: boolean) => {
    if (!getStoredToken()) {
      toast.error("Please sign in first.");
      return;
    }

    const member = membersRef.current.find(item => item.id === memberId);
    if (!member) {
      toast.error("Member not found.");
      return;
    }

    const attendance = [...(member.attendance || [])];
    const existingIndex = attendance.findIndex(record => record.date === date);

    if (existingIndex >= 0) {
      attendance[existingIndex] = { date, status };
    } else {
      attendance.push({ date, status });
    }

    try {
      await apiRequest<Member>(`/api/attendance/${memberId}`, {
        method: "PUT",
        body: JSON.stringify({ date, status }),
      });
      setMembers(prev => prev.map(item => item.id === memberId ? { ...item, attendance } : item));
      toast.success(`Attendance marked as ${status ? "Present" : "Absent"}!`);
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Network error during attendance update.");
      throw error;
    }
  }, []);

  // --- Initialization ---
  useEffect(() => {
    setAuthStateValue(getStoredAuthState());
  }, []);

  // --- Fetch members when auth changes ---
  useEffect(() => {
    if (!authState.ready || !authState.token) {
      if (authState.ready) setMembers([]);
      return undefined;
    }

    let cancelled = false;

    apiRequest<Member[]>("/api/members")
      .then(fetchedMembers => {
        if (!cancelled) setMembers(fetchedMembers);
      })
      .catch(error => {
        if (!cancelled) {
          console.error("Error loading members:", error);
          toast.error("Could not load members.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authState.ready, authState.token]);

  // --- Health-pulse simulation ---
  // Uses refs so the interval is created ONCE per login session
  // instead of being recreated every 3 seconds (which froze the UI).
  useEffect(() => {
    if (!authState.token) return undefined;

    const intervalId = setInterval(() => {
      // Use functional updater so we always work with the LATEST members state.
      // This prevents the pulse from overwriting edits made by updateMember.
      setMembers(prevMembers => {
        if (prevMembers.length === 0) return prevMembers;

        const currentTicks = memberTicksRef.current;
        const currentAlerts = activeCriticalAlertsRef.current;
        const currentDismissed = dismissedIdsRef.current;

        const newMemberTicksState: Record<string, number> = {};
        const criticalAlertsToTrigger: { member: Member; hr: number; spo2: number }[] = [];

        const updated = prevMembers.map(member => {
          const currentHr = member.healthData?.hr || 0;
          const currentSpo2 = member.healthData?.spo2 || 0;

          let tick = (currentTicks[member.id] !== undefined ? currentTicks[member.id] : Math.floor(Math.random() * 40));
          tick++;

          const shouldSpike = tick >= 50;

          const hr = shouldSpike ? 106 + Math.floor(Math.random() * 10) : clamp(currentHr + step(2, 3), 60, 100);
          const spo2 = shouldSpike ? 90 + Math.floor(Math.random() * 3) : clamp(currentSpo2 + step(0, 1), 94, 100);

          const isCritical = hr > 105 || hr < 50 || spo2 < 93;

          newMemberTicksState[member.id] = shouldSpike ? 0 : tick;

          // Only update healthData — preserve all other member fields (name, email, etc.)
          const updatedMember = { ...member, healthData: { hr, spo2 } };

          if (isCritical && !currentAlerts.has(member.id) && !currentDismissed.has(member.id)) {
            criticalAlertsToTrigger.push({ member: updatedMember, hr, spo2 });
          }

          return updatedMember;
        });

        setMemberTicks(newMemberTicksState);

        // Fire emergency alerts outside the state updater
        if (criticalAlertsToTrigger.length > 0) {
          setTimeout(() => {
            criticalAlertsToTrigger.forEach(({ member, hr, spo2 }) => {
              setActiveCriticalAlerts(prev => new Map(prev).set(member.id, true));
              setEmergencyAlertIds(prev => new Set(prev).add(member.id));

              fetch("/api/emergency/alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member, hr, spo2 }),
              })
                .then(res => res.json())
                .then(data => {
                  if (!data.success) {
                    console.error(`Emergency alert failed for ${member.name}:`, data.error || data);
                  }
                })
                .catch(err => {
                  console.error(`Emergency alert network error for ${member.name}:`, err);
                });
            });
          }, 0);
        }

        return updated;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [authState.token]);

  const value: AppContextType = {
    authState,
    setAuthState,
    members,
    addMember,
    updateMember,
    deleteMember,
    markAttendance,
    login,
    register,
    logout,
    emergencyAlertIds,
    dismissedIds,
    dismissAlert,
    sendFeesReminder,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};