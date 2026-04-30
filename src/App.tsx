import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MemberDetail from "./pages/MemberDetail";
import Attendance from "./pages/Attendance";
import FeesManagement from "./pages/FeesManagement";
import RegisterMember from "./pages/RegisterMember";
import Login from "./pages/Login";
import Register from "./pages/Register";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useApp();
  if (!authState.token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
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
              
              <Route path="/fees" element={
                <ProtectedRoute>
                  <FeesManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/register-member" element={
                <ProtectedRoute>
                  <RegisterMember />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}
