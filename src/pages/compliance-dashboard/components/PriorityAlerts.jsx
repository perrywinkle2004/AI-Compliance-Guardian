import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriorityAlerts = () => {
  const alerts = [
    {
      id: 1,
      severity: "critical",
      title: "High-Risk PII in Slack Channel",
      description: "Social Security Numbers detected in #customer-support channel",
      source: "Slack",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      affectedRecords: 23,
      actionRequired: true
    },
    {
      id: 2,
      severity: "high",
      title: "Unencrypted Email Attachments",
      description: "Customer contracts containing PII sent without encryption",
      source: "Email",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      affectedRecords: 7,
      actionRequired: true
    },
    {
      id: 3,
      severity: "medium",
      title: "Code Repository Exposure",
      description: "API keys and database credentials found in commit history",
      source: "GitHub",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      affectedRecords: 12,
      actionRequired: false
    },
    {
      id: 4,
      severity: "high",
      title: "GDPR Compliance Gap",
      description: "Customer data retention exceeds policy limits",
      source: "Database",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      affectedRecords: 156,
      actionRequired: true
    }
  ];

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-l-error',
          icon: 'AlertTriangle'
        };
      case 'high':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-l-warning',
          icon: 'AlertCircle'
        };
      case 'medium':
        return {
          color: 'text-accent',
          bgColor: 'bg-accent/10',
          borderColor: 'border-l-accent',
          icon: 'Info'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-l-muted',
          icon: 'Bell'
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const handleQuickAction = (alertId, action) => {
    console.log(`Performing ${action} on alert ${alertId}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-error/10 rounded-lg">
            <Icon name="AlertTriangle" size={20} className="text-error" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Priority Alerts</h2>
            <p className="text-sm text-muted-foreground">Urgent compliance issues requiring attention</p>
          </div>
        </div>
        <Button variant="outline" iconName="Settings" iconPosition="left" size="sm">
          Configure Alerts
        </Button>
      </div>
      <div className="space-y-4">
        {alerts?.map((alert) => {
          const severityConfig = getSeverityConfig(alert?.severity);
          return (
            <div
              key={alert?.id}
              className={`p-4 rounded-lg border-l-4 ${severityConfig?.bgColor} ${severityConfig?.borderColor} hover:shadow-sm transition-shadow duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon name={severityConfig?.icon} size={18} className={`mt-0.5 ${severityConfig?.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{alert?.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityConfig?.color} ${severityConfig?.bgColor}`}>
                        {alert?.severity?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert?.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Icon name="Database" size={12} />
                        <span>{alert?.source}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="Clock" size={12} />
                        <span>{formatTimestamp(alert?.timestamp)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="FileText" size={12} />
                        <span>{alert?.affectedRecords} records</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {alert?.actionRequired && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Eye"
                        onClick={() => handleQuickAction(alert?.id, 'view')}
                      >
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        iconName="Zap"
                        onClick={() => handleQuickAction(alert?.id, 'remediate')}
                      >
                        Remediate
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {alerts?.length} of {alerts?.length} alerts
          </span>
          <Button variant="ghost" iconName="ArrowRight" iconPosition="right" size="sm">
            View All Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PriorityAlerts;