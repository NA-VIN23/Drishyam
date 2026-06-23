import React, { useState } from 'react';
import { mockAircrafts } from '../data/mockData';
import type { Aircraft as AircraftType, AircraftStatus } from '../types';
import { Search, Plus, X, Plane, Filter } from 'lucide-react';

const Aircraft: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AircraftStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [aircraftList, setAircraftList] = useState<AircraftType[]>(mockAircrafts);

  // Form state
  const [form, setForm] = useState<Omit<AircraftType, 'flightHours' | 'nextInspection'> & { flightHours: string; nextInspection: string }>({
    aircraftNumber: '', model: '', manufacturer: '', status: 'Active', flightHours: '', nextInspection: ''
  });
  const [formError, setFormError] = useState('');

  const filtered = aircraftList.filter(ac => {
    const matchSearch =
      ac.aircraftNumber.toLowerCase().includes(search.toLowerCase()) ||
      ac.model.toLowerCase().includes(search.toLowerCase()) ||
      ac.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || ac.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.aircraftNumber || !form.model || !form.manufacturer) {
      setFormError('Aircraft Number, Model and Manufacturer are required.'); return;
    }
    const newAc: AircraftType = {
      ...form,
      flightHours: Number(form.flightHours) || 0,
      nextInspection: form.nextInspection || new Date().toISOString().split('T')[0],
    };
    setAircraftList(prev => [newAc, ...prev]);
    setShowModal(false);
    setForm({ aircraftNumber: '', model: '', manufacturer: '', status: 'Active', flightHours: '', nextInspection: '' });
    setFormError('');
  };

  const statusBadge = (status: AircraftStatus) => {
    const cls = status === 'Active' ? 'badge-active' : status === 'Maintenance' ? 'badge-maintenance' : 'badge-aog';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Aircraft Fleet</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {aircraftList.length} aircraft registered · {aircraftList.filter(a => a.status === 'Active').length} operational
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Aircraft
        </button>
      </div>

      {/* Search & Filters */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by tail number, model, manufacturer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filters-wrapper">
          <Filter size={16} color="var(--text-muted)" />
          {(['All', 'Active', 'Maintenance', 'AOG'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                border: `1px solid ${statusFilter === s ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                backgroundColor: statusFilter === s ? 'rgba(8,145,178,0.08)' : 'transparent',
                color: statusFilter === s ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--font-family)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Aircraft Number</th>
              <th>Model</th>
              <th>Manufacturer</th>
              <th>Flight Hours</th>
              <th>Next Inspection</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Plane size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                  No aircraft found matching your criteria.
                </td>
              </tr>
            ) : filtered.map(ac => (
              <tr key={ac.aircraftNumber}>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                    {ac.aircraftNumber}
                  </span>
                </td>
                <td style={{ color: 'var(--text-primary)' }}>{ac.model}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{ac.manufacturer}</td>
                <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {ac.flightHours.toLocaleString()} hrs
                </td>
                <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(ac.nextInspection).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>{statusBadge(ac.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Aircraft Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Register New Aircraft</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--status-aog-bg)', border: '1px solid var(--status-aog-border)',
                    borderRadius: '6px', padding: '10px 14px', marginBottom: '16px',
                    fontSize: '13px', color: 'var(--status-aog-text)'
                  }}>
                    {formError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Tail / Registration No.</label>
                    <input className="form-control" placeholder="e.g. VT-DRG"
                      value={form.aircraftNumber} onChange={e => setForm(f => ({ ...f, aircraftNumber: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Model</label>
                    <input className="form-control" placeholder="e.g. Airbus A320"
                      value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Manufacturer</label>
                    <input className="form-control" placeholder="e.g. Airbus"
                      value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as AircraftStatus }))}>
                      <option>Active</option>
                      <option>Maintenance</option>
                      <option>AOG</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Flight Hours</label>
                    <input className="form-control" type="number" placeholder="e.g. 5000"
                      value={form.flightHours} onChange={e => setForm(f => ({ ...f, flightHours: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Next Inspection Date</label>
                    <input className="form-control" type="date"
                      style={{ colorScheme: 'dark' }}
                      value={form.nextInspection} onChange={e => setForm(f => ({ ...f, nextInspection: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={15} /> Register Aircraft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aircraft;