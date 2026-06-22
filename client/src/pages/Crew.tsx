import React, { useState } from 'react';
import { mockCrew } from '../data/mockData';
import type { CrewMember, CrewStatus } from '../types';
import { Search, Plus, X, Users, Mail, Phone, Filter } from 'lucide-react';

const Crew: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CrewStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [crewList, setCrewList] = useState<CrewMember[]>(mockCrew);

  const [form, setForm] = useState<Omit<CrewMember, 'id'>>({
    name: '', designation: '', email: '', status: 'Active', phone: ''
  });
  const [formError, setFormError] = useState('');

  const filtered = crewList.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.designation.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.designation || !form.email) {
      setFormError('Name, Designation, and Email are required.');
      return;
    }
    if (!form.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const newMember: CrewMember = {
      ...form,
      id: `CREW-${String(crewList.length + 1).padStart(3, '0')}`
    };
    setCrewList(prev => [newMember, ...prev]);
    setShowModal(false);
    setForm({ name: '', designation: '', email: '', status: 'Active', phone: '' });
    setFormError('');
  };

  const statusBadge = (status: CrewStatus) => {
    const map: Record<CrewStatus, string> = {
      'Active': 'badge-active',
      'Flight Duty': 'badge-active',
      'On Leave': 'badge-muted',
      'Suspended': 'badge-aog'
    };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  // Quick stats
  const onDuty = crewList.filter(c => c.status === 'Flight Duty').length;
  const active = crewList.filter(c => c.status === 'Active').length;
  const onLeave = crewList.filter(c => c.status === 'On Leave').length;

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Crew Roster
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {crewList.length} crew members registered
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Crew Member
        </button>
      </div>

      {/* Quick Stat Chips */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'On Flight Duty', count: onDuty, cls: 'badge-active' },
          { label: 'Available', count: active, cls: 'badge-active' },
          { label: 'On Leave', count: onLeave, cls: 'badge-muted' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)'
          }}>
            <Users size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
            <span className={`badge ${item.cls}`} style={{ fontSize: '11px' }}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, designation, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filters-wrapper">
          <Filter size={16} color="var(--text-muted)" />
          {(['All', 'Active', 'Flight Duty', 'On Leave', 'Suspended'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                border: `1px solid ${statusFilter === s ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                backgroundColor: statusFilter === s ? 'rgba(0,210,255,0.08)' : 'transparent',
                color: statusFilter === s ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontFamily: 'var(--font-family)', whiteSpace: 'nowrap'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Crew Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                  No crew members found.
                </td>
              </tr>
            ) : filtered.map(member => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar initials circle */}
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(0,210,255,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                      border: '1px solid rgba(0,210,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)'
                    }}>
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{member.designation}</td>
                <td>
                  <a href={`mailto:${member.email}`}
                    style={{ color: 'var(--accent-cyan)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={12} />
                    {member.email}
                  </a>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {member.phone ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={12} color="var(--text-muted)" />{member.phone}
                    </span>
                  ) : '—'}
                </td>
                <td>{statusBadge(member.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Crew Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Crew Member</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
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
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" placeholder="e.g. Capt. Arjun Singh"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input className="form-control" placeholder="e.g. First Officer (B787)"
                    value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-control" type="email" placeholder="crew.member@drishyam.aero"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone</label>
                    <input className="form-control" placeholder="+91 98765 XXXXX"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as CrewStatus }))}>
                      <option>Active</option>
                      <option>Flight Duty</option>
                      <option>On Leave</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} /> Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crew;