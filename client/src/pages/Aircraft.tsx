import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Edit, Filter, Plane, Plus, Search, Trash2, X } from 'lucide-react';

type ApiAircraftStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'GROUNDED' | 'RETIRED';

type AircraftRecord = {
  id: string;
  aircraftNo: string;
  model: string;
  manufacturer: string;
  status: ApiAircraftStatus;
  totalFlightHours: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type AircraftFormState = {
  aircraftNo: string;
  model: string;
  manufacturer: string;
  status: ApiAircraftStatus;
  totalFlightHours: string;
  notes: string;
};

const STATUS_OPTIONS: Array<{ value: 'All' | ApiAircraftStatus; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_MAINTENANCE', label: 'Maintenance' },
  { value: 'GROUNDED', label: 'AOG' },
  { value: 'RETIRED', label: 'Retired' },
];

const DEFAULT_FORM: AircraftFormState = {
  aircraftNo: '',
  model: '',
  manufacturer: '',
  status: 'ACTIVE',
  totalFlightHours: '',
  notes: '',
};

const statusLabelMap: Record<ApiAircraftStatus, string> = {
  ACTIVE: 'Active',
  IN_MAINTENANCE: 'Maintenance',
  GROUNDED: 'AOG',
  RETIRED: 'Retired',
};

const statusBadgeClass: Record<ApiAircraftStatus, string> = {
  ACTIVE: 'badge-active',
  IN_MAINTENANCE: 'badge-maintenance',
  GROUNDED: 'badge-aog',
  RETIRED: 'badge-muted',
};

const Aircraft: React.FC = () => {
  const { user } = useAuth();
  const isWriteAuthorized = useMemo(() => {
    return user && ['ADMIN', 'ENGINEER'].includes(user.roleKey);
  }, [user]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ApiAircraftStatus>('All');
  const [aircraftList, setAircraftList] = useState<AircraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAircraftId, setEditingAircraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<AircraftFormState>(DEFAULT_FORM);

  const loadAircraft = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/aircraft');
      setAircraftList(response.data?.data ?? []);
    } catch {
      setError('Unable to load aircraft from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAircraft();
  }, []);

  const filtered = useMemo(() => {
    return aircraftList.filter((aircraft) => {
      const searchValue = search.toLowerCase();
      const matchSearch =
        aircraft.aircraftNo.toLowerCase().includes(searchValue) ||
        aircraft.model.toLowerCase().includes(searchValue) ||
        aircraft.manufacturer.toLowerCase().includes(searchValue);
      const matchStatus = statusFilter === 'All' || aircraft.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [aircraftList, search, statusFilter]);

  const openCreateModal = () => {
    setEditingAircraftId(null);
    setForm(DEFAULT_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (aircraft: AircraftRecord) => {
    setEditingAircraftId(aircraft.id);
    setForm({
      aircraftNo: aircraft.aircraftNo,
      model: aircraft.model,
      manufacturer: aircraft.manufacturer,
      status: aircraft.status,
      totalFlightHours: String(aircraft.totalFlightHours),
      notes: aircraft.notes ?? '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAircraftId(null);
    setForm(DEFAULT_FORM);
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.aircraftNo.trim() || !form.model.trim() || !form.manufacturer.trim()) {
      setFormError('Aircraft number, model, and manufacturer are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      aircraftNo: form.aircraftNo.trim(),
      model: form.model.trim(),
      manufacturer: form.manufacturer.trim(),
      status: form.status,
      totalFlightHours: Number(form.totalFlightHours) || 0,
      notes: form.notes.trim() || null,
    };

    try {
      if (editingAircraftId) {
        await api.put(`/aircraft/${editingAircraftId}`, payload);
      } else {
        await api.post('/aircraft', payload);
      }

      await loadAircraft();
      closeModal();
    } catch {
      setFormError('Could not save aircraft. Please check the values and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (aircraft: AircraftRecord) => {
    const confirmed = window.confirm(`Delete aircraft ${aircraft.aircraftNo}?`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/aircraft/${aircraft.id}`);
      await loadAircraft();
    } catch {
      setError('Unable to delete aircraft right now.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Aircraft Fleet</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {aircraftList.length} aircraft registered · {aircraftList.filter((aircraft) => aircraft.status === 'ACTIVE').length} active
          </p>
        </div>
        {isWriteAuthorized && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add Aircraft
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

      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by tail number, model, manufacturer…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filters-wrapper">
          <Filter size={16} color="var(--text-muted)" />
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                border: `1px solid ${statusFilter === option.value ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                backgroundColor: statusFilter === option.value ? 'rgba(8,145,178,0.08)' : 'transparent',
                color: statusFilter === option.value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-family)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Aircraft Number</th>
              <th>Model</th>
              <th>Manufacturer</th>
              <th>Flight Hours</th>
              <th>Status</th>
              <th>Notes</th>
              {isWriteAuthorized && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isWriteAuthorized ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading aircraft…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isWriteAuthorized ? 7 : 6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Plane size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                  No aircraft found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((aircraft) => (
                <tr key={aircraft.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                      {aircraft.aircraftNo}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)' }}>{aircraft.model}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{aircraft.manufacturer}</td>
                  <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {Number(aircraft.totalFlightHours).toLocaleString()} hrs
                  </td>
                  <td><span className={`badge ${statusBadgeClass[aircraft.status]}`}>{statusLabelMap[aircraft.status]}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{aircraft.notes || '—'}</td>
                  {isWriteAuthorized && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" style={{ padding: '8px 10px' }} onClick={() => openEditModal(aircraft)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '8px 10px', color: 'var(--status-aog-text)' }} onClick={() => void handleDelete(aircraft)}>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingAircraftId ? 'Edit Aircraft' : 'Register New Aircraft'}</span>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
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
                    <label className="form-label">Aircraft Number</label>
                    <input className="form-control" placeholder="e.g. VT-DRG" value={form.aircraftNo} onChange={(event) => setForm((current) => ({ ...current, aircraftNo: event.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Model</label>
                    <input className="form-control" placeholder="e.g. Airbus A320" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Manufacturer</label>
                    <input className="form-control" placeholder="e.g. Airbus" value={form.manufacturer} onChange={(event) => setForm((current) => ({ ...current, manufacturer: event.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ApiAircraftStatus }))}>
                      <option value="ACTIVE">Active</option>
                      <option value="IN_MAINTENANCE">Maintenance</option>
                      <option value="GROUNDED">AOG</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Flight Hours</label>
                    <input className="form-control" type="number" min="0" step="0.1" placeholder="e.g. 5000" value={form.totalFlightHours} onChange={(event) => setForm((current) => ({ ...current, totalFlightHours: event.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Notes</label>
                    <input className="form-control" placeholder="Optional notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Plus size={15} /> {saving ? 'Saving…' : editingAircraftId ? 'Update Aircraft' : 'Register Aircraft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aircraft;