import React, { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/client'
import { Btn, Badge, Card, Modal, Field, TwoCol, Empty, showToast, useConfirm } from '../components/UI'

const EMPTY_PRODUCT = {
  product_id: '', title: '', description: '',
  price: '', currency: 'GBP', labels: '',
  image_url: '', product_url: '',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | 'add' | product object for edit
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (e) {
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const allLabels = [...new Set(products.flatMap(p => p.labels))]
    .filter(l => !['home'].includes(l)).slice(0, 8)

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.product_id.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.labels.includes(catFilter)
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setForm(EMPTY_PRODUCT)
    setModal('add')
  }

  const openEdit = (product) => {
    setForm({ ...product, labels: product.labels.join(', ') })
    setModal(product)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
      }
      if (modal === 'add') {
        await createProduct(payload)
        showToast('Product added')
      } else {
        await updateProduct(form.product_id, payload)
        showToast('Product updated')
      }
      setModal(null)
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    try {
      await deleteProduct(product.product_id)
      showToast('Product deleted')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) })

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            {products.length} products · synced to chatbot brain
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={load}>↻ Refresh</Btn>
          <Btn variant="primary" onClick={openAdd}>+ Add product</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total products', value: products.length, sub: 'in chatbot' },
          { label: 'Avg price', value: products.length ? `£${(products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2)}` : '—', sub: 'across all' },
          { label: 'Categories', value: allLabels.length, sub: 'unique labels' },
          { label: 'Showing', value: filtered.length, sub: 'after filters' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        {/* Search + Filters */}
        <div style={{
          display: 'flex', gap: 8, padding: '10px 14px',
          borderBottom: '0.5px solid var(--border)', background: 'var(--bg)',
          flexWrap: 'wrap', alignItems: 'center'
        }}>
          <input
            type="text" placeholder="Search products…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />

        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <Empty message="No products found. Try adjusting your search." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Product', 'ID', 'Labels', 'Price', ''].map(h => (
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
              {filtered.map(p => (
                <tr key={p.product_id} style={{ borderBottom: '0.5px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.image_url && (
                        <img src={p.image_url} alt="" style={{
                          width: 36, height: 36, borderRadius: 6,
                          objectFit: 'cover', border: '0.5px solid var(--border)', flexShrink: 0
                        }} onError={e => e.target.style.display = 'none'} />
                      )}
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{p.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)' }}>
                    {p.product_id}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.labels.slice(0, 4).map(l => <Badge key={l} variant="product">{l}</Badge>)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                    £{p.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" onClick={() => openEdit(p)}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => handleDelete(p)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {modal !== null && (
        <Modal
          title={modal === 'add' ? 'Add product' : `Edit: ${modal.title}`}
          onClose={() => setModal(null)}
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Add product' : 'Save changes'}
            </Btn>
          </>}
        >
          <TwoCol>
            <Field label="Product ID" hint="e.g. home014 — cannot be changed after creation">
              <input type="text" placeholder="home014" {...f('product_id')} disabled={modal !== 'add'} />
            </Field>
            <Field label="Price (GBP)">
              <input type="number" step="0.01" placeholder="0.00" {...f('price')} />
            </Field>
          </TwoCol>
          <Field label="Title">
            <input type="text" placeholder="Product name" {...f('title')} />
          </Field>
          <Field label="Description" hint="This is what the chatbot will use to describe and recommend this product">
            <textarea rows={3} placeholder="Describe the product…" {...f('description')} />
          </Field>
          <Field label="Labels (comma separated)" hint="Used for filtering and search">
            <input type="text" placeholder="home, decor, christmas, eco" {...f('labels')} />
          </Field>
          <TwoCol>
            <Field label="Image URL">
              <input type="text" placeholder="https://…" {...f('image_url')} />
            </Field>
            <Field label="Product URL">
              <input type="text" placeholder="https://…" {...f('product_url')} />
            </Field>
          </TwoCol>
          {form.image_url && (
            <img src={form.image_url} alt="preview" style={{
              height: 80, objectFit: 'contain', borderRadius: 6,
              border: '0.5px solid var(--border)', padding: 4
            }} onError={e => e.target.style.display = 'none'} />
          )}
        </Modal>
      )}
    </div>
  )
}
