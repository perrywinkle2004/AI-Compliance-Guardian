import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SSOOptions from './components/SSOOptions';
import ComplianceBadges from './components/ComplianceBadges';
import MockCredentialsHelper from './components/MockCredentialsHelper';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/compliance-dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Login Form */}
          <div className="order-2 lg:order-1">
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <LoginHeader />
              
              <div className="bg-card border border-border rounded-xl shadow-lg p-8">
                <LoginForm />
                
                <div className="mt-6">
                  <SSOOptions />
                </div>
                
                <MockCredentialsHelper />
              </div>
            </div>
          </div>

          {/* Right Column - Compliance Information */}
          <div className="order-1 lg:order-2">
            <div className="bg-card border border-border rounded-xl shadow-lg p-8">
              <ComplianceBadges />
              
              {/* Additional Enterprise Features */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Enterprise AI-Powered Protection
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Multi-Agent AI Processing
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Advanced AI algorithms automatically detect and classify PII across 
                        Slack messages, Jira tickets, contracts, and code repositories.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-success rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Real-time Risk Assessment
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Continuous monitoring with intelligent risk scoring and 
                        automated remediation recommendations for compliance violations.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-warning rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Automated Compliance Reporting
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generate comprehensive compliance reports for GDPR, HIPAA, 
                        and other regulatory frameworks with audit trail documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  © {new Date()?.getFullYear()} AI Compliance Guardian. All rights reserved.
                </p>
                <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <button className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button className="hover:text-foreground transition-colors">
                    Terms of Service
                  </button>
                  <span>•</span>
                  <button className="hover:text-foreground transition-colors">
                    Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;