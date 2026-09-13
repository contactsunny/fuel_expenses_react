import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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
    <div className="min-h-dvh grid bg-background p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:grid-cols-[1fr_26rem] md:gap-6 md:p-6">
      <section className="app-hero hidden min-h-[calc(100dvh-3rem)] items-end p-10 md:flex">
        <div className="max-w-xl">
          <p className="app-eyebrow app-hero-muted">Fuel Expenses</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">Track fuel spending with less friction.</h1>
          <p className="mt-4 text-base app-hero-muted">A focused PWA for fuel logs, vehicles, categories, and spend analytics.</p>
        </div>
      </section>
      <div className="flex min-h-[calc(100dvh-2rem)] items-center justify-center">
      <Card className="w-full max-w-sm animate-scale-in" padding={false}>
        <div className="p-6 md:p-8">
          <div className="mb-8 text-center">
            <img
              src="/favicon.svg"
              alt=""
              className="mx-auto mb-4 h-12 w-12 rounded-lg shadow-sm ring-1 ring-border/60"
              width={48}
              height={48}
            />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Fuel Expenses</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue</p>
          </div>
          <div id="googleBtn" className="flex justify-center min-h-[44px]" />
        </div>
      </Card>
      </div>
    </div>
  )
}
