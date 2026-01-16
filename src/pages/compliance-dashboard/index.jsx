// src/pages/compliance-dashboard/index.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import MetricsOverview from './components/MetricsOverview';
import PriorityAlerts from './components/PriorityAlerts';
import ComplianceChart from './components/ComplianceChart.jsx';
import RiskSummaryTable from './components/RiskSummaryTable';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FileUploadModal from './components/FileUploadModal';
import ChatWidget from '../../components/ChatWidget';
import DragDropTop from './components/DragDropTop';
import CameraScanModal from './components/CameraScanModal';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';

const API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  /* ================= SETTINGS STATE (LOGIC ONLY) ================= */
  const [theme, setTheme] = useState('light');
  const [unitPrefix, setUnitPrefix] = useState('normal');
  const [density, setDensity] = useState('normal');
  const [fontStyle, setFontStyle] = useState('default');
  const [userRole, setUserRole] = useState('learner');

  /* ================= READ SETTINGS FROM URL + STORAGE ================= */
  useEffect(() => {
    setTheme(searchParams.get('theme') || localStorage.getItem('dashboardTheme') || 'light');
    setUnitPrefix(searchParams.get('units') || localStorage.getItem('dashboardUnits') || 'normal');
    setDensity(searchParams.get('density') || localStorage.getItem('dashboardDensity') || 'normal');
    setFontStyle(searchParams.get('font') || localStorage.getItem('dashboardFont') || 'default');
    setUserRole(localStorage.getItem('dashboardRole') || 'learner');
  }, [searchParams]);

  /* ================= APPLY VISUAL SETTINGS ================= */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', fontStyle);
  }, [theme, fontStyle]);

  /* ================= CAMERA EVENT ================= */
  useEffect(() => {
    const onOpen = () => setIsCameraModalOpen(true);
    window.addEventListener('camera:open', onOpen);
    return () => window.removeEventListener('camera:open', onOpen);
  }, []);

  /* ================= ACTIONS ================= */
  const handleRefreshDashboard = () => {
    window.location.reload();
  };

  const handleCameraUploaded = (result) => {
    try {
      window.dispatchEvent(
        new CustomEvent('dashboard:filesProcessed', { detail: result })
      );
    } catch (e) { }
  };

  /* ================= RENDER (STRUCTURE UNCHANGED) ================= */
  return (
    <div
      className={`min-h-screen bg-background ${density === 'compact' ? 'text-sm' : ''
        }`}
    >
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="mb-6">
            <BreadcrumbNavigation />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Compliance Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor PII risks and compliance status across all data sources
              </p>
            </div>

            {/* RIGHT-SIDE ACTIONS — UNCHANGED */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={handleRefreshDashboard}
              >
                Refresh Data
              </Button>

              <Button
                variant="default"
                iconName="Settings"
                iconPosition="left"
                onClick={() => navigate('/dashboard-settings')}
              >
                Dashboard Settings
              </Button>
            </div>
          </div>

          <DragDropTop />

          {/* DATA COMPONENTS (STRUCTURE SAME, SETTINGS APPLIED VIA PROPS/ATTRS) */}
          <MetricsOverview unitPrefix={unitPrefix} />
          <PriorityAlerts />
          <ComplianceChart />
          <RiskSummaryTable />

          <RecentActivity onViewAll={() => navigate('/activity')} />
        </div>
      </main>

      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
      />

      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onUploaded={(res) => {
          handleCameraUploaded(res);
          setIsCameraModalOpen(false);
        }}
      />

      <ChatWidget backendUrl={API_BASE} />
    </div>
  );
};

export default ComplianceDashboard;
