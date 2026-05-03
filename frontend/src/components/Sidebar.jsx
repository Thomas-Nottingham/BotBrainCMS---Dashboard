import React from 'react'
import { NavLink } from 'react-router-dom'

const nav = [
  { section: 'Content' },
  { to: '/products', label: 'Products', icon: '▦' },
  { to: '/knowledge', label: 'Knowledge base', icon: '◎' },
  { section: 'Chatbot' },
  { to: '/appearance', label: 'Appearance', icon: '◐' },
  { section: 'System' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 210, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '0.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>BotBrain CMS</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Content Management</div>
      </div>
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {nav.map((item, i) =>
          item.section ? (
            <div key={i} style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
              padding: '12px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>{item.section}</div>
          ) : (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', fontSize: 13,
              color: isActive ? 'var(--text)' : 'var(--text-2)',
              fontWeight: isActive ? 500 : 400,
              background: isActive ? 'var(--bg)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}>
              <span style={{ fontSize: 14, opacity: 0.7, width: 16, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
        v1.0.0 · Connected ✓
      </div>
    </aside>
  )
}
