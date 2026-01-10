import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ReportPreviewModal = ({ report, isOpen, onClose, onDownload }) => {
  if (!isOpen || !report) return null;

  const mockPreviewData = {
    gdpr: {
      sections: [
        { title: 'Executive Summary', content: 'GDPR compliance assessment for Q4 2024 showing 94% compliance rate with 23 minor violations identified and remediated.' },
        { title: 'Data Processing Activities', content: '156 data processing activities reviewed across 12 business units with full documentation compliance.' },
        { title: 'Rights Requests', content: '47 data subject requests processed with 100% completion rate within statutory timeframes.' },
        { title: 'Breach Incidents', content: '2 minor incidents reported and resolved within 72-hour notification requirement.' }
      ],
      metrics: {
        'Compliance Score': '94%',
        'Data Subjects': '12,847',
        'Processing Activities': '156',
        'Rights Requests': '47'
      }
    },
    pii: {
      sections: [
        { title: 'PII Detection Summary', content: 'Comprehensive scan of 2.3M records identified 15,847 instances of PII across multiple data sources.' },
        { title: 'Risk Classification', content: 'High-risk PII: 234 instances, Medium-risk: 1,567 instances, Low-risk: 14,046 instances.' },
        { title: 'Data Source Analysis', content: 'Slack messages contained 45% of detected PII, followed by email data at 32%.' },
        { title: 'Remediation Status', content: '89% of high-risk PII has been successfully anonymized or encrypted.' }
      ],
      metrics: {
        'Total PII Instances': '15,847',
        'High Risk': '234',
        'Remediated': '89%',
        'Data Sources': '5'
      }
    }
  };

  const previewData = mockPreviewData?.[report?.type] || mockPreviewData?.gdpr;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">{report?.title}</h2>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(report.generatedDate)?.toLocaleDateString()} • {report?.coveragePeriod}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={() => onDownload(report)}
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-border bg-muted/30 p-4">
            <h3 className="font-medium text-card-foreground mb-4">Report Sections</h3>
            <div className="space-y-2">
              {previewData?.sections?.map((section, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  {section?.title}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-card-foreground mb-3">Key Metrics</h4>
              <div className="space-y-3">
                {Object.entries(previewData?.metrics)?.map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <div className="text-muted-foreground">{key}</div>
                    <div className="font-medium text-card-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="FileText" size={24} className="text-primary" />
                  <h1 className="text-2xl font-bold text-card-foreground">{report?.title}</h1>
                </div>
                <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {Object.entries(previewData?.metrics)?.map(([key, value]) => (
                      <div key={key}>
                        <div className="text-2xl font-bold text-primary">{value}</div>
                        <div className="text-sm text-muted-foreground">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {previewData?.sections?.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-xl font-semibold text-card-foreground mb-4">
                      {section?.title}
                    </h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {section?.content}
                      </p>
                    </div>
                    
                    {/* Mock chart placeholder */}
                    {index === 0 && (
                      <div className="mt-6 bg-muted/30 border border-border rounded-lg p-8 text-center">
                        <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Interactive charts and visualizations would appear here
                        </p>
                      </div>
                    )}

                    {/* Mock table placeholder */}
                    {index === 1 && (
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full border border-border rounded-lg">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 border-b border-border">Category</th>
                              <th className="text-left p-3 border-b border-border">Count</th>
                              <th className="text-left p-3 border-b border-border">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-3 border-b border-border">High Risk</td>
                              <td className="p-3 border-b border-border">234</td>
                              <td className="p-3 border-b border-border">
                                <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                                  Remediated
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3 border-b border-border">Medium Risk</td>
                              <td className="p-3 border-b border-border">1,567</td>
                              <td className="p-3 border-b border-border">
                                <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                                  In Progress
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3">Low Risk</td>
                              <td className="p-3">14,046</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                  Monitored
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;