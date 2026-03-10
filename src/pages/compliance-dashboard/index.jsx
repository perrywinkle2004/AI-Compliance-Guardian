// src/pages/compliance-dashboard/index.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import MetricsOverview from './components/MetricsOverview';
import PriorityAlerts from './components/PriorityAlerts';
import ComplianceChart from './components/ComplianceChart.jsx';
import RiskSummaryTable from './components/RiskSummaryTable';
import Button from '../../components/ui/Button';
import FileUploadModal from './components/FileUploadModal';
import ChatWidget from '../../components/ChatWidget';
import DragDropTop from './components/DragDropTop';
import CameraScanModal from './components/CameraScanModal';
import RecentActivity from './components/RecentActivity';
import { useAuth } from '../../context/AuthContext';

const API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  /* ===== ACTIVITY STATE ===== */
  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  /* ===== SETTINGS STATE ===== */
  const [theme, setTheme] = useState('light');
  const [unitPrefix, setUnitPrefix] = useState('normal');
  const [density, setDensity] = useState('normal');
  const [fontStyle, setFontStyle] = useState('default');

  /* ===== FORCE RE-READ SETTINGS ON NAVIGATION ===== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setTheme(params.get('theme') || localStorage.getItem('dashboardTheme') || 'light');
    setUnitPrefix(params.get('units') || localStorage.getItem('dashboardUnits') || 'normal');
    setDensity(params.get('density') || localStorage.getItem('dashboardDensity') || 'normal');
    setFontStyle(params.get('font') || localStorage.getItem('dashboardFont') || 'default');
  }, [location]);

  /* ===== APPLY VISUAL SETTINGS ===== */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', fontStyle);
  }, [theme, fontStyle]);

  /* ===== CAMERA EVENT ===== */
  useEffect(() => {
    const onOpen = () => setIsCameraModalOpen(true);
    window.addEventListener('camera:open', onOpen);
    return () => window.removeEventListener('camera:open', onOpen);
  }, []);

  /* ===== FETCH ACTIVITY ===== */
  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      try {
        const token = user?.token || localStorage.getItem('token');
        const res = await fetch(
          `${API_BASE}/activity?limit=5`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setActivityItems(Array.isArray(data) ? data : []);
      } catch {
        // silently ignore network errors for the widget
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    }

    fetchActivity();
    const timer = setInterval(fetchActivity, 30_000); // refresh every 30 s

    // Also refresh when a dashboard:refresh event fires (e.g. after file upload)
    const onRefresh = () => fetchActivity();
    window.addEventListener('dashboard:refresh', onRefresh);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('dashboard:refresh', onRefresh);
    };
  }, [user]);

  const handleRefreshDashboard = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen bg-background ${density === 'compact' ? 'text-sm' : ''}`}>
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <BreadcrumbNavigation />

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                {isAdmin ? "Compliance Dashboard" : "User Portal"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isAdmin ? "Monitor PII risks and compliance status" : "Manage your documents and compliance reports"}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={handleRefreshDashboard}>
                Refresh Data
              </Button>

              {isAdmin && (
                <Button onClick={() => navigate('/dashboard-settings')}>
                  Dashboard Settings
                </Button>
              )}
            </div>
          </div>

          <DragDropTop />

          <MetricsOverview unitPrefix={unitPrefix} />

          {isAdmin && (
            <>
              <PriorityAlerts />
              <ComplianceChart />
              <RiskSummaryTable />
            </>
          )}

          <RecentActivity
            items={activityItems}
            loading={activityLoading}
            onViewAll={() => navigate('/activity')}
          />
        </div>
      </main>

      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
      />

      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />

      <ChatWidget backendUrl={API_BASE} />
    </div>
  );
};

export default ComplianceDashboard;
