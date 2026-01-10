import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import RiskSummaryCards from './components/RiskSummaryCards';
import FindingsTable from './components/FindingsTable';
import FilterControls from './components/FilterControls';
import RemediationPanel from './components/RemediationPanel';
import RiskVisualization from './components/RiskVisualization';
import PredictiveComplianceInsights from './components/PredictiveComplianceInsights';

const RiskAssessmentDetails = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('findings');
  const [filteredFindings, setFilteredFindings] = useState([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Mock risk data
  const riskData = {
    overallScore: 87,
    affectedRecords: 12847,
    piiTypes: 6,
    complianceImpact: 78
  };

  // Mock findings data
  const mockFindings = [
    {
      id: 1,
      piiType: 'SSN',
      context: `Employee record shows SSN: 123-45-6789 in payroll system`,
      confidence: 95,
      source: 'HR Database',
      sourceIcon: 'Database',
      location: '/hr/payroll/employee_records.csv:line 247',
      detectedAt: '2025-10-07T06:30:00Z'
    },
    {
      id: 2,
      piiType: 'Email',
      context: `Contact information: john.doe@company.com found in support ticket`,
      confidence: 88,
      source: 'Jira Tickets',
      sourceIcon: 'Ticket',
      location: 'SUPPORT-4521: Customer inquiry about billing',
      detectedAt: '2025-10-07T05:45:00Z'
    },
    {
      id: 3,
      piiType: 'Credit Card',
      context: `Payment method: **** **** **** 1234 stored in transaction log`,
      confidence: 92,
      source: 'Payment System',
      sourceIcon: 'CreditCard',
      location: '/payments/transactions/2025-10-06.log:entry 1847',
      detectedAt: '2025-10-06T23:15:00Z'
    },
    {
      id: 4,
      piiType: 'Phone',
      context: `Customer phone: (555) 123-4567 in support conversation`,
      confidence: 85,
      source: 'Slack Messages',
      sourceIcon: 'MessageSquare',
      location: '#customer-support channel, message ID: 1697234567',
      detectedAt: '2025-10-06T18:22:00Z'
    },
    {
      id: 5,
      piiType: 'Address',
      context: `Shipping address: 123 Main St, Anytown, ST 12345 in order details`,
      confidence: 90,
      source: 'E-commerce DB',
      sourceIcon: 'Package',
      location: '/orders/customer_orders.json:order_id 78234',
      detectedAt: '2025-10-06T14:30:00Z'
    },
    {
      id: 6,
      piiType: 'Name',
      context: `Employee name: Sarah Mitchell mentioned in code comments`,
      confidence: 78,
      source: 'Code Repository',
      sourceIcon: 'Code',
      location: '/src/utils/employee-utils.js:line 45',
      detectedAt: '2025-10-06T11:18:00Z'
    }
  ];

  // Mock remediation recommendations
  const mockRecommendations = [
    {
      id: 1,
      title: 'Anonymize SSN Data',
      strategy: 'Anonymization',
      priority: 'Critical',
      description: 'Replace Social Security Numbers with anonymized tokens while maintaining data utility for analytics',
      affectedRecords: 1247,
      estimatedTime: '2-3 days',
      riskReduction: 85,
      steps: [
        'Identify all SSN occurrences across data sources',
        'Generate secure anonymization tokens',
        'Replace SSN values with tokens',
        'Update data access policies',
        'Verify anonymization effectiveness'
      ],
      complianceImpact: ['GDPR Article 25 compliance', 'CCPA data minimization', 'SOX data protection']
    },
    {
      id: 2,
      title: 'Encrypt Email Communications',
      strategy: 'Encryption',
      priority: 'High',
      description: 'Implement end-to-end encryption for email data containing personal information',
      affectedRecords: 3456,
      estimatedTime: '1-2 weeks',
      riskReduction: 72,
      steps: [
        'Deploy encryption infrastructure',
        'Encrypt existing email archives',
        'Configure automatic encryption policies',
        'Train staff on encrypted communication',
        'Monitor encryption compliance'
      ],
      complianceImpact: ['HIPAA encryption standards', 'GDPR data protection', 'Industry best practices']
    },
    {
      id: 3,
      title: 'Implement Data Masking',
      strategy: 'Masking',
      priority: 'Medium',
      description: 'Apply dynamic data masking to credit card and payment information in non-production environments',
      affectedRecords: 892,
      estimatedTime: '3-5 days',
      riskReduction: 68,
      steps: [
        'Configure masking rules for payment data',
        'Apply masking to development databases',
        'Test application functionality',
        'Deploy to staging environments',
        'Monitor masking effectiveness'
      ],
      complianceImpact: ['PCI DSS compliance', 'Data security standards', 'Development best practices']
    }
  ];

  const tabs = [
    { id: 'findings', label: 'Detailed Findings', icon: 'Search', count: mockFindings?.length },
    { id: 'visualization', label: 'Risk Analysis', icon: 'BarChart3' },
    { id: 'predictive', label: 'Predictive Insights', icon: 'TrendingUp' },
    { id: 'remediation', label: 'Recommendations', icon: 'CheckCircle', count: mockRecommendations?.length }
  ];

  useEffect(() => {
    setFilteredFindings(mockFindings);
  }, []);

  const handleFiltersChange = (filters) => {
    let filtered = [...mockFindings];

    // Apply search filter
    if (filters?.searchTerm) {
      const searchTerm = filters?.searchTerm?.toLowerCase();
      filtered = filtered?.filter(finding =>
        finding?.context?.toLowerCase()?.includes(searchTerm) ||
        finding?.source?.toLowerCase()?.includes(searchTerm) ||
        finding?.location?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Apply PII type filter
    if (filters?.piiType) {
      filtered = filtered?.filter(finding => finding?.piiType === filters?.piiType);
    }

    // Apply confidence level filter
    if (filters?.confidenceLevel) {
      switch (filters?.confidenceLevel) {
        case 'high':
          filtered = filtered?.filter(finding => finding?.confidence >= 90);
          break;
        case 'medium':
          filtered = filtered?.filter(finding => finding?.confidence >= 70 && finding?.confidence < 90);
          break;
        case 'low':
          filtered = filtered?.filter(finding => finding?.confidence < 70);
          break;
      }
    }

    // Apply data source filter
    if (filters?.dataSource) {
      const sourceMap = {
        'slack': 'Slack Messages',
        'jira': 'Jira Tickets',
        'email': 'Email Communications',
        'contracts': 'Contract Documents',
        'code': 'Code Repository'
      };
      filtered = filtered?.filter(finding => finding?.source === sourceMap?.[filters?.dataSource]);
    }

    setFilteredFindings(filtered);
  };

  const handleMarkFalsePositive = (findingId) => {
    console.log(`Marking finding ${findingId} as false positive`);
    // Implementation would update finding status
  };

  const handleApproveRemediation = (findingId) => {
    console.log(`Approving remediation for finding ${findingId}`);
    // Implementation would approve remediation plan
  };

  const handleApproveRecommendation = (recommendationId) => {
    console.log(`Approving recommendation ${recommendationId}`);
    navigate('/remediation-planning');
  };

  const handleCustomizeRemediation = (recommendationId) => {
    console.log(`Customizing recommendation ${recommendationId}`);
    navigate('/remediation-planning');
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      navigate('/compliance-reports');
    }, 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'findings':
        return (
          <div className="space-y-6">
            <FilterControls
              onFiltersChange={handleFiltersChange}
              totalResults={filteredFindings?.length}
            />
            <FindingsTable
              findings={filteredFindings}
              onMarkFalsePositive={handleMarkFalsePositive}
              onApproveRemediation={handleApproveRemediation}
            />
          </div>
        );
      
      case 'visualization':
        return <RiskVisualization riskData={riskData} />;
      
      case 'predictive':
        return <PredictiveComplianceInsights />;
      
      case 'remediation':
        return (
          <RemediationPanel
            recommendations={mockRecommendations}
            onApproveRecommendation={handleApproveRecommendation}
            onCustomizeRemediation={handleCustomizeRemediation}
          />
        );
      
      default:
        return null;
    }
  };

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
                <h1 className="text-3xl font-bold text-foreground">Risk Assessment Details</h1>
                <p className="text-muted-foreground mt-2">
                  Comprehensive analysis of detected PII risks with detailed findings and remediation strategies
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleGenerateReport}
                  loading={isGeneratingReport}
                >
                  Generate Report
                </Button>
                <Button
                  variant="default"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => navigate('/remediation-planning')}
                >
                  Plan Remediation
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Summary Cards */}
          <RiskSummaryCards riskData={riskData} />

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Content - 3 columns */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="bg-card border border-border rounded-lg mb-6">
                <div className="border-b border-border">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`
                          flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                          ${activeTab === tab?.id
                            ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                          }
                        `}
                      >
                        <Icon name={tab?.icon} size={16} />
                        <span>{tab?.label}</span>
                        {tab?.count && (
                          <span className={`
                            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${activeTab === tab?.id
                              ? 'bg-primary/10 text-primary' :'bg-muted text-muted-foreground'
                            }
                          `}>
                            {tab?.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-96">
                {renderTabContent()}
              </div>
            </div>

            {/* Right Sidebar - 1 column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="AlertTriangle"
                    iconPosition="left"
                    onClick={() => navigate('/compliance-dashboard')}
                  >
                    View Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Database"
                    iconPosition="left"
                    onClick={() => navigate('/data-source-management')}
                  >
                    Manage Sources
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="FileText"
                    iconPosition="left"
                    onClick={() => navigate('/compliance-reports')}
                  >
                    View Reports
                  </Button>
                </div>
              </div>

              {/* Risk Summary */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Assessment Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Scan Completed</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date()?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data Sources</span>
                    <span className="text-sm font-medium text-foreground">5 systems</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing Time</span>
                    <span className="text-sm font-medium text-foreground">2.3 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Scan</span>
                    <span className="text-sm font-medium text-foreground">Tomorrow 9:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">GDPR</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                      At Risk
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CCPA</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
                      Non-Compliant
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">HIPAA</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                      Compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentDetails;