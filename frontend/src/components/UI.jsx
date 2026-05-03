import React from 'react'

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Btn({ children, variant = 'default', size = 'md', onClick, disabled, type = 'button', style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: '0.5px solid var(--border-strong)',
    borderRadius: 'var(--radius)', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s',
    background: 'var(--surface)', color: 'var(--text)',
    padding: size === 'sm' ? '4px 10px' : '7px 14px',
    fontSize: size === 'sm' ? 12 : 13,
  }
  const variants = {
    primary: { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' },
    danger: { color: 'var(--danger-text)', borderColor: 'var(--danger-text)', background: 'transparent' },
    ghost: { border: 'none', background: 'transparent', color: 'var(--text-2)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: { background: 'var(--bg)', color: 'var(--text-2)', border: '0.5px solid var(--border)' },
    product: { background: 'var(--info-bg)', color: 'var(--info-text)', border: 'none' },
    general: { background: 'var(--success-bg)', color: 'var(--success-text)', border: 'none' },
    support: { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: 'none' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      ...styles[variant]
    }}>{children}</span>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      ...style
    }}>{children}</div>
  )
}

export function CardHeader({ children, style }) {
  return (
    <div style={{
      padding: '14px 18px',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      ...style
    }}>{children}</div>
  )
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '0.5px solid var(--border)', width: 500, maxWidth: '95vw',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px 18px', borderBottom: '0.5px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{title}</span>
          <Btn variant="ghost" size="sm" onClick={onClose} style={{ fontSize: 18, padding: '2px 8px' }}>✕</Btn>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '14px 18px', borderTop: '0.5px solid var(--border)',
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0
          }}>{footer}</div>
        )}
      </div>
    </div>
  )
}

// ─── FIELD ───────────────────────────────────────────────────────────────────
export function Field({ label, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</span>}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function Empty({ message = 'No items found' }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
      {message}
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastTimeout
export function showToast(message, type = 'success') {
  let el = document.getElementById('toast-root')
  if (!el) {
    el = document.createElement('div')
    el.id = 'toast-root'
    document.body.appendChild(el)
  }
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;color:#fff;background:${type === 'error' ? '#b91c1c' : '#166534'};box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;`
  el.textContent = message
  el.style.opacity = 1
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { el.style.opacity = 0 }, 2500)
}

// ─── CONFIRM ──────────────────────────────────────────────────────────────────
export function useConfirm() {
  return (message) => window.confirm(message)
}

// ─── TWO-COL GRID ─────────────────────────────────────────────────────────────
export function TwoCol({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
}
