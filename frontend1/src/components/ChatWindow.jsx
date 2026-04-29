import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { Zap } from 'lucide-react'

export default function ChatWindow({ messages, isLoading, docFilterName }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, boxShadow: '0 0 32px rgba(229,9,20,0.15)',
        }}>
          <Zap size={28} color="var(--red)" fill="var(--red)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ask your documents anything</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 400, lineHeight: 1.6 }}>
          Upload PDFs or DOCX files via <strong style={{ color: '#fff' }}>Admin</strong>, then ask questions here.
          {docFilterName && (
            <span> Currently searching in <strong style={{ color: 'var(--red)' }}>{docFilterName}</strong>.</span>
          )}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Summarize the main points', 'What are the key findings?', 'List all recommendations'].map((s) => (
            <span key={s} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'default',
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="animate-fade" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
      }}>
        <Zap size={15} color="var(--red)" fill="var(--red)" />
      </div>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '4px 16px 16px 16px', padding: '12px 16px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
