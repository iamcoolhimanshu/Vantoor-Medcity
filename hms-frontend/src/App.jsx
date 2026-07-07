import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import PrivateRoute from "./components/layout/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HospitalRoutes from "./routes/HospitalRoutes";
import PublicFormRenderer from "./pages/HospitalManagement/forms/PublicFormRenderer";

function RootRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? "/hospital/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/public/form/:id" element={<PublicFormRenderer />} />
            <Route
              path="/hospital"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path=":tab"   element={<HospitalRoutes />} />
              <Route path=":tab/*" element={<HospitalRoutes />} />
            </Route>
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
