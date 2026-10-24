import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Monitor, ClipboardList, ChartPie, Car, Tags, Wrench, Settings, User, LogOut, Plus, ChevronRight, } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useFuelRecord } from "../contexts/FuelRecordContext";
import FuelRecordForm from "./FuelRecordForm";
import { getPreferences } from "../services/preferences";
import { cn } from "../utils/cn";
import { Button } from "./ui";
const navLinkClass = ({ isActive }) => cn("flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm transition-colors duration-150", isActive
    ? "bg-accent text-accent-foreground font-semibold shadow-sm shadow-accent/25"
    : "text-muted-foreground hover:bg-muted hover:text-foreground");
const subLinkClass = ({ isActive }) => cn("flex items-center rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors duration-150", isActive
    ? "bg-accent-muted text-accent font-medium"
    : "text-muted-foreground hover:bg-muted hover:text-foreground");
const bottomNavLinkClass = ({ isActive }) => cn("relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] px-2 py-1.5 text-[11px] font-medium transition-colors", isActive
    ? "bg-accent-muted text-accent"
    : "text-muted-foreground hover:bg-muted hover:text-foreground");
export default function Layout() {
    const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
    });
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const isAnalyticsPage = location.pathname.startsWith("/live/analytics");
    const [analyticsMenuOpen, setAnalyticsMenuOpen] = useState(isAnalyticsPage);
    useEffect(() => {
        setAnalyticsMenuOpen(isAnalyticsPage);
    }, [isAnalyticsPage]);
    const isRecordsPage = location.pathname === "/live/records" || location.pathname === "/live/dashboard";
    useEffect(() => {
        const onResize = () => {
            const newWidth = window.innerWidth;
            setScreenWidth(newWidth);
            if (newWidth >= 768) {
                setSidebarOpen(true);
            }
            else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const getUserData = () => {
        const user = localStorage.getItem("user");
        try {
            return user ? JSON.parse(user) : {};
        }
        catch {
            return {};
        }
    };
    const getUserInitials = (name) => {
        if (!name)
            return "U";
        const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
        if (parts.length === 0)
            return "U";
        if (parts.length === 1)
            return parts[0][0].toUpperCase();
        const first = parts[0][0];
        const last = parts[parts.length - 1][0];
        if (parts.length === 3 && parts[1].length === 1) {
            return (first + parts[1]).toUpperCase();
        }
        return (first + last).toUpperCase();
    };
    const getUserInitialsColor = (name) => {
        const colors = [
            "bg-blue-500",
            "bg-emerald-500",
            "bg-violet-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-amber-500",
            "bg-red-500",
            "bg-teal-500",
        ];
        if (!name)
            return colors[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };
    const userData = getUserData();
    const [userImage, setUserImage] = useState(() => {
        const cachedImage = localStorage.getItem(`user_image_${userData?.id || userData?.email || ""}`);
        if (cachedImage) {
            return cachedImage;
        }
        const imageUrl = userData?.imageUrl ||
            userData?.image ||
            userData?.picture ||
            userData?.photoURL ||
            userData?.image_url ||
            "";
        return imageUrl && imageUrl.trim() !== "" ? imageUrl : "";
    });
    const [showFallback, setShowFallback] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const handleImageError = (e) => {
        const img = e.currentTarget;
        const currentSrc = img.src;
        if (currentSrc.includes("googleusercontent.com") && retryCount < 3) {
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
                const userObj = getUserData();
                const originalUrl = userObj?.imageUrl || userObj?.image || userObj?.picture || "";
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
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx && img.complete && img.naturalWidth > 0) {
            try {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL("image/png");
                const cacheKey = `user_image_${userData?.id || userData?.email || ""}`;
                localStorage.setItem(cacheKey, dataUrl);
                setUserImage(dataUrl);
            }
            catch (err) {
                console.warn("Could not cache image:", err);
            }
        }
    };
    const userName = userData?.name || "User";
    const initials = getUserInitials(userName);
    const initialsColor = getUserInitialsColor(userName);
    const { showFuelForm, setShowFuelForm, editingRecord, setEditingRecord, triggerRefresh } = useFuelRecord();
    const [defaultPreferences, setDefaultPreferences] = useState({});
    useEffect(() => {
        getPreferences()
            .then((res) => {
            const preferences = res.data?.data ?? res.data ?? {};
            setDefaultPreferences({
                defaultVehicleId: preferences.defaultVehicleId ?? "",
                defaultFuelType: preferences.defaultFuelType ?? "",
                defaultPaymentType: preferences.defaultPaymentType ?? "",
            });
        })
            .catch((err) => {
            console.error("Error loading preferences:", err);
            setDefaultPreferences({});
        });
    }, []);
    const handleFuelFormSave = () => {
        triggerRefresh();
    };
    const logout = () => {
        localStorage.clear();
        navigate("/");
    };
    const handleNavClick = () => {
        if (screenWidth < 768) {
            setSidebarOpen(false);
        }
    };
    const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
    const themeLabel = theme === "light" ? "Light theme" : theme === "dark" ? "Dark theme" : "System theme";
    const bottomNavItems = [
        { to: "/live/records", label: "Records", icon: ClipboardList },
        { to: "/live/analytics", label: "Analytics", icon: ChartPie },
        { to: "/live/vehicles", label: "Vehicles", icon: Car },
        { to: "/live/categories", label: "Categories", icon: Tags },
        { to: "/live/settings", label: "Settings", icon: Settings },
    ];
    return (_jsxs("div", { className: "min-h-dvh bg-background text-foreground grid grid-rows-[auto_1fr]", children: [_jsx("header", { className: "sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/80 pt-[env(safe-area-inset-top,0px)]", children: _jsxs("div", { className: "h-14 px-3 md:px-6 flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                        e.stopPropagation();
                                        setSidebarOpen((v) => !v);
                                    }, "aria-label": sidebarOpen ? "Close navigation" : "Open navigation", "aria-expanded": sidebarOpen, children: sidebarOpen && screenWidth < 768 ? (_jsx(X, { className: "h-5 w-5" })) : (_jsx(Menu, { className: "h-5 w-5" })) }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("img", { src: "/favicon.svg", alt: "", className: "h-7 w-7 rounded-[var(--radius-control)] shadow-sm ring-1 ring-border/60", width: 28, height: 28 }), _jsx("span", { className: "font-semibold tracking-tight text-foreground text-sm md:text-base", children: "Fuel Expenses" })] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleTheme();
                                    }, "aria-label": `Theme: ${themeLabel}. Click to cycle.`, title: themeLabel, children: _jsx(ThemeIcon, { className: "h-4.5 w-4.5 h-4 w-4" }) }), _jsx("button", { onClick: () => navigate("/live/profile"), className: "ml-1 w-8 h-8 rounded-full overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-accent/40 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "aria-label": "Open profile", children: showFallback || !userImage ? (_jsx("div", { className: `w-8 h-8 rounded-full ${initialsColor} flex items-center justify-center text-white font-semibold text-xs`, children: initials })) : (_jsx("img", { className: "w-8 h-8 object-cover", src: userImage, alt: "", onError: handleImageError, onLoad: handleImageLoad, loading: "lazy" }, `${userImage}-${retryCount}`)) })] })] }) }), sidebarOpen && screenWidth < 768 && (_jsx("div", { className: "fixed inset-0 bg-shell/50 z-10 md:hidden animate-fade-in", onClick: () => setSidebarOpen(false), "aria-hidden": true })), _jsx("aside", { className: cn("border-r border-border bg-surface/95 backdrop-blur-xl fixed left-0 z-20 w-72 overflow-y-auto transition-transform duration-300 ease-out top-[var(--header-offset)] h-[calc(100dvh-var(--header-offset))] pb-[env(safe-area-inset-bottom,0px)] md:w-72", sidebarOpen ? "translate-x-0" : "-translate-x-full"), "aria-label": "Main navigation", children: _jsxs("nav", { className: "p-4 space-y-1", children: [_jsxs("div", { className: "mb-4 rounded-[var(--radius-card)] border border-border bg-accent-muted/40 p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Workspace" }), _jsx("p", { className: "mt-1 truncate text-sm font-semibold text-foreground", children: userName }), _jsx("p", { className: "truncate text-xs text-muted-foreground", children: userData?.email || "Fuel log" })] }), _jsx("div", { className: "px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground", children: "Navigation" }), _jsxs(NavLink, { to: "/live/records", onClick: handleNavClick, className: navLinkClass, children: [_jsx(ClipboardList, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Records"] }), _jsxs("details", { open: analyticsMenuOpen, onToggle: (e) => setAnalyticsMenuOpen(e.target.open), children: [_jsxs("summary", { className: cn("px-3 py-2.5 rounded-lg cursor-pointer list-none flex items-center justify-between text-sm transition-colors", isAnalyticsPage
                                        ? "bg-accent text-accent-foreground font-semibold shadow-sm shadow-accent/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"), children: [_jsxs("span", { className: "flex items-center gap-2.5", children: [_jsx(ChartPie, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Analytics"] }), _jsx(ChevronRight, { className: cn("h-4 w-4 transition-transform duration-200", analyticsMenuOpen && "rotate-90"), "aria-hidden": true })] }), _jsxs("div", { className: "mt-0.5 ml-4 pl-3 border-l border-border space-y-0.5", children: [_jsx(NavLink, { to: "/live/analytics/vehicleCategory", onClick: handleNavClick, className: subLinkClass, children: "Vehicle Category" }), _jsx(NavLink, { to: "/live/analytics/fuelPrice", onClick: handleNavClick, className: subLinkClass, children: "Fuel Price" }), _jsx(NavLink, { to: "/live/analytics/vsChart", onClick: handleNavClick, className: subLinkClass, children: "Fuel Type" })] })] }), _jsxs(NavLink, { to: "/live/vehicles", onClick: handleNavClick, className: navLinkClass, children: [_jsx(Car, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Vehicles"] }), _jsxs(NavLink, { to: "/live/categories", onClick: handleNavClick, className: navLinkClass, children: [_jsx(Tags, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Categories"] }), _jsxs(NavLink, { to: "/live/serviceRecords", onClick: handleNavClick, className: navLinkClass, children: [_jsx(Wrench, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Service Records"] }), _jsx("div", { className: "mt-4 pt-3 border-t border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Account" }), _jsxs(NavLink, { to: "/live/settings", onClick: handleNavClick, className: navLinkClass, children: [_jsx(Settings, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Settings"] }), _jsxs(NavLink, { to: "/live/profile", onClick: handleNavClick, className: navLinkClass, children: [_jsx(User, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Profile"] }), _jsxs("button", { onClick: logout, className: "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", children: [_jsx(LogOut, { className: "h-4 w-4 shrink-0", "aria-hidden": true }), "Logout"] })] }) }), _jsx("div", { className: "max-w-screen-2xl mx-auto w-full", children: _jsx("div", { className: sidebarOpen ? "md:ml-72" : "md:ml-0", style: { transition: "margin-left 0.3s" }, children: _jsxs("main", { className: "px-3 py-4 md:p-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8 animate-fade-in", children: [_jsx(Outlet, {}), _jsxs("footer", { className: "mt-12 hidden pb-4 text-center text-xs text-muted-foreground md:block", children: ["\u00A9 ", new Date().getFullYear(), " ", _jsx("a", { className: "underline underline-offset-2 hover:text-foreground transition-colors", href: "https://blog.contactsunny.com", target: "_blank", rel: "noreferrer", children: "Sunny Srinidhi" })] })] }) }) }), isRecordsPage && (_jsxs("button", { onClick: () => {
                    setEditingRecord(null);
                    setShowFuelForm(true);
                }, className: "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:brightness-105 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:right-[calc(1.5rem+env(safe-area-inset-right,0px))] md:h-11 md:w-auto md:rounded-[var(--radius-control)] md:px-4 md:gap-2", "aria-label": "Add fuel record", children: [_jsx(Plus, { className: "h-6 w-6 md:h-5 md:w-5" }), _jsx("span", { className: "hidden text-sm font-semibold md:inline", children: "Add record" })] })), _jsx("nav", { className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur-xl md:hidden", "aria-label": "Primary navigation", children: _jsx("div", { className: "mx-auto flex max-w-md items-center gap-1", children: bottomNavItems.map(({ to, label, icon: Icon }) => (_jsxs(NavLink, { to: to, className: bottomNavLinkClass, children: [_jsx(Icon, { className: "h-4 w-4", "aria-hidden": true }), _jsx("span", { className: "truncate", children: label })] }, to))) }) }), _jsx(FuelRecordForm, { isOpen: showFuelForm, onClose: () => {
                    setShowFuelForm(false);
                    setEditingRecord(null);
                }, onSave: handleFuelFormSave, record: editingRecord, defaultPreferences: defaultPreferences })] }));
}
