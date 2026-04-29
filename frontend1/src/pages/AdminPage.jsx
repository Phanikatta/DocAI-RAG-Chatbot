import { useState, useEffect } from 'react'
import { Shield, FileText, Layers, RefreshCw, Database } from 'lucide-react'
import toast from 'react-hot-toast'
import PasswordModal from '../components/PasswordModal'
import FileUpload from '../components/FileUpload'
import DocumentList from '../components/DocumentList'
import { documentsApi, healthApi } from '../services/api'

export default function AdminPage() {
  const [authed, setAuthed]       = useState(sessionStorage.getItem('admin_auth') === 'true')
  const [documents, setDocuments] = useState([])
  const [health, setHealth]       = useState(null)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (authed) loadData()
  }, [authed])

  async function loadData() {
    setLoading(true)
    try {
      const [docRes, healthRes] = await Promise.all([documentsApi.list(), healthApi.check()])
      setDocuments(docRes.data)
      setHealth(healthRes.data)
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  function handleUploaded(newDocs) {
    setDocuments((prev) => [...newDocs, ...prev])
    loadData()  // refresh health stats
  }

  function handleDeleted(docId) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    loadData()
  }

  if (!authed) return <PasswordModal onSuccess={() => setAuthed(true)} />

  const totalChunks = documents.reduce((s, d) => s + d.chunk_count, 0)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px', overflowY: 'auto', height: '100%' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="var(--red)" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Document Management</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload, manage and index your knowledge base</p>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={loadData} disabled={loading}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      {health && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard icon={FileText} label="Documents" value={documents.length} color="var(--red)" />
          <StatCard icon={Layers}   label="Total Chunks" value={health.total_chunks} color="#63b3ed" />
          <StatCard icon={Database} label="Chat Sessions" value={health.session_count} color="var(--success)" />
        </div>
      )}

      {/* Upload section */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          Upload Documents
        </h2>
        <FileUpload onUploaded={handleUploaded} />
      </section>

      <div className="divider" />

      {/* Document list */}
      <section style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            Knowledge Base
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
              {documents.length} file{documents.length !== 1 ? 's' : ''} · {totalChunks} chunks indexed
            </span>
          </h2>
        </div>
        <DocumentList documents={documents} onDeleted={handleDeleted} />
      </section>

      {/* Logout */}
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
          style={{ color: 'var(--text-muted)' }}
        >
          Sign out of Admin
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}
