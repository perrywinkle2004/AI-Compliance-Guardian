import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ReportCard from './components/ReportCard';
import ReportFilters from './components/ReportFilters';
import ReportGenerationPanel from './components/ReportGenerationPanel';
import ScheduledReportsPanel from './components/ScheduledReportsPanel';
import ReportPreviewModal from './components/ReportPreviewModal';

const ComplianceReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    framework: 'all',
    dataSource: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [isGenerationPanelOpen, setIsGenerationPanelOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');
  const [generatingReports, setGeneratingReports] = useState([]);

  // Mock reports data
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        title: 'Q4 2024 GDPR Compliance Summary',
        category: 'GDPR Compliance',
        type: 'gdpr',
        description: 'Comprehensive quarterly assessment of GDPR compliance status including data processing activities, rights requests, and breach incidents with detailed remediation recommendations.',
        generatedDate: '2024-12-15T10:30:00Z',
        coveragePeriod: 'Oct 1 - Dec 31, 2024',
        fileSize: 2847392,
        formats: ['pdf', 'excel'],
        status: 'ready',
        isNew: true
      },
      {
        id: 2,
        title: 'PII Detection Analytics - November 2024',
        category: 'PII Analytics',
        type: 'pii',
        description: 'Monthly analysis of personally identifiable information detected across all integrated data sources with risk scoring and anonymization recommendations.',
        generatedDate: '2024-12-01T14:15:00Z',
        coveragePeriod: 'November 2024',
        fileSize: 1923847,
        formats: ['pdf', 'csv'],
        status: 'ready',
        isNew: false
      },
      {
        id: 3,
        title: 'Remediation Progress Report',
        category: 'Remediation Tracking',
        type: 'remediation',
        description: 'Comprehensive tracking of all remediation activities including completion status, timeline adherence, and effectiveness metrics for risk mitigation efforts.',
        generatedDate: '2024-11-28T09:45:00Z',
        coveragePeriod: 'Q4 2024',
        fileSize: 3456789,
        formats: ['pdf', 'excel', 'json'],
        status: 'ready',
        isNew: false
      },
      {
        id: 4,
        title: 'Audit Trail Documentation',
        category: 'Audit & Compliance',
        type: 'audit',
        description: 'Complete audit trail documentation for compliance verification including user activities, system changes, and data access logs with regulatory compliance mapping.',
        generatedDate: '2024-11-25T16:20:00Z',
        coveragePeriod: 'Last 90 days',
        fileSize: 5234567,
        formats: ['pdf', 'csv', 'json'],
        status: 'ready',
        isNew: false
      },
      {
        id: 5,
        title: 'Custom Risk Assessment Template',
        category: 'Custom Reports',
        type: 'custom',
        description: 'Customizable template for generating targeted risk assessments with configurable parameters for specific compliance frameworks and data sources.',
        generatedDate: null,
        coveragePeriod: 'Configurable',
        fileSize: 0,
        formats: ['pdf', 'excel'],
        status: 'template',
        isNew: false
      },
      {
        id: 6,
        title: 'CCPA Compliance Report Template',
        category: 'CCPA Compliance',
        type: 'custom',
        description: 'Pre-configured template for California Consumer Privacy Act compliance reporting with automated data collection and privacy rights tracking.',
        generatedDate: null,
        coveragePeriod: 'Configurable',
        fileSize: 0,
        formats: ['pdf', 'excel'],
        status: 'template',
        isNew: true
      }
    ];

    const mockScheduledReports = [
      {
        id: 1,
        name: 'Monthly GDPR Summary',
        reportType: 'gdpr',
        frequency: 'monthly',
        recipients: ['compliance@company.com', 'legal@company.com'],
        enabled: true,
        nextRun: new Date(2025, 0, 15, 9, 0, 0)
      },
      {
        id: 2,
        name: 'Weekly PII Detection Report',
        reportType: 'pii',
        frequency: 'weekly',
        recipients: ['security@company.com'],
        enabled: true,
        nextRun: new Date(2025, 0, 13, 8, 0, 0)
      },
      {
        id: 3,
        name: 'Quarterly Audit Documentation',
        reportType: 'audit',
        frequency: 'quarterly',
        recipients: ['audit@company.com', 'compliance@company.com'],
        enabled: false,
        nextRun: new Date(2025, 3, 1, 10, 0, 0)
      }
    ];

    const mockSavedFilters = [
      {
        id: 1,
        name: 'High Priority Reports',
        filters: {
          search: '',
          type: 'all',
          framework: 'gdpr',
          dataSource: 'all',
          status: 'ready',
          dateRange: { start: '', end: '' }
        }
      },
      {
        id: 2,
        name: 'PII Analytics Only',
        filters: {
          search: '',
          type: 'pii',
          framework: 'all',
          dataSource: 'all',
          status: 'all',
          dateRange: { start: '', end: '' }
        }
      }
    ];

    setReports(mockReports);
    setFilteredReports(mockReports);
    setScheduledReports(mockScheduledReports);
    setSavedFilters(mockSavedFilters);
  }, []);

  // Filter reports based on current filters
  useEffect(() => {
    let filtered = reports?.filter(report => {
      const matchesSearch = !filters?.search || 
        report?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        report?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase());
      
      const matchesType = filters?.type === 'all' || report?.type === filters?.type;
      const matchesStatus = filters?.status === 'all' || report?.status === filters?.status;
      
      const matchesDateRange = !filters?.dateRange?.start || !filters?.dateRange?.end || 
        (report?.generatedDate && 
         new Date(report.generatedDate) >= new Date(filters.dateRange.start) &&
         new Date(report.generatedDate) <= new Date(filters.dateRange.end));

      return matchesSearch && matchesType && matchesStatus && matchesDateRange;
    });

    setFilteredReports(filtered);
  }, [reports, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      framework: 'all',
      dataSource: 'all',
      status: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const handleSaveFilters = () => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      const newSavedFilter = {
        id: Date.now(),
        name: filterName,
        filters: { ...filters }
      };
      setSavedFilters(prev => [...prev, newSavedFilter]);
    }
  };

  const handleReportGeneration = (config) => {
    const newReport = {
      id: Date.now(),
      title: config?.title,
      category: 'Custom Reports',
      type: config?.reportType,
      description: `Custom generated report covering ${config?.dataSources?.join(', ')} from ${config?.dateRange?.start} to ${config?.dateRange?.end}`,
      generatedDate: new Date()?.toISOString(),
      coveragePeriod: `${config?.dateRange?.start} - ${config?.dateRange?.end}`,
      fileSize: Math.floor(Math.random() * 5000000) + 1000000,
      formats: config?.outputFormats,
      status: 'generating',
      isNew: true
    };

    setReports(prev => [newReport, ...prev]);
    setGeneratingReports(prev => [...prev, newReport?.id]);

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev?.map(report => 
        report?.id === newReport?.id 
          ? { ...report, status: 'ready' }
          : report
      ));
      setGeneratingReports(prev => prev?.filter(id => id !== newReport?.id));
    }, 5000);
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setIsPreviewOpen(true);
  };

  const handleDownload = (report) => {
    console.log('Downloading report:', report?.title);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report?.title?.replace(/\s+/g, '_')}.pdf`;
    link?.click();
  };

  const handleScheduleUpdate = (scheduleId, updates) => {
    setScheduledReports(prev => prev?.map(schedule =>
      schedule?.id === scheduleId ? { ...schedule, ...updates } : schedule
    ));
  };

  const handleScheduleDelete = (scheduleId) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      setScheduledReports(prev => prev?.filter(schedule => schedule?.id !== scheduleId));
    }
  };

  const handleScheduleCreate = (newSchedule) => {
    setScheduledReports(prev => [...prev, newSchedule]);
  };

  const tabs = [
    { id: 'reports', label: 'Reports Library', icon: 'FileText' },
    { id: 'scheduled', label: 'Scheduled Reports', icon: 'Calendar' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <BreadcrumbNavigation />
            <div className="flex items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Compliance Reports</h1>
                <p className="text-muted-foreground mt-2">
                  Generate, manage, and distribute comprehensive compliance documentation
                </p>
              </div>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsGenerationPanelOpen(true)}
              >
                Generate Report
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }
                  `}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'reports' && (
            <>
              {/* Filters */}
              <ReportFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                onSaveFilters={handleSaveFilters}
                savedFilters={savedFilters}
              />

              {/* Reports Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Reports Library ({filteredReports?.length})
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {generatingReports?.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        <span>{generatingReports?.length} generating...</span>
                      </div>
                    )}
                  </div>
                </div>

                {filteredReports?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or generate a new report
                    </p>
                    <Button
                      variant="outline"
                      iconName="Plus"
                      iconPosition="left"
                      onClick={() => setIsGenerationPanelOpen(true)}
                    >
                      Generate New Report
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports?.map((report) => (
                      <ReportCard
                        key={report?.id}
                        report={report}
                        onPreview={handlePreview}
                        onGenerate={handleReportGeneration}
                        onDownload={handleDownload}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'scheduled' && (
            <ScheduledReportsPanel
              scheduledReports={scheduledReports}
              onUpdateSchedule={handleScheduleUpdate}
              onDeleteSchedule={handleScheduleDelete}
              onCreateSchedule={handleScheduleCreate}
            />
          )}
        </div>
      </main>
      {/* Modals */}
      <ReportGenerationPanel
        isOpen={isGenerationPanelOpen}
        onClose={() => setIsGenerationPanelOpen(false)}
        onGenerate={handleReportGeneration}
      />
      <ReportPreviewModal
        report={selectedReport}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedReport(null);
        }}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default ComplianceReports;