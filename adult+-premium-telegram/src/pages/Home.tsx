import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Star, CreditCard, MessageCircle, AlertTriangle, ChevronRight, Info, Crown, Users, Download } from 'lucide-react';
import { PACKAGES } from '../context/constants';
import { Link } from 'react-router-dom';

export function Home() {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install the app, please use the "Add to Home Screen" option in your browser menu.');
    }
  };

  const features = [
    { icon: <Zap size={24} className="text-yellow-400" />, title: "Instant Access", desc: "Get access to premium channels immediately after payment confirmation." },
    { icon: <ShieldCheck size={24} className="text-green-400" />, title: "Highly Secure", desc: "Your data and transactions are protected with advanced encryption." },
    { icon: <Star size={24} className="text-purple-400" />, title: "Premium Content", desc: "Hand-picked high-quality Telegram channels and groups." },
  ];

  const [lang, setLang] = useState<'EN' | 'BN'>('EN');

  const content = {
    EN: {
      welcome: "Welcome",
      explore: "Explore Channels",
      whyBest: "Why We Are Best?",
      systemInst: "System Instruction",
      paymentInst: "Payment Instruction",
      packages: "Our Packages",
      needHelp: "Need Help?",
      contactAgent: "Contact Our Agent",
    },
    BN: {
      welcome: "স্বাগতম",
      explore: "চ্যানেল দেখুন",
      whyBest: "কেন আমরা সেরা?",
      systemInst: "সিস্টেম নির্দেশাবলী",
      paymentInst: "পেমেন্ট নির্দেশাবলী",
      packages: "আমাদের প্যাকেজগুলো",
      needHelp: "সাহায্য প্রয়োজন?",
      contactAgent: "এজেন্টের সাথে যোগাযোগ করুন",
    }
  };

  const t = content[lang];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 space-y-10 sm:space-y-12 pb-32 max-w-md mx-auto sm:max-w-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Crown size={18} className="text-white sm:hidden" />
            <Crown size={20} className="text-white hidden sm:block" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold gradient-text">Adult+ Premium</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
            className="px-2.5 py-1.5 glass rounded-xl text-[9px] sm:text-[10px] font-bold text-purple-400 border-white/5 hover:bg-white/10 transition-colors"
          >
            {lang === 'EN' ? 'বাংলা' : 'English'}
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 glass rounded-full border-white/5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live</span>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="relative overflow-hidden glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {t.welcome}, <span className="gradient-text">{user?.fullName.split(' ')[0]}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-[90%] sm:max-w-[80%]">
            Explore the most exclusive collection of premium Telegram channels and groups.
          </p>
          <Link to="/channels" className="mt-6 inline-flex items-center gap-2 btn-primary text-sm sm:text-base py-3 sm:py-3.5 px-6 sm:px-8">
            {t.explore} <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Why Best Section */}
      <section className="space-y-5 sm:space-y-6">
        <h3 className="text-xl sm:text-2xl font-bold px-1 sm:px-2">{t.whyBest}</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start gap-3 sm:gap-4 border-white/5"
            >
              <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl shrink-0">{f.icon}</div>
              <div>
                <h4 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">{f.title}</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Instructions Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-purple-400">
            <Info size={24} />
            <h4 className="font-bold text-xl">{t.systemInst}</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">• Select your desired package from the list.</li>
            <li className="flex gap-2">• Complete the payment using available methods.</li>
            <li className="flex gap-2">• Provide your transaction details for verification.</li>
            <li className="flex gap-2">• Wait for admin approval (usually within 5-30 mins).</li>
          </ul>
        </div>

        <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-pink-400">
            <CreditCard size={24} />
            <h4 className="font-bold text-xl">{t.paymentInst}</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">• Use bKash, Nagad, or Crypto for payments.</li>
            <li className="flex gap-2">• Always copy the correct account number.</li>
            <li className="flex gap-2">• Ensure the Trx ID is correct to avoid delays.</li>
            <li className="flex gap-2">• Contact agent if payment is not confirmed within 1 hour.</li>
          </ul>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold">{t.packages}</h3>
          <Link to="/profile" className="text-purple-400 text-sm font-semibold hover:underline">View All</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6">
          {PACKAGES.slice(0, 4).map((p) => (
            <div key={p.id} className="min-w-[280px] glass p-6 rounded-3xl border-white/5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Crown size={24} className="text-purple-500" />
                </div>
                <h4 className="font-bold text-lg mb-1">{p.name.split('(')[0]}</h4>
                <p className="text-sm text-gray-400">{p.channels} Premium Channels</p>
                <p className="text-sm text-gray-400">Duration = {p.durationDays} Days</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{p.priceBDT} BDT</span>
                <Link to="/profile" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Agent */}
      <section className="glass p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-purple-600/10 to-pink-600/10 text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle size={32} className="text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold">{t.needHelp}</h3>
        <p className="text-gray-400">Our dedicated support agents are available 24/7 to assist you with any issues or queries.</p>
        <a href="https://t.me/rayhan_md4" target="_blank" rel="noopener noreferrer" className="inline-block btn-primary px-10">
          {t.contactAgent}
        </a>
      </section>

      {/* Future Implementation */}
      <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4">
        <div className="flex items-center gap-3 text-blue-400">
          <Zap size={24} />
          <h4 className="font-bold text-xl">Future Implementation</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl text-center">
            <Users size={20} className="mx-auto mb-2 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Live Chat</span>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl text-center">
            <Star size={20} className="mx-auto mb-2 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">VIP Groups</span>
          </div>
        </div>
      </section>

      {/* Safety Alert */}
      <section className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-start gap-4">
        <AlertTriangle className="text-red-500 shrink-0" size={28} />
        <div>
          <h4 className="font-bold text-red-500 mb-1">Safety Alert</h4>
          <p className="text-xs text-red-400/80 leading-relaxed">
            This application contains 18+ adult content. If you are under 18 years of age, please exit immediately. By entering, you confirm you are legally an adult.
          </p>
        </div>
      </section>

      {/* Download App Section */}
      <section className="glass p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-blue-600/10 to-purple-600/10 text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <Download size={32} className="text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold">Download Our App</h3>
        <p className="text-gray-400">Install our application on your device for a faster and smoother experience.</p>
        <button 
          onClick={handleInstall}
          className="inline-flex items-center gap-2 btn-primary bg-gradient-to-r from-blue-600 to-purple-600 px-10"
        >
          <Download size={18} />
          Install Now
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
            <Crown size={16} className="text-purple-500" />
          </div>
          <span className="font-bold text-gray-400">Adult+ Premium</span>
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">© 2026 All Rights Reserved</p>
      </footer>
    </motion.div>
  );
}
