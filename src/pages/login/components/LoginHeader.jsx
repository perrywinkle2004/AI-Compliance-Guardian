import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center space-y-4 mb-8">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl shadow-lg">
          <Icon name="Shield" size={28} color="white" />
        </div>
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            AI Compliance Guardian
          </h1>
          <span className="text-sm text-muted-foreground leading-none">
            Enterprise Data Protection Platform
          </span>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sign in to your enterprise compliance dashboard to monitor data protection, 
          assess risks, and manage remediation across your organization.
        </p>
      </div>

      {/* Current Status Indicator */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-medium">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <span>All Systems Operational</span>
      </div>
    </div>
  );
};

export default LoginHeader;