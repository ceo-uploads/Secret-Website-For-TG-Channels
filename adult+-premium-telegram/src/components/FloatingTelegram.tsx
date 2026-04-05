import { Send } from 'lucide-react';
import { motion } from 'motion/react';

export function FloatingTelegram() {
  return (
    <motion.a
      href="https://t.me/rayhan_md4"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 w-14 h-14 bg-[#0088cc] rounded-full flex items-center justify-center shadow-2xl shadow-[#0088cc]/40 z-50 group"
    >
      <Send className="text-white group-hover:rotate-12 transition-transform" size={28} />
      <div className="absolute -top-12 right-0 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
        Contact Agent
      </div>
    </motion.a>
  );
}
