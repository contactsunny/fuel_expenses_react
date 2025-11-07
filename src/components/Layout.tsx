import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout() {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    // Initialize sidebar state based on initial screen width
    return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  // Check if we're on an Analytics page
  const isAnalyticsPage = location.pathname.startsWith("/live/analytics");

  useEffect(() => {
    const onResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      // Automatically show/hide sidebar based on screen width
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
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    // For multiple words, take first letter of first word and first letter of last word
    // But if there's a middle initial (single letter), use that instead
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    // If there's a middle part that's a single letter, use that
    if (parts.length === 3 && parts[1].length === 1) {
      return (first + parts[1]).toUpperCase();
    }
    return (first + last).toUpperCase();
  };

  const getUserInitialsColor = (name: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
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
    // Check for cached image first
    const cachedImage = localStorage.getItem(`user_image_${userData?.id || userData?.email || ''}`);
    if (cachedImage) {
      return cachedImage;
    }
    
    const imageUrl = userData?.imageUrl || userData?.image || userData?.picture || userData?.photoURL || userData?.image_url || '';
    return imageUrl && imageUrl.trim() !== '' ? imageUrl : '';
  });

  const [showFallback, setShowFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const currentSrc = img.src;
    
    // If it's a Google image that failed, try retrying a few times
    // This handles 429 rate limiting errors
    if (currentSrc.includes('googleusercontent.com') && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      // Try again after a delay, using the original URL
      setTimeout(() => {
        const userObj = getUserData();
        const originalUrl = userObj?.imageUrl || userObj?.image || userObj?.picture || '';
        if (originalUrl) {
          setUserImage(originalUrl);
        }
      }, 2000 * retryCount); // Exponential backoff
      return;
    }
    
    // Final fallback - show initials
    setShowFallback(true);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setShowFallback(false);
    
    // Cache the image as data URL when it successfully loads
    const img = e.currentTarget;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx && img.complete && img.naturalWidth > 0) {
      try {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        
        // Cache the image in localStorage
        const cacheKey = `user_image_${userData?.id || userData?.email || ''}`;
        localStorage.setItem(cacheKey, dataUrl);
        
        // Update the image source to use cached version
        setUserImage(dataUrl);
      } catch (err) {
        // If canvas operations fail (CORS), just continue with original URL
        console.warn('Could not cache image:', err);
      }
    }
  };

  const userName = userData?.name || 'User';
  const initials = getUserInitials(userName);
  const initialsColor = getUserInitialsColor(userName);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 grid grid-rows-[auto_1fr]">
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60">
        <div className="h-14 px-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen((v) => !v);
              }}
              aria-label="Toggle navigation"
            >
              <span className="text-xl">☰</span>
            </button>
            <div className="font-semibold tracking-tight dark:text-slate-100">Fuel Expenses</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
              type="button"
            >
              <span className="text-lg" role="img" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
            </button>
            <button
              onClick={() => navigate("/live/profile")}
              className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 ring-slate-300 dark:ring-slate-600"
            >
              {showFallback || !userImage ? (
                <div className={`w-8 h-8 rounded-full ${initialsColor} flex items-center justify-center text-white font-semibold text-xs`}>
                  {initials}
                </div>
              ) : (
                <img
                  key={`${userImage}-${retryCount}`}
                  className="w-8 h-8 object-cover"
                  src={userImage}
                  alt="profile"
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
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={
          "border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 fixed inset-y-0 left-0 top-14 z-20 w-64 overflow-y-auto h-[calc(100vh-3.5rem)] transition-transform duration-300 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
          <nav className="p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Navigation
            </div>
            <NavLink
              to="/live/records"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }`
              }
            >
              <span className="mr-2">📋</span>
              Records
            </NavLink>
            <details open={isAnalyticsPage}>
              <summary className={`px-3 py-2 rounded-md cursor-pointer list-none ${
                isAnalyticsPage 
                  ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
              }`}>
                <span className="flex items-center">
                  <span className="mr-2">📊</span>
                  Analytics
                </span>
              </summary>
              <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-300 dark:border-slate-600 space-y-1">
                <NavLink
                  to="/live/analytics/vehicleCategory"
                  className={({ isActive }: { isActive: boolean }) =>
                    `block px-3 py-2 rounded-md text-sm ${
                      isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                    }`
                  }
                >
                  • Vehicle Category
                </NavLink>
                <NavLink
                  to="/live/analytics/fuelPrice"
                  className={({ isActive }: { isActive: boolean }) =>
                    `block px-3 py-2 rounded-md text-sm ${
                      isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                    }`
                  }
                >
                  • Fuel Price
                </NavLink>
                <NavLink
                  to="/live/analytics/vsChart"
                  className={({ isActive }: { isActive: boolean }) =>
                    `block px-3 py-2 rounded-md text-sm ${
                      isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                    }`
                  }
                >
                  • Fuel Type
                </NavLink>
              </div>
            </details>
            <NavLink
              to="/live/vehicles"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }`
              }
            >
              <span className="mr-2">🚗</span>
              Vehicles
            </NavLink>
            <NavLink
              to="/live/categories"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }`
              }
            >
              <span className="mr-2">🏷️</span>
              Categories
            </NavLink>
            <NavLink
              to="/live/serviceRecords"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }`
              }
            >
              <span className="mr-2">🔧</span>
              Service Records
            </NavLink>

            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Account
            </div>
            <NavLink
              to="/live/profile"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 font-medium border-l-2 border-blue-500 dark:border-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }`
              }
            >
              <span className="mr-2">👤</span>
              Profile
            </NavLink>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 flex items-center"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </nav>
        </aside>

      <div className="max-w-screen-2xl mx-auto w-full">
        <div className={sidebarOpen ? "md:ml-64" : "md:ml-0"} style={{ transition: 'margin-left 0.3s' }}>
          <main className="p-4 md:p-6">
            <Outlet />
            <footer className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()}{" "}
              <a
                className="underline"
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
    </div>
  );
}
