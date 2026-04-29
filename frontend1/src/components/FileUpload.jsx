import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { documentsApi } from '../services/api'

export default function FileUpload({ onUploaded }) {
  const [queue, setQueue] = useState([])   // { file, status: 'pending'|'uploading'|'done'|'error', error }
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted) => {
    const newItems = accepted.map((f) => ({ file: f, status: 'pending', error: null }))
    setQueue((prev) => [...prev, ...newItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] },
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejections) => {
      rejections.forEach(({ file, errors }) => {
        toast.error(`${file.name}: ${errors[0].message}`)
      })
    },
  })

  function removeFromQueue(index) {
    setQueue((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadAll() {
    const pending = queue.filter((q) => q.status === 'pending')
    if (!pending.length) return

    setUploading(true)
    const files = pending.map((q) => q.file)

    // Mark all as uploading
    setQueue((prev) => prev.map((q) => q.status === 'pending' ? { ...q, status: 'uploading' } : q))

    try {
      const { data } = await documentsApi.upload(files)
      setQueue((prev) => prev.map((q) => q.status === 'uploading' ? { ...q, status: 'done' } : q))
      toast.success(`${data.length} document${data.length > 1 ? 's' : ''} uploaded & indexed!`)
      onUploaded(data)
      // Auto-clear done items after 2s
      setTimeout(() => setQueue((prev) => prev.filter((q) => q.status !== 'done')), 2000)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed'
      setQueue((prev) => prev.map((q) => q.status === 'uploading' ? { ...q, status: 'error', error: msg } : q))
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const statusIcon = { uploading: <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} />, done: <CheckCircle size={14} color="var(--success)" />, error: <AlertCircle size={14} color="#ff4d4d" />, pending: null }

  return (
    <div>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--red)' : 'var(--border-light)'}`,
          borderRadius: 12, padding: '32px 24px', textAlign: 'center',
          background: isDragActive ? 'rgba(229,9,20,0.05)' : 'var(--bg-card)',
          cursor: 'pointer', transition: 'all var(--transition)',
          boxShadow: isDragActive ? 'var(--shadow-red)' : 'none',
        }}
      >
        <input {...getInputProps()} />
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
          background: isDragActive ? 'rgba(229,9,20,0.15)' : 'var(--bg-elevated)',
          border: `1px solid ${isDragActive ? 'rgba(229,9,20,0.4)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Upload size={20} color={isDragActive ? 'var(--red)' : 'var(--text-secondary)'} />
        </div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          {isDragActive ? 'Drop files here…' : 'Drag & drop or click to upload'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          PDF, DOCX — up to 50 MB each
        </p>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {queue.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <FileText size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{item.file.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {fmtSize(item.file.size)}
                  {item.error && <span style={{ color: '#ff4d4d', marginLeft: 6 }}>{item.error}</span>}
                </div>
              </div>
              {statusIcon[item.status]}
              {item.status !== 'uploading' && (
                <button className="btn-icon" style={{ padding: 3 }} onClick={() => removeFromQueue(i)}>
                  <X size={13} />
                </button>
              )}
            </div>
          ))}

          {queue.some((q) => q.status === 'pending') && (
            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', marginTop: 4 }}
              onClick={uploadAll}
              disabled={uploading}
            >
              {uploading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Uploading…</> : <><Upload size={14} /> Upload {queue.filter((q) => q.status === 'pending').length} File(s)</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
