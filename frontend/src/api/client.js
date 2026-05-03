const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request('GET', `/products${qs ? '?' + qs : ''}`)
}
export const createProduct = (data) => request('POST', '/products', data)
export const updateProduct = (id, data) => request('PUT', `/products/${id}`, data)
export const deleteProduct = (id) => request('DELETE', `/products/${id}`)

export const getKnowledge = (category) =>
  request('GET', `/knowledge${category ? '?category=' + category : ''}`)
export const createKnowledge = (data) => request('POST', '/knowledge', data)
export const updateKnowledge = (key, data) => request('PUT', `/knowledge/${key}`, data)
export const deleteKnowledge = (key) => request('DELETE', `/knowledge/${key}`)
