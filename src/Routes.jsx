// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ComplianceReports from './pages/compliance-reports';
import DataSourceManagement from './pages/data-source-management';
import LoginPage from './pages/login';
import RiskAssessmentDetails from './pages/risk-assessment-details';
import ComplianceDashboard from './pages/compliance-dashboard';
import RemediationPlanning from './pages/remediation-planning';

// NEW: Activity page for "View All Activity"
import ActivityPage from "./pages/activity";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<ComplianceDashboard />} />
        <Route path="/compliance-reports" element={<ComplianceReports />} />
        <Route path="/data-source-management" element={<DataSourceManagement />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/risk-assessment-details" element={<RiskAssessmentDetails />} />
        <Route path="/compliance-dashboard" element={<ComplianceDashboard />} />
        <Route path="/remediation-planning" element={<RemediationPlanning />} />

        {/* NEW: Activity route */}
        <Route path="/activity" element={<ActivityPage />} />

        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

