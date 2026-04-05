import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Smartphone, Crown, CreditCard, History, LogOut, ChevronRight, CheckCircle2, Clock, XCircle, Copy, Check, Info, Bitcoin, Wallet, QrCode, Lock } from 'lucide-react';
import { PACKAGES } from '../context/constants';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Transaction, Package } from '../types';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export function Profile() {
  const { user, logout } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({ accountNumber: '', trxId: '', ntag: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Rejected'>('All');

  const hasActivePackage = user?.activePackage && user.activePackage.status === 'Active';

  const filteredTransactions = useMemo(() => {
    if (!user?.transactions) return [];
    const txs = Object.values(user.transactions) as Transaction[];
    if (transactionFilter === 'All') return txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return txs.filter(t => t.status === transactionFilter).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [user?.transactions, transactionFilter]);

  

const handleCopy = async (text: string, id: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    
    // Reset the icon back to "Copy" after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};

  const USD_TO_BDT = 125;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !paymentMethod || !user) return;

    setIsSubmitting(true);
    try {
      const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();

      // Calculate amount based on method
      let finalAmount = selectedPackage.priceBDT;
      if (paymentMethod === 'binance-usdt' || paymentMethod === 'nsave') {
        finalAmount = (selectedPackage.priceUSD || (selectedPackage.priceBDT / USD_TO_BDT));
      }

      const newTransaction: Transaction = {
        id: transactionId,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: finalAmount,
        method: paymentMethod,
        accountNumber: paymentDetails.accountNumber,
        trxId: paymentDetails.trxId,
        ntag: paymentDetails.ntag,
        status: 'Pending',
        timestamp: new Date().toISOString(),
      };

      const transactionRef = ref(db, `users/${user.uid}/transactions/${transactionId}`);
      const pendingRef = ref(db, `pending_payments/${transactionId}`);

      await set(transactionRef, newTransaction);
      await set(pendingRef, { ...newTransaction, userId: user.uid, userMobile: user.mobileNumber });

      // Reset state
      setSelectedPackage(null);
      setPaymentMethod(null);
      setPaymentDetails({ accountNumber: '', trxId: '', ntag: '' });
      alert('Payment submitted successfully! Please wait for admin confirmation.');
    } catch (err) {
      console.error(err);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

const paymentMethods = [
    { 
      id: 'bkash', 
      name: 'bKash', 
      icon: (
        <img 
          src="data:image/png;base64,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" 
          alt="bKash" 
          className="w-8 h-8 object-contain" 
        />
      ), 
      color: '#e2136e', 
      account: 'Contact Our Agent', 
      instruction: 'Go to bKash app or Dial *247# and select send money option' 
    },
    { 
      id: 'nagad', 
      name: 'Nagad', 
      icon: (
        <img 
          src="data:image/png;base64,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" 
          alt="Nagad" 
          className="w-10 h-10 object-contain" 
        />
      ), 
      color: '#f7941d', 
      account: 'Contact Our Agent', 
      instruction: 'Go to Nagad app or Dial *167# and select send money option' 
    },
    { 
      id: 'binance-usdt', 
      name: 'Binance (USDT)', 
      icon: (
        <img 
          src="data:image/png;base64,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"
          alt="bKash" 
          className="w-8 h-8 object-contain" 
        />
      ), 
      color: '#f3ba2f', 
      account: 'Contact Our Agent', 
      instruction: 'Send USDT (TRC20) to the address below', 
      isCrypto: true 
    },
    { 
      id: 'binance-btc', 
      name: 'Binance (BTC)', 
      icon: <Bitcoin className="text-[#f3ba2f]" size={24} />, 
      color: '#f3ba2f', 
      account: 'Contact Our Agent', 
      instruction: 'Send Bitcoin to the address below', 
      isCrypto: true, 
      underConstruction: false
    },
    { 
      id: 'nsave', 
      name: 'nSave', 
      icon: (
        <img 
          src="data:image/jpeg;base64,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" 
          alt="bKash" 
          className="w-8 h-8 object-contain" 
        />
      ), 
      color: '#3b82f6', 
      account: 'Contact Our Agent', 
      instruction: 'Send USD to the ntag below' 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 space-y-6 sm:space-y-8 pb-32 max-w-md mx-auto sm:max-w-none"
    >
      {/* User Header */}
      <header className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 blur-[60px] rounded-full" />
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 shrink-0">
            <User size={32} className="text-white sm:hidden" />
            <User size={40} className="text-white hidden sm:block" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">{user?.fullName}</h2>
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
              <Smartphone size={14} />
              <span className="truncate">{user?.mobileNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Crown size={12} />
              <span>UID: {user?.uid}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Active Package Section */}
      {hasActivePackage ? (
        <section className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold px-1 sm:px-2 flex items-center gap-2">
            <Crown className="text-purple-500" size={18} />
            Active Package
          </h3>
          <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 bg-gradient-to-br from-purple-600/10 to-pink-600/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Crown size={100} className="text-purple-500 sm:hidden" />
              <Crown size={120} className="text-purple-500 hidden sm:block" />
            </div>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">{user?.activePackage?.name}</h4>
                  <span className="px-2.5 py-0.5 bg-green-500/20 text-green-500 text-[9px] sm:text-[10px] font-bold uppercase rounded-full border border-green-500/20">
                    {user?.activePackage?.status}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Price Bought</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{user?.activePackage?.price} BDT</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Activation Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-200">{user?.activePackage?.activationDate}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">End Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-200">{user?.activePackage?.endDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Limitation</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-200">{user?.activePackage?.limit} Channels</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Remaining</p>
                  <p className="text-xs sm:text-sm font-semibold text-purple-400">
                    {(() => {
                      if (!user?.activePackage?.endDate) return '0 Days';

                      // Parse DD/MM/YYYY format
                      const [day, month, year] = user.activePackage.endDate.split('/').map(Number);
                      const end = new Date(year, month - 1, day);

                      // Get current date and set to midnight for accurate day-to-day comparison
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const diffTime = end.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      return `${Math.max(0, diffDays)} Days`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-5 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-bold px-1 sm:px-2 flex items-center gap-2">
            <CreditCard className="text-purple-500" size={18} />
            Available Packages
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {PACKAGES.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPackage(p)}
                className="glass p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border-white/5 hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Crown size={20} className="text-purple-500 sm:hidden" />
                    <Crown size={24} className="text-purple-500 hidden sm:block" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">{p.name.split('(')[0]}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-400">{p.channels} Premium Channels</p>
                    <p className="text-[10px] ">Duration = {p.durationDays} Days</p>
                  </div>
                </div>
                <div>

                </div>
                <div className="mt-5 sm:mt-6 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Price</p>
                    <p className="text-lg sm:text-xl font-bold text-white">{p.priceBDT} BDT</p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-500 group-hover:text-purple-500 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Transactions Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History className="text-purple-500" size={20} />
            Transactions
          </h3>
          <select
            value={transactionFilter}
            onChange={(e: any) => setTransactionFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500/50"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="glass p-5 rounded-2xl border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    tx.status === 'Confirmed' ? "bg-green-500/10 text-green-500" :
                      tx.status === 'Rejected' ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {tx.status === 'Confirmed' ? <CheckCircle2 size={24} /> :
                      tx.status === 'Rejected' ? <XCircle size={24} /> :
                        <Clock size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{tx.packageName}</h4>
                    <p className="text-[10px] text-gray-400">{tx.timestamp.split('T')[0]} • {tx.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{tx.amount} BDT</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    tx.status === 'Confirmed' ? "text-green-500" :
                      tx.status === 'Rejected' ? "text-red-500" :
                        "text-yellow-500"
                  )}>{tx.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass p-12 rounded-3xl border-white/5 text-center space-y-3">
              <History size={48} className="mx-auto text-gray-600" />
              <p className="text-gray-400 text-sm">No transactions found</p>
            </div>
          )}
        </div>
      </section>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-4 glass rounded-2xl text-red-500 font-bold hover:bg-red-500/10 transition-colors border-red-500/10"
      >
        <LogOut size={20} />
        Logout Account
      </button>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md glass p-8 rounded-[2.5rem] relative my-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

              <button
                onClick={() => {
                  setSelectedPackage(null);
                  setPaymentMethod(null);
                }}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle size={20} />
              </button>

              {!paymentMethod ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Select Payment Method</h3>
                    <p className="text-sm text-gray-400">Choose your preferred way to pay</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={cn(
                          "flex items-center justify-between p-4 glass rounded-2xl border-white/5 transition-all group relative overflow-hidden",
                          m.underConstruction ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                        )}
                        disabled={m.underConstruction}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            {m.icon}
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-gray-200 block">{m.name}</span>
                            {m.underConstruction && <span className="text-[10px] text-red-500 font-bold uppercase">Under Construction</span>}
                          </div>
                        </div>
                        {!m.underConstruction && <ChevronRight size={20} className="text-gray-500" />}
                        {m.underConstruction && <Lock size={16} className="text-gray-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(null)}
                      className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <h3 className="text-xl font-bold">Payment Details</h3>
                  </div>

                  {/* Payment Info Card */}
                  {paymentMethods.find(m => m.id === paymentMethod) && (
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-4 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {paymentMethods.find(m => m.id === paymentMethod)?.icon}
                          <span className="font-bold">{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                        </div>
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Merchant</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Account / Address</p>
                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                          <code className="text-xs font-mono text-purple-300 break-all pr-2">
                            {paymentMethods.find(m => m.id === paymentMethod)?.account}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              const accountText = paymentMethods.find(m => m.id === paymentMethod)?.account;
                              if (accountText) {
                                // Direct copy logic within the click handler to ensure context
                                navigator.clipboard.writeText(accountText).then(() => {
                                  setCopied('acc');
                                  setTimeout(() => setCopied(null), 2000);
                                }).catch(err => {
                                  console.error('Copy failed', err);
                                });
                              }
                            }}
                            className="shrink-0 p-2 hover:bg-white/5 rounded-lg transition-colors active:scale-95"
                          >
                            {copied === 'acc' ? (
                              <Check size={16} className="text-green-500 animate-in zoom-in duration-300" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {paymentMethods.find(m => m.id === paymentMethod)?.isCrypto && (
                        <div className="flex justify-center p-4 bg-white rounded-2xl">
                          <QRCodeSVG value={paymentMethods.find(m => m.id === paymentMethod)?.account || ''} size={140} />
                        </div>
                      )}

                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-3">
                        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-400/80 leading-relaxed">
                          {paymentMethods.find(m => m.id === paymentMethod)?.instruction}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
                        {paymentMethod === 'nsave' ? 'Your ntag' : 'Your Account Number'}
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentMethod === 'nsave' ? paymentDetails.ntag : paymentDetails.accountNumber}
                        onChange={(e) => setPaymentDetails(prev => ({
                          ...prev,
                          [paymentMethod === 'nsave' ? 'ntag' : 'accountNumber']: e.target.value
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder={paymentMethod === 'nsave' ? '@your_ntag' : '01XXXXXXXXX'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
                        {paymentMethod.includes('binance') ? 'Transaction Hash / Initial' : 'Transaction ID (TrxID)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentDetails.trxId}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, trxId: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="Enter Transaction ID"
                      />
                    </div>
                  </div>

                  <div className="p-5 glass rounded-2xl border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Amount</p>
                      <p className="text-xl font-bold text-white">
                        {paymentMethod === 'nsave' ? `${selectedPackage.priceUSD || (selectedPackage.priceBDT / USD_TO_BDT).toFixed(2)} USD` :
                          paymentMethod === 'binance-usdt' ? `${selectedPackage.priceUSD || (selectedPackage.priceBDT / USD_TO_BDT).toFixed(2)} USDT` :
                            paymentMethod === 'binance-btc' ? `${selectedPackage.priceUSD || (selectedPackage.priceBDT / USD_TO_BDT).toFixed(2)} BTC` :
                              `${selectedPackage.priceBDT} BDT`}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary py-3 px-8 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Pay'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}