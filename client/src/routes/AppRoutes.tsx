import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Aircraft from "../pages/Aircraft";
import Crew from "../pages/Crew";
import Policies from "../pages/Policies";
import FlightLogs from "../pages/FlightLogs";
import { ROUTE_ACCESS } from "../data/roles";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={ROUTE_ACCESS['/dashboard']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/aircraft" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS['/aircraft']}><Aircraft /></ProtectedRoute>} />
            <Route path="/crew" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS['/crew']}><Crew /></ProtectedRoute>} />
            <Route path="/policies" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS['/policies']}><Policies /></ProtectedRoute>} />
            <Route path="/flight-logs" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS['/flight-logs']}><FlightLogs /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}