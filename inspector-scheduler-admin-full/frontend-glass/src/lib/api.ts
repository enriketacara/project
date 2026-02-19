import axios from 'axios'
import { getToken, clearToken, clearUser } from './auth'

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) clearToken()
    return Promise.reject(err)
  }
)

export default api
