import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, Settings, Zap, Sun, Moon } from 'lucide-react'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('docai-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('docai-theme', theme)
  }, [theme])

  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  const navLinks = [
    { to: '/',      label: 'Chat',  icon: MessageSquare },
    { to: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <nav style={{
      background: 'var(--navbar-bg)',
      borderBottom: '1px solid var(--navbar-border)',
      padding: '0 28px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34,
          background: 'var(--red)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(229,9,20,0.5)',
        }}>
          <Zap size={18} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Doc<span style={{ color: 'var(--red)' }}>AI</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: active ? 'var(--bg-elevated)' : 'transparent',
              border: active ? '1px solid var(--border-light)' : '1px solid transparent',
              transition: 'all var(--transition)', textDecoration: 'none',
            }}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right: theme toggle + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Day / Night toggle */}
        <button
          onClick={toggle}
          title={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 20,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            cursor: 'pointer', color: 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600,
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          {isLight
            ? <><Moon size={14} /> Night</>
            : <><Sun  size={14} /> Day</>}
        </button>

        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
          RAG Online
        </div>
      </div>
    </nav>
  )
}
