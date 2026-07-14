import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Fuel } from 'lucide-react'
import { Card } from '../components/ui'

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
    <div className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14,165,233,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(14,165,233,0.08), transparent)',
        }}
        aria-hidden
      />
      <Card className="relative w-full max-w-sm shadow-xl shadow-black/10 dark:shadow-black/40 border-border p-8 animate-scale-in" padding={false}>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted text-accent">
              <Fuel className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Fuel Expenses</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue</p>
          </div>
          <div id="googleBtn" className="flex justify-center min-h-[44px]" />
        </div>
      </Card>
    </div>
  )
}
