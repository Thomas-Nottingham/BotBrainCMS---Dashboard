// import React, { useState } from 'react'
// import { Btn, Card, CardHeader, Field, TwoCol, showToast } from '../components/UI'

// export default function Settings() {
//   const [settings, setSettings] = useState({
//     mongoUri: '',
//     dbName: 'botbrain',
//     apiUrl: 'http://localhost:3000',
//     webhookUrl: '',
//     syncInterval: 'on_save',
//   })

//   const s = (key) => ({
//     value: settings[key],
//     onChange: e => setSettings(p => ({ ...p, [key]: e.target.value }))
//   })

//   const testConnection = async () => {
//     try {
//       const res = await fetch(`${settings.apiUrl}/health`)
//       if (res.ok) showToast('API is reachable ✓')
//       else showToast('API returned an error', 'error')
//     } catch {
//       showToast('Cannot reach API — is it running?', 'error')
//     }
//   }

//   return (
//     <div style={{ padding: 28 }}>
//       <div style={{ marginBottom: 24 }}>
//         <h1 style={{ fontSize: 20, fontWeight: 600 }}>Settings</h1>
//         <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
//           Database connection and deployment configuration
//         </p>
//       </div>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

//         <Card>
//           <CardHeader><span style={{ fontWeight: 500, fontSize: 14 }}>Database</span></CardHeader>
//           <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
//             <Field label="MongoDB URI" hint="Get this from MongoDB Atlas → Connect → Drivers">
//               <input type="password" placeholder="mongodb+srv://user:pass@cluster.mongodb.net/" {...s('mongoUri')} />
//             </Field>
//             <TwoCol>
//               <Field label="Database name">
//                 <input type="text" {...s('dbName')} />
//               </Field>
//               <Field label="Backend API URL">
//                 <input type="text" {...s('apiUrl')} />
//               </Field>
//             </TwoCol>
//           </div>
//         </Card>

//         <Card>
//           <CardHeader><span style={{ fontWeight: 500, fontSize: 14 }}>Sync</span></CardHeader>
//           <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
//             <Field label="Webhook on content update" hint="Your chatbot can call this URL when new content is saved, to invalidate its cache">
//               <input type="text" placeholder="https://your-bot-api.com/webhook/refresh" {...s('webhookUrl')} />
//             </Field>
//             <Field label="Cache TTL (seconds)" hint="How long your chatbot caches content before re-fetching from the API">
//               <select {...s('syncInterval')}>
//                 <option value="0">No cache (always fresh)</option>
//                 <option value="30">30 seconds</option>
//                 <option value="60">1 minute (recommended)</option>
//                 <option value="300">5 minutes</option>
//                 <option value="manual">Manual only</option>
//               </select>
//             </Field>
//           </div>
//         </Card>

//         <Card>
//           <CardHeader><span style={{ fontWeight: 500, fontSize: 14 }}>Environment variables</span></CardHeader>
//           <div style={{ padding: 20 }}>
//             <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
//               Add these to your <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 4 }}>.env</code> file in the backend directory:
//             </p>
//             <pre style={{
//               background: 'var(--bg)', border: '0.5px solid var(--border)',
//               borderRadius: 8, padding: 14, fontFamily: 'monospace',
//               fontSize: 12, lineHeight: 1.8, color: 'var(--text-2)'
//             }}>
//               {`MONGODB_URI=${settings.mongoUri || 'mongodb+srv://user:pass@cluster.mongodb.net/'}
// DB_NAME=${settings.dbName}

// # In your chatbot's .env:
// BOTBRAIN_API_URL=${settings.apiUrl}
// BOTBRAIN_CACHE_TTL=60`}
//             </pre>
//           </div>
//         </Card>

//         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
//           <Btn onClick={testConnection}>Test API connection</Btn>
//           <Btn variant="primary" onClick={() => showToast('Settings saved (add persistence here)')}>Save settings</Btn>
//         </div>
//       </div>
//     </div>
//   )
// }
import React, { useState, useEffect } from 'react'
import { Btn, Card, CardHeader, Field, TwoCol, showToast } from '../components/UI'

export default function Settings() {
  const [settings, setSettings] = useState({
    client_name: '',
    client_api_url: '',
    client_api_key: '',
    dbName: 'botbrain',
    chatbot_url: 'http://localhost:8000',
  })
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [syncCount, setSyncCount] = useState(null)

  // Load settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => { })
  }, [])

  const s = (key) => ({
    value: settings[key] || '',
    onChange: e => setSettings(p => ({ ...p, [key]: e.target.value }))
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      showToast('Settings saved!')
    } catch {
      showToast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const testClientApi = async () => {
    if (!settings.client_api_url) return showToast('Enter an API URL first', 'error')
    try {
      const headers = {}
      if (settings.client_api_key) {
        headers['apikey'] = settings.client_api_key
        headers['Authorization'] = `Bearer ${settings.client_api_key}`
      }
      const res = await fetch(settings.client_api_url, { headers })
      if (res.ok) {
        const data = await res.json()
        const count = Array.isArray(data) ? data.length : '?'
        showToast(`✓ Connected — ${count} products found`)
      } else {
        showToast(`API returned ${res.status}`, 'error')
      }
    } catch {
      showToast('Cannot reach client API', 'error')
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Save settings first so the backend has the latest config
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const res = await fetch('/api/sync/run', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setLastSync(new Date().toLocaleTimeString())
        setSyncCount(data.synced)
        showToast(`✓ Synced ${data.synced} products successfully`)
      } else {
        showToast(data.detail || 'Sync failed', 'error')
      }
    } catch {
      showToast('Sync failed — is the backend running?', 'error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
          Client product source and sync configuration
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Client API */}
        <Card>
          <CardHeader><span style={{ fontWeight: 500, fontSize: 14 }}>Client product source</span></CardHeader>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Client name" hint="e.g. Inspitalfields, Mock Store">
              <input type="text" placeholder="Client name" {...s('client_name')} />
            </Field>
            <Field label="Product API URL" hint="The endpoint that returns products as JSON — e.g. Supabase view URL">
              <input
                type="text"
                placeholder="https://xxx.supabase.co/rest/v1/botbrain_products"
                {...s('client_api_url')}
              />
            </Field>
            <Field label="API Key" hint="Their API key or bearer token">
              <input type="password" placeholder="their_api_key" {...s('client_api_key')} />
            </Field>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Btn onClick={testClientApi} disabled={!settings.client_api_url}>
                Test connection
              </Btn>
              <Btn
                variant="primary"
                onClick={handleSync}
                disabled={syncing || !settings.client_api_url}
              >
                {syncing ? 'Importing...' : 'Import products now'}
              </Btn>
              {lastSync && (
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  Last sync: {lastSync} — {syncCount} products updated
                </span>
              )}
            </div>

            <div style={{
              background: 'var(--bg)', border: '0.5px solid var(--border)',
              borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8
            }}>
              ⏰ Auto sync runs every <strong>5 minutes</strong> in the background — any new or changed products will be picked up automatically.
            </div>
          </div>
        </Card>

        {/* System */}
        <Card>
          <CardHeader><span style={{ fontWeight: 500, fontSize: 14 }}>System</span></CardHeader>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TwoCol>
              <Field label="Database name">
                <input type="text" {...s('dbName')} />
              </Field>
              <Field label="Chatbot API URL" hint="Used to notify the chatbot when products are updated">
                <input type="text" {...s('chatbot_url')} />
              </Field>
            </TwoCol>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </Btn>
        </div>

      </div>
    </div>
  )
}