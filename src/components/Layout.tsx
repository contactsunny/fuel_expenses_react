import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  ClipboardList,
  ChartPie,
  Car,
  Tags,
  Wrench,
  Settings,
  User,
  LogOut,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useFuelRecord } from "../contexts/FuelRecordContext";
import FuelRecordForm from "./FuelRecordForm";
import { getPreferences } from "../services/preferences";
import { cn } from "../utils/cn";
import { Button } from "./ui";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
    isActive
      ? "bg-accent-muted text-accent font-medium"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

const subLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors duration-150",
    isActive
      ? "bg-accent-muted text-accent font-medium"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

export default function Layout() {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
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

  const isRecordsPage =
    location.pathname === "/live/records" || location.pathname === "/live/dashboard";

  useEffect(() => {
    const onResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      if (newWidth >= 768) {
        setSidebarOpen(true);
      } else {
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
    } catch {
      return {};
    }
  };

  const getUserInitials = (name: string): string => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    if (parts.length === 3 && parts[1].length === 1) {
      return (first + parts[1]).toUpperCase();
    }
    return (first + last).toUpperCase();
  };

  const getUserInitialsColor = (name: string): string => {
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
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const userData = getUserData();
  const [userImage, setUserImage] = useState<string>(() => {
    const cachedImage = localStorage.getItem(`user_image_${userData?.id || userData?.email || ""}`);
    if (cachedImage) {
      return cachedImage;
    }

    const imageUrl =
      userData?.imageUrl ||
      userData?.image ||
      userData?.picture ||
      userData?.photoURL ||
      userData?.image_url ||
      "";
    return imageUrl && imageUrl.trim() !== "" ? imageUrl : "";
  });

  const [showFallback, setShowFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
      } catch (err) {
        console.warn("Could not cache image:", err);
      }
    }
  };

  const userName = userData?.name || "User";
  const initials = getUserInitials(userName);
  const initialsColor = getUserInitialsColor(userName);

  const { showFuelForm, setShowFuelForm, editingRecord, setEditingRecord, triggerRefresh } =
    useFuelRecord();
  const [defaultPreferences, setDefaultPreferences] = useState<{
    defaultVehicleId?: string;
    defaultFuelType?: string;
    defaultPaymentType?: string;
  }>({});

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
  const themeLabel =
    theme === "light" ? "Light theme" : theme === "dark" ? "Dark theme" : "System theme";

  return (
    <div className="min-h-dvh bg-background text-foreground grid grid-rows-[auto_1fr]">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/70">
        <div className="h-14 px-3 md:px-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen((v) => !v);
              }}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen && screenWidth < 768 ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <ClipboardList className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold tracking-tight text-foreground text-sm md:text-base">
                Fuel Expenses
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              aria-label={`Theme: ${themeLabel}. Click to cycle.`}
              title={themeLabel}
            >
              <ThemeIcon className="h-4.5 w-4.5 h-4 w-4" />
            </Button>
            <button
              onClick={() => navigate("/live/profile")}
              className="ml-1 w-8 h-8 rounded-full overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-accent/40 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile"
            >
              {showFallback || !userImage ? (
                <div
                  className={`w-8 h-8 rounded-full ${initialsColor} flex items-center justify-center text-white font-semibold text-xs`}
                >
                  {initials}
                </div>
              ) : (
                <img
                  key={`${userImage}-${retryCount}`}
                  className="w-8 h-8 object-cover"
                  src={userImage}
                  alt=""
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && screenWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "border-r border-border bg-surface fixed inset-y-0 left-0 top-14 z-20 w-64 overflow-y-auto h-[calc(100dvh-3.5rem)] transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
      >
        <nav className="p-3 space-y-0.5">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
          <NavLink to="/live/records" onClick={handleNavClick} className={navLinkClass}>
            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
            Records
          </NavLink>
          <details
            open={analyticsMenuOpen}
            onToggle={(e) => setAnalyticsMenuOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary
              className={cn(
                "px-3 py-2 rounded-lg cursor-pointer list-none flex items-center justify-between text-sm transition-colors",
                isAnalyticsPage
                  ? "bg-accent-muted text-accent font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <ChartPie className="h-4 w-4 shrink-0" aria-hidden />
                Analytics
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  analyticsMenuOpen && "rotate-90"
                )}
                aria-hidden
              />
            </summary>
            <div className="mt-0.5 ml-4 pl-3 border-l border-border space-y-0.5">
              <NavLink
                to="/live/analytics/vehicleCategory"
                onClick={handleNavClick}
                className={subLinkClass}
              >
                Vehicle Category
              </NavLink>
              <NavLink
                to="/live/analytics/fuelPrice"
                onClick={handleNavClick}
                className={subLinkClass}
              >
                Fuel Price
              </NavLink>
              <NavLink to="/live/analytics/vsChart" onClick={handleNavClick} className={subLinkClass}>
                Fuel Type
              </NavLink>
            </div>
          </details>
          <NavLink to="/live/vehicles" onClick={handleNavClick} className={navLinkClass}>
            <Car className="h-4 w-4 shrink-0" aria-hidden />
            Vehicles
          </NavLink>
          <NavLink to="/live/categories" onClick={handleNavClick} className={navLinkClass}>
            <Tags className="h-4 w-4 shrink-0" aria-hidden />
            Categories
          </NavLink>
          <NavLink to="/live/serviceRecords" onClick={handleNavClick} className={navLinkClass}>
            <Wrench className="h-4 w-4 shrink-0" aria-hidden />
            Service Records
          </NavLink>

          <div className="mt-4 pt-3 border-t border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </div>
          <NavLink to="/live/settings" onClick={handleNavClick} className={navLinkClass}>
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            Settings
          </NavLink>
          <NavLink to="/live/profile" onClick={handleNavClick} className={navLinkClass}>
            <User className="h-4 w-4 shrink-0" aria-hidden />
            Profile
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Logout
          </button>
        </nav>
      </aside>

      <div className="max-w-screen-2xl mx-auto w-full">
        <div
          className={sidebarOpen ? "md:ml-64" : "md:ml-0"}
          style={{ transition: "margin-left 0.3s" }}
        >
          <main className="p-4 md:p-6 animate-fade-in">
            <Outlet />
            <footer className="mt-12 pb-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <a
                className="underline underline-offset-2 hover:text-foreground transition-colors"
                href="https://blog.contactsunny.com"
                target="_blank"
                rel="noreferrer"
              >
                Sunny Srinidhi
              </a>
            </footer>
          </main>
        </div>
      </div>

      {isRecordsPage && (
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowFuelForm(true);
          }}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:brightness-110 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Add fuel record"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <FuelRecordForm
        isOpen={showFuelForm}
        onClose={() => {
          setShowFuelForm(false);
          setEditingRecord(null);
        }}
        onSave={handleFuelFormSave}
        record={editingRecord}
        defaultPreferences={defaultPreferences}
      />
    </div>
  );
}
