import React, { useEffect, useState } from 'react'
import { getKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from '../api/client'
import { Btn, Badge, Card, Modal, Field, TwoCol, Empty, showToast, useConfirm } from '../components/UI'

const EMPTY = { key: '', text: '', category: 'general' }

export default function Knowledge() {
  const [entries, setEntries] = useState([])
  const [tab, setTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getKnowledge()
      setEntries(data)
    } catch (e) {
      showToast('Failed to load knowledge', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visible = entries.filter(e => e.category === tab)

  const openAdd = () => {
    setForm({ ...EMPTY, category: tab })
    setModal('add')
  }

  const openEdit = (entry) => {
    setForm(entry)
    setModal(entry)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'add') {
        await createKnowledge(form)
        showToast('Entry added')
      } else {
        await updateKnowledge(form.key, { text: form.text, category: form.category })
        showToast('Entry updated')
      }
      setModal(null)
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entry) => {
    if (!confirm(`Delete "${entry.key}"?`)) return
    try {
      await deleteKnowledge(entry.key)
      showToast('Entry deleted')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) })

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Knowledge base</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            Everything the chatbot knows about your business — {entries.length} entries total
          </p>
        </div>
        <Btn variant="primary" onClick={openAdd}>+ Add entry</Btn>
      </div>

      <Card>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', padding: '0 18px' }}>
          {['general', 'support'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 16px', fontSize: 13, cursor: 'pointer',
              border: 'none', background: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              color: tab === t ? 'var(--text)' : 'var(--text-2)',
              fontWeight: tab === t ? 500 : 400,
              transition: 'all 0.15s', marginBottom: -0.5,
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({entries.filter(e => e.category === t).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : visible.length === 0 ? (
          <Empty message={`No ${tab} entries yet. Click "Add entry" to get started.`} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Key', 'Category', 'Content preview', ''].map(h => (
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
              {visible.map(entry => (
                <tr key={entry.key}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {entry.key}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge variant={entry.category}>{entry.category}</Badge>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-2)', fontSize: 12, maxWidth: 360 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.text}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" onClick={() => openEdit(entry)}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => handleDelete(entry)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal !== null && (
        <Modal
          title={modal === 'add' ? 'Add knowledge entry' : `Edit: ${modal.key}`}
          onClose={() => setModal(null)}
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Add entry' : 'Save changes'}
            </Btn>
          </>}
        >
          <TwoCol>
            <Field label="Key" hint="Unique identifier, e.g. returns_policy">
              <input type="text" placeholder="my_key" {...f('key')} disabled={modal !== 'add'} />
            </Field>
            <Field label="Category">
              <select {...f('category')}>
                <option value="general">General</option>
                <option value="support">Support</option>
              </select>
            </Field>
          </TwoCol>
          <Field label="Content" hint="Write clearly — this is exactly what the chatbot will use to answer questions">
            <textarea rows={6} placeholder="Write what the chatbot should know…" {...f('text')} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
