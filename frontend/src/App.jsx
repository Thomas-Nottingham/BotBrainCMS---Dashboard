import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Products from './pages/Products'
import Knowledge from './pages/Knowledge'
import Appearance from './pages/Appearance'
import Clients from './pages/Clients'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/appearance" element={<Appearance />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
