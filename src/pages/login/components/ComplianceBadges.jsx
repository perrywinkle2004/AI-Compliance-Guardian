import React from 'react';
import Icon from '../../../components/AppIcon';

const ComplianceBadges = () => {
  const complianceCertifications = [
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      icon: 'Shield',
      description: 'Security, Availability & Confidentiality',
      color: 'text-success'
    },
    {
      id: 'gdpr',
      name: 'GDPR Compliant',
      icon: 'Lock',
      description: 'European Data Protection Regulation',
      color: 'text-accent'
    },
    {
      id: 'hipaa',
      name: 'HIPAA Ready',
      icon: 'Heart',
      description: 'Healthcare Information Protection',
      color: 'text-warning'
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      icon: 'Award',
      description: 'Information Security Management',
      color: 'text-primary'
    }
  ];

  const securityFeatures = [
    {
      icon: 'Key',
      text: 'End-to-end encryption'
    },
    {
      icon: 'UserCheck',
      text: 'Multi-factor authentication'
    },
    {
      icon: 'Database',
      text: 'Secure data processing'
    },
    {
      icon: 'Clock',
      text: 'Session timeout protection'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Compliance Certifications */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
          Enterprise Security & Compliance
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {complianceCertifications?.map((cert) => (
            <div
              key={cert?.id}
              className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <Icon name={cert?.icon} size={20} className={cert?.color} />
              <span className="text-xs font-medium text-foreground mt-1">
                {cert?.name}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-0.5">
                {cert?.description}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Security Features */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 text-center">
          Security Features
        </h4>
        <div className="space-y-2">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon name={feature?.icon} size={14} className="text-success" />
              <span className="text-xs text-muted-foreground">{feature?.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Trust Indicators */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Shield" size={12} className="text-success" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Server" size={12} className="text-success" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Users" size={12} className="text-success" />
            <span>500+ Enterprises</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceBadges;