import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setScreenWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const userImage = useMemo(() => {
    const user = localStorage.getItem("user");
    try {
      return user
        ? JSON.parse(user)?.imageUrl ?? "/icons/icon-128x128.png"
        : "/icons/icon-128x128.png";
    } catch {
      return "/icons/icon-128x128.png";
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 grid grid-rows-[auto_1fr]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="h-14 px-4 flex items-center justify-between max-w-screen-2xl mx-auto">
          <button
            className="p-2 rounded-md hover:bg-slate-100 md:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <span className="i">☰</span>
          </button>
          <div className="font-semibold tracking-tight">Fuel Expenses</div>
          <button
            onClick={() => navigate("/live/profile")}
            className="w-8 h-8 rounded-full overflow-hidden"
          >
            <img
              className="w-8 h-8 object-cover"
              src={userImage}
              alt="profile"
            />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] max-w-screen-2xl mx-auto w-full">
        <aside
          className={
            (sidebarOpen ? "block" : "hidden") +
            " md:block border-r border-slate-200 bg-white"
          }
        >
          <nav className="p-3 space-y-1 sticky top-14">
            <div className="px-3 text-xs font-semibold text-slate-500">
              Navigation
            </div>
            <NavLink
              to="/live/records"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md ${
                  isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`
              }
            >
              Records
            </NavLink>
            <details>
              <summary className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer">
                Analytics
              </summary>
              <div className="mt-1 ml-2 space-y-1">
                <NavLink
                  to="/live/analytics/vehicleCategory"
                  className={({ isActive }: { isActive: boolean }) =>
                    `block px-3 py-2 rounded-md ${
                      isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                    }`
                  }
                >
                  Vehicle Category
                </NavLink>
                <NavLink
                  to="/live/analytics/fuelPrice"
                  className={({ isActive }: { isActive: boolean }) =>
                    `block px-3 py-2 rounded-md ${
                      isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                    }`
                  }
                >
                  Fuel Price
                </NavLink>
                <NavLink
                  to="/live/analytics/vsChart"
                  className={({ isActive }: { isActive: boolean }) =>
                    `block px-3 py-2 rounded-md ${
                      isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                    }`
                  }
                >
                  Fuel Type
                </NavLink>
              </div>
            </details>
            <NavLink
              to="/live/vehicles"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md ${
                  isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`
              }
            >
              Vehicles
            </NavLink>
            <NavLink
              to="/live/categories"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md ${
                  isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/live/serviceRecords"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md ${
                  isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`
              }
            >
              Service Records
            </NavLink>

            <div className="mt-4 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-500">
              Account
            </div>
            <NavLink
              to="/live/profile"
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md ${
                  isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`
              }
            >
              Profile
            </NavLink>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700"
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="p-4 md:p-6">
          <Outlet />
          <footer className="mt-10 text-center text-sm text-slate-500">
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
  );
}
