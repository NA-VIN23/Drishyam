import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, X, CalendarCheck, ClipboardList } from 'lucide-react';

type CertificationStatus = 'VALID' | 'EXPIRES_SOON' | 'EXPIRED';
type ShiftStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

type CrewOption = { id: string; name: string; designation: string; };

type CrewCertification = {
  id: string;
  crewId: string;
  crew: CrewOption;
  certificationName: string;
  issuedBy?: string | null;
  issuedAt: string;
  expiresAt?: string | null;
  status: CertificationStatus;
  notes?: string | null;
};

type CrewShiftRecord = {
  id: string;
  crewId: string;
  crew: CrewOption;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  shiftRole?: string | null;
  location?: string | null;
  status: ShiftStatus;
  notes?: string | null;
};

type CertificationFormState = {
  crewId: string;
  certificationName: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  status: CertificationStatus;
  notes: string;
};

type ShiftFormState = {
  crewId: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  shiftRole: string;
  location: string;
  status: ShiftStatus;
  notes: string;
};

const DEFAULT_CERT_FORM: CertificationFormState = {
  crewId: '',
  certificationName: '',
  issuedBy: '',
  issuedAt: new Date().toISOString().split('T')[0],
  expiresAt: '',
  status: 'VALID',
  notes: '',
};

const DEFAULT_SHIFT_FORM: ShiftFormState = {
  crewId: '',
  shiftDate: new Date().toISOString().split('T')[0],
  shiftStart: '08:00',
  shiftEnd: '16:00',
  shiftRole: 'Flight Crew',
  location: '',
  status: 'SCHEDULED',
  notes: '',
};

const CrewPlanning: React.FC = () => {
  const { user } = useAuth();
  const [crewOptions, setCrewOptions] = useState<CrewOption[]>([]);
  const [certifications, setCertifications] = useState<CrewCertification[]>([]);
  const [shifts, setShifts] = useState<CrewShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'certifications' | 'shifts'>('certifications');
  const [showCertModal, setShowCertModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [certForm, setCertForm] = useState(DEFAULT_CERT_FORM);
  const [shiftForm, setShiftForm] = useState(DEFAULT_SHIFT_FORM);
  const [formError, setFormError] = useState('');
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  const canManage = user && ['ADMIN', 'ENGINEER', 'OPERATIONS'].includes(user.roleKey);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [crewRes, certRes, shiftRes] = await Promise.all([
        api.get('/crew'),
        api.get('/crew-certifications'),
        api.get('/crew-shifts'),
      ]);
      setCrewOptions(crewRes.data?.data ?? []);
      setCertifications(certRes.data?.data ?? []);
      setShifts(shiftRes.data?.data ?? []);
    } catch {
      setError('Unable to load crew planning data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const filteredCertifications = useMemo(() => {
    const q = search.toLowerCase();
    return certifications.filter((cert) =>
      cert.crew.name.toLowerCase().includes(q) ||
      cert.certificationName.toLowerCase().includes(q) ||
      cert.issuedBy?.toLowerCase().includes(q) ||
      (cert.notes ?? '').toLowerCase().includes(q),
    );
  }, [certifications, search]);

  const filteredShifts = useMemo(() => {
    const q = search.toLowerCase();
    return shifts.filter((shift) =>
      shift.crew.name.toLowerCase().includes(q) ||
      shift.shiftRole?.toLowerCase().includes(q) ||
      shift.location?.toLowerCase().includes(q) ||
      (shift.notes ?? '').toLowerCase().includes(q),
    );
  }, [shifts, search]);

  const openCertModal = () => {
    setEditingCertId(null);
    setCertForm(DEFAULT_CERT_FORM);
    setFormError('');
    setShowCertModal(true);
  };

  const openShiftModal = () => {
    setEditingShiftId(null);
    setShiftForm(DEFAULT_SHIFT_FORM);
    setFormError('');
    setShowShiftModal(true);
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.crewId || !certForm.certificationName) {
      setFormError('Crew and certification name are required.');
      return;
    }

    try {
      const payload = {
        crewId: certForm.crewId,
        certificationName: certForm.certificationName.trim(),
        issuedBy: certForm.issuedBy.trim() || undefined,
        issuedAt: certForm.issuedAt,
        expiresAt: certForm.expiresAt || undefined,
        status: certForm.status,
        notes: certForm.notes.trim() || undefined,
      };

      if (editingCertId) {
        await api.put(`/crew-certifications/${editingCertId}`, payload);
      } else {
        await api.post('/crew-certifications', payload);
      }

      await loadData();
      setShowCertModal(false);
    } catch {
      setFormError('Unable to save certification.');
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.crewId || !shiftForm.shiftDate || !shiftForm.shiftStart || !shiftForm.shiftEnd) {
      setFormError('Crew, date, start and end times are required.');
      return;
    }

    try {
      const payload = {
        crewId: shiftForm.crewId,
        shiftDate: shiftForm.shiftDate,
        shiftStart: shiftForm.shiftStart,
        shiftEnd: shiftForm.shiftEnd,
        shiftRole: shiftForm.shiftRole.trim() || undefined,
        location: shiftForm.location.trim() || undefined,
        status: shiftForm.status,
        notes: shiftForm.notes.trim() || undefined,
      };

      if (editingShiftId) {
        await api.put(`/crew-shifts/${editingShiftId}`, payload);
      } else {
        await api.post('/crew-shifts', payload);
      }

      await loadData();
      setShowShiftModal(false);
    } catch {
      setFormError('Unable to save shift.');
    }
  };

  const handleCertEdit = (cert: CrewCertification) => {
    setEditingCertId(cert.id);
    setCertForm({
      crewId: cert.crewId,
      certificationName: cert.certificationName,
      issuedBy: cert.issuedBy ?? '',
      issuedAt: cert.issuedAt.split('T')[0],
      expiresAt: cert.expiresAt ? cert.expiresAt.split('T')[0] : '',
      status: cert.status,
      notes: cert.notes ?? '',
    });
    setFormError('');
    setShowCertModal(true);
  };

  const handleShiftEdit = (shift: CrewShiftRecord) => {
    setEditingShiftId(shift.id);
    setShiftForm({
      crewId: shift.crewId,
      shiftDate: shift.shiftDate.split('T')[0],
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      shiftRole: shift.shiftRole ?? '',
      location: shift.location ?? '',
      status: shift.status,
      notes: shift.notes ?? '',
    });
    setFormError('');
    setShowShiftModal(true);
  };

  const handleCertDelete = async (id: string) => {
    if (!window.confirm('Delete this certification record?')) return;
    try {
      await api.delete(`/crew-certifications/${id}`);
      await loadData();
    } catch {
      setError('Unable to delete certification.');
    }
  };

  const handleShiftDelete = async (id: string) => {
    if (!window.confirm('Delete this shift assignment?')) return;
    try {
      await api.delete(`/crew-shifts/${id}`);
      await loadData();
    } catch {
      setError('Unable to delete shift.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Crew Planning</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Track certifications and assign crew shifts in one unified operations view.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setTab('certifications')} style={{ minWidth: '150px' }}><ClipboardList size={16} /> Certifications</button>
          <button className="btn btn-secondary" onClick={() => setTab('shifts')} style={{ minWidth: '150px' }}><CalendarCheck size={16} /> Shifts</button>
          {canManage && (
            <button className="btn btn-primary" onClick={tab === 'certifications' ? openCertModal : openShiftModal}><Plus size={16} /> Add {tab === 'certifications' ? 'Certification' : 'Shift'}</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--status-aog-bg)', border: '1px solid var(--status-aog-border)', color: 'var(--status-aog-text)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            placeholder="Search crew, certification, location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="form-control"
            style={{ width: '320px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-active">Crew: {crewOptions.length}</span>
          <span className="badge badge-maintenance">Certifications: {certifications.length}</span>
          <span className="badge badge-aog">Shifts: {shifts.length}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '18px' }}>
        {tab === 'certifications' ? (
          <div style={{ borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Certification Records</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Manage crew qualifications and compliance expiry.</p>
              </div>
              <span className="badge badge-active" style={{ fontSize: '12px' }}>Valid + expiring</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px' }}>Crew Member</th>
                    <th style={{ padding: '16px' }}>Certification</th>
                    <th style={{ padding: '16px' }}>Issued At</th>
                    <th style={{ padding: '16px' }}>Expires At</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading certification records…</td></tr>
                  ) : filteredCertifications.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>No certification records found.</td></tr>
                  ) : filteredCertifications.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px' }}><strong style={{ color: 'var(--text-primary)' }}>{cert.crew.name}</strong><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cert.crew.designation}</div></td>
                      <td style={{ padding: '14px 16px' }}>{cert.certificationName}</td>
                      <td style={{ padding: '14px 16px' }}>{new Date(cert.issuedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>{cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                      <td style={{ padding: '14px 16px' }}><span className={`badge ${cert.status === 'VALID' ? 'badge-active' : cert.status === 'EXPIRES_SOON' ? 'badge-maintenance' : 'badge-aog'}`}>{cert.status.replace('_', ' ')}</span></td>
                      <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {canManage && (
                          <>
                            <button className="btn btn-secondary" onClick={() => handleCertEdit(cert)}><Filter size={14} /></button>
                            <button className="btn btn-danger" onClick={() => handleCertDelete(cert.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Shift Assignments</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Coordinate crew schedules and duty locations.</p>
              </div>
              <span className="badge badge-maintenance" style={{ fontSize: '12px' }}>Upcoming schedules</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px' }}>Crew Member</th>
                    <th style={{ padding: '16px' }}>Date</th>
                    <th style={{ padding: '16px' }}>Time</th>
                    <th style={{ padding: '16px' }}>Role</th>
                    <th style={{ padding: '16px' }}>Location</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading shift assignments…</td></tr>
                  ) : filteredShifts.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>No shift assignments found.</td></tr>
                  ) : filteredShifts.map((shift) => (
                    <tr key={shift.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px' }}><strong style={{ color: 'var(--text-primary)' }}>{shift.crew.name}</strong><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{shift.crew.designation}</div></td>
                      <td style={{ padding: '14px 16px' }}>{new Date(shift.shiftDate).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>{shift.shiftStart} - {shift.shiftEnd}</td>
                      <td style={{ padding: '14px 16px' }}>{shift.shiftRole ?? 'Crew'}</td>
                      <td style={{ padding: '14px 16px' }}>{shift.location ?? 'TBD'}</td>
                      <td style={{ padding: '14px 16px' }}><span className={`badge ${shift.status === 'SCHEDULED' ? 'badge-maintenance' : shift.status === 'COMPLETED' ? 'badge-active' : 'badge-aog'}`}>{shift.status}</span></td>
                      <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {canManage && (
                          <>
                            <button className="btn btn-secondary" onClick={() => handleShiftEdit(shift)}><Filter size={14} /></button>
                            <button className="btn btn-danger" onClick={() => handleShiftDelete(shift.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCertModal && (
        <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingCertId ? 'Edit Certification' : 'Add Certification'}</span>
              <button className="modal-close" onClick={() => setShowCertModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCertSubmit}>
              <div className="modal-body">
                {formError && <div className="alert-box">{formError}</div>}
                <div className="form-group"><label className="form-label">Crew Member</label><select className="form-control" value={certForm.crewId} onChange={(e) => setCertForm((prev) => ({ ...prev, crewId: e.target.value }))}>
                  <option value="">Select crew</option>
                  {crewOptions.map((crew) => (<option key={crew.id} value={crew.id}>{crew.name} — {crew.designation}</option>))}
                </select></div>
                <div className="form-group"><label className="form-label">Certification Name</label><input className="form-control" value={certForm.certificationName} onChange={(e) => setCertForm((prev) => ({ ...prev, certificationName: e.target.value }))} /></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Issued By</label><input className="form-control" value={certForm.issuedBy} onChange={(e) => setCertForm((prev) => ({ ...prev, issuedBy: e.target.value }))} /></div><div className="form-group"><label className="form-label">Issued At</label><input type="date" className="form-control" value={certForm.issuedAt} onChange={(e) => setCertForm((prev) => ({ ...prev, issuedAt: e.target.value }))} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Expires At</label><input type="date" className="form-control" value={certForm.expiresAt} onChange={(e) => setCertForm((prev) => ({ ...prev, expiresAt: e.target.value }))} /></div><div className="form-group"><label className="form-label">Status</label><select className="form-control" value={certForm.status} onChange={(e) => setCertForm((prev) => ({ ...prev, status: e.target.value as CertificationStatus }))}><option value="VALID">Valid</option><option value="EXPIRES_SOON">Expires Soon</option><option value="EXPIRED">Expired</option></select></div></div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" value={certForm.notes} onChange={(e) => setCertForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Certification</button></div>
            </form>
          </div>
        </div>
      )}

      {showShiftModal && (
        <div className="modal-overlay" onClick={() => setShowShiftModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingShiftId ? 'Edit Shift' : 'Add Shift'}</span>
              <button className="modal-close" onClick={() => setShowShiftModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleShiftSubmit}>
              <div className="modal-body">
                {formError && <div className="alert-box">{formError}</div>}
                <div className="form-group"><label className="form-label">Crew Member</label><select className="form-control" value={shiftForm.crewId} onChange={(e) => setShiftForm((prev) => ({ ...prev, crewId: e.target.value }))}>
                  <option value="">Select crew</option>
                  {crewOptions.map((crew) => (<option key={crew.id} value={crew.id}>{crew.name} — {crew.designation}</option>))}
                </select></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Shift Date</label><input type="date" className="form-control" value={shiftForm.shiftDate} onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftDate: e.target.value }))} /></div><div className="form-group"><label className="form-label">Shift Role</label><input className="form-control" value={shiftForm.shiftRole} onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftRole: e.target.value }))} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Start Time</label><input type="time" className="form-control" value={shiftForm.shiftStart} onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftStart: e.target.value }))} /></div><div className="form-group"><label className="form-label">End Time</label><input type="time" className="form-control" value={shiftForm.shiftEnd} onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftEnd: e.target.value }))} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Location</label><input className="form-control" value={shiftForm.location} onChange={(e) => setShiftForm((prev) => ({ ...prev, location: e.target.value }))} /></div><div className="form-group"><label className="form-label">Status</label><select className="form-control" value={shiftForm.status} onChange={(e) => setShiftForm((prev) => ({ ...prev, status: e.target.value as ShiftStatus }))}><option value="SCHEDULED">Scheduled</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div></div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" value={shiftForm.notes} onChange={(e) => setShiftForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowShiftModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Shift</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewPlanning;
