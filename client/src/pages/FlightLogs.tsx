import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, X, ClipboardList, Filter, Edit, Trash2, Calendar, Clock, Gauge, Droplet, UserPlus } from 'lucide-react';

type FlightLogStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

type CrewMemberShort = {
  id: string;
  name: string;
  designation: string;
};

type FlightLogCrewRecord = {
  dutyRole: string;
  crew: CrewMemberShort;
};

type AircraftShort = {
  id: string;
  aircraftNo: string;
  model: string;
};

type FlightLogRecord = {
  id: string;
  logNumber: string;
  flightDate: string;
  flightHours: number;
  engineRpm: number | null;
  engineTemperature: number | null;
  fuelUsed: number | null;
  notes: string | null;
  status: FlightLogStatus;
  aircraftId: string;
  aircraft: AircraftShort;
  crewMembers: FlightLogCrewRecord[];
  createdAt: string;
};

type CrewOption = {
  id: string;
  name: string;
  designation: string;
};

type AircraftOption = {
  id: string;
  aircraftNo: string;
  model: string;
};

type CrewAssignmentInput = {
  crewId: string;
  dutyRole: string;
};

type FlightLogFormState = {
  logNumber: string;
  aircraftId: string;
  flightDate: string;
  flightHours: string;
  engineRpm: string;
  engineTemperature: string;
  fuelUsed: string;
  notes: string;
  status: FlightLogStatus;
  crewAssignments: CrewAssignmentInput[];
};

const DEFAULT_FORM: FlightLogFormState = {
  logNumber: '',
  aircraftId: '',
  flightDate: new Date().toISOString().split('T')[0],
  flightHours: '',
  engineRpm: '',
  engineTemperature: '',
  fuelUsed: '',
  notes: '',
  status: 'DRAFT',
  crewAssignments: [],
};

const STATUS_LABELS: Record<FlightLogStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
};

const STATUS_CLASSES: Record<FlightLogStatus, string> = {
  DRAFT: 'badge-muted',
  SUBMITTED: 'badge-maintenance',
  APPROVED: 'badge-active',
};

const DUTY_ROLES = ['Captain', 'Co-Pilot', 'Flight Engineer', 'Cabin Crew', 'Observer'];

const FlightLogs: React.FC = () => {
  const { user } = useAuth();
  
  // Permissions: Only ENGINEER and OPERATIONS can write
  const isWriteAuthorized = useMemo(() => {
    return user && ['ENGINEER', 'OPERATIONS'].includes(user.roleKey);
  }, [user]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | FlightLogStatus>('All');
  const [aircraftFilter, setAircraftFilter] = useState<string>('All');

  const [logs, setLogs] = useState<FlightLogRecord[]>([]);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [crewOptions, setCrewOptions] = useState<CrewOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<FlightLogFormState>(DEFAULT_FORM);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [logsRes, aircraftRes, crewRes] = await Promise.all([
        api.get('/flight-logs'),
        api.get('/aircraft'),
        api.get('/crew'),
      ]);
      setLogs(logsRes.data?.data ?? []);
      setAircraftOptions(aircraftRes.data?.data ?? []);
      setCrewOptions(crewRes.data?.data ?? []);
    } catch {
      setError('Unable to load flight logs, aircraft options, or crew roster from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch = log.logNumber.toLowerCase().includes(q) || (log.notes ?? '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || log.status === statusFilter;
      const matchAircraft = aircraftFilter === 'All' || log.aircraftId === aircraftFilter;
      return matchSearch && matchStatus && matchAircraft;
    });
  }, [logs, search, statusFilter, aircraftFilter]);

  const totalLoggedHours = useMemo(() => {
    return logs.reduce((total, log) => total + log.flightHours, 0);
  }, [logs]);

  const openCreateModal = () => {
    if (!isWriteAuthorized) return;
    setEditingLogId(null);
    setForm({
      ...DEFAULT_FORM,
      logNumber: `FL-${String(logs.length + 1).padStart(3, '0')}`,
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (log: FlightLogRecord) => {
    if (!isWriteAuthorized) return;
    setEditingLogId(log.id);
    setForm({
      logNumber: log.logNumber,
      aircraftId: log.aircraftId,
      flightDate: log.flightDate.split('T')[0],
      flightHours: String(log.flightHours),
      engineRpm: log.engineRpm !== null ? String(log.engineRpm) : '',
      engineTemperature: log.engineTemperature !== null ? String(log.engineTemperature) : '',
      fuelUsed: log.fuelUsed !== null ? String(log.fuelUsed) : '',
      notes: log.notes ?? '',
      status: log.status,
      crewAssignments: log.crewMembers.map((cm) => ({
        crewId: cm.crew.id,
        dutyRole: cm.dutyRole,
      })),
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLogId(null);
    setForm(DEFAULT_FORM);
    setFormError('');
  };

  const handleAddCrewAssignment = () => {
    const availableCrew = crewOptions.filter(
      (opt) => !form.crewAssignments.some((a) => a.crewId === opt.id)
    );
    if (availableCrew.length === 0) {
      setFormError('No more crew members available to add.');
      return;
    }
    setForm((current) => ({
      ...current,
      crewAssignments: [
        ...current.crewAssignments,
        { crewId: availableCrew[0].id, dutyRole: 'Captain' },
      ],
    }));
  };

  const handleRemoveCrewAssignment = (index: number) => {
    setForm((current) => ({
      ...current,
      crewAssignments: current.crewAssignments.filter((_, idx) => idx !== index),
    }));
  };

  const handleCrewAssignmentChange = (index: number, field: keyof CrewAssignmentInput, value: string) => {
    setForm((current) => {
      const copy = [...current.crewAssignments];
      copy[index] = { ...copy[index], [field]: value };
      return { ...current, crewAssignments: copy };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWriteAuthorized) return;

    if (!form.logNumber.trim() || !form.aircraftId || !form.flightDate || !form.flightHours) {
      setFormError('Log number, Aircraft, Date, and Flight Hours are required.');
      return;
    }

    const hours = Number(form.flightHours);
    if (isNaN(hours) || hours <= 0) {
      setFormError('Flight hours must be a positive number.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      logNumber: form.logNumber.trim(),
      aircraftId: form.aircraftId,
      flightDate: form.flightDate,
      flightHours: hours,
      engineRpm: form.engineRpm ? Number(form.engineRpm) : null,
      engineTemperature: form.engineTemperature ? Number(form.engineTemperature) : null,
      fuelUsed: form.fuelUsed ? Number(form.fuelUsed) : null,
      notes: form.notes.trim() || null,
      status: form.status,
      crewAssignments: form.crewAssignments,
    };

    try {
      if (editingLogId) {
        await api.put(`/flight-logs/${editingLogId}`, payload);
      } else {
        await api.post('/flight-logs', payload);
      }
      await loadData();
      closeModal();
    } catch {
      setFormError('Could not save flight log. Please verify values and check if this log number is unique.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (log: FlightLogRecord) => {
    if (!isWriteAuthorized) return;
    const confirmed = window.confirm(`Permanently delete Flight Log ${log.logNumber}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/flight-logs/${log.id}`);
      await loadData();
    } catch {
      setError('Unable to delete flight log right now.');
    }
  };

  return (
    <div>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Flight Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {logs.length} flights recorded · {totalLoggedHours.toFixed(1)} total hours flown
          </p>
        </div>
        {isWriteAuthorized && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Log Flight
          </button>
        )}
      </div>

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

      {/* Stats Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            <ClipboardList size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Logged Flights</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{logs.length}</div>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            <Clock size={18} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Accumulated Flight Time</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalLoggedHours.toFixed(1)} hrs</div>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            <Calendar size={18} color="var(--status-active-text)" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Approved Submissions</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{logs.filter(l => l.status === 'APPROVED').length}</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Panel */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by log number or notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filters-wrapper">
          <Filter size={16} color="var(--text-muted)" />
          
          <select 
            className="form-control" 
            value={aircraftFilter}
            onChange={(e) => setAircraftFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="All">All Aircraft</option>
            {aircraftOptions.map(ac => (
              <option key={ac.id} value={ac.id}>{ac.aircraftNo} ({ac.model})</option>
            ))}
          </select>

          <select 
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ minWidth: '130px' }}
          >
            <option value="All">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Log Number</th>
              <th>Aircraft</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Metrics</th>
              <th>Crew Allocation</th>
              <th>Status</th>
              {isWriteAuthorized && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isWriteAuthorized ? 8 : 7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading flight logs…
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={isWriteAuthorized ? 8 : 7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <ClipboardList size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                  No flight logs found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                      {log.logNumber}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>{log.aircraft.aircraftNo}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.aircraft.model}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(log.flightDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {log.flightHours.toFixed(1)} hrs
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {log.engineRpm && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <Gauge size={11} color="var(--text-muted)" /> {log.engineRpm} rpm
                        </span>
                      )}
                      {log.engineTemperature && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <Gauge size={11} color="var(--text-muted)" /> {log.engineTemperature}°C
                        </span>
                      )}
                      {log.fuelUsed && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <Droplet size={11} color="var(--text-muted)" /> {log.fuelUsed} L
                        </span>
                      )}
                      {!log.engineRpm && !log.engineTemperature && !log.fuelUsed && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    {log.crewMembers.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {log.crewMembers.map((cm, idx) => (
                          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{cm.dutyRole}:</span>
                            <span>{cm.crew.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_CLASSES[log.status]}`}>
                      {STATUS_LABELS[log.status]}
                    </span>
                  </td>
                  {isWriteAuthorized && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" style={{ padding: '8px 10px' }} onClick={() => openEditModal(log)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '8px 10px', color: 'var(--status-aog-text)' }} onClick={() => void handleDelete(log)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingLogId ? 'Edit Flight Log' : 'Log New Flight'}</span>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Log Number</label>
                    <input
                      className="form-control"
                      placeholder="e.g. FL-001"
                      value={form.logNumber}
                      onChange={(e) => setForm((c) => ({ ...c, logNumber: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Aircraft</label>
                    <select
                      className="form-control"
                      value={form.aircraftId}
                      onChange={(e) => setForm((c) => ({ ...c, aircraftId: e.target.value }))}
                      required
                    >
                      <option value="" disabled>Select Aircraft</option>
                      {aircraftOptions.map(ac => (
                        <option key={ac.id} value={ac.id}>{ac.aircraftNo} ({ac.model})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Flight Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.flightDate}
                      onChange={(e) => setForm((c) => ({ ...c, flightDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Flight Hours</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="form-control"
                      placeholder="e.g. 2.5"
                      value={form.flightHours}
                      onChange={(e) => setForm((c) => ({ ...c, flightHours: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Engine RPM</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Optional"
                      value={form.engineRpm}
                      onChange={(e) => setForm((c) => ({ ...c, engineRpm: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Engine Temp (°C)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Optional"
                      value={form.engineTemperature}
                      onChange={(e) => setForm((c) => ({ ...c, engineTemperature: e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Fuel Used (Liters)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Optional"
                      value={form.fuelUsed}
                      onChange={(e) => setForm((c) => ({ ...c, fuelUsed: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Crew Assignments Subform */}
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(148,163,184,0.03)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                      Crew Allocations
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                      onClick={handleAddCrewAssignment}
                    >
                      <UserPlus size={13} /> Add Assignment
                    </button>
                  </div>

                  {form.crewAssignments.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                      No crew members assigned to this flight yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {form.crewAssignments.map((assignment, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <select
                            className="form-control"
                            value={assignment.crewId}
                            onChange={(e) => handleCrewAssignmentChange(index, 'crewId', e.target.value)}
                            style={{ flex: 1.2 }}
                          >
                            {crewOptions.map((opt) => (
                              <option 
                                key={opt.id} 
                                value={opt.id} 
                                disabled={form.crewAssignments.some((a, aIdx) => a.crewId === opt.id && aIdx !== index)}
                              >
                                {opt.name} ({opt.designation})
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-control"
                            value={assignment.dutyRole}
                            onChange={(e) => handleCrewAssignmentChange(index, 'dutyRole', e.target.value)}
                            style={{ flex: 0.8 }}
                          >
                            {DUTY_ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '10px', color: 'var(--status-aog-text)', border: 'none', background: 'none' }}
                            onClick={() => handleRemoveCrewAssignment(index)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Flight Notes / Remarks</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="Enter weather conditions, flight path, snags or pilot comments…"
                    value={form.notes}
                    onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))}
                    style={{ resize: 'vertical', fontFamily: 'var(--font-family)' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Flight Status</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as FlightLogStatus }))}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Plus size={15} /> {saving ? 'Saving…' : editingLogId ? 'Update Log' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightLogs;
