import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const MetricsOverview = ({ unitPrefix = 'normal' }) => {
  const [metricData, setMetricData] = useState({
    total_pii: 0,
    total_scans: 0,
    high_risk: 0,
    compliance_score: 95
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch(`${API_BASE}/metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetricData({
            total_pii: data.total_pii || 0,
            total_scans: data.total_scans || 0,
            high_risk: data.high_risk_items || 0,
            compliance_score: data.compliance_score || 95
          });
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
    // Refresh when a new file is uploaded
    const handler = () => fetchMetrics();
    window.addEventListener('dashboard:refresh', handler);
    return () => window.removeEventListener('dashboard:refresh', handler);
  }, []);
  const metrics = [
    {
      id: 1,
      title: "Total PII Instances",
      value: loading ? "..." : metricData.total_pii.toLocaleString(),
      change: "+12",
      changeType: "increase",
      icon: "Shield",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: 2,
      title: "Total Scans run",
      value: loading ? "..." : metricData.total_scans.toLocaleString(),
      change: "+5",
      changeType: "increase",
      icon: "FileText",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: 3,
      title: "High-Risk Items",
      value: loading ? "..." : metricData.high_risk.toLocaleString(),
      change: "-2",
      changeType: "decrease",
      icon: "AlertTriangle",
      color: "text-error",
      bgColor: "bg-error/10"
    },
    {
      id: 4,
      title: "Avg Compliance Score",
      value: loading ? "..." : metricData.compliance_score.toFixed(1),
      change: "+1.5",
      changeType: "increase",
      icon: "TrendingUp",
      color: "text-success",
      bgColor: "bg-success/10"
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