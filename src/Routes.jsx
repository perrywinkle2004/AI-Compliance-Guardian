// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";

import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";

import ComplianceReports from "./pages/compliance-reports";
import DataSourceManagement from "./pages/data-source-management";

import RiskAssessmentDetails from "./pages/risk-assessment-details";
import ComplianceDashboard from "./pages/compliance-dashboard";
import RemediationPlanning from "./pages/remediation-planning";
import ActivityPage from "./pages/activity";
import DashboardSettings from "./pages/dashboard-settings";

/* 🔹 NEW IMPORTS */
import AlertDetails from "./pages/alerts/AlertDetails";
import AlertsList from "./pages/alerts/AlertsList";
import RemediationPage from "./pages/remediation/RemediationPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin-dashboard" element={<ComplianceDashboard />} />
              <Route path="/dashboard-settings" element={<DashboardSettings />} />
              <Route path="/data-source-management" element={<DataSourceManagement />} />
              <Route path="/risk-assessment-details" element={<RiskAssessmentDetails />} />
              <Route path="/remediation-planning" element={<RemediationPlanning />} />
              <Route path="/alerts" element={<AlertsList />} />
              <Route path="/alerts/:id" element={<AlertDetails />} />
              <Route path="/remediation/:id" element={<RemediationPage />} />
            </Route>

            {/* USER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user-dashboard" element={<ComplianceDashboard />} />
            </Route>

            {/* SHARED ROUTES (Admin & User) */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'user']} />}>
              <Route path="/compliance-reports" element={<ComplianceReports />} />
              <Route path="/activity" element={<ActivityPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
