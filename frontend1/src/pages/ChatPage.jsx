import { useState, useEffect, useRef } from 'react'
import { Send, Square } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { chatApi, documentsApi } from '../services/api'

export default function ChatPage() {
  const [sessions, setSessions]         = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages]         = useState([])
  const [documents, setDocuments]       = useState([])
  const [docFilter, setDocFilter]       = useState(null)
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const inputRef                        = useRef(null)

  // Load sessions + documents on mount
  useEffect(() => {
    async function init() {
      try {
        const [sesRes, docRes] = await Promise.all([chatApi.getSessions(), documentsApi.list()])
        setSessions(sesRes.data)
        setDocuments(docRes.data)

        if (sesRes.data.length > 0) {
          const latest = sesRes.data[0]
          setActiveSession(latest)
          const msgRes = await chatApi.getMessages(latest.id)
          setMessages(msgRes.data)
        }
      } catch {
        toast.error('Failed to load data')
      }
    }
    init()
  }, [])

  async function selectSession(session) {
    setActiveSession(session)
    try {
      const { data } = await chatApi.getMessages(session.id)
      setMessages(data)
    } catch {
      toast.error('Failed to load messages')
    }
    inputRef.current?.focus()
  }

  function handleNewSession(session) {
    setSessions((prev) => [session, ...prev])
    setActiveSession(session)
    setMessages([])
    inputRef.current?.focus()
  }

  function handleDeleteSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSession?.id === id) {
      setActiveSession(null)
      setMessages([])
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    let sessionId = activeSession?.id
    if (!sessionId) {
      try {
        const { data } = await chatApi.createSession()
        sessionId = data.id
        setSessions((prev) => [data, ...prev])
        setActiveSession(data)
      } catch {
        toast.error('Failed to create session')
        return
      }
    }

    // Optimistically add user message
    const tempUserMsg = { id: `tmp-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString(), sources: null }
    setMessages((prev) => [...prev, tempUserMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await chatApi.sendMessage(sessionId, text, docFilter)
      // Replace temp + add real assistant message
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        { ...tempUserMsg, id: `user-${Date.now()}` },
        data.message,
      ])
      // Update session title if first message
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, message_count: s.message_count + 2 } : s))
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
      toast.error(err.response?.data?.detail || 'Failed to get response')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const activeDocName = docFilter ? documents.find((d) => d.id === docFilter)?.filename : null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={selectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        documents={documents}
        docFilter={docFilter}
        onDocFilterChange={setDocFilter}
      />

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header bar */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-base)', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 1 }}>
              {activeSession?.title || 'New Conversation'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {activeDocName
                ? <>Searching in <strong style={{ color: 'var(--red)' }}>{activeDocName}</strong></>
                : `${documents.length} document${documents.length !== 1 ? 's' : ''} in knowledge base`}
            </p>
          </div>
          {activeDocName && (
            <button className="btn btn-ghost btn-sm" onClick={() => setDocFilter(null)}>
              Clear Filter
            </button>
          )}
        </div>

        {/* Messages */}
        <ChatWindow messages={messages} isLoading={loading} docFilterName={activeDocName} />

        {/* Input area */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          background: 'var(--bg-base)', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '8px 8px 8px 16px',
            transition: 'border-color var(--transition)',
          }}
            onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
            onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents… (Enter to send, Shift+Enter for newline)"
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                resize: 'none', fontFamily: 'inherit', maxHeight: 120, overflowY: 'auto',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{ borderRadius: 10, padding: '8px 14px', flexShrink: 0, alignSelf: 'flex-end' }}
            >
              {loading
                ? <Square size={15} fill="#fff" />
                : <Send size={15} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
            Powered by Groq LLaMA3 + RAG · Answers grounded in your documents
          </p>
        </div>
      </div>
    </div>
  )
}
