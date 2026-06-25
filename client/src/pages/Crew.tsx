import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Search, Plus, X, Users, Mail, Filter, Edit, Trash2 } from 'lucide-react';

type ApiCrewStatus = 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY' | 'ON_LEAVE';

type CrewRecord = {
  id: string;
  employeeNo?: string | null;
  name: string;
  designation: string;
  email?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  status: ApiCrewStatus;
  availabilityNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CrewForm = {
  name: string;
  designation: string;
  email: string;
  phone: string;
  status: ApiCrewStatus;
};

const DEFAULT_FORM: CrewForm = { name: '', designation: '', email: '', phone: '', status: 'AVAILABLE' };

const Crew: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ApiCrewStatus>('All');
  const [crewList, setCrewList] = useState<CrewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CrewForm>(DEFAULT_FORM);
  const [formError, setFormError] = useState('');

  const loadCrew = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/crew');
      setCrewList(res.data?.data ?? []);
    } catch {
      setError('Unable to load crew list from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCrew(); }, []);

  const filtered = useMemo(() => crewList.filter((c) => {
    const q = search.toLowerCase();
    const match = c.name.toLowerCase().includes(q) || c.designation.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q);
    const statusMatch = statusFilter === 'All' || c.status === statusFilter;
    return match && statusMatch;
  }), [crewList, search, statusFilter]);

  const openCreate = () => { setEditingId(null); setForm(DEFAULT_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (c: CrewRecord) => { setEditingId(c.id); setForm({ name: c.name, designation: c.designation, email: c.email ?? '', phone: c.phone ?? '', status: c.status }); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(DEFAULT_FORM); setFormError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.designation.trim()) { setFormError('Name and designation are required'); return; }
    if (form.email && !form.email.includes('@')) { setFormError('Please enter a valid email'); return; }

    try {
      if (editingId) {
        await api.put(`/crew/${editingId}`, { name: form.name.trim(), designation: form.designation.trim(), email: form.email || undefined, phone: form.phone || undefined, status: form.status });
      } else {
        await api.post('/crew', { name: form.name.trim(), designation: form.designation.trim(), email: form.email || undefined, phone: form.phone || undefined, status: form.status });
      }
      await loadCrew();
      closeModal();
    } catch {
      setFormError('Unable to save crew member.');
    }
  };

  const handleDelete = async (c: CrewRecord) => {
    if (!window.confirm(`Delete crew member ${c.name}?`)) return;
    try { await api.delete(`/crew/${c.id}`); await loadCrew(); } catch { setError('Unable to delete crew member.'); }
  };

  const onDuty = crewList.filter(c => c.status === 'ASSIGNED').length;
  const active = crewList.filter(c => c.status === 'AVAILABLE').length;
  const onLeave = crewList.filter(c => c.status === 'ON_LEAVE').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Crew Roster</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{crewList.length} crew members registered</p>
        </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Crew Member</button>
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{ label: 'On Flight Duty', count: onDuty, cls: 'badge-active' }, { label: 'Available', count: active, cls: 'badge-active' }, { label: 'On Leave', count: onLeave, cls: 'badge-muted' }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Users size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
            <span className={`badge ${item.cls}`} style={{ fontSize: '11px' }}>{item.count}</span>
          </div>
        ))}
      </div>

      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input className="form-control" placeholder="Search by name, designation, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filters-wrapper">
          <Filter size={16} color="var(--text-muted)" />
          {(['All', 'AVAILABLE', 'ASSIGNED', 'OFF_DUTY', 'ON_LEAVE'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s === 'All' ? 'All' : (s as ApiCrewStatus))} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, border: `1px solid ${statusFilter === s ? 'var(--accent-cyan)' : 'var(--border-color)'}`, backgroundColor: statusFilter === s ? 'rgba(8,145,178,0.08)' : 'transparent', color: statusFilter === s ? 'var(--accent-cyan)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>{s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading crew…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                  No crew members found.
                </td>
              </tr>
            ) : filtered.map(member => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(59,130,246,0.1) 100%)', border: '1px solid rgba(8,145,178,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{member.designation}</td>
                <td>
                  {member.email ? (<a href={`mailto:${member.email}`} style={{ color: 'var(--accent-cyan)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} />{member.email}</a>) : '—'}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{member.phone ?? '—'}</td>
                <td><span className={`badge ${member.status === 'AVAILABLE' ? 'badge-active' : member.status === 'ASSIGNED' ? 'badge-active' : member.status === 'ON_LEAVE' ? 'badge-muted' : 'badge-aog'}`}>{member.status.replace('_', ' ')}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '8px 10px' }} onClick={() => openEdit(member)}><Edit size={14} /></button>
                    <button className="btn btn-secondary" style={{ padding: '8px 10px', color: 'var(--status-aog-text)' }} onClick={() => handleDelete(member)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingId ? 'Edit Crew Member' : 'Add Crew Member'}</span>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ backgroundColor: 'var(--status-aog-bg)', border: '1px solid var(--status-aog-border)', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--status-aog-text)' }}>{formError}</div>
                )}
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" placeholder="e.g. Capt. Arjun Singh" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Designation</label><input className="form-control" placeholder="e.g. First Officer (B787)" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-control" type="email" placeholder="crew.member@drishyam.aero" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}><label className="form-label">Phone</label><input className="form-control" placeholder="+91 98765 XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="form-group" style={{ margin: 0 }}><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ApiCrewStatus }))}><option value="AVAILABLE">Available</option><option value="ASSIGNED">Assigned</option><option value="OFF_DUTY">Off Duty</option><option value="ON_LEAVE">On Leave</option></select></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary"><Plus size={15} /> {editingId ? 'Update' : 'Add to Roster'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crew;