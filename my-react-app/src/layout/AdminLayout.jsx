import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  Mail, // Added icon for messages
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/books', label: 'Manage Books', icon: BookOpen },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/orders', label: 'Orders Status', icon: ShoppingBag },
    { to: '/admin/users', label: 'Users List', icon: Users },
    { to: '/admin/messages', label: 'Messages', icon: Mail }, // ADDED THIS LINE
  ];

  const DesktopSidebarContent = () => (
    <>
      <div className="p-5 space-y-7">
        <div className="flex items-center gap-2.5 px-2">
          <BookMarked className="w-6 h-6 text-orange-500" />
          <h1 className="text-sm font-black uppercase tracking-wider text-white">Admin Panel</h1>
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-600">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 z-40">
        <DesktopSidebarContent />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-50 transform transition-transform duration-300 lg:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-6 h-6 text-orange-500" />
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Admin Panel</h1>
          </div>
          <button type="button" onClick={() => setMobileSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-5 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="min-h-screen lg:pl-64 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between lg:justify-end px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30">
          <button type="button" onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          
          {/* ... (Keep your existing Header/Dropdown logic here) */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}