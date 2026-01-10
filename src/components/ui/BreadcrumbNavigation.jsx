import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route configuration with breadcrumb information
  const routeConfig = {
    '/compliance-dashboard': {
      label: 'Dashboard',
      icon: 'LayoutDashboard'
    },
    '/data-source-management': {
      label: 'Data Sources',
      icon: 'Database',
      parent: '/compliance-dashboard'
    },
    '/risk-assessment-details': {
      label: 'Risk Analysis',
      icon: 'Shield',
      parent: '/compliance-dashboard'
    },
    '/remediation-planning': {
      label: 'Remediation',
      icon: 'CheckCircle',
      parent: '/compliance-dashboard'
    },
    '/compliance-reports': {
      label: 'Reports',
      icon: 'FileText',
      parent: '/compliance-dashboard'
    }
  };

  const buildBreadcrumbs = (pathname) => {
    const breadcrumbs = [];
    const currentRoute = routeConfig?.[pathname];
    
    if (!currentRoute) return breadcrumbs;

    // Build breadcrumb chain
    let current = pathname;
    const visited = new Set();
    
    while (current && !visited?.has(current)) {
      visited?.add(current);
      const route = routeConfig?.[current];
      
      if (route) {
        breadcrumbs?.unshift({
          label: route?.label,
          path: current,
          icon: route?.icon,
          isActive: current === pathname
        });
        current = route?.parent;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs(location?.pathname);

  // Don't render breadcrumbs on login page or if no breadcrumbs
  if (location?.pathname === '/login' || breadcrumbs?.length === 0) {
    return null;
  }

  const handleBreadcrumbClick = (path) => {
    if (path !== location?.pathname) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      <Icon name="Home" size={14} className="text-muted-foreground" />
      {breadcrumbs?.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb?.path}>
          <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          
          <button
            onClick={() => handleBreadcrumbClick(breadcrumb?.path)}
            disabled={breadcrumb?.isActive}
            className={`
              flex items-center space-x-1.5 px-2 py-1 rounded-md transition-colors duration-200
              ${breadcrumb?.isActive
                ? 'text-foreground font-medium cursor-default'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
              }
            `}
            aria-current={breadcrumb?.isActive ? 'page' : undefined}
          >
            <Icon name={breadcrumb?.icon} size={14} />
            <span>{breadcrumb?.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;