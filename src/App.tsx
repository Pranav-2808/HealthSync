import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BusinessInsights from "./pages/BusinessInsights";
import MemberDetail from "./pages/MemberDetail";
import Attendance from "./pages/Attendance";
import FeesManagement from "./pages/FeesManagement";
import EditMember from "./pages/EditMember";
import RegisterMember from "./pages/RegisterMember";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";

const AppLoading = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
      <div className="h-5 w-5 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
      <span className="text-sm font-semibold">Loading HealthSync...</span>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useApp();
  if (!authState.ready) return <AppLoading />;
  if (!authState.token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useApp();
  if (!authState.ready) return <AppLoading />;
  if (authState.token) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Inner layout that can access router context
const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className={isAuthPage ? "" : "min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200"}>
      {!isAuthPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/insights" element={
            <ProtectedRoute>
              <BusinessInsights />
            </ProtectedRoute>
          } />

          <Route path="/member/:id" element={
            <ProtectedRoute>
              <MemberDetail />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } />

          <Route path="/member/edit/:id" element={
            <ProtectedRoute>
              <EditMember />
            </ProtectedRoute>
          } />

          <Route path="/fees" element={<ProtectedRoute><FeesManagement /></ProtectedRoute>} />
          <Route path="/register-member" element={<ProtectedRoute><RegisterMember /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#1e293b",
              color: "#f1f5f9",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#e11d48", secondary: "#fff" },
            },
          }}
        />
        <AppLayout />
      </Router>
    </AppProvider>
  );
}