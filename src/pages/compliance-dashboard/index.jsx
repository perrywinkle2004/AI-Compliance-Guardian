// src/pages/compliance-dashboard/index.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);

  // camera modal state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  useEffect(() => {
    // listen for any component firing the camera:open event
    const onOpen = () => setIsCameraModalOpen(true);
    window.addEventListener('camera:open', onOpen);
    return () => window.removeEventListener('camera:open', onOpen);
  }, []);

  // central handler for when camera/upload returns a server result
  const handleCameraUploaded = (result) => {
    try {
      // tell everyone a file was processed (RiskSummaryTable listens for this)
      window.dispatchEvent(new CustomEvent('dashboard:filesProcessed', { detail: result }));
    } catch (e) {
      // ignore
    }
    // small UX feedback
    if (result && result.reply) {
      try { alert(`Scan result: ${result.reply}`); } catch(e) {}
    }
  };

  // Quick action helpers (original backend-based functions preserved)
  async function startNewScanActionBackend() {
    try {
      setQaLoading(true);
      const res = await fetch(`${API_BASE}/scan/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "manual" }) });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status} ${txt}`);
      }
      const json = await res.json();
      alert(`Scan started (id=${json.scan_id || json.id || "unknown"}). Refreshing dashboard...`);
      window.dispatchEvent(new CustomEvent('dashboard:refresh'));
      return json;
    } catch (err) {
      console.error("Start scan failed", err);
      alert("Failed to start scan: " + (err?.message || err));
    } finally {
      setQaLoading(false);
    }
  }

  async function viewRiskDetailsAction() {
    try {
      navigate('/risk-assessment-details');
    } catch (e) {
      alert("Cannot navigate: " + e?.message);
    }
  }

  async function planRemediationAction() {
    try {
      navigate('/remediation-planning');
    } catch (e) {
      alert("Cannot navigate: " + e?.message);
    }
  }

  async function generateReportsAction() {
    try {
      setQaLoading(true);
      const res = await fetch(`${API_BASE}/reports/generate?format=docx`, { method: "POST" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status} ${txt}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compliance-report.docx';
      a.click();
      URL.revokeObjectURL(url);
      alert("Report downloaded.");
    } catch (err) {
      console.error("Generate report failed", err);
      alert("Failed to generate report: " + (err?.message || err));
    } finally {
      setQaLoading(false);
    }
  }

  // This actions object is passed into the QuickActions component to override handlers.
  // The startScan action opens the camera modal (UX-first) rather than calling backend directly.
  const actions = {
    async startScan() {
      // open camera modal — QuickActions default will fallback to backend if custom handler not provided
      window.dispatchEvent(new CustomEvent('camera:open'));
      return { ok: true, opened: true };
    },
    // keep other actions available if you want to override
    viewRisk: viewRiskDetailsAction,
    planRemediation: planRemediationAction,
    generateReport: generateReportsAction,
  };

  // local quickActions used in the right-column card (keeps original look & icons)
  const quickActions = [
    {
      title: 'Start New Scan',
      description: 'Initiate comprehensive PII detection across all data sources',
      icon: 'Scan',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      action: () => window.dispatchEvent(new CustomEvent('camera:open')),
    },
    {
      title: 'View Risk Details',
      description: 'Analyze detailed risk assessments and findings',
      icon: 'Shield',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      action: viewRiskDetailsAction
    },
    {
      title: 'Plan Remediation',
      description: 'Create and manage remediation strategies',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      action: planRemediationAction
    },
    {
      title: 'Generate Reports',
      description: 'Export compliance reports and documentation',
      icon: 'FileText',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      action: generateReportsAction
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'scan_completed',
      title: 'Slack Channel Scan Completed',
      description: 'Scanned #customer-support channel - 23 PII instances found',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      icon: 'CheckCircle',
      color: 'text-success'
    },
    {
      id: 2,
      type: 'alert_triggered',
      title: 'High-Risk Alert Triggered',
      description: 'Critical PII detected in email attachments',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      icon: 'AlertTriangle',
      color: 'text-error'
    },
    {
      id: 3,
      type: 'remediation_completed',
      title: 'Remediation Task Completed',
      description: 'Successfully anonymized 156 database records',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'Zap',
      color: 'text-primary'
    },
    {
      id: 4,
      type: 'report_generated',
      title: 'Compliance Report Generated',
      description: 'Monthly GDPR compliance report ready for review',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: 'FileText',
      color: 'text-accent'
    }
  ];

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="mb-6">
            <BreadcrumbNavigation />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Monitor PII risks and compliance status across all data sources
              </p>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={() => window.dispatchEvent(new CustomEvent('dashboard:refresh'))}>
                Refresh Data
              </Button>
              <Button variant="default" iconName="Settings" iconPosition="left">
                Dashboard Settings
              </Button>
            </div>
          </div>

          {/* Drag & Drop uploader */}
          <DragDropTop onProcessed={(res) => {
            try {
              window.dispatchEvent(new CustomEvent('dashboard:filesProcessed', { detail: res }));
            } catch (e) { /* ignore */ }
          }} />

          <MetricsOverview />
          <PriorityAlerts />
          <ComplianceChart />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <RiskSummaryTable />
            </div>

            <div className="space-y-6">
              {/* Right-side Quick Actions card: uses inline quickActions (keeps your original look) */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        try {
                          await action.action();
                        } catch (e) {
                          console.error("QuickAction error", e);
                          alert("Action failed: " + (e?.message || e));
                        }
                      }}
                      disabled={qaLoading}
                      className="w-full p-4 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors duration-200 group"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon name={action.icon} size={18} className={action.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                            {action.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                        <Icon
                          name="ArrowRight"
                          size={16}
                          className="text-muted-foreground group-hover:text-primary transition-colors duration-200"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity card */}
              <RecentActivity items={recentActivity} onViewAll={() => navigate('/activity')} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">2.3TB</div>
                <div className="text-sm text-muted-foreground">Data Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <div className="text-sm text-muted-foreground">Records Anonymized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring Active</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
      />

      {/* Camera Scan Modal (new) */}
      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onUploaded={(res) => {
          handleCameraUploaded(res);
          setIsCameraModalOpen(false);
        }}
      />

      {/* Chat widget (floating assistant) */}
      <ChatWidget backendUrl={API_BASE} />
    </div>
  );
};

export default ComplianceDashboard;
