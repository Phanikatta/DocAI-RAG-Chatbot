import ReactMarkdown from 'react-markdown'
import { User, Zap } from 'lucide-react'
import SourceCitations from './SourceCitations'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className="animate-fade"
      style={{
        display: 'flex',
        gap: 12,
        padding: '4px 0',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'var(--red)' : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border-light)',
        boxShadow: isUser ? '0 0 12px rgba(229,9,20,0.3)' : 'none',
      }}>
        {isUser ? <User size={15} color="#fff" /> : <Zap size={15} color="var(--red)" fill="var(--red)" />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '72%', minWidth: 60 }}>
        <div style={{
          background: isUser ? 'var(--red)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px',
          boxShadow: isUser ? '0 2px 12px rgba(229,9,20,0.2)' : 'none',
        }}>
          {isUser ? (
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#fff', margin: 0 }}>{message.content}</p>
          ) : (
            <div className="markdown-body" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' }}>
              <ReactMarkdown
                components={{
                  p:      ({ children }) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
                  ul:     ({ children }) => <ul style={{ paddingLeft: 18, margin: '4px 0 8px' }}>{children}</ul>,
                  ol:     ({ children }) => <ol style={{ paddingLeft: 18, margin: '4px 0 8px' }}>{children}</ol>,
                  li:     ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ color: '#fff', fontWeight: 600 }}>{children}</strong>,
                  h1:     ({ children }) => <h1 style={{ fontSize: 16, margin: '8px 0 4px', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>{children}</h1>,
                  h2:     ({ children }) => <h2 style={{ fontSize: 15, margin: '8px 0 4px' }}>{children}</h2>,
                  h3:     ({ children }) => <h3 style={{ fontSize: 14, margin: '6px 0 3px' }}>{children}</h3>,
                  code:   ({ inline, children }) =>
                    inline
                      ? <code style={{ background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4, fontSize: 12, color: '#63b3ed', fontFamily: 'monospace' }}>{children}</code>
                      : <pre style={{ background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 8, overflow: 'auto', fontSize: 12, margin: '6px 0' }}><code style={{ fontFamily: 'monospace', color: '#a8ff78' }}>{children}</code></pre>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--red)', paddingLeft: 10, color: 'var(--text-secondary)', margin: '6px 0' }}>{children}</blockquote>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && (
          <SourceCitations sources={message.sources} />
        )}

        {/* Timestamp */}
        <div style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 4,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
