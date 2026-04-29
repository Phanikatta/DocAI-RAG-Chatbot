import { useState } from 'react'
import { FileText, Trash2, Layers, Calendar, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'
import { documentsApi } from '../services/api'

export default function DocumentList({ documents, onDeleted }) {
  const [deleting, setDeleting] = useState(null)

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.filename}"? This removes all its indexed chunks.`)) return
    setDeleting(doc.id)
    try {
      await documentsApi.delete(doc.id)
      onDeleted(doc.id)
      toast.success(`"${doc.filename}" deleted`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  function fmtSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  function fmtDate(dt) {
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (documents.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        color: 'var(--text-muted)', fontSize: 14,
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
      }}>
        <FileText size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
        <p>No documents uploaded yet.</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Upload PDFs or DOCX files above to get started.</p>
      </div>
    )
  }

  const badgeColors = { PDF: 'var(--red)', DOCX: '#63b3ed', DOC: '#63b3ed' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}
        >
          {/* Icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${badgeColors[doc.file_type] || 'var(--text-muted)'}18`,
            border: `1px solid ${badgeColors[doc.file_type] || 'var(--border)'}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={18} color={badgeColors[doc.file_type] || 'var(--text-muted)'} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>{doc.filename}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                background: `${badgeColors[doc.file_type] || 'var(--text-muted)'}22`,
                color: badgeColors[doc.file_type] || 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {doc.file_type}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Layers size={11} /> {doc.chunk_count} chunks
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <HardDrive size={11} /> {fmtSize(doc.size_bytes)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} /> {fmtDate(doc.uploaded_at)}
              </span>
            </div>
          </div>

          {/* Delete */}
          <button
            className="btn-icon danger"
            onClick={() => handleDelete(doc)}
            disabled={deleting === doc.id}
            title="Delete document"
          >
            {deleting === doc.id
              ? <span className="spinner" style={{ width: 14, height: 14 }} />
              : <Trash2 size={15} />}
          </button>
        </div>
      ))}
    </div>
  )
}
