import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Search, ChevronRight, QrCode, ExternalLink, X, ChevronLeft, Lock, Crown } from 'lucide-react';
import { SAMPLE_CHANNELS } from '../context/constants';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export function Channels() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const itemsPerPage = 100;

  const hasActivePackage = user?.activePackage && user.activePackage.status === 'Active';
  const packageLimit = user?.activePackage?.limit || 0;

  const channels = useMemo(() => {
    if (!hasActivePackage) return [];
    const limitKey = packageLimit.toString();
    const getChannels = SAMPLE_CHANNELS[limitKey];
    return getChannels ? getChannels() : [];
  }, [hasActivePackage, packageLimit]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const totalPages = Math.ceil(filteredChannels.length / itemsPerPage);
  const paginatedChannels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredChannels.slice(start, start + itemsPerPage);
  }, [filteredChannels, currentPage]);

  if (!hasActivePackage) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-purple-500/10 rounded-[2rem] flex items-center justify-center mb-4"
        >
          <Lock className="text-purple-500" size={48} />
        </motion.div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold gradient-text">Premium Access Required</h2>
          <p className="text-gray-400 max-w-xs mx-auto">
            You don't have an active package. Purchase a package to unlock thousands of premium Telegram channels.
          </p>
        </div>
        <Link to="/profile" className="btn-primary px-12 py-4 text-lg">
          Buy Premium Package
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 space-y-6 sm:space-y-8 pb-32 max-w-md mx-auto sm:max-w-none"
    >
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <MessageSquare className="text-purple-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Telegram Channels</h2>
            <p className="text-xs sm:text-sm text-purple-400 font-medium">
              {user?.activePackage?.name} • {channels.length} Available
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search premium channels..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm sm:text-base"
          />
        </div>
      </header>

      {/* Channels List */}
      <div className="space-y-2.5 sm:space-y-3">
        {paginatedChannels.map((channel, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.01 }}
            onClick={() => setSelectedChannel(channel)}
            className="glass p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500/10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-purple-400 text-sm">
                {(currentPage - 1) * itemsPerPage + i + 1}
              </div>
              <span className="font-semibold text-gray-200 group-hover:text-white transition-colors text-sm sm:text-base">{channel.name}</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-500 group-hover:text-purple-500 group-hover:bg-purple-500/10 transition-all">
              <ChevronRight size={18} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-3 glass rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="glass px-6 py-3 rounded-xl font-bold text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-3 glass rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Channel Details Popup */}
      <AnimatePresence>
        {selectedChannel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm glass p-8 rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              
              <button
                onClick={() => setSelectedChannel(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-purple-500/20 rounded-[2rem] flex items-center justify-center">
                  <Crown className="text-purple-500" size={40} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{selectedChannel.name}</h3>
                  <p className="text-sm text-gray-400">Premium Telegram Channel</p>
                </div>

                <div className="p-6 bg-white rounded-[2rem] shadow-2xl shadow-purple-500/20">
                  <QRCodeSVG value={selectedChannel.link} size={180} />
                </div>

                <div className="space-y-4 w-full">
                  <a
                    href={selectedChannel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full btn-primary py-4"
                  >
                    Join Channel <ExternalLink size={18} />
                  </a>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Scan QR or Click to Join
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
