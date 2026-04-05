import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, CreditCard, History, PlusCircle, 
  BarChart3, LogOut, Search, Filter, Check, X, 
  ShieldCheck, Smartphone, Crown, TrendingUp, UserPlus, 
  ArrowUpRight, ArrowDownRight, MoreVertical, Trash2, Edit3, Lock, CheckCircle2,
  Ban, ShieldAlert, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { ref, onValue, set, remove, get, update } from 'firebase/database';
import { db } from '../firebase';
import { User, Transaction, Package } from '../types';
import { PACKAGES } from '../context/constants';
import { cn } from '../lib/utils';

export function AdminPortal() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'pending' | 'payments' | 'give-access' | 'stats' | 'leads'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'confirm' | 'danger';
  }>({ show: false, title: '', message: '', onConfirm: () => {}, type: 'confirm' });
  const [editNameModal, setEditNameModal] = useState<{
    show: boolean;
    userId: string;
    currentName: string;
  }>({ show: false, userId: '', currentName: '' });

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Admin Login Check
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '366720') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      setNotification({ type: 'error', message: 'Invalid Admin Password' });
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const usersRef = ref(db, 'users');
    const pendingRef = ref(db, 'pending_payments');

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([key, value]: [string, any]) => ({
          ...value,
          uid: value.uid || key
        }));
        setUsers(list);
      }
    });

    const unsubscribePending = onValue(pendingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([key, value]: [string, any]) => ({
          ...value,
          id: value.id || key
        }));
        setPendingPayments(list);
      } else {
        setPendingPayments([]);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribePending();
    };
  }, [isAdminLoggedIn]);

  // Derived Stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalRevenue = users.reduce((acc, u) => {
      const txs = u.transactions ? Object.values(u.transactions) as Transaction[] : [];
      return acc + txs.filter(t => t.status === 'Confirmed').reduce((sum, t) => sum + t.amount, 0);
    }, 0);
    const activePackages = users.filter(u => u.activePackage?.status === 'Active').length;
    const pendingCount = pendingPayments.length;

    return { totalUsers, totalRevenue, activePackages, pendingCount };
  }, [users, pendingPayments]);

  // Handlers
  const handleConfirmPayment = async (payment: any) => {
    console.log('Confirming payment:', payment);
    if (!payment || !payment.userId || !payment.id) {
      console.error('Invalid payment data:', payment);
      setNotification({ type: 'error', message: 'Invalid payment data: Missing ID or User ID' });
      return;
    }

    setConfirmModal({
      show: true,
      title: 'Confirm Payment',
      message: `Are you sure you want to confirm payment of ${payment.amount} BDT for ${payment.userMobile}?`,
      type: 'confirm',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setIsSubmitting(true);
        try {
          const pkg = PACKAGES.find(p => p.id === payment.packageId);
          if (!pkg) throw new Error('Package not found: ' + payment.packageId);

          const activationDate = new Date();
          const endDate = new Date();
          endDate.setDate(activationDate.getDate() + pkg.durationDays);

          const userPackage = {
            id: pkg.id,
            name: pkg.name,
            price: pkg.priceBDT,
            limit: pkg.channels,
            activationDate: activationDate.toLocaleDateString('en-GB'),
            endDate: endDate.toLocaleDateString('en-GB'),
            status: 'Active'
          };

          // Update user's transaction status and active package
          const updates: any = {};
          updates[`users/${payment.userId}/transactions/${payment.id}/status`] = 'Confirmed';
          updates[`users/${payment.userId}/activePackage`] = userPackage;
          updates[`pending_payments/${payment.id}`] = null; // Remove from pending

          console.log('Executing multi-path update:', updates);
          await update(ref(db), updates);
          
          setNotification({ type: 'success', message: 'Payment confirmed and package activated!' });
        } catch (err) {
          console.error('Confirm Payment Error:', err);
          setNotification({ type: 'error', message: 'Error confirming payment: ' + (err as Error).message });
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleRejectPayment = async (payment: any) => {
    console.log('Rejecting payment:', payment);
    if (!payment || !payment.userId || !payment.id) {
      setNotification({ type: 'error', message: 'Invalid payment data' });
      return;
    }

    setConfirmModal({
      show: true,
      title: 'Reject Payment',
      message: `Are you sure you want to reject the payment request from ${payment.userMobile}?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setIsSubmitting(true);
        try {
          const updates: any = {};
          updates[`users/${payment.userId}/transactions/${payment.id}/status`] = 'Rejected';
          updates[`pending_payments/${payment.id}`] = null;

          console.log('Executing multi-path update (reject):', updates);
          await update(ref(db), updates);
          setNotification({ type: 'success', message: 'Payment rejected successfully' });
        } catch (err) {
          console.error('Reject Payment Error:', err);
          setNotification({ type: 'error', message: 'Error rejecting payment: ' + (err as Error).message });
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleBlockUser = async (userId: string) => {
    setConfirmModal({
      show: true,
      title: 'Block User',
      message: 'Are you sure you want to block this user\'s package?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        try {
          await update(ref(db, `users/${userId}/activePackage`), { status: 'Blocked' });
          setNotification({ type: 'success', message: 'User package blocked' });
        } catch (err) {
          setNotification({ type: 'error', message: 'Failed to block user' });
        }
      }
    });
  };

  const handleReactivateUser = async (userId: string) => {
    setConfirmModal({
      show: true,
      title: 'Reactivate User',
      message: 'Reactivate this user\'s package?',
      type: 'confirm',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        try {
          await update(ref(db, `users/${userId}/activePackage`), { status: 'Active' });
          setNotification({ type: 'success', message: 'User package reactivated' });
        } catch (err) {
          setNotification({ type: 'error', message: 'Failed to reactivate user' });
        }
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmModal({
      show: true,
      title: 'DELETE USER',
      message: 'CRITICAL: Are you sure you want to delete this user permanently? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        try {
          await remove(ref(db, `users/${userId}`));
          setNotification({ type: 'success', message: 'User deleted permanently' });
        } catch (err) {
          setNotification({ type: 'error', message: 'Failed to delete user' });
        }
      }
    });
  };

  const handleGiveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const mobileOrUid = (form.elements.namedItem('mobileOrUid') as HTMLInputElement).value;
    const packageId = (form.elements.namedItem('packageId') as HTMLSelectElement).value;

    const targetUser = users.find(u => 
      u.mobileNumber?.toString() === mobileOrUid || 
      u.uid?.toString() === mobileOrUid
    );
    if (!targetUser) {
      setNotification({ type: 'error', message: 'User not found' });
      return;
    }

    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      setNotification({ type: 'error', message: 'Invalid package selected' });
      return;
    }

    setIsSubmitting(true);
    try {
      const activationDate = new Date();
      const endDate = new Date();
      endDate.setDate(activationDate.getDate() + pkg.durationDays);

      const userPackage = {
        id: pkg.id,
        name: pkg.name,
        price: pkg.priceBDT,
        limit: pkg.channels,
        activationDate: activationDate.toLocaleDateString('en-GB'),
        endDate: endDate.toLocaleDateString('en-GB'),
        status: 'Active'
      };

      await update(ref(db, `users/${targetUser.uid}`), { activePackage: userPackage });
      setNotification({ type: 'success', message: `Package "${pkg.name}" granted to ${targetUser.fullName}` });
      form.reset();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Error granting access' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md glass p-8 rounded-[2.5rem] border-white/5 space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-red-500" size={32} />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Admin Access</h1>
            <p className="text-gray-400">Enter secure password to continue</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Admin Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary bg-gradient-to-r from-red-600 to-orange-600 py-4 shadow-red-500/20">
              Unlock Portal
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={cn(
              "fixed top-10 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border min-w-[300px]",
              notification.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border-white/5 space-y-6"
            >
              <div className="space-y-2">
                <h3 className={cn("text-2xl font-bold", confirmModal.type === 'danger' ? "text-red-500" : "text-white")}>
                  {confirmModal.title}
                </h3>
                <p className="text-gray-400">{confirmModal.message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-colors shadow-lg",
                    confirmModal.type === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-green-600 hover:bg-green-700 shadow-green-500/20"
                  )}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Name Modal */}
      <AnimatePresence>
        {editNameModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditNameModal(prev => ({ ...prev, show: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border-white/5 space-y-6"
            >
              <h3 className="text-2xl font-bold">Edit User Name</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={editNameModal.currentName}
                  onChange={(e) => setEditNameModal(prev => ({ ...prev, currentName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-500/50"
                  placeholder="Enter full name"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditNameModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await update(ref(db, `users/${editNameModal.userId}`), { fullName: editNameModal.currentName });
                      setNotification({ type: 'success', message: 'Name updated successfully' });
                      setEditNameModal(prev => ({ ...prev, show: false }));
                    } catch (err) {
                      setNotification({ type: 'error', message: 'Failed to update name' });
                    }
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 glass-dark border-r border-white/5 p-4 sm:p-6 space-y-6 sm:space-y-8 lg:h-screen lg:sticky lg:top-0 overflow-y-auto z-50 no-scrollbar">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-red-500" size={20} sm:size={24} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold gradient-text">Admin Panel</h2>
        </div>

        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { id: 'users', icon: <Users size={18} />, label: 'Users' },
            { id: 'pending', icon: <CreditCard size={18} />, label: 'Pending', badge: stats.pendingCount },
            { id: 'give-access', icon: <PlusCircle size={18} />, label: 'Access' },
            { id: 'stats', icon: <BarChart3 size={18} />, label: 'Stats' },
            { id: 'leads', icon: <TrendingUp size={18} />, label: 'Leads' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all group shrink-0 lg:shrink",
                activeTab === item.id ? "bg-red-500/10 text-red-500 border border-red-500/20" : "text-gray-400 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {item.icon}
                <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge ? (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            sessionStorage.removeItem('admin_auth');
            setIsAdminLoggedIn(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-semibold text-sm mt-auto"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 space-y-10 overflow-x-hidden">
        {/* Top Stats Cards */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <Users className="text-blue-400" />, trend: '+12%', color: 'blue' },
              { label: 'Total Revenue', value: `${stats.totalRevenue} BDT`, icon: <CreditCard className="text-green-400" />, trend: '+8%', color: 'green' },
              { label: 'Active Packages', value: stats.activePackages, icon: <Crown className="text-purple-400" />, trend: '+5%', color: 'purple' },
              { label: 'Pending Requests', value: stats.pendingCount, icon: <History className="text-yellow-400" />, trend: '-2%', color: 'yellow' },
            ].map((s, i) => (
              <div key={i} className="glass p-6 rounded-[2rem] border-white/5 space-y-4 relative overflow-hidden group">
                <div className={cn("absolute -top-12 -right-12 w-24 h-24 blur-[50px] rounded-full opacity-20", `bg-${s.color}-500`)} />
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{s.icon}</div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", s.trend.startsWith('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
                    {s.trend}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{s.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Recent Activity</h3>
                <button onClick={() => setActiveTab('pending')} className="text-red-500 text-sm font-bold hover:underline">View All Pending</button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Pending Payments Preview */}
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <History className="text-yellow-500" size={20} />
                    Pending Requests
                  </h4>
                  <div className="space-y-4">
                    {pendingPayments.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center font-bold text-purple-400">
                            {p.userMobile.slice(-2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{p.packageName}</p>
                            <p className="text-[10px] text-gray-400">{p.userMobile} • {p.method}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleConfirmPayment(p)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><Check size={18} /></button>
                          <button onClick={() => handleRejectPayment(p)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><X size={18} /></button>
                        </div>
                      </div>
                    ))}
                    {pendingPayments.length === 0 && <p className="text-center text-gray-500 py-8">No pending requests</p>}
                  </div>
                </div>

                {/* Quick Stats Chart Placeholder */}
                <div className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                  <BarChart3 size={64} className="text-gray-700" />
                  <h4 className="font-bold text-lg">Growth Overview</h4>
                  <p className="text-sm text-gray-500">Visual analytics will be available as more data is collected.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-2xl font-bold">User Directory</h3>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Mobile or UID..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <th className="px-6 py-4">User Info</th>
                        <th className="px-6 py-4">UID</th>
                        <th className="px-6 py-4">Financials</th>
                        <th className="px-6 py-4">Active Package</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.filter(u => 
                        (u.mobileNumber?.toString() || '').includes(searchQuery) || 
                        (u.uid?.toString() || '').includes(searchQuery) || 
                        (u.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                      ).map((u) => {
                        const txs = u.transactions ? Object.values(u.transactions) as Transaction[] : [];
                        const completedTxs = txs.filter(t => t.status === 'Confirmed');
                        const totalSpent = completedTxs.reduce((sum, t) => sum + t.amount, 0);

                        return (
                        <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center font-bold text-white">
                                {u.fullName[0]}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{u.fullName}</p>
                                <p className="text-xs text-gray-500">{u.mobileNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-400">{u.uid}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-green-400">{totalSpent} BDT</p>
                              <p className="text-[10px] text-gray-500">{completedTxs.length} Payments</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {u.activePackage ? (
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-purple-400">{u.activePackage.name}</p>
                                <p className="text-[10px] text-gray-500">Expires: {u.activePackage.endDate}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-600 italic">No Active Package</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                              u.activePackage?.status === 'Active' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                              u.activePackage?.status === 'Blocked' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              "bg-gray-500/10 text-gray-500 border-gray-500/20"
                            )}>
                              {u.activePackage?.status || 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditNameModal({ show: true, userId: u.uid, currentName: u.fullName })}
                                className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                                title="Edit Name"
                              >
                                <Edit3 size={16} />
                              </button>
                              
                              {u.activePackage?.status === 'Active' ? (
                                <button 
                                  onClick={() => handleBlockUser(u.uid)}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                  title="Block Package"
                                >
                                  <Ban size={16} />
                                </button>
                              ) : u.activePackage?.status === 'Blocked' ? (
                                <button 
                                  onClick={() => handleReactivateUser(u.uid)}
                                  className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                                  title="Reactivate Package"
                                >
                                  <Check size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setActiveTab('give-access')}
                                  className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors"
                                  title="Grant Access"
                                >
                                  <PlusCircle size={16} />
                                </button>
                              )}
                              
                              <button 
                                onClick={() => handleDeleteUser(u.uid)}
                                className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pending' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h3 className="text-2xl font-bold">Pending Payment Requests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingPayments.map((p) => (
                  <div key={p.id} className="glass p-6 rounded-[2rem] border-white/5 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <CreditCard size={80} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full border border-yellow-500/20">
                        {p.method}
                      </div>
                      <span className="text-xs text-gray-500 font-mono">#{p.id}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-white">
                          {p.userMobile.slice(-2)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{p.amount} BDT</p>
                          <p className="text-xs text-gray-400">{p.packageName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">User Mobile:</span>
                          <span className="text-xs font-bold">{p.userMobile}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Trx ID:</span>
                          <span className="text-xs font-bold text-purple-400">{p.trxId}</span>
                        </div>
                        {p.accountNumber && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Sender Acc:</span>
                            <span className="text-xs font-bold">{p.accountNumber}</span>
                          </div>
                        )}
                        {p.ntag && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">nTag:</span>
                            <span className="text-xs font-bold">{p.ntag}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleConfirmPayment(p)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Check size={18} /> Confirm
                      </button>
                      <button
                        onClick={() => handleRejectPayment(p)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-red-500/20"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingPayments.length === 0 && (
                  <div className="col-span-full glass p-20 rounded-[3rem] text-center space-y-4">
                    <CheckCircle2 size={64} className="mx-auto text-green-500/20" />
                    <h4 className="text-xl font-bold text-gray-400">All caught up!</h4>
                    <p className="text-sm text-gray-600">No pending payment requests at the moment.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'give-access' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold">Manual Access Control</h3>
                <p className="text-gray-400">Grant package access to users manually</p>
              </div>

              <form onSubmit={handleGiveAccess} className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest">Target User</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
                      <input
                        name="mobileOrUid"
                        type="text"
                        required
                        placeholder="Enter Mobile Number or UID"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest">Select Package</label>
                    <select
                      name="packageId"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-red-500/50 transition-all appearance-none"
                    >
                      <option value="" className="bg-[#0a0a0a]">Choose a package...</option>
                      {PACKAGES.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#0a0a0a]">{p.name} - {p.priceBDT} BDT</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary bg-gradient-to-r from-red-600 to-orange-600 py-4 shadow-red-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Granting Access...' : 'Grant Package Access'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Analytical Overview</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  Real-time Data
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <TrendingUp className="text-red-500" size={20} />
                      Revenue Distribution
                    </h4>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={users.slice(0, 10).map(u => ({
                        name: u.fullName.split(' ')[0],
                        revenue: (Object.values(u.transactions || {}) as Transaction[])
                          .filter(t => t.status === 'Confirmed')
                          .reduce((sum, t) => sum + t.amount, 0)
                      }))}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ color: '#ef4444' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#ef4444" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Package Distribution Pie Chart */}
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Crown className="text-purple-500" size={20} />
                    Package Popularity
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '1000 Channels', value: users.filter(u => u.activePackage?.limit === 1000).length },
                            { name: '1500 Channels', value: users.filter(u => u.activePackage?.limit === 1500).length },
                            { name: '2500 Channels', value: users.filter(u => u.activePackage?.limit === 2500).length },
                            { name: '5000 Channels', value: users.filter(u => u.activePackage?.limit === 5000).length },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[0, 1, 2, 3].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#ef4444', '#8b5cf6', '#3b82f6', '#f59e0b'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Growth Bar Chart */}
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 xl:col-span-2">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <BarChart3 className="text-blue-500" size={20} />
                    User Activity Overview
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={users.slice(0, 15).map(u => ({
                        name: u.fullName.split(' ')[0],
                        payments: Object.keys(u.transactions || {}).length
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        />
                        <Bar dataKey="payments" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h3 className="text-2xl font-bold">User Leads</h3>
              <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">Signup Date</th>
                      <th className="px-6 py-4">Total Payments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm">{u.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{u.mobileNumber}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-purple-400">
                          {u.transactions ? Object.keys(u.transactions).length : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
