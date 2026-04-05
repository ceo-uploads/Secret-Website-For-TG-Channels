import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { LogIn, Lock, Smartphone, AlertCircle, Info } from 'lucide-react';

export function Login() {
  const [mobileOrUid, setMobileOrUid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(mobileOrUid, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#0f0f0f] to-[#050505] overflow-y-auto no-scrollbar">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-[400px] glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <LogIn className="text-purple-500" size={28} sm:size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-gray-400 mt-1.5 sm:mt-2 text-sm sm:text-base">Login to access premium content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-300 ml-1">Mobile Number or UID</label>
            <div className="relative group">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} sm:size={20} />
              <input
                type="text"
                required
                value={mobileOrUid}
                onChange={(e) => setMobileOrUid(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-12 pr-4 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm sm:text-base"
                placeholder="Enter Mobile or UID"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} sm:size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <button type="submit" className="w-full btn-primary py-4">
            Login Now
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => setShowForgotPopup(true)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot Password?
          </button>
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Popup */}
      {showForgotPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm glass p-8 rounded-[2rem] text-center"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Forgot Password?</h3>
            <p className="text-gray-400 mb-6">
              If you've forgot password, contact our agent on Telegram for recovery.
            </p>
            <div className="space-y-3">
              <a
                href="https://t.me/rayhan_md4"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full btn-primary py-3"
              >
                Contact Agent
              </a>
              <button
                onClick={() => setShowForgotPopup(false)}
                className="block w-full btn-secondary py-3"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
