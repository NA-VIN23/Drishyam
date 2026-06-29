import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  X, 
  Filter, 
  Edit, 
  Trash2, 
  Info, 
  ArrowRight, 
  Plane, 
  User,
  Wrench
} from 'lucide-react';

type SnagSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type SnagStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

type AircraftShort = {
  id: string;
  aircraftNo: string;
  model: string;
};

type UserShort = {
  id: string;
  name: string;
  email: string;
};

type CrewShort = {
  id: string;
  name: string;
  designation: string;
};

type SnagHistoryRecord = {
  id: string;
  fromStatus: SnagStatus | null;
  toStatus: SnagStatus;
  note: string | null;
  createdAt: string;
  changedBy?: {
    name: string;
  } | null;
};

type SnagRecord = {
  id: string;
  snagNumber: string;
  title: string;
  description: string | null;
  severity: SnagSeverity;
  status: SnagStatus;
  detectedAt: string;
  aircraftId: string;
  aircraft: AircraftShort;
  reportedByUserId: string | null;
  reportedByUser: UserShort | null;
  reportedByCrewId: string | null;
  reportedByCrew: CrewShort | null;
  assignedCrewId: string | null;
  assignedCrew: CrewShort | null;
  history: SnagHistoryRecord[];
  createdAt: string;
};

type SnagFormState = {
  snagNumber: string;
  title: string;
  description: string;
  severity: SnagSeverity;
  status: SnagStatus;
  aircraftId: string;
  reportedByCrewId: string;
  assignedCrewId: string;
};

type StatusFormState = {
  status: SnagStatus;
  note: string;
};

const SEVERITY_OPTIONS: Array<{ value: SnagSeverity; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const STATUS_OPTIONS: Array<{ value: SnagStatus; label: string }> = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const DEFAULT_FORM = (): SnagFormState => ({
  snagNumber: `SNAG-${Math.floor(1000 + Math.random() * 9000)}`,
  title: '',
  description: '',
  severity: 'MEDIUM',
  status: 'OPEN',
  aircraftId: '',
  reportedByCrewId: '',
  assignedCrewId: '',
});

const DEFAULT_STATUS_FORM = (currentStatus: SnagStatus): StatusFormState => ({
  status: currentStatus,
  note: '',
});

const severityLabelMap: Record<SnagSeverity, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const severityBadgeClass: Record<SnagSeverity, string> = {
  LOW: 'badge-muted',
  MEDIUM: 'badge-maintenance',
  HIGH: 'badge-aog',
  CRITICAL: 'badge-aog-critical',
};

const statusLabelMap: Record<SnagStatus, string> = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const statusBadgeClass: Record<SnagStatus, string> = {
  OPEN: 'badge-aog',
  ACKNOWLEDGED: 'badge-maintenance',
  IN_PROGRESS: 'badge-maintenance-active',
  RESOLVED: 'badge-active',
  CLOSED: 'badge-muted',
};

const Snags: React.FC = () => {
  const { user } = useAuth();

  // Permissions: Engineer & Admin have full write access.
  const isWriteAuthorized = useMemo(() => {
    return user && ['ENGINEER', 'ADMIN'].includes(user.roleKey);
  }, [user]);

  // Permissions: Technician, Engineer & Admin can update status.
  const isStatusUpdateAuthorized = useMemo(() => {
    return user && ['TECHNICIAN', 'ENGINEER', 'ADMIN'].includes(user.roleKey);
  }, [user]);

  const [snagsList, setSnagsList] = useState<SnagRecord[]>([]);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftShort[]>([]);
  const [crewOptions, setCrewOptions] = useState<CrewShort[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SnagStatus>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | SnagSeverity>('All');
  const [aircraftFilter, setAircraftFilter] = useState<string>('All');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSnagId, setEditingSnagId] = useState<string | null>(null);
  const [form, setForm] = useState<SnagFormState>(DEFAULT_FORM());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdatingSnag, setStatusUpdatingSnag] = useState<SnagRecord | null>(null);
  const [statusForm, setStatusForm] = useState<StatusFormState>(DEFAULT_STATUS_FORM('OPEN'));

  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedSnag, setSelectedSnag] = useState<SnagRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [snagsRes, aircraftRes, crewRes] = await Promise.all([
        api.get('/snags'),
        api.get('/aircraft'),
        api.get('/crew')
      ]);
      setSnagsList(snagsRes.data?.data ?? []);
      setAircraftOptions(aircraftRes.data?.data ?? []);
      setCrewOptions(crewRes.data?.data ?? []);
    } catch {
      setError('Unable to load snags, aircraft, or crew options from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredSnags = useMemo(() => {
    return snagsList.filter((snag) => {
      const q = search.toLowerCase();
      const matchSearch = 
        snag.snagNumber.toLowerCase().includes(q) ||
        snag.title.toLowerCase().includes(q) ||
        (snag.description ?? '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || snag.status === statusFilter;
      const matchSeverity = severityFilter === 'All' || snag.severity === severityFilter;
      const matchAircraft = aircraftFilter === 'All' || snag.aircraftId === aircraftFilter;
      return matchSearch && matchStatus && matchSeverity && matchAircraft;
    });
  }, [snagsList, search, statusFilter, severityFilter, aircraftFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = snagsList.length;
    const openAndInProg = snagsList.filter(s => ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(s.status)).length;
    const critical = snagsList.filter(s => ['HIGH', 'CRITICAL'].includes(s.severity) && s.status !== 'CLOSED' && s.status !== 'RESOLVED').length;
    const resolved = snagsList.filter(s => ['RESOLVED', 'CLOSED'].includes(s.status)).length;
    return { total, openAndInProg, critical, resolved };
  }, [snagsList]);

  // Open modals handlers
  const openCreateModal = () => {
    setEditingSnagId(null);
    setForm(DEFAULT_FORM());
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (snag: SnagRecord) => {
    setEditingSnagId(snag.id);
    setForm({
      snagNumber: snag.snagNumber,
      title: snag.title,
      description: snag.description ?? '',
      severity: snag.severity,
      status: snag.status,
      aircraftId: snag.aircraftId,
      reportedByCrewId: snag.reportedByCrewId ?? '',
      assignedCrewId: snag.assignedCrewId ?? '',
    });
    setFormError('');
    setShowFormModal(true);
  };

  const openStatusUpdateModal = (snag: SnagRecord) => {
    setStatusUpdatingSnag(snag);
    setStatusForm(DEFAULT_STATUS_FORM(snag.status));
    setFormError('');
    setShowStatusModal(true);
  };

  const openDetailsDrawer = (snag: SnagRecord) => {
    setSelectedSnag(snag);
    setShowDetailsDrawer(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingSnagId(null);
    setForm(DEFAULT_FORM());
    setFormError('');
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setStatusUpdatingSnag(null);
    setFormError('');
  };

  const closeDetailsDrawer = () => {
    setShowDetailsDrawer(false);
    setSelectedSnag(null);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.snagNumber.trim() || !form.title.trim() || !form.aircraftId) {
      setFormError('Snag number, title, and aircraft are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      snagNumber: form.snagNumber.trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      severity: form.severity,
      status: form.status,
      aircraftId: form.aircraftId,
      reportedByCrewId: form.reportedByCrewId || null,
      assignedCrewId: form.assignedCrewId || null,
    };

    try {
      if (editingSnagId) {
        await api.put(`/snags/${editingSnagId}`, payload);
      } else {
        await api.post('/snags', payload);
      }
      await loadData();
      closeFormModal();
    } catch {
      setFormError('Could not save snag. Make sure the snag number is unique.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!statusUpdatingSnag) return;

    setSaving(true);
    setFormError('');

    const payload = {
      status: statusForm.status,
      note: statusForm.note.trim() || `Status updated to ${statusLabelMap[statusForm.status]}`,
    };

    try {
      await api.put(`/snags/${statusUpdatingSnag.id}`, payload);
      await loadData();
      closeStatusModal();
    } catch {
      setFormError('Could not update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (snag: SnagRecord) => {
    const confirmed = window.confirm(`Are you sure you want to delete snag report ${snag.snagNumber}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/snags/${snag.id}`);
      await loadData();
    } catch {
      setError('Unable to delete snag right now.');
    }
  };

  return (
    <div className="snags-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Snags & Discrepancies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Report aircraft write-ups, track status changes, and view discrepancy history
          </p>
        </div>
        {isWriteAuthorized && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Report Snag
          </button>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid var(--status-aog-border)',
          backgroundColor: 'var(--status-aog-bg)',
          color: 'var(--status-aog-text)',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Stats Dashboard Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Total Reported</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</span>
        </div>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--status-maint-text)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Unresolved Snags</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--status-maint-text)' }}>{stats.openAndInProg}</span>
        </div>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--status-aog-text)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Critical Discrepancies</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--status-aog-text)' }}>{stats.critical}</span>
        </div>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--status-active-text)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Resolved / Closed</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--status-active-text)' }}>{stats.resolved}</span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by snag number, title, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-secondary)" />
          
          <select 
            className="form-control" 
            style={{ width: '150px', padding: '6px 10px', fontSize: '13px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <select 
            className="form-control" 
            style={{ width: '150px', padding: '6px 10px', fontSize: '13px' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
          >
            <option value="All">All Severities</option>
            {SEVERITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <select 
            className="form-control" 
            style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
            value={aircraftFilter}
            onChange={(e) => setAircraftFilter(e.target.value)}
          >
            <option value="All">All Aircraft</option>
            {aircraftOptions.map(ac => <option key={ac.id} value={ac.id}>{ac.aircraftNo}</option>)}
          </select>
        </div>
      </div>

      {/* Snags Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Snag Number</th>
              <th>Aircraft</th>
              <th>Discrepancy Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Assigned To</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading snag reports...</td>
              </tr>
            ) : filteredSnags.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                  No snags found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredSnags.map((snag) => (
                <tr key={snag.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                      {snag.snagNumber}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Plane size={13} style={{ color: 'var(--text-secondary)' }} />
                      {snag.aircraft?.aircraftNo}
                    </span>
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{snag.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {snag.description || '—'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${severityBadgeClass[snag.severity]}`}>
                      {severityLabelMap[snag.severity]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusBadgeClass[snag.status]}`}>
                      {statusLabelMap[snag.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {snag.reportedByCrew ? (
                        <span>{snag.reportedByCrew.name} <small style={{ color: 'var(--text-muted)' }}>(Crew)</small></span>
                      ) : snag.reportedByUser ? (
                        <span>{snag.reportedByUser.name} <small style={{ color: 'var(--text-muted)' }}>(User)</small></span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>System</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {snag.assignedCrew ? (
                        <span>{snag.assignedCrew.name}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 8px' }} 
                        onClick={() => openDetailsDrawer(snag)}
                        title="View Details & History"
                      >
                        <Info size={14} />
                      </button>
                      
                      {isStatusUpdateAuthorized && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 8px', color: 'var(--accent-cyan)' }} 
                          onClick={() => openStatusUpdateModal(snag)}
                          title="Update Status"
                        >
                          <Wrench size={14} />
                        </button>
                      )}

                      {isWriteAuthorized && (
                        <>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px' }} 
                            onClick={() => openEditModal(snag)}
                            title="Edit Snag"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', color: 'var(--status-aog-text)' }} 
                            onClick={() => void handleDelete(snag)}
                            title="Delete Snag"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report / Edit Snag Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingSnagId ? 'Edit Snag Details' : 'Report Discrepancy (Snag)'}</span>
              <button className="modal-close" onClick={closeFormModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--status-aog-bg)',
                    border: '1px solid var(--status-aog-border)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: 'var(--status-aog-text)',
                  }}>
                    {formError}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Snag ID / Number</label>
                    <input 
                      className="form-control" 
                      placeholder="e.g. SNAG-002" 
                      value={form.snagNumber} 
                      onChange={(e) => setForm(curr => ({ ...curr, snagNumber: e.target.value }))}
                      disabled={!!editingSnagId} // Lock Snag Number on edit
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Associated Aircraft</label>
                    <select 
                      className="form-control"
                      value={form.aircraftId}
                      onChange={(e) => setForm(curr => ({ ...curr, aircraftId: e.target.value }))}
                    >
                      <option value="">-- Select Aircraft --</option>
                      {aircraftOptions.map(ac => <option key={ac.id} value={ac.id}>{ac.aircraftNo} ({ac.model})</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label">Title / Brief Discrepancy</label>
                    <input 
                      className="form-control" 
                      placeholder="e.g. Engine 1 oil temperature indicator fluctuating" 
                      value={form.title} 
                      onChange={(e) => setForm(curr => ({ ...curr, title: e.target.value }))} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label">Detailed Description</label>
                    <textarea 
                      className="form-control" 
                      style={{ height: '80px', resize: 'vertical', fontFamily: 'var(--font-family)' }}
                      placeholder="Describe the exact issue symptoms, flight phases where it occurred, or troubleshooting done so far..." 
                      value={form.description} 
                      onChange={(e) => setForm(curr => ({ ...curr, description: e.target.value }))} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Severity Level</label>
                    <select 
                      className="form-control"
                      value={form.severity}
                      onChange={(e) => setForm(curr => ({ ...curr, severity: e.target.value as SnagSeverity }))}
                    >
                      {SEVERITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Current Status</label>
                    <select 
                      className="form-control"
                      value={form.status}
                      onChange={(e) => setForm(curr => ({ ...curr, status: e.target.value as SnagStatus }))}
                      disabled={!editingSnagId} // Default to OPEN on create, editable on update
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Reported By Crew</label>
                    <select 
                      className="form-control"
                      value={form.reportedByCrewId}
                      onChange={(e) => setForm(curr => ({ ...curr, reportedByCrewId: e.target.value }))}
                    >
                      <option value="">-- Select Crew (Optional) --</option>
                      {crewOptions.map(c => <option key={c.id} value={c.id}>{c.name} ({c.designation})</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assigned Technician / Crew</label>
                    <select 
                      className="form-control"
                      value={form.assignedCrewId}
                      onChange={(e) => setForm(curr => ({ ...curr, assignedCrewId: e.target.value }))}
                    >
                      <option value="">-- Select Crew (Optional) --</option>
                      {crewOptions.map(c => <option key={c.id} value={c.id}>{c.name} ({c.designation})</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeFormModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingSnagId ? 'Update Snag' : 'Report Snag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      {showStatusModal && statusUpdatingSnag && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Update Status: {statusUpdatingSnag.snagNumber}</span>
              <button className="modal-close" onClick={closeStatusModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleStatusSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--status-aog-bg)',
                    border: '1px solid var(--status-aog-border)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: 'var(--status-aog-text)',
                  }}>
                    {formError}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</div>
                    <span className={`badge ${statusBadgeClass[statusUpdatingSnag.status]}`}>{statusLabelMap[statusUpdatingSnag.status]}</span>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>New Status</div>
                    <select 
                      className="form-control"
                      style={{ padding: '4px 8px', fontSize: '13px', width: '150px' }}
                      value={statusForm.status}
                      onChange={(e) => setStatusForm(curr => ({ ...curr, status: e.target.value as SnagStatus }))}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status Modification Note</label>
                  <textarea 
                    className="form-control"
                    style={{ height: '70px', resize: 'vertical', fontFamily: 'var(--font-family)' }}
                    placeholder="Provide a brief explanation of work carried out, checklist item references, or next step details..."
                    value={statusForm.note}
                    onChange={(e) => setStatusForm(curr => ({ ...curr, note: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeStatusModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Status Change History Drawer */}
      {showDetailsDrawer && selectedSnag && (
        <div className="modal-overlay" onClick={closeDetailsDrawer} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div 
            className="drawer-content" 
            style={{ 
              width: '500px', 
              backgroundColor: 'var(--bg-card)', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Aircraft Write-Up Details</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selectedSnag.snagNumber}</h2>
              </div>
              <button 
                onClick={closeDetailsDrawer}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
              
              {/* Title & Description */}
              <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{selectedSnag.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedSnag.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Grid Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Helicopter</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Plane size={13} style={{ color: 'var(--accent-cyan)' }} />
                    {selectedSnag.aircraft?.aircraftNo} ({selectedSnag.aircraft?.model})
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Severity</span>
                  <span className={`badge ${severityBadgeClass[selectedSnag.severity]}`} style={{ marginTop: '2px', display: 'inline-block' }}>
                    {severityLabelMap[selectedSnag.severity]}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Current Status</span>
                  <span className={`badge ${statusBadgeClass[selectedSnag.status]}`} style={{ marginTop: '2px', display: 'inline-block' }}>
                    {statusLabelMap[selectedSnag.status]}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Reported At</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {new Date(selectedSnag.detectedAt).toLocaleDateString()} {new Date(selectedSnag.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Reported By</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {selectedSnag.reportedByCrew?.name || selectedSnag.reportedByUser?.name || 'System / Automatic'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Assigned To</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {selectedSnag.assignedCrew?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Status Change Timeline */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600, marginBottom: '12px' }}>Timeline & Maintenance Log</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                  {/* Timeline vertical bar */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    bottom: '6px',
                    left: '6px',
                    width: '2px',
                    backgroundColor: 'var(--border-color)',
                  }} />

                  {/* List History Entries */}
                  {selectedSnag.history && selectedSnag.history.length > 0 ? (
                    selectedSnag.history.map((hist, idx) => (
                      <div key={hist.id || idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* Circle Indicator on bar */}
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          left: '-18px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: hist.toStatus === 'RESOLVED' || hist.toStatus === 'CLOSED' ? 'var(--status-active-text)' : 'var(--accent-cyan)',
                          border: '2px solid var(--bg-card)',
                          boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                        }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {hist.fromStatus ? `${statusLabelMap[hist.fromStatus]} → ` : ''}
                            <span style={{ color: hist.toStatus === 'RESOLVED' || hist.toStatus === 'CLOSED' ? 'var(--status-active-text)' : 'var(--text-primary)' }}>
                              {statusLabelMap[hist.toStatus]}
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(hist.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {hist.note && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '4px' }}>
                            "{hist.note}"
                          </div>
                        )}

                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <User size={10} />
                          <span>Logged by: {hist.changedBy?.name || 'Authorized Actor'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No timeline history recorded for this snag.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global CSS Animation for Drawer */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .badge-aog-critical {
          background-color: rgba(220, 38, 38, 0.15);
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.4);
          animation: pulseBorder 2s infinite;
        }
        .badge-maintenance-active {
          background-color: rgba(245, 158, 11, 0.15);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.55);
        }
        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .drawer-content {
          box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>

    </div>
  );
};

export default Snags;
