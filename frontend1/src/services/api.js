import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Documents ─────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: (files) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: () => api.get('/documents/'),
  delete: (docId) => api.delete(`/documents/${docId}`),
}

// ── Chat ──────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (sessionId, message, documentFilter = null) =>
    api.post('/chat/message', { session_id: sessionId, message, document_filter: documentFilter }),

  createSession: () => api.post('/chat/sessions'),
  getSessions:   () => api.get('/chat/sessions'),
  getMessages:   (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (password) => api.post('/auth/login', { password }),
}

// ── Health ────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => api.get('/health'),
}

export default api
