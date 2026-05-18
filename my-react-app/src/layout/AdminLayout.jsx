import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, PlusCircle, ShoppingBag, Users, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Links mapped explicitly to match your App.jsx routing table paths
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/books', label: 'Manage Books', icon: PlusCircle },
    { path: '/admin/orders', label: 'Orders Status', icon: ShoppingBag },
    { path: '/admin/users', label: 'Users List', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    console.log("Admin Logged Out");
    navigate('/login');
  };

  // Dynamically changes header text depending on which section is loaded
  const getCurrentHeaderTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Management Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* SIDEBAR NAVIGATION CONTROL LAYER */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-10">
        
        {/* Top Branding Section */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-800 bg-gray-950">
          <BookOpen className="w-7 h-7 text-amber-500" />
          <span className="text-lg font-bold tracking-wider text-amber-500">ADMIN PANEL</span>
        </div>

        {/* Core Sub-route Menu Mapping Area */}
        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations Panel */}
        <div className="p-4 border-t border-gray-800 space-y-2 bg-gray-950">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-900/40 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Account
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE VIEWPORT COMPOSER */}
      <div className="flex-grow ml-64 flex flex-col min-h-screen">
        
        {/* Top Navigation Global Header Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-5">
          <h1 className="text-lg font-bold text-gray-800">{getCurrentHeaderTitle()}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              A
            </div>
            <span className="text-sm font-semibold text-gray-700">System Admin</span>
          </div>
        </header>

        {/* Dynamic Nested Route Viewport Container */}
        <main className="flex-grow p-8">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}