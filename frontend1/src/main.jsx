import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #2d2d2d',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#46d369', secondary: '#141414' } },
          error:   { iconTheme: { primary: '#e50914', secondary: '#141414' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
