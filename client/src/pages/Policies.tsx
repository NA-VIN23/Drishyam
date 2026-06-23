import React, { useState } from 'react';
import { mockPolicies } from '../data/mockData';
import type { Policy } from '../types';
import { Search, Upload, X, FileText, Tag, Calendar, File, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Safety', 'Operations', 'Flight Operations', 'Maintenance', 'Regulatory'];

const Policies: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);

  const [form, setForm] = useState({
    title: '', category: 'Safety', version: '', fileSize: 'N/A'
  });
  const [formError, setFormError] = useState('');
  const [fileName, setFileName] = useState('');

  const filtered = policies.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category) {
      setFormError('Title and Category are required.');
      return;
    }
    const newPolicy: Policy = {
      id: `POL-${String(policies.length + 100 + 1)}`,
      title: form.title,
      category: form.category,
      uploadDate: new Date().toISOString().split('T')[0],
      version: form.version || '1.0',
      fileSize: fileName ? form.fileSize : 'N/A'
    };
    setPolicies(prev => [newPolicy, ...prev]);
    setShowModal(false);
    setForm({ title: '', category: 'Safety', version: '', fileSize: 'N/A' });
    setFileName('');
    setFormError('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Safety':          return { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'rgba(220,38,38,0.25)' };
      case 'Operations':      return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', border: 'rgba(59,130,246,0.25)' };
      case 'Flight Operations': return { bg: 'rgba(8,145,178,0.1)', color: '#0891b2', border: 'rgba(8,145,178,0.25)' };
      case 'Maintenance':     return { bg: 'rgba(217,119,6,0.1)', color: '#d97706', border: 'rgba(217,119,6,0.25)' };
      case 'Regulatory':      return { bg: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: 'rgba(139,92,246,0.25)' };
      default:                return { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.25)' };
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Policy Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {policies.length} documents · Regulatory & Compliance Directives
          </p>
        </div>
        <button className="btn btn-cyan" onClick={() => setShowModal(true)}>
          <Upload size={16} />
          Upload Policy
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        overflowX: 'auto', paddingBottom: '4px', flexWrap: 'wrap'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
              border: `1px solid ${categoryFilter === cat ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              backgroundColor: categoryFilter === cat ? 'rgba(8,145,178,0.08)' : 'var(--bg-card)',
              color: categoryFilter === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s ease',
              fontFamily: 'var(--font-family)', whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-filter-panel" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ maxWidth: '500px' }}>
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search policy title or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Filter size={14} />
          <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Policy Cards Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 20px',
          backgroundColor: 'var(--bg-card)', borderRadius: '12px',
          border: '1px solid var(--border-color)', color: 'var(--text-muted)'
        }}>
          <FileText size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', margin: 0 }}>No policies found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map(policy => {
            const catColor = getCategoryColor(policy.category);
            return (
              <div key={policy.id} className="card" style={{ cursor: 'pointer' }}>
                {/* Card Top: Icon + Category Badge */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: '14px'
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    backgroundColor: catColor.bg, border: `1px solid ${catColor.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={20} color={catColor.color} />
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '9999px', letterSpacing: '0.03em', textTransform: 'uppercase',
                    backgroundColor: catColor.bg, color: catColor.color,
                    border: `1px solid ${catColor.border}`
                  }}>
                    {policy.category}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
                  margin: '0 0 14px', lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {policy.title}
                </h3>

                {/* Meta row */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '12px',
                  paddingTop: '12px', borderTop: '1px solid var(--border-color)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Tag size={11} /> v{policy.version}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Calendar size={11} />
                    {new Date(policy.uploadDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    <File size={11} /> {policy.fileSize}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Policy Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Upload New Policy</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload}>
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
                  <label className="form-label">Policy Title</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Emergency Procedures Manual v2.1"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Version</label>
                    <input
                      className="form-control"
                      placeholder="e.g. 2.1"
                      value={form.version}
                      onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    />
                  </div>
                </div>

                {/* File drop zone */}
                <div className="form-group">
                  <label className="form-label">Document File</label>
                  <label htmlFor="policy-file-input" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '28px 20px', borderRadius: '8px', cursor: 'pointer',
                    border: `2px dashed ${fileName ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    backgroundColor: fileName ? 'rgba(8,145,178,0.04)' : 'rgba(243,244,246,0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    <Upload size={24} color={fileName ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                    {fileName ? (
                      <span style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 500 }}>
                        {fileName}
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          Click to select file
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          PDF, DOCX, XLSX — Max 50 MB
                        </span>
                      </>
                    )}
                  </label>
                  <input
                    id="policy-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.xlsx"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        setForm(f => ({ ...f, fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-cyan">
                  <Upload size={15} /> Upload Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;