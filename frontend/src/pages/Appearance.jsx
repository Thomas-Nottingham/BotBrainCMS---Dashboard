import React, { useState, useEffect } from 'react'
import { Btn, Card, CardHeader, Field, showToast } from '../components/UI'

const DEFAULT = {
  accentColor: '#000000',
  colorScheme: 'light',
  radius: 'round',
  density: 'spacious',
  hue: 210,
  tint: 5,
  shade: 3,
  botName: 'Inspitalfields',
  greeting: 'Welcome to Inspitalfields — ask me anything about our products or services!',
  placeholder: 'Type your question here...',
}

function Pill({ label, active, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
      border: '0.5px solid var(--border)',
      background: active ? 'var(--accent)' : 'var(--surface)',
      color: active ? 'var(--accent-text)' : 'var(--text-2)',
      fontWeight: active ? 500 : 400, transition: 'all 0.15s', ...style
    }}>{label}</button>
  )
}



export default function Appearance() {
  const [s, setS] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load appearance from MongoDB on mount
  useEffect(() => {
    fetch('/api/appearance')
      .then(r => r.json())
      .then(data => {
        setS(prev => ({ ...prev, ...data }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const set = (key, val) => setS(p => ({ ...p, [key]: val }))

  const [previewKey, setPreviewKey] = useState(0)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      })
      showToast('Appearance saved!')
      setPreviewKey(k => k + 1)  // forces iframe reload after save
    } catch (e) {
      showToast('Failed to save appearance')
    } finally {
      setSaving(false)
    }
  }


  const themeConfig = `theme: {
  density: "${s.density}",
  colorScheme: "${s.colorScheme}",
  color: {
    grayscale: { hue: ${s.hue}, tint: ${s.tint}, shade: ${s.shade} },
    accent: { primary: "${s.accentColor}", level: 2 },
  },
  radius: "${s.radius}",
},`

  const widgetConfig = `<ChatWidget
  botName="${s.botName}"
  greeting="${s.greeting}"
  placeholder="${s.placeholder}"
  ${themeConfig}
/>`

  const copy = (text, label) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard`)
  }

  const CHATKIT_DEFAULT = {
    accentColor: '#000000',
    colorScheme: 'light',
    radius: 'round',
    density: 'spacious',
    hue: 160,
    tint: 1,
    shade: 1,
    botName: s.botName,        // keep their bot name
    greeting: s.greeting,      // keep their greeting
    placeholder: s.placeholder // keep their placeholder
  }

  // Compute preview colours
  const isDark = s.colorScheme === 'dark'
  const previewBg = isDark ? '#1a1a18' : '#f5f5f3'
  const previewSurface = isDark ? '#2a2a28' : '#ffffff'
  const previewText = isDark ? '#e8e8e4' : '#1a1a18'
  const previewText2 = isDark ? '#9a9a96' : '#6b6b67'
  const bubbleRadius = s.radius === 'none' ? 4 : s.radius === 'pill' ? 20 : 12
  const spacing = s.density === 'compact' ? 8 : 14



  if (loading) return <div style={{ padding: 28, color: 'var(--text-2)' }}>Loading appearance settings...</div>

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Appearance</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            Customise how the chatbot widget looks on your client's site
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save & preview'}
          </Btn>
          <Btn variant="secondary" onClick={() => setS(prev => ({ ...prev, ...CHATKIT_DEFAULT }))}>
            Reset to default
          </Btn>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Settings panel */}
        <Card>
          <CardHeader><span style={{ fontWeight: 500, fontSize: 14 }}>Theme settings</span></CardHeader>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Accent colour">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <input type="color" value={s.accentColor} onChange={e => set('accentColor', e.target.value)}
                    style={{ height: 36, border: '0.5px solid var(--border)', borderRadius: 6, padding: 2, cursor: 'pointer', background: 'none', width: 'auto' }} />
                  <code style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.accentColor}</code>
                </div>
              </Field>


            </div>

            <Field label="Greeting message">
              <textarea rows={2} value={s.greeting} onChange={e => set('greeting', e.target.value)} style={{ marginTop: 4 }} />
            </Field>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Colour scheme">
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {['light', 'dark'].map(v =>
                    <Pill key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} active={s.colorScheme === v} onClick={() => set('colorScheme', v)} />
                  )}
                </div>
              </Field>

              <Field label="Border radius">
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {[['round', '8px'], ['pill', '20px']].map(([v, br]) =>
                    <Pill key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} active={s.radius === v} onClick={() => set('radius', v)} style={{ borderRadius: br }} />
                  )}
                </div>
              </Field>

              <Field label="Density">
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {['compact', 'spacious'].map(v =>
                    <Pill key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} active={s.density === v} onClick={() => set('density', v)} />
                  )}
                </div>
              </Field>
            </div>



            <Field label={`Grayscale hue: ${s.hue}`} hint="Shifts the neutral tones — try 210 for blue-grey, 40 for warm tan">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input type="range" min={0} max={360} value={s.hue} onChange={e => set('hue', +e.target.value)} style={{ flex: 1 }} />
                <code style={{ fontSize: 12, minWidth: 30 }}>{s.hue}</code>
              </div>
            </Field>

            <Field label={`Tint: ${s.tint}`} hint="Controls how light the neutral tones are — try 1 for minimal, 8 for stronger tint">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input type="range" min={1} max={9} value={s.tint} onChange={e => set('tint', +e.target.value)} style={{ flex: 1 }} />
                <code style={{ fontSize: 12, minWidth: 30 }}>{s.tint}</code>
              </div>
            </Field>

            <Field label={`Shade: ${s.shade}`} hint="Controls how dark the neutral tones are — try 1 for minimal, 8 for stronger shade">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input type="range" min={1} max={4} value={s.shade} onChange={e => set('shade', +e.target.value)} style={{ flex: 1 }} />
                <code style={{ fontSize: 12, minWidth: 30 }}>{s.shade}</code>
              </div>
            </Field>

          </div>
        </Card>




        {/* Live preview */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>Live preview</div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid var(--border)', height: 500 }}>
            <iframe
              key={previewKey}
              src="http://localhost:3000"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Chatbot preview"
            />
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
            Preview reloads when you save changes.
          </div>
        </div>
      </div>
    </div>
  )
}