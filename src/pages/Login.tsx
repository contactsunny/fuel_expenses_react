import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card } from '../components/ui'
import { endpoints, url } from '../services/api'

declare global {
  interface Window {
    google?: any
    gapi?: any
  }
}

const GOOGLE_CLIENT_ID = '236873673590-2cbnveachalcb7slscl21fo3vl8ocd54.apps.googleusercontent.com'

let googleIdentityScript: Promise<void> | undefined

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!googleIdentityScript) {
    googleIdentityScript = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
      const script = existing ?? document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.googleIdentity = 'true'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Google sign-in could not be loaded'))
      if (!existing) document.head.appendChild(script)
    }).catch((error) => {
      googleIdentityScript = undefined
      throw error
    })
  }
  return googleIdentityScript!
}

export default function Login() {
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/live/dashboard', { replace: true })
      return
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    loadGoogleIdentityScript().then(() => {
      if (cancelled) return
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          const idToken = response?.credential
          if (!idToken) return
          try {
            const { data } = await axios.post(url(endpoints.auth.baseUrl, endpoints.auth.login), { idToken })
            if (data?.status === '0') {
              localStorage.setItem('user', JSON.stringify(data.data.user))
              localStorage.setItem('token', data.data.token)
              navigate('/live/dashboard', { replace: true })
            } else {
              setLoginError('Sign-in was not accepted. Please try again.')
            }
          } catch (error) {
            console.error('Login request failed:', error)
            setLoginError('Could not reach the login server. Check that the API is running and try again.')
          }
        },
      })
      const container = document.getElementById('googleBtn')
      if (container) {
        container.replaceChildren()
        window.google?.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320 })
      }
    }).catch((error) => {
      console.error(error)
      if (!cancelled) setLoginError('Google sign-in could not be loaded. Check your connection and try again.')
    })
    return () => {
      cancelled = true
      window.google?.accounts.id.cancel()
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
          {loginError && <p role="alert" className="mt-4 text-sm text-danger">{loginError}</p>}
        </div>
      </Card>
      </div>
    </div>
  )
}
