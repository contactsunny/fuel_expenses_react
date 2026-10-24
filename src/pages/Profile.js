import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { User } from 'lucide-react';
import { Card } from '../components/ui';
function getInitials(name) {
    if (!name)
        return 'U';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length === 0)
        return 'U';
    if (parts.length === 1)
        return parts[0][0].toUpperCase();
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    if (parts.length === 3 && parts[1].length === 1) {
        return (first + parts[1]).toUpperCase();
    }
    return (first + last).toUpperCase();
}
function getInitialsColor(name) {
    const colors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-amber-500', 'bg-red-500', 'bg-teal-500'
    ];
    if (!name)
        return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
export default function Profile() {
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        }
        catch {
            return {};
        }
    })();
    const [userImage, setUserImage] = useState(() => {
        const cachedImage = localStorage.getItem(`user_image_${user?.id || user?.email || ''}`);
        if (cachedImage) {
            return cachedImage;
        }
        const imageUrl = user?.imageUrl || user?.image || user?.picture || user?.photoURL || user?.image_url || '';
        if (imageUrl && imageUrl.trim() !== '') {
            return imageUrl;
        }
        return '';
    });
    const [showFallback, setShowFallback] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const handleImageError = (e) => {
        const img = e.currentTarget;
        const currentSrc = img.src;
        if (currentSrc.includes('googleusercontent.com') && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
                const originalUrl = user?.imageUrl || user?.image || user?.picture || '';
                if (originalUrl) {
                    setUserImage(originalUrl);
                }
            }, 2000 * retryCount);
            return;
        }
        setShowFallback(true);
    };
    const handleImageLoad = (e) => {
        setShowFallback(false);
        const img = e.currentTarget;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx && img.complete && img.naturalWidth > 0) {
            try {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                const cacheKey = `user_image_${user?.id || user?.email || ''}`;
                localStorage.setItem(cacheKey, dataUrl);
                setUserImage(dataUrl);
            }
            catch (err) {
                console.warn('Could not cache image:', err);
            }
        }
    };
    const userName = user?.name || 'User';
    const initials = getInitials(userName);
    const initialsColor = getInitialsColor(userName);
    return (_jsxs("div", { className: "app-page max-w-3xl space-y-5", children: [_jsxs("section", { className: "app-hero p-5 md:p-7", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Account" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Profile" }), _jsx("p", { className: "mt-2 text-sm app-hero-muted", children: user?.email || '' })] }), _jsxs(Card, { className: "section-panel flex items-center gap-4 p-5 md:p-6", children: [showFallback || !userImage ? (_jsx("div", { className: `w-20 h-20 rounded-xl ${initialsColor} flex items-center justify-center text-white font-semibold text-2xl shrink-0`, children: initials })) : (_jsx("img", { src: userImage, alt: "", className: "w-20 h-20 rounded-xl object-cover bg-muted shrink-0 ring-1 ring-border", onError: handleImageError, onLoad: handleImageLoad, loading: "lazy" }, `${userImage}-${retryCount}`)), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "font-semibold text-foreground truncate flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-muted-foreground shrink-0", "aria-hidden": true }), user?.name || 'User'] }), _jsx("div", { className: "text-muted-foreground text-sm truncate mt-0.5", children: user?.email || '' })] })] })] }));
}
