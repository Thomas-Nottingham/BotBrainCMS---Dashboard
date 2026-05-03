import React, { useState } from 'react'
import { Btn, Badge, Card, Modal, Field, TwoCol, Empty, showToast } from '../components/UI'

const DEMO_CLIENTS = [
  { id: 1, name: 'Inspitalfields', domain: 'inspitalfields.co.uk', status: 'active', lastSync: '2 min ago', apiKey: 'ck_live_abc123' },
]

export default function Clients() {
  const [clients, setClients] = useState(DEMO_CLIENTS)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', domain: '', apiKey: '' })

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) })

  const handleAdd = () => {
    setClients(p => [...p, {
      id: Date.now(), ...form, status: 'active', lastSync: 'Just now'
    }])
    setModal(false)
    showToast('Client added')
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Clients</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            Manage which stores are using this chatbot CMS
          </p>
        </div>
        <Btn variant="primary" onClick={() => setModal(true)}>+ Add client</Btn>
      </div>

      <Card>
        {clients.length === 0 ? <Empty message="No clients yet." /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Store', 'Domain', 'Status', 'Last sync', 'API key', ''].map(h => (
                  <th key={h} style={{
                    fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'var(--text-3)',
                    padding: '8px 14px', textAlign: 'left',
                    borderBottom: '0.5px solid var(--border)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>{c.domain}</td>
                  <td style={{ padding: '10px 14px' }}><Badge variant="general">{c.status}</Badge></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-3)' }}>{c.lastSync}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)' }}>
                    {c.apiKey.slice(0, 12)}…
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" onClick={() => showToast('Sync triggered')}>Sync now</Btn>
                      <Btn size="sm" onClick={() => { navigator.clipboard.writeText(c.apiKey); showToast('API key copied') }}>Copy key</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal && (
        <Modal
          title="Add client"
          onClose={() => setModal(false)}
          footer={<>
            <Btn onClick={() => setModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAdd}>Add client</Btn>
          </>}
        >
          <Field label="Store name"><input type="text" placeholder="My Store" {...f('name')} /></Field>
          <Field label="Domain"><input type="text" placeholder="mystore.co.uk" {...f('domain')} /></Field>
          <Field label="ChatKit API key" hint="The domain key from your ChatKit dashboard">
            <input type="text" placeholder="ck_live_…" {...f('apiKey')} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
