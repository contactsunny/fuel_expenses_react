import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
const ThemeContext = createContext(undefined);
const STORAGE_KEY = 'theme';
function getSystemTheme() {
    if (typeof window === 'undefined')
        return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function resolveTheme(preference) {
    if (preference === 'system')
        return getSystemTheme();
    return preference;
}
function applyTheme(resolved) {
    if (typeof document === 'undefined')
        return;
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.setAttribute('content', resolved === 'dark' ? '#0b1220' : '#f4f6fa');
    }
}
function readStoredPreference() {
    if (typeof window === 'undefined')
        return 'system';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system')
        return stored;
    return 'system';
}
function withThemeTransition(fn) {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    fn();
    window.setTimeout(() => {
        root.classList.remove('theme-transitioning');
    }, 220);
}
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const preference = readStoredPreference();
        applyTheme(resolveTheme(preference));
        return preference;
    });
    const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(readStoredPreference()));
    const setTheme = useCallback((preference) => {
        withThemeTransition(() => {
            const resolved = resolveTheme(preference);
            applyTheme(resolved);
            localStorage.setItem(STORAGE_KEY, preference);
            setThemeState(preference);
            setResolvedTheme(resolved);
        });
    }, []);
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => {
            if (theme !== 'system')
                return;
            const resolved = getSystemTheme();
            applyTheme(resolved);
            setResolvedTheme(resolved);
        };
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [theme]);
    const toggleTheme = useCallback(() => {
        const order = ['light', 'dark', 'system'];
        const idx = order.indexOf(theme);
        const next = order[(idx + 1) % order.length];
        setTheme(next);
    }, [theme, setTheme]);
    return (_jsx(ThemeContext.Provider, { value: { theme, resolvedTheme, setTheme, toggleTheme }, children: children }));
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
