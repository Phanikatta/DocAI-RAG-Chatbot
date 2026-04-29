import { useState } from 'react'
import { Lock, Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'

export default function PasswordModal({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      const { data } = await authApi.login(password)
      if (data.success) {
        sessionStorage.setItem('admin_auth', 'true')
        toast.success('Welcome, Admin!')
        onSuccess()
      } else {
        toast.error('Incorrect password')
        setPassword('')
      }
    } catch {
      toast.error('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
      backdropFilter: 'blur(8px)',
    }}>
      <div className="animate-fade" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 16, padding: '36px 32px',
        width: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(229,9,20,0.2)',
          }}>
            <Lock size={22} color="var(--red)" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Admin Access</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Enter the admin password to manage documents
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              className="input"
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex',
              }}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !password}
            style={{ justifyContent: 'center', height: 42 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Verifying…</>
              : <><Zap size={15} /> Enter Admin</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Default password: <code style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4 }}>admin123</code>
        </p>
      </div>
    </div>
  )
}
