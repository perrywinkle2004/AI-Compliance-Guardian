import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsOverview = () => {
  const metrics = [
    {
      id: 1,
      title: "Total PII Instances",
      value: "12,847",
      change: "+234",
      changeType: "increase",
      icon: "Shield",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: 2,
      title: "High-Risk Items",
      value: "89",
      change: "-12",
      changeType: "decrease",
      icon: "AlertTriangle",
      color: "text-error",
      bgColor: "bg-error/10"
    },
    {
      id: 3,
      title: "Remediation Rate",
      value: "94.2%",
      change: "+2.1%",
      changeType: "increase",
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      id: 4,
      title: "Compliance Score",
      value: "87.5",
      change: "+1.2",
      changeType: "increase",
      icon: "TrendingUp",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics?.map((metric) => (
        <div key={metric?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${metric?.bgColor}`}>
              <Icon name={metric?.icon} size={24} className={metric?.color} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              metric?.changeType === 'increase' ? 'text-success' : 'text-error'
            }`}>
              <Icon 
                name={metric?.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
              />
              <span className="font-medium">{metric?.change}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{metric?.value}</h3>
            <p className="text-sm text-muted-foreground">{metric?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;