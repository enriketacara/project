import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.88)',
            color: '#0f172a',
            border: '1px solid rgba(15,23,42,0.10)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
