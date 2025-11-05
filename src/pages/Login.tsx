import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

declare global {
  interface Window {
    google?: any
    gapi?: any
  }
}

const GOOGLE_CLIENT_ID = '236873673590-2cbnveachalcb7slscl21fo3vl8ocd54.apps.googleusercontent.com'
const AUTH_BASE = 'https://api.fuel.contactsunny.com/user'

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/live/dashboard', { replace: true })
      return
    }
  }, [navigate])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          const idToken = response?.credential
          if (!idToken) return
          try {
            const { data } = await axios.post(`${AUTH_BASE}/login`, { idToken })
            if (data?.status === '0') {
              localStorage.setItem('user', JSON.stringify(data.data.user))
              localStorage.setItem('token', data.data.token)
              navigate('/live/dashboard', { replace: true })
            }
          } catch {
            // ignore
          }
        },
      })
      const container = document.getElementById('googleBtn')
      if (container) {
        window.google?.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320 })
        window.google?.accounts.id.prompt()
      }
    }
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3">⛽️</div>
          <h1 className="text-xl font-semibold">Fuel Expenses</h1>
          <p className="text-slate-500 text-sm">Sign in to continue</p>
        </div>
        <div id="googleBtn" className="flex justify-center" />
      </div>
    </div>
  )
}


