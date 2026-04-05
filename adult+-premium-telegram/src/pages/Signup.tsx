import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { UserPlus, Lock, Smartphone, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Signup() {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      await signup(fullName, mobileNumber, password);
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
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-pink-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <UserPlus className="text-pink-500" size={28} sm:size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Create Account</h1>
          <p className="text-gray-400 mt-1.5 sm:mt-2 text-sm sm:text-base">Join our premium community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-[10px] sm:text-xs font-medium text-gray-400 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={16} sm:size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm sm:text-base"
                placeholder="Enter Full Name"
              />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-[10px] sm:text-xs font-medium text-gray-400 ml-1">Mobile Number</label>
            <div className="relative group">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={16} sm:size={18} />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm sm:text-base"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[10px] sm:text-xs font-medium text-gray-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={16} sm:size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm sm:text-base"
                  placeholder="••••"
                />
              </div>
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[10px] sm:text-xs font-medium text-gray-400 ml-1">Confirm</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={16} sm:size={18} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm sm:text-base"
                  placeholder="••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 px-1">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={cn(
                "mt-1 w-5 h-5 rounded flex items-center justify-center transition-colors border",
                agreed ? "bg-purple-500 border-purple-500" : "bg-white/5 border-white/20"
              )}
            >
              {agreed && <CheckCircle2 size={14} className="text-white" />}
            </button>
            <p className="text-xs text-gray-400 leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-purple-400 hover:underline"
              >
                Terms and Conditions
              </button>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button type="submit" className="w-full btn-primary py-3.5 mt-2">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Terms Popup */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md glass p-8 rounded-[2rem] max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold mb-4 gradient-text">Terms & Conditions</h3>
            <div className="text-sm text-gray-300 space-y-4 leading-relaxed">
              <p>1. You must be 18 years or older to access this application.</p>
              <p>2. The content provided is for adult entertainment purposes only.</p>
              <p>3. Sharing of premium links or content is strictly prohibited and will result in account termination.</p>
              <p>4. Payments are non-refundable once the package is activated.</p>
              <p>5. We are not responsible for any content shared within external Telegram channels.</p>
              <p>6. Your data is stored securely in our database for account management purposes.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="w-full btn-primary py-3 mt-8"
            >
              I Understand
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
