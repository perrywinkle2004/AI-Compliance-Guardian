import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/compliance-dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'Compliance monitoring and alert coordination hub'
    },
    {
      label: 'Data Sources',
      path: '/data-source-management',
      icon: 'Database',
      tooltip: 'Integration management and system health monitoring'
    },
    {
      label: 'Risk Analysis',
      path: '/risk-assessment-details',
      icon: 'Shield',
      tooltip: 'Comprehensive PII risk examination and findings investigation'
    },
    {
      label: 'Remediation',
      path: '/remediation-planning',
      icon: 'CheckCircle',
      tooltip: 'Strategic planning and execution tracking for compliance risk mitigation'
    },
    {
      label: 'Reports',
      path: '/compliance-reports',
      icon: 'FileText',
      tooltip: 'Comprehensive compliance documentation and regulatory reporting'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="Shield" size={20} color="white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                AI Compliance Guardian
              </h1>
              <span className="text-xs text-muted-foreground leading-none">
                Enterprise Data Protection
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              title={item?.tooltip}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200 ease-out
                ${isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <NotificationCenter />
          <UserProfileDropdown />
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <nav className="px-4 py-2 space-y-1">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-200 ease-out
                  ${isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;