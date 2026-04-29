import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, BookOpen } from 'lucide-react'

export default function SourceCitations({ sources }) {
  const [open, setOpen] = useState(false)

  if (!sources || sources.length === 0) return null

  const avgScore = (sources.reduce((a, s) => a + s.relevance_score, 0) / sources.length * 100).toFixed(0)

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)',
          color: '#63b3ed', borderRadius: 20, padding: '3px 10px',
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
          transition: 'all var(--transition)',
        }}
      >
        <BookOpen size={12} />
        {sources.length} source{sources.length > 1 ? 's' : ''} · {avgScore}% relevance
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="animate-fade" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sources.map((src, i) => (
            <SourceCard key={i} source={src} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false)
  const score = Math.round(source.relevance_score * 100)
  const scoreColor = score >= 80 ? '#46d369' : score >= 60 ? '#f5a623' : '#a3a3a3'

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 12px', fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4, background: 'rgba(99,179,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontSize: 10, fontWeight: 700, color: '#63b3ed',
          }}>
            {index}
          </div>
          <FileText size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span className="truncate" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
            {source.filename}
          </span>
          {source.page && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
              p.{source.page}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Relevance bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 99 }}>
              <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: scoreColor, fontWeight: 600 }}>{score}%</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: 8, padding: '8px 10px',
          background: 'var(--bg-card)', borderRadius: 6,
          fontSize: 12, color: 'var(--text-secondary)',
          lineHeight: 1.6, borderLeft: '2px solid rgba(99,179,237,0.3)',
          maxHeight: 160, overflowY: 'auto',
        }}>
          {source.content}
        </div>
      )}
    </div>
  )
}
