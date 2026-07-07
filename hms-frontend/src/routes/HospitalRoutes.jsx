import React, { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import HospitalManagement, { CrudTab, TAB_CONFIG_MAP } from "../pages/HospitalManagement/Hospitalmanagement";
import DashboardPage from "../pages/HospitalManagement/Dashboard";
import AppointmentManagement from "../pages/HospitalManagement/appointment/AppointmentManagement";
import CommunicationDashboard from "../pages/communication/CommunicationDashboard";
import WorkflowDashboard from "../pages/HospitalManagement/workflow/WorkflowDashboard";
import DynamicFormBuilderDashboard from "../pages/HospitalManagement/forms/DynamicFormBuilderDashboard";

const AnalyticsStudio = lazy(() => import("../pages/HospitalManagement/AnalyticsStudio"));
const DashboardBuilder = lazy(() => import("../pages/HospitalManagement/DashboardBuilder"));
const DashboardRenderer = lazy(() => import("../pages/HospitalManagement/DashboardRenderer"));

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "calc(100vh - 52px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--hm-bg, #0A1628)",
      color: "#34D399", fontSize: 14,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600, gap: 10,
    }}>
      <span style={{ animation: "spin 0.8s linear infinite", display: "inline-flex" }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </span>
      Loading module…
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

export default function HospitalRoutes() {
  const { tab } = useParams();

  // analytics → custom analytics dashboards and builder
  if (tab === "analytics") {
    const pathParts = window.location.pathname.split("/hospital/analytics/")[1];
    if (pathParts) {
      const parts = pathParts.split("/");
      const action = parts[0];
      const id = parts[1];
      if (action === "create" || action === "edit") {
        return (
          <Suspense fallback={<LoadingScreen />}>
            <DashboardBuilder dashboardId={id} />
          </Suspense>
        );
      }
      if (action === "view") {
        return (
          <Suspense fallback={<LoadingScreen />}>
            <DashboardRenderer dashboardId={id} />
          </Suspense>
        );
      }
    }
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AnalyticsStudio />
      </Suspense>
    );
  }

  // dashboard → dedicated Dashboard page
  if (tab === "dashboard") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <DashboardPage />
      </Suspense>
    );
  }

  // workflow → Smart Automation & Workflow Engine
  if (tab === "workflow") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <WorkflowDashboard />
      </Suspense>
    );
  }

  // appointment → dedicated Appointment Management page
  if (tab === "appointment") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AppointmentManagement />
      </Suspense>
    );
  }

  // communication → Communication Hub dashboard
  if (tab === "communication") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <CommunicationDashboard />
      </Suspense>
    );
  }

  // forms → Dynamic Form Builder Dashboard
  if (tab === "forms") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <DynamicFormBuilderDashboard />
      </Suspense>
    );
  }

  // any tab with a config → CrudTab directly (no wrapper needed)
  const config = TAB_CONFIG_MAP[tab];
  if (config) {
    return <CrudTab key={tab} config={config} />;
  }

  // fallback
  return <DashboardPage />;
}