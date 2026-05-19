import React, { useState, useRef, useEffect } from 'react';
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
  BookMarked
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the profile dropdown automatically if the user clicks anywhere outside of it
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
    // Clear session storage tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Redirect cleanly to client login portal path
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-600">
      
      {/* 1. LEFT FIXED MAIN NAVIGATION SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="p-5 space-y-7">
          {/* Brand Header Identity */}
          <div className="flex items-center gap-2.5 px-2">
            <BookMarked className="w-6 h-6 text-orange-500" />
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Admin Panel</h1>
          </div>

          {/* Navigational Links Collection */}
          <nav className="space-y-1">
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>

            <NavLink 
              to="/admin/books" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Manage Books
            </NavLink>

            <NavLink 
              to="/admin/reports" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Reports
            </NavLink>

            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders Status
            </NavLink>

            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" /> Users List
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer Context Utilities */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
          {/* Bottom logout button removed successfully from here */}
        </div>
      </aside>

      {/* 2. MAIN APP CONTAINER CONTENT REGION */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* FIXED UPPER LAYOUT MASTER HEADER BAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shrink-0 select-none z-40">
          
          {/* FUNCTIONAL DROPDOWN INTERACTION CONTAINER */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer group focus:outline-none"
            >
              {/* Profile Monogram Badge Avatar */}
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-black shadow-sm ring-2 ring-amber-500/10 shrink-0">
                A
              </div>
              
              {/* Identity Display Text Node */}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-800 group-hover:text-gray-900 transition-colors">System Admin</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-0.5">Root Administrator</p>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
            </button>

            {/* DYNAMIC DROPDOWN MENU ACCENT PANEL */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150 transform origin-top-right z-50">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-800">Signed in as</p>
                  <p className="text-[11px] font-medium text-slate-400 truncate">admin@bookstore.com</p>
                </div>

                {/* Navigation Hook Link to Admin Settings View */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 hover:text-gray-900 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> System Settings
                </button>

                <div className="h-px bg-gray-100 my-1.5" />

                {/* Terminate Session Trigger Option */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/60 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout Session
                </button>
              </div>
            )}
          </div>

        </header>

        {/* 3. SCROLLABLE INNER PAGE WORKSPACE ROUTE TARGET SECTION */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}