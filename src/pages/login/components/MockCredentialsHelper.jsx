import React, { useState } from 'react';

import Icon from '../../../components/AppIcon';

const MockCredentialsHelper = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mockAccounts = [
    {
      role: 'Administrator',
      email: 'admin@company.com',
      password: 'Admin123!',
      description: 'Full system access with administrative privileges',
      color: 'text-error'
    },
    {
      role: 'Compliance Officer',
      email: 'compliance@company.com',
      password: 'Compliance123!',
      description: 'Compliance monitoring and reporting access',
      color: 'text-accent'
    },
    {
      role: 'Security Analyst',
      email: 'security@company.com',
      password: 'Security123!',
      description: 'Risk assessment and security analysis access',
      color: 'text-warning'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)?.then(() => {
      // In a real app, you'd show a toast notification
      console.log('Copied to clipboard:', text);
    });
  };

  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-accent" />
          <span className="text-sm font-medium text-foreground">
            Demo Credentials
          </span>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Use these credentials to explore different user roles and access levels:
          </p>
          
          {mockAccounts?.map((account, index) => (
            <div key={index} className="p-3 bg-card rounded-md border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${account?.color}`}>
                  {account?.role}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => copyToClipboard(account?.email)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Copy email"
                  >
                    <Icon name="Copy" size={12} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(account?.password)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Copy password"
                  >
                    <Icon name="Key" size={12} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <Icon name="Mail" size={10} className="text-muted-foreground" />
                  <span className="font-mono text-muted-foreground">{account?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Lock" size={10} className="text-muted-foreground" />
                  <span className="font-mono text-muted-foreground">{account?.password}</span>
                </div>
                <p className="text-muted-foreground mt-1">{account?.description}</p>
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <Icon name="AlertTriangle" size={12} className="inline mr-1" />
              These are demo credentials for testing purposes only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockCredentialsHelper;