import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/"       element={<ChatPage />} />
          <Route path="/admin"  element={<AdminPage />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
