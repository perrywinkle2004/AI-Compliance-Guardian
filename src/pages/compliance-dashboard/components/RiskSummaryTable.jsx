// src/pages/compliance-dashboard/components/RiskSummaryTable.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const RiskSummaryTable = () => {
  const [filters, setFilters] = useState({
    source: '',
    riskLevel: '',
    status: '',
    dateRange: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [riskData, setRiskData] = useState([]); // move demo data to state so we can refresh
  const [loading, setLoading] = useState(false);

  // same source/risk/status options as before
  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'Slack', label: 'Slack' },
    { value: 'Email', label: 'Email' },
    { value: 'GitHub', label: 'GitHub' },
    { value: 'Jira', label: 'Jira' },
    { value: 'Database', label: 'Database' }
  ];
  const riskLevelOptions = [
    { value: '', label: 'All Risk Levels' },
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' }
  ];

  // demo fallback dataset (kept same as you had originally)
  const demoData = [
    {
      id: 1,
      source: "Slack",
      sourceIcon: "MessageSquare",
      location: "#customer-support",
      riskScore: 95,
      riskLevel: "Critical",
      piiTypes: ["SSN", "Credit Card", "Email"],
      detectedAt: new Date(Date.now() - 15 * 60 * 1000),
      status: "Pending",
      affectedRecords: 23,
      lastScan: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 2,
      source: "Email",
      sourceIcon: "Mail",
      location: "contracts@company.com",
      riskScore: 87,
      riskLevel: "High",
      piiTypes: ["Name", "Address", "Phone"],
      detectedAt: new Date(Date.now() - 45 * 60 * 1000),
      status: "In Progress",
      affectedRecords: 7,
      lastScan: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
      id: 3,
      source: "GitHub",
      sourceIcon: "Github",
      location: "customer-api/src/config",
      riskScore: 72,
      riskLevel: "Medium",
      piiTypes: ["API Keys", "Database URL"],
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "Resolved",
      affectedRecords: 12,
      lastScan: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: 4,
      source: "Jira",
      sourceIcon: "Ticket",
      location: "PROJ-1234",
      riskScore: 68,
      riskLevel: "Medium",
      piiTypes: ["Email", "User ID"],
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "Pending",
      affectedRecords: 5,
      lastScan: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 5,
      source: "Database",
      sourceIcon: "Database",
      location: "customer_data_2025.csv",
      riskScore: 91,
      riskLevel: "High",
      piiTypes: ["SSN", "DOB", "Address", "Phone"],
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "In Progress",
      affectedRecords: 156,
      lastScan: new Date(Date.now() - 8 * 60 * 60 * 1000)
    },
    {
      id: 6,
      source: "Slack",
      sourceIcon: "MessageSquare",
      location: "#general",
      riskScore: 45,
      riskLevel: "Low",
      piiTypes: ["Email"],
      detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: "Resolved",
      affectedRecords: 2,
      lastScan: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  useEffect(() => {
    // try to fetch a server-provided risk summary if endpoint exists; otherwise fall back to demoData
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/risks/summary`);
        if (!res.ok) throw new Error('no-risks-endpoint');
        const json = await res.json();
        if (!cancelled) setRiskData(Array.isArray(json) ? json : demoData);
      } catch (err) {
        // endpoint may not exist — use demo data
        console.debug("risks/summary not available, using demo data", err?.message || err);
        if (!cancelled) setRiskData(demoData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // listen for global dashboard refresh events (dispatched by quick actions or uploads)
    const onRefresh = () => {
      load();
    };
    window.addEventListener('dashboard:refresh', onRefresh);
    window.addEventListener('dashboard:filesProcessed', onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener('dashboard:refresh', onRefresh);
      window.removeEventListener('dashboard:filesProcessed', onRefresh);
    };
  }, []);

  const getRiskLevelConfig = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical':
        return { color: 'text-error', bgColor: 'bg-error/10' };
      case 'High':
        return { color: 'text-warning', bgColor: 'bg-warning/10' };
      case 'Medium':
        return { color: 'text-accent', bgColor: 'bg-accent/10' };
      case 'Low':
        return { color: 'text-success', bgColor: 'bg-success/10' };
      default:
        return { color: 'text-muted-foreground', bgColor: 'bg-muted/10' };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Resolved':
        return { color: 'text-success', bgColor: 'bg-success/10' };
      case 'In Progress':
        return { color: 'text-warning', bgColor: 'bg-warning/10' };
      case 'Pending':
        return { color: 'text-error', bgColor: 'bg-error/10' };
      default:
        return { color: 'text-muted-foreground', bgColor: 'bg-muted/10' };
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Bulk actions call backend endpoints
  const handleBulkAction = async (action) => {
    try {
      if (!window.confirm(`Perform bulk action: ${action}?`)) return;
      const selectedIds = riskData.slice(0, 2).map(r => r.id); // placeholder: you can add checkboxes later
      const res = await fetch(`${API_BASE}/remediation/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status} ${txt}`);
      }
      const json = await res.json();
      alert(`Bulk ${action} applied: ${json?.applied || selectedIds.length}`);
      // notify other components
      window.dispatchEvent(new CustomEvent('dashboard:refresh'));
    } catch (err) {
      console.error("Bulk action failed", err);
      alert("Bulk action failed: " + (err?.message || err));
    }
  };

  // Row-level actions call backend
  const handleRowAction = async (id, action) => {
    try {
      if (action === 'view') {
        // dispatch an event other components may listen for
        window.dispatchEvent(new CustomEvent('dashboard:viewRisk', { detail: { id } }));
        alert(`Open details for risk ${id} (if implemented)`);
        return;
      }
      if (action === 'remediate') {
        const res = await fetch(`${API_BASE}/remediation/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remediate", ids: [id] })
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Server returned ${res.status} ${txt}`);
        }
        const json = await res.json();
        alert(`Remediation applied for ${id}: ${json?.applied || "ok"}`);
        window.dispatchEvent(new CustomEvent('dashboard:refresh'));
        return;
      }
      if (action === 'menu') {
        alert("Open row menu (not implemented)");
        return;
      }
    } catch (err) {
      console.error("Row action failed", err);
      alert("Row action failed: " + (err?.message || err));
    }
  };

  // New Scan button now triggers camera modal via event (UX-first)
  const handleStartNewScan = async () => {
    try {
      // open the camera modal — index.jsx listens for this
      window.dispatchEvent(new CustomEvent('camera:open'));
    } catch (err) {
      console.error("Start scan (camera) failed", err);
      alert("Start scan failed: " + (err?.message || err));
    }
  };

  // Export CSV uses server /metrics/export/csv; triggers download
  const handleExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics/export/csv?range_hours=24`, { method: "GET" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status} ${txt}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metrics_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Export CSV failed: " + (err?.message || err));
    }
  };

  // Filtering local data (demo) - when a server endpoint is present you'd filter server-side
  const filteredData = riskData?.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item?.location?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      item?.piiTypes?.some(type => type?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
    const matchesSource = filters?.source === '' || item?.source === filters?.source;
    const matchesRiskLevel = filters?.riskLevel === '' || item?.riskLevel === filters?.riskLevel;
    const matchesStatus = filters?.status === '' || item?.status === filters?.status;
    return matchesSearch && matchesSource && matchesRiskLevel && matchesStatus;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Risk Summary</h2>
          <p className="text-sm text-muted-foreground">Recent scans across all data sources</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="Download" iconPosition="left" size="sm" onClick={handleExport}>
            Export
          </Button>
          <Button variant="default" iconName="Scan" iconPosition="left" size="sm" onClick={handleStartNewScan} disabled={loading}>
            New Scan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <input
          type="search"
          placeholder="Search location or PII type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="input lg:col-span-2"
        />
        <select value={filters.source} onChange={(e) => handleFilterChange('source', e.target.value)}>
          {sourceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.riskLevel} onChange={(e) => handleFilterChange('riskLevel', e.target.value)}>
          {riskLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">
            {filteredData?.length} of {riskData?.length} items
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="CheckCircle"
            onClick={() => handleBulkAction('remediate')}
          >
            Bulk Remediate
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Archive"
            onClick={() => handleBulkAction('archive')}
          >
            Archive Selected
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Score</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PII Types</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Records</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Detected</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((item) => {
              const riskConfig = getRiskLevelConfig(item?.riskLevel);
              const statusConfig = getStatusConfig(item?.status);

              return (
                <tr key={item?.id} className="border-b border-border hover:bg-muted/50 transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <Icon name={item?.sourceIcon} size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{item?.source}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-foreground font-mono">{item?.location}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${riskConfig?.color}`}>{item?.riskScore}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskConfig?.color} ${riskConfig?.bgColor}`}>
                        {item?.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item?.piiTypes?.map((type, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig?.color} ${statusConfig?.bgColor}`}>
                      {item?.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-foreground">{item?.affectedRecords}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">{formatTimestamp(item?.detectedAt)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" iconName="Eye" onClick={() => handleRowAction(item?.id, 'view')} />
                      <Button variant="ghost" size="sm" iconName="Zap" onClick={() => handleRowAction(item?.id, 'remediate')} />
                      <Button variant="ghost" size="sm" iconName="MoreHorizontal" onClick={() => handleRowAction(item?.id, 'menu')} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredData?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskSummaryTable;
