import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Key, Settings, AlertTriangle, RefreshCw, Truck } from 'lucide-react';

export default function AdminSettings() {
  // Account Information State
  const [adminEmail, setAdminEmail] = useState('admin@bookstore.com');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Bookstore Operations Configuration States
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [shippingFee, setShippingFee] = useState(150); // NPR Base Shipping
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Status message loops
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Sync initial logged admin details from session
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed.email) setAdminEmail(parsed.email);
      } catch (e) {
        console.error("Error retrieving admin config state:", e);
      }
    }
  }, []);

  // Flash a status auto-clear alert bubble
  const triggerStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  // Handle Password Credentials Form Submission
  const handleSecurityUpdate = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      triggerStatus('error', 'Please fill out all password fields.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      triggerStatus('error', 'New passwords do not match.');
      return;
    }
    
    // Simulate API update execution safe loop
    triggerStatus('success', 'Security configurations modified successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Handle System Store Rules Configuration Save
  const handlePreferencesUpdate = (e) => {
    e.preventDefault();
    // Save settings configuration context here to backend api or localStorage
    triggerStatus('success', 'Store operational policies deployed successfully.');
  };

  // Handle Core Database Backup Simulation Routine
  const runSystemBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      triggerStatus('success', 'Cloud snapshot pipeline completed safely. Mongoose logs cleared.');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" /> Admin System Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure access privileges, manage bookstore inventory thresholds, and invoke system database utilities.
          </p>
        </div>
        
        {/* Dynamic Alert Banner */}
        {statusMessage.text && (
          <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all animate-in fade-in duration-200 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SHOP CONFIGURATIONS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section 1: Book Distribution & Inventory Rules */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <Truck className="w-5 h-5 text-indigo-500" /> Bookstore Core Defaults
            </h3>
            
            <form onSubmit={handlePreferencesUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Low Stock Trigger Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-gray-400">Books</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Triggers out-of-stock or alert metrics when quantities dip below this number.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Base Delivery Charge
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                  />
                  <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">NPR</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Standard flat delivery rate calculated on storefront end customer checkouts.</p>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Operational Rules
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Account Authentication Security Update */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <Key className="w-5 h-5 text-orange-500" /> Update Security Credentials
            </h3>

            <form onSubmit={handleSecurityUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Admin Identity Profile Node
                </label>
                <input
                  type="email"
                  disabled
                  value={adminEmail}
                  className="w-full bg-slate-100 border border-gray-200 text-gray-400 font-medium rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Current Key
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    New Secure Key
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Confirm Key Match
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-orange-500/10 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Commit Security Patch
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: MAINTENANCE & SYSTEM PIPELINES */}
        <div className="space-y-8">
          
          {/* System Telemetry & Backups */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Database Diagnostics
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Trigger structural logs serialization. Backs up active catalog product nodes, user models metadata, and authorization nodes into secure offline archives.
              </p>
              
              <button
                onClick={runSystemBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                {isBackingUp ? 'Compiling Archives...' : 'Execute Full System Backup'}
              </button>
            </div>
          </div>

          {/* Quick Platform Status Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
            {/* Visual background accents */}
            <div className="absolute right-0 bottom-0 transform translate-x-6 translate-y-6 opacity-10">
              <Settings className="w-32 h-32 text-white" />
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-sm uppercase tracking-wider text-orange-400">Maintenance Sandbox</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Activating maintenance mode takes down the client storefront index view and returns an offline diagnostic splash page to user agents.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">Public Front-End Access</span>
              <button
                type="button"
                onClick={() => {
                  setIsMaintenanceMode(!isMaintenanceMode);
                  triggerStatus('success', `Platform status set to: ${!isMaintenanceMode ? 'Offline Sandbox Mode' : 'Live Mode'}`);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  isMaintenanceMode ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}