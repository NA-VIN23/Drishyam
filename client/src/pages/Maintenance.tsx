import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  X,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Plane,
  User,
  Clock,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';

/* ─────────────────── Types ─────────────────── */
type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type AircraftShort = { id: string; aircraftNo: string; model: string };
type CrewShort = { id: string; name: string; designation: string };

type MaintenanceTask = {
  id: string;
  maintenanceRecordId: string;
  title: string;
  description: string | null;
  status: MaintenanceStatus;
  dueAt: string | null;
  completedAt: string | null;
  assignedCrewId: string | null;
  assignedCrew: CrewShort | null;
  createdAt: string;
};

type MaintenanceRecord = {
  id: string;
  workOrderNumber: string;
  title: string;
  description: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  openedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  aircraftId: string;
  aircraft: AircraftShort;
  assignedTechnicianId: string | null;
  assignedTechnician: CrewShort | null;
  tasks: MaintenanceTask[];
};

type WOFormState = {
  workOrderNumber: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  aircraftId: string;
  assignedTechnicianId: string;
};

type TaskFormState = {
  title: string;
  description: string;
  assignedCrewId: string;
  dueAt: string;
};

/* ─────────────────── Constants ─────────────────── */
const STATUS_OPTIONS: Array<{ value: MaintenanceStatus; label: string }> = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS: Array<{ value: MaintenancePriority; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const KANBAN_COLUMNS: Array<{ status: MaintenanceStatus; label: string; accent: string; bg: string; badgeClass: string }> = [
  { status: 'OPEN',        label: 'Open',        accent: '#6b7280', bg: '#f9fafb',                    badgeClass: 'badge-muted' },
  { status: 'IN_PROGRESS', label: 'In Progress',  accent: '#d97706', bg: 'rgba(245,158,11,0.04)',     badgeClass: 'badge-maintenance' },
  { status: 'RESOLVED',    label: 'Resolved',     accent: '#059669', bg: 'rgba(16,185,129,0.04)',     badgeClass: 'badge-active' },
  { status: 'CLOSED',      label: 'Closed',       accent: '#9ca3af', bg: 'rgba(156,163,175,0.06)',    badgeClass: 'badge-muted' },
];

const PRIORITY_BADGE: Record<MaintenancePriority, string> = {
  LOW:      'badge-muted',
  MEDIUM:   'badge-maintenance',
  HIGH:     'badge-aog',
  CRITICAL: 'badge-aog',
};

const PRIORITY_DOT: Record<MaintenancePriority, string> = {
  LOW:      '#9ca3af',
  MEDIUM:   '#d97706',
  HIGH:     '#ef4444',
  CRITICAL: '#dc2626',
};

const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed',
};

const DEFAULT_WO_FORM = (): WOFormState => ({
  workOrderNumber: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
  title: '',
  description: '',
  status: 'OPEN',
  priority: 'MEDIUM',
  aircraftId: '',
  assignedTechnicianId: '',
});

const DEFAULT_TASK_FORM = (): TaskFormState => ({
  title: '',
  description: '',
  assignedCrewId: '',
  dueAt: '',
});

/* ─────────────────── Component ─────────────────── */
const Maintenance: React.FC = () => {
  const { user } = useAuth();

  const isWriteAuthorized = useMemo(
    () => user && ['ENGINEER', 'ADMIN'].includes(user.roleKey),
    [user],
  );
  const isTaskAuthorized = useMemo(
    () => user && ['TECHNICIAN', 'ENGINEER', 'ADMIN'].includes(user.roleKey),
    [user],
  );

  /* Data */
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftShort[]>([]);
  const [crewOptions, setCrewOptions] = useState<CrewShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* Filters */
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | MaintenancePriority>('All');
  const [aircraftFilter, setAircraftFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  /* Work-Order modal */
  const [showWOModal, setShowWOModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [woForm, setWoForm] = useState<WOFormState>(DEFAULT_WO_FORM());
  const [woError, setWoError] = useState('');
  const [woSaving, setWoSaving] = useState(false);

  /* Status modal */
  const [statusRecord, setStatusRecord] = useState<MaintenanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<MaintenanceStatus>('OPEN');
  const [statusSaving, setStatusSaving] = useState(false);

  /* Task modal */
  const [taskParent, setTaskParent] = useState<MaintenanceRecord | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(DEFAULT_TASK_FORM());
  const [taskError, setTaskError] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);

  /* Expanded card (task checklist) */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ─── Loader ─── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [recRes, acRes, crewRes] = await Promise.all([
        api.get('/maintenance-records'),
        api.get('/aircraft'),
        api.get('/crew'),
      ]);
      setRecords(recRes.data?.data ?? []);
      setAircraftOptions(acRes.data?.data ?? []);
      setCrewOptions(crewRes.data?.data ?? []);
    } catch {
      setError('Unable to load maintenance data from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  /* ─── Filters ─── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        r.workOrderNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q);
      const matchPriority = priorityFilter === 'All' || r.priority === priorityFilter;
      const matchAircraft = aircraftFilter === 'All' || r.aircraftId === aircraftFilter;
      return matchSearch && matchPriority && matchAircraft;
    });
  }, [records, search, priorityFilter, aircraftFilter]);

  /* ─── Stats ─── */
  const stats = useMemo(() => ({
    total: records.length,
    open: records.filter((r) => r.status === 'OPEN').length,
    inProgress: records.filter((r) => r.status === 'IN_PROGRESS').length,
    critical: records.filter((r) => ['HIGH', 'CRITICAL'].includes(r.priority) && r.status !== 'CLOSED').length,
    resolved: records.filter((r) => ['RESOLVED', 'CLOSED'].includes(r.status)).length,
  }), [records]);

  /* ─── Work-Order CRUD ─── */
  const openCreate = () => {
    setEditingId(null);
    setWoForm(DEFAULT_WO_FORM());
    setWoError('');
    setShowWOModal(true);
  };

  const openEdit = (rec: MaintenanceRecord) => {
    setEditingId(rec.id);
    setWoForm({
      workOrderNumber: rec.workOrderNumber,
      title: rec.title,
      description: rec.description ?? '',
      status: rec.status,
      priority: rec.priority,
      aircraftId: rec.aircraftId,
      assignedTechnicianId: rec.assignedTechnicianId ?? '',
    });
    setWoError('');
    setShowWOModal(true);
  };

  const handleWOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woForm.workOrderNumber.trim() || !woForm.title.trim() || !woForm.aircraftId) {
      setWoError('Work order number, title, and aircraft are required.');
      return;
    }
    setWoSaving(true);
    setWoError('');
    const payload = {
      workOrderNumber: woForm.workOrderNumber.trim(),
      title: woForm.title.trim(),
      description: woForm.description.trim() || null,
      status: woForm.status,
      priority: woForm.priority,
      aircraftId: woForm.aircraftId,
      assignedTechnicianId: woForm.assignedTechnicianId || null,
    };
    try {
      if (editingId) {
        await api.put(`/maintenance-records/${editingId}`, payload);
      } else {
        await api.post('/maintenance-records', payload);
      }
      await loadData();
      setShowWOModal(false);
    } catch {
      setWoError('Could not save work order. Ensure the WO number is unique.');
    } finally {
      setWoSaving(false);
    }
  };

  const handleDelete = async (rec: MaintenanceRecord) => {
    if (!window.confirm(`Delete work order ${rec.workOrderNumber}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/maintenance-records/${rec.id}`);
      await loadData();
    } catch {
      setError('Unable to delete this work order.');
    }
  };

  /* ─── Status update ─── */
  const openStatusModal = (rec: MaintenanceRecord) => {
    setStatusRecord(rec);
    setNewStatus(rec.status);
  };

  const handleStatusSave = async () => {
    if (!statusRecord) return;
    setStatusSaving(true);
    try {
      await api.put(`/maintenance-records/${statusRecord.id}`, { status: newStatus });
      await loadData();
      setStatusRecord(null);
    } catch {
      setError('Failed to update status.');
    } finally {
      setStatusSaving(false);
    }
  };

  /* ─── Task CRUD ─── */
  const openAddTask = (rec: MaintenanceRecord) => {
    setTaskParent(rec);
    setTaskForm(DEFAULT_TASK_FORM());
    setTaskError('');
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskParent) {
      setTaskError('Task title is required.');
      return;
    }
    setTaskSaving(true);
    setTaskError('');
    try {
      await api.post(`/maintenance-records/${taskParent.id}/tasks`, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        assignedCrewId: taskForm.assignedCrewId || null,
        dueAt: taskForm.dueAt || null,
      });
      await loadData();
      setTaskParent(null);
    } catch {
      setTaskError('Could not add task. Please try again.');
    } finally {
      setTaskSaving(false);
    }
  };

  const toggleTaskStatus = async (task: MaintenanceTask) => {
    const nextStatus: MaintenanceStatus =
      task.status === 'OPEN' ? 'IN_PROGRESS' :
      task.status === 'IN_PROGRESS' ? 'RESOLVED' : 'OPEN';
    try {
      await api.put(`/maintenance-records/tasks/${task.id}`, {
        status: nextStatus,
        completedAt: nextStatus === 'RESOLVED' ? new Date().toISOString() : null,
      });
      await loadData();
    } catch {
      setError('Failed to update task status.');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/maintenance-records/tasks/${taskId}`);
      await loadData();
    } catch {
      setError('Failed to delete task.');
    }
  };

  /* ─── Helpers ─── */
  const taskProgress = (tasks: MaintenanceTask[]) => {
    if (!tasks.length) return null;
    const done = tasks.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return { done, total: tasks.length, pct: Math.round((done / tasks.length) * 100) };
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /* ═══════════════════════════════════════════════════════
     KANBAN CARD
  ══════════════════════════════════════════════════════ */
  const KanbanCard = ({ rec }: { rec: MaintenanceRecord }) => {
    const progress = taskProgress(rec.tasks);
    const expanded = expandedId === rec.id;

    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '14px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow var(--transition-fast)',
          cursor: 'default',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: PRIORITY_DOT[rec.priority], flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                {rec.workOrderNumber}
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
              {rec.title}
            </div>
          </div>
          <span className={`badge ${PRIORITY_BADGE[rec.priority]}`} style={{ fontSize: '10px', padding: '2px 7px', flexShrink: 0 }}>
            {rec.priority}
          </span>
        </div>

        {/* Aircraft + Technician */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Plane size={11} />
            <span>{rec.aircraft?.aircraftNo} — {rec.aircraft?.model}</span>
          </div>
          {rec.assignedTechnician && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <User size={11} />
              <span>{rec.assignedTechnician.name}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Clock size={11} />
            <span>{fmtDate(rec.openedAt)}</span>
          </div>
        </div>

        {/* Task progress bar */}
        {progress && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Tasks</span>
              <span style={{ fontWeight: 600 }}>{progress.done}/{progress.total}</span>
            </div>
            <div style={{ height: '4px', borderRadius: '9999px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress.pct}%`,
                  borderRadius: '9999px',
                  backgroundColor: progress.pct === 100 ? 'var(--status-active-text)' : 'var(--accent-cyan)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {isTaskAuthorized && (
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
              onClick={() => setExpandedId(expanded ? null : rec.id)}
              title="Toggle task checklist"
            >
              <ClipboardList size={11} />
              Tasks ({rec.tasks.length})
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
          {isWriteAuthorized && (
            <>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => openStatusModal(rec)}
                title="Update status"
              >
                <ArrowRight size={11} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => openEdit(rec)}
                title="Edit work order"
              >
                <Edit size={11} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--status-aog-text)', marginLeft: 'auto' }}
                onClick={() => void handleDelete(rec)}
                title="Delete work order"
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>

        {/* Expandable task checklist */}
        {expanded && (
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            {rec.tasks.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                No tasks yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {rec.tasks.map((task) => {
                  const done = task.status === 'RESOLVED' || task.status === 'CLOSED';
                  const inProg = task.status === 'IN_PROGRESS';
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '7px',
                        backgroundColor: done ? 'rgba(16,185,129,0.05)' : inProg ? 'rgba(245,158,11,0.05)' : '#f9fafb',
                        border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : inProg ? 'rgba(245,158,11,0.2)' : 'var(--border-color)'}`,
                      }}
                    >
                      <button
                        style={{ background: 'none', border: 'none', cursor: isTaskAuthorized ? 'pointer' : 'default', padding: '0', marginTop: '1px', flexShrink: 0 }}
                        onClick={() => isTaskAuthorized ? void toggleTaskStatus(task) : undefined}
                        title={done ? 'Mark open' : inProg ? 'Mark resolved' : 'Mark in progress'}
                      >
                        {done ? (
                          <CheckSquare size={15} color="var(--status-active-text)" />
                        ) : inProg ? (
                          <CheckSquare size={15} color="var(--status-maint-text)" />
                        ) : (
                          <Square size={15} color="var(--text-muted)" />
                        )}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '12px', fontWeight: 600,
                          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: done ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </div>
                        {task.assignedCrew && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <User size={10} style={{ display: 'inline', marginRight: '3px' }} />
                            {task.assignedCrew.name}
                          </div>
                        )}
                        {task.dueAt && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Due: {fmtDate(task.dueAt)}
                          </div>
                        )}
                      </div>
                      {isWriteAuthorized && (
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: 'var(--text-muted)', flexShrink: 0 }}
                          onClick={() => void deleteTask(task.id)}
                          title="Remove task"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {isTaskAuthorized && (
              <button
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '11px', gap: '4px', width: '100%', justifyContent: 'center' }}
                onClick={() => openAddTask(rec)}
              >
                <Plus size={11} /> Add Task
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Maintenance &amp; Work Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Track work orders, task checklists, and technician assignments across the fleet
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '7px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: viewMode === 'kanban' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'kanban' ? '#fff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '7px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: viewMode === 'list' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              List
            </button>
          </div>
          {isWriteAuthorized && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> New Work Order
            </button>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          marginBottom: '16px', padding: '12px 14px', borderRadius: '8px',
          border: '1px solid var(--status-aog-border)', backgroundColor: 'var(--status-aog-bg)',
          color: 'var(--status-aog-text)', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Total Work Orders</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</span>
        </div>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--status-muted-border)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Open</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--status-muted-text)' }}>{stats.open}</span>
        </div>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--status-maint-border)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>In Progress</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--status-maint-text)' }}>{stats.inProgress}</span>
        </div>
        <div className="col-3 card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--status-aog-border)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>High/Critical</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--status-aog-text)' }}>{stats.critical}</span>
        </div>
      </div>

      {/* ── Search & Filter Panel ── */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by WO number, title, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters-wrapper">
          <Filter size={16} color="var(--text-secondary)" />
          <select
            className="form-control"
            style={{ width: '150px', padding: '6px 10px', fontSize: '13px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
          >
            <option value="All">All Priorities</option>
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="form-control"
            style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
            value={aircraftFilter}
            onChange={(e) => setAircraftFilter(e.target.value)}
          >
            <option value="All">All Aircraft</option>
            {aircraftOptions.map((ac) => <option key={ac.id} value={ac.id}>{ac.aircraftNo}</option>)}
          </select>
        </div>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Wrench size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>Loading work orders...</p>
        </div>
      )}

      {/* ═══ KANBAN VIEW ═══ */}
      {!loading && viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'start' }}>
          {KANBAN_COLUMNS.map((col) => {
            const colCards = filtered.filter((r) => r.status === col.status);
            return (
              <div key={col.status} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Column header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '8px 8px 0 0',
                  backgroundColor: col.bg,
                  border: `1px solid var(--border-color)`, borderBottom: `3px solid ${col.accent}`,
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: col.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {col.label}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                    borderRadius: '9999px', backgroundColor: col.accent, color: '#fff',
                  }}>
                    {colCards.length}
                  </span>
                </div>
                {/* Column body */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  padding: '10px', minHeight: '120px',
                  backgroundColor: col.bg, border: '1px solid var(--border-color)',
                  borderTop: 'none', borderRadius: '0 0 8px 8px',
                }}>
                  {colCards.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                      No work orders
                    </div>
                  ) : (
                    colCards.map((rec) => <KanbanCard key={rec.id} rec={rec} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {!loading && viewMode === 'list' && (
        <div className="table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Work Order</th>
                <th>Aircraft</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Tasks</th>
                <th>Opened</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <AlertTriangle size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                    No work orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const progress = taskProgress(rec.tasks);
                  return (
                    <tr key={rec.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                          {rec.workOrderNumber}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                          <Plane size={13} style={{ color: 'var(--text-secondary)' }} />
                          {rec.aircraft?.aircraftNo}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '260px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{rec.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rec.description || '—'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${PRIORITY_BADGE[rec.priority]}`}>{rec.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${KANBAN_COLUMNS.find(c => c.status === rec.status)?.badgeClass ?? 'badge-muted'}`}>
                          {STATUS_LABEL[rec.status]}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {rec.assignedTechnician?.name ?? (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        {progress ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '4px', borderRadius: '9999px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${progress.pct}%`, borderRadius: '9999px', backgroundColor: progress.pct === 100 ? 'var(--status-active-text)' : 'var(--accent-cyan)' }} />
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {progress.done}/{progress.total}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{fmtDate(rec.openedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {isTaskAuthorized && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 8px' }}
                              onClick={() => openAddTask(rec)}
                              title="Add task"
                            >
                              <Plus size={13} />
                            </button>
                          )}
                          {isWriteAuthorized && (
                            <>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 8px', color: 'var(--accent-cyan)' }}
                                onClick={() => openStatusModal(rec)}
                                title="Update status"
                              >
                                <ArrowRight size={13} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 8px' }}
                                onClick={() => openEdit(rec)}
                                title="Edit"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 8px', color: 'var(--status-aog-text)' }}
                                onClick={() => void handleDelete(rec)}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════
          WORK ORDER CREATE / EDIT MODAL
      ══════════════════════════════════════════ */}
      {showWOModal && (
        <div className="modal-overlay" onClick={() => setShowWOModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingId ? 'Edit Work Order' : 'New Work Order'}</span>
              <button className="modal-close" onClick={() => setShowWOModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleWOSubmit(e)}>
              <div className="modal-body">
                {woError && (
                  <div style={{ backgroundColor: 'var(--status-aog-bg)', border: '1px solid var(--status-aog-border)', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--status-aog-text)' }}>
                    {woError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Work Order Number</label>
                    <input
                      className="form-control"
                      placeholder="e.g. WO-1042"
                      value={woForm.workOrderNumber}
                      onChange={(e) => setWoForm((c) => ({ ...c, workOrderNumber: e.target.value }))}
                      disabled={!!editingId}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Associated Aircraft</label>
                    <select
                      className="form-control"
                      value={woForm.aircraftId}
                      onChange={(e) => setWoForm((c) => ({ ...c, aircraftId: e.target.value }))}
                    >
                      <option value="">-- Select Aircraft --</option>
                      {aircraftOptions.map((ac) => <option key={ac.id} value={ac.id}>{ac.aircraftNo} ({ac.model})</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      placeholder="Brief title for this work order"
                      value={woForm.title}
                      onChange={(e) => setWoForm((c) => ({ ...c, title: e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      style={{ height: '80px', resize: 'vertical', fontFamily: 'var(--font-family)' }}
                      placeholder="Describe the maintenance scope, findings, or instructions..."
                      value={woForm.description}
                      onChange={(e) => setWoForm((c) => ({ ...c, description: e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={woForm.priority}
                      onChange={(e) => setWoForm((c) => ({ ...c, priority: e.target.value as MaintenancePriority }))}
                    >
                      {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={woForm.status}
                      onChange={(e) => setWoForm((c) => ({ ...c, status: e.target.value as MaintenanceStatus }))}
                    >
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label">Assigned Technician (optional)</label>
                    <select
                      className="form-control"
                      value={woForm.assignedTechnicianId}
                      onChange={(e) => setWoForm((c) => ({ ...c, assignedTechnicianId: e.target.value }))}
                    >
                      <option value="">-- Select Technician --</option>
                      {crewOptions.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.designation})</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={woSaving}>
                  {woSaving ? 'Saving...' : editingId ? 'Update Work Order' : 'Create Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STATUS UPDATE MODAL
      ══════════════════════════════════════════ */}
      {statusRecord && (
        <div className="modal-overlay" onClick={() => setStatusRecord(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Update Status</span>
              <button className="modal-close" onClick={() => setStatusRecord(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Current</div>
                  <span className={`badge ${KANBAN_COLUMNS.find(c => c.status === statusRecord.status)?.badgeClass ?? 'badge-muted'}`}>
                    {STATUS_LABEL[statusRecord.status]}
                  </span>
                </div>
                <ArrowRight size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>New Status</div>
                  <select
                    className="form-control"
                    style={{ padding: '4px 8px', fontSize: '13px', width: '150px' }}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as MaintenanceStatus)}
                  >
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '6px 10px', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.1)' }}>
                Work order: <strong>{statusRecord.workOrderNumber}</strong> — {statusRecord.title}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setStatusRecord(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={statusSaving} onClick={() => void handleStatusSave()}>
                {statusSaving ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ADD TASK MODAL
      ══════════════════════════════════════════ */}
      {taskParent && (
        <div className="modal-overlay" onClick={() => setTaskParent(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Task — {taskParent.workOrderNumber}</span>
              <button className="modal-close" onClick={() => setTaskParent(null)}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleTaskSubmit(e)}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {taskError && (
                  <div style={{ backgroundColor: 'var(--status-aog-bg)', border: '1px solid var(--status-aog-border)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: 'var(--status-aog-text)' }}>
                    {taskError}
                  </div>
                )}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Task Title</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Inspect hydraulic fluid levels"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((c) => ({ ...c, title: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-control"
                    style={{ height: '70px', resize: 'vertical', fontFamily: 'var(--font-family)' }}
                    placeholder="Task steps, reference, or notes..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((c) => ({ ...c, description: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assign To (optional)</label>
                    <select
                      className="form-control"
                      value={taskForm.assignedCrewId}
                      onChange={(e) => setTaskForm((c) => ({ ...c, assignedCrewId: e.target.value }))}
                    >
                      <option value="">-- Select Crew --</option>
                      {crewOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Due Date (optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={taskForm.dueAt}
                      onChange={(e) => setTaskForm((c) => ({ ...c, dueAt: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTaskParent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={taskSaving}>
                  {taskSaving ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Maintenance;
