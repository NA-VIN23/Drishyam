import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Aircraft from "../pages/Aircraft";
import Crew from "../pages/Crew";
import Policies from "../pages/Policies";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/aircraft" element={<Aircraft />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/policies" element={<Policies />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}