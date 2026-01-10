import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportCard = ({ report, onPreview, onGenerate, onDownload }) => {
  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'gdpr': return 'Shield';
      case 'pii': return 'Eye';
      case 'remediation': return 'CheckCircle';
      case 'audit': return 'FileSearch';
      case 'custom': return 'Settings';
      default: return 'FileText';
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'gdpr': return 'text-primary';
      case 'pii': return 'text-warning';
      case 'remediation': return 'text-success';
      case 'audit': return 'text-accent';
      case 'custom': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-muted ${getReportTypeColor(report?.type)}`}>
            <Icon name={getReportTypeIcon(report?.type)} size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{report?.title}</h3>
            <p className="text-sm text-muted-foreground">{report?.category}</p>
          </div>
        </div>
        {report?.isNew && (
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
            New
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {report?.description}
      </p>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Generated:</span>
          <p className="font-medium text-card-foreground">
            {new Date(report.generatedDate)?.toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Coverage:</span>
          <p className="font-medium text-card-foreground">{report?.coveragePeriod}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Size:</span>
          <p className="font-medium text-card-foreground">
            {formatFileSize(report?.fileSize)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Format:</span>
          <div className="flex items-center space-x-1">
            {report?.formats?.map((format, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-muted text-xs rounded"
              >
                {format?.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            onClick={() => onPreview(report)}
          >
            Preview
          </Button>
          {report?.status === 'template' && (
            <Button
              variant="default"
              size="sm"
              iconName="Play"
              iconPosition="left"
              onClick={() => onGenerate(report)}
            >
              Generate
            </Button>
          )}
        </div>
        {report?.status === 'ready' && (
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={() => onDownload(report)}
          >
            Download
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;