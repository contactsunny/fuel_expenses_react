import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui';
export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }
        if (localStorage.getItem('pwa-installed') === 'true') {
            setIsInstalled(true);
            return;
        }
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
            localStorage.setItem('pwa-installed', 'true');
        });
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);
    const handleInstall = async () => {
        if (!deferredPrompt)
            return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setShowPrompt(false);
            localStorage.setItem('pwa-installed', 'true');
        }
        setDeferredPrompt(null);
    };
    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };
    if (isInstalled || !showPrompt || !deferredPrompt || sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
        return null;
    }
    return (_jsx("div", { className: "fixed z-50 animate-slide-up bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] md:left-auto md:right-[calc(1rem+env(safe-area-inset-right,0px))] md:max-w-sm", children: _jsxs("div", { className: "rounded-[var(--radius-panel)] border border-border bg-surface-elevated shadow-xl shadow-black/20 p-4 flex items-start gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-accent-muted text-accent", children: _jsx(Smartphone, { className: "h-5 w-5", "aria-hidden": true }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-sm font-semibold text-foreground mb-1", children: "Install Fuel Expenses" }), _jsx("p", { className: "text-xs text-muted-foreground mb-3 leading-relaxed", children: "Install this app on your device for quick access and a better experience." }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", onClick: handleInstall, className: "flex-1", children: [_jsx(Download, { className: "h-3.5 w-3.5" }), "Install"] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: handleDismiss, children: "Not now" })] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: handleDismiss, "aria-label": "Close", className: "shrink-0 -mt-1 -mr-1 h-8 w-8", children: _jsx(X, { className: "h-4 w-4" }) })] }) }));
}
