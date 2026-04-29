import { useState } from 'react'
import { Plus, Trash2, MessageSquare, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { chatApi } from '../services/api'

export default function Sidebar({
  sessions, activeSession, onSelectSession, onNewSession, onDeleteSession,
  documents, docFilter, onDocFilterChange,
}) {
  const [docsOpen, setDocsOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  async function handleNew() {
    try {
      const { data } = await chatApi.createSession()
      onNewSession(data)
    } catch {
      toast.error('Failed to create session')
    }
  }

  async function confirmDelete(id) {
    try {
      await chatApi.deleteSession(id)
      onDeleteSession(id)
      toast.success('Chat deleted')
    } catch {
      toast.error('Failed to delete chat')
    } finally {
      setConfirmId(null)
    }
  }

  function fmt(dt) {
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <aside style={{
      width: 260, minWidth: 260,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* New chat button */}
      <div style={{ padding: '14px 12px 10px' }}>
        <button className="btn btn-primary w-full" onClick={handleNew} style={{ justifyContent: 'center' }}>
          <Plus size={15} /> New Chat
        </button>
      </div>

      {/* Sessions list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '6px 6px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Recent Chats
        </p>

        {sessions.length === 0 && (
          <div style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No chats yet.<br />Start a new conversation!
          </div>
        )}

        {sessions.map((s) => {
          const isActive = s.id === activeSession?.id
          const isConfirming = confirmId === s.id

          return (
            <div key={s.id} style={{ marginBottom: 2 }}>
              <div
                onClick={() => !isConfirming && onSelectSession(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  border: isActive ? '1px solid var(--border-light)' : '1px solid transparent',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-card)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <MessageSquare size={14} style={{ color: isActive ? 'var(--red)' : 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {s.message_count} msg · {fmt(s.created_at)}
                  </div>
                </div>

                {/* Delete button — always visible at low opacity */}
                <button
                  className="btn-icon danger"
                  style={{ padding: 4, flexShrink: 0, opacity: 0.35, transition: 'opacity var(--transition)' }}
                  onClick={e => { e.stopPropagation(); setConfirmId(s.id) }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.35' }}
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Inline confirm row */}
              {isConfirming && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 10px', borderRadius: 8, marginTop: 2,
                  background: 'rgba(229,9,20,0.08)',
                  border: '1px solid rgba(229,9,20,0.25)',
                  fontSize: 12, color: 'var(--text-secondary)',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <span>Delete this chat?</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => confirmDelete(s.id)}
                      style={{ fontSize: 11, fontWeight: 700, color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Document filter */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px 12px' }}>
        <button
          onClick={() => setDocsOpen(!docsOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0', marginBottom: 6 }}
        >
          {docsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          Filter by Doc
        </button>

        {docsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button
              onClick={() => onDocFilterChange(null)}
              style={{
                textAlign: 'left', background: !docFilter ? 'rgba(229,9,20,0.12)' : 'transparent',
                border: !docFilter ? '1px solid rgba(229,9,20,0.3)' : '1px solid transparent',
                color: !docFilter ? 'var(--red)' : 'var(--text-secondary)',
                borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer',
              }}
            >
              All Documents
            </button>
            {documents.map((d) => (
              <button
                key={d.id}
                onClick={() => onDocFilterChange(d.id)}
                style={{
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 5,
                  background: docFilter === d.id ? 'rgba(229,9,20,0.12)' : 'transparent',
                  border: docFilter === d.id ? '1px solid rgba(229,9,20,0.3)' : '1px solid transparent',
                  color: docFilter === d.id ? 'var(--red)' : 'var(--text-secondary)',
                  borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer',
                }}
              >
                <FileText size={11} style={{ flexShrink: 0 }} />
                <span className="truncate">{d.filename}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
