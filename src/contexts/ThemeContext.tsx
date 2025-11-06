import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Force remove dark class first
  while (root.classList.contains('dark')) {
    root.classList.remove('dark')
  }
  
  // Then add it only if theme is dark
  if (theme === 'dark') {
    root.classList.add('dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark'
    
    const stored = localStorage.getItem('theme')
    const initialTheme = (stored === 'dark' || stored === 'light' ? stored : 'dark') as Theme
    
    // Apply immediately to prevent flash
    applyTheme(initialTheme)
    
    return initialTheme
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    // Apply immediately before state update
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Update state
    setTheme(newTheme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
