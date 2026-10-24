import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui';
import { endpoints, url } from '../services/api';
const GOOGLE_CLIENT_ID = '236873673590-2cbnveachalcb7slscl21fo3vl8ocd54.apps.googleusercontent.com';
export default function Login() {
    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/live/dashboard', { replace: true });
            return;
        }
    }, [navigate]);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onload = () => {
            window.google?.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    const idToken = response?.credential;
                    if (!idToken)
                        return;
                    try {
                        const { data } = await axios.post(url(endpoints.auth.baseUrl, endpoints.auth.login), { idToken });
                        if (data?.status === '0') {
                            localStorage.setItem('user', JSON.stringify(data.data.user));
                            localStorage.setItem('token', data.data.token);
                            navigate('/live/dashboard', { replace: true });
                        }
                    }
                    catch {
                        // ignore
                    }
                },
            });
            const container = document.getElementById('googleBtn');
            if (container) {
                window.google?.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320 });
                window.google?.accounts.id.prompt();
            }
        };
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    return (_jsxs("div", { className: "min-h-dvh grid bg-background p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:grid-cols-[1fr_26rem] md:gap-6 md:p-6", children: [_jsx("section", { className: "app-hero hidden min-h-[calc(100dvh-3rem)] items-end p-10 md:flex", children: _jsxs("div", { className: "max-w-xl", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Fuel Expenses" }), _jsx("h1", { className: "mt-3 text-5xl font-semibold tracking-tight", children: "Track fuel spending with less friction." }), _jsx("p", { className: "mt-4 text-base app-hero-muted", children: "A focused PWA for fuel logs, vehicles, categories, and spend analytics." })] }) }), _jsx("div", { className: "flex min-h-[calc(100dvh-2rem)] items-center justify-center", children: _jsx(Card, { className: "w-full max-w-sm animate-scale-in", padding: false, children: _jsxs("div", { className: "p-6 md:p-8", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("img", { src: "/favicon.svg", alt: "", className: "mx-auto mb-4 h-12 w-12 rounded-lg shadow-sm ring-1 ring-border/60", width: 48, height: 48 }), _jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "Fuel Expenses" }), _jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Sign in to continue" })] }), _jsx("div", { id: "googleBtn", className: "flex justify-center min-h-[44px]" })] }) }) })] }));
}
