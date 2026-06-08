import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ArrowLeft,
  BookMarked,
  Menu,
  X,
  Mail,
  ScanLine,
  Barcode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const dropdownRef = useRef(null);
  const desktopNavRef = useRef(null);
  const mobileNavRef = useRef(null);
  const desktopSidebarScrollTopRef = useRef(0);
  const mobileSidebarScrollTopRef = useRef(0);

  const adminUser = useMemo(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch {
      return null;
    }
  }, []);

  const adminEmail = adminUser?.email || "admin@bookstore.com";

  const navGroups = [
    {
      label: "Overview",
      links: [
        {
          to: "/admin/dashboard",
          label: "Dashboard",
          description: "Store overview",
          icon: LayoutDashboard,
        },
        {
          to: "/admin/reports",
          label: "Reports",
          description: "Sales ledger",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Operations",
      links: [
        {
          to: "/admin/books",
          label: "Manage Books",
          description: "Inventory hub",
          icon: BookOpen,
        },
        {
          to: "/admin/orders",
          label: "Orders Status",
          description: "Delivery flow",
          icon: ShoppingBag,
        },
        {
          to: "/admin/pos",
          label: "POS System",
          description: "Counter billing",
          icon: ScanLine,
        },
        {
          to: "/admin/print-barcode",
          label: "Print Barcode",
          description: "Barcode labels",
          icon: Barcode,
        },
      ],
    },
    {
      label: "Customers",
      links: [
        {
          to: "/admin/users",
          label: "Users List",
          description: "Customer accounts",
          icon: Users,
        },
        {
          to: "/admin/messages",
          label: "Messages",
          description: "Contact queries",
          icon: Mail,
        },
      ],
    },
    {
      label: "Settings",
      links: [
        {
          to: "/admin/hero-settings",
          label: "Hero Settings",
          description: "Homepage banner",
          icon: Settings,
        },
        {
          to: "/admin/vat-bill-settings",
          label: "VAT Bill Settings",
          description: "Invoice details",
          icon: ReceiptText,
        },
      ],
    },
  ];

  const allNavLinks = useMemo(() => {
    return navGroups.flatMap((group) => group.links);
  }, []);

  const currentPage =
    allNavLinks.find((item) => location.pathname.startsWith(item.to)) ||
    allNavLinks[0];

  const CurrentPageIcon = currentPage.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (desktopNavRef.current) {
      desktopNavRef.current.scrollTop = desktopSidebarScrollTopRef.current;
    }

    if (mobileNavRef.current) {
      mobileNavRef.current.scrollTop = mobileSidebarScrollTopRef.current;
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    setIsDropdownOpen(false);
    setMobileSidebarOpen(false);

    navigate("/login/admin", { replace: true });
  };

  const SidebarBrand = () => (
    <div className="px-5 pt-5 pb-4 shrink-0">
      <div className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-[1px] shadow-xl shadow-orange-950/20">
        <div className="rounded-[1.65rem] bg-slate-950/95 p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
              <BookMarked className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                Admin Panel
              </h1>

              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                PatraPatrika Center
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />

            <p className="text-[11px] font-bold text-slate-300">
              Secure admin workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const SidebarNav = ({ isMobile = false }) => (
    <nav
      ref={isMobile ? mobileNavRef : desktopNavRef}
      onScroll={(e) => {
        if (isMobile) {
          mobileSidebarScrollTopRef.current = e.currentTarget.scrollTop;
        } else {
          desktopSidebarScrollTopRef.current = e.currentTarget.scrollTop;
        }
      }}
      className="flex-1 min-h-0 px-4 pb-5 space-y-6 overflow-y-auto"
    >
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            {group.label}
          </p>

          <div className="space-y-1.5">
            {group.links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (isMobile) {
                      setMobileSidebarOpen(false);
                    }
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                      isActive
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-orange-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.08em] truncate">
                          {item.label}
                        </p>

                        <p
                          className={`text-[11px] font-bold mt-0.5 truncate ${
                            isActive ? "text-orange-50" : "text-slate-500"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-white shadow-sm" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const SidebarFooter = ({ isMobile = false }) => (
    <div className="p-4 border-t border-white/10 shrink-0">
      <button
        type="button"
        onClick={() => {
          navigate("/");
          if (isMobile) {
            setMobileSidebarOpen(false);
          }
        }}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </button>
    </div>
  );

  const DesktopSidebarContent = () => (
    <>
      <SidebarBrand />
      <SidebarNav />
      <SidebarFooter />
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased text-slate-700">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-slate-950 text-slate-300 flex-col justify-between border-r border-white/10 z-40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-20 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col min-h-0 h-full">
          <DesktopSidebarContent />
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-80 max-w-[88vw] bg-slate-950 text-slate-300 flex flex-col border-r border-white/10 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                Admin Panel
              </h1>

              <p className="text-[11px] text-slate-500 font-bold">
                PatraPatrika Center
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="w-10 h-10 rounded-2xl bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <SidebarNav isMobile />
        <SidebarFooter isMobile />
      </aside>

      <div className="min-h-screen lg:pl-72 flex flex-col">
        <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-11 h-11 rounded-2xl text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 items-center justify-center shrink-0">
              <CurrentPageIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Admin Workspace
              </p>

              <h2 className="text-base sm:text-lg font-black text-slate-950 truncate">
                {currentPage.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2">
              <Sparkles className="w-4 h-4 text-orange-500" />

              <p className="text-xs font-black text-slate-600">
                Store management mode
              </p>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 border border-transparent hover:border-slate-200 px-2 sm:px-3 py-2 rounded-2xl transition-colors duration-150 cursor-pointer group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-black shadow-sm ring-4 ring-orange-100 shrink-0">
                  A
                </div>

                <div className="text-left hidden md:block">
                  <p className="text-sm font-black text-gray-900 group-hover:text-gray-950 transition-colors">
                    System Admin
                  </p>

                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider -mt-0.5">
                    Root Administrator
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? "rotate-180 text-slate-700" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-slate-950/10 border border-gray-100 py-2 z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-slate-50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Signed in as
                    </p>

                    <p className="text-sm font-black text-gray-900 truncate mt-1">
                      {adminEmail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/admin/settings");
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-slate-50 hover:text-gray-950 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    System Settings
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-black text-rose-600 hover:bg-rose-50/70 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}