import React from 'react';
import { Home, MessageSquare, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/channels', icon: MessageSquare, label: 'Channels' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-dark rounded-[2rem] p-2 sm:p-2.5 flex items-center justify-around border border-white/10 shadow-2xl z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-4 sm:px-6 py-2 rounded-2xl transition-all relative group",
              isActive ? "text-purple-500" : "text-gray-500 hover:text-gray-300"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-purple-500/10 rounded-2xl border border-purple-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10">
                <item.icon size={isActive ? 22 : 20} className="sm:w-6 sm:h-6" />
              </div>
              <span className={cn(
                "text-[9px] sm:text-[10px] font-bold uppercase tracking-widest relative z-10",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
              )}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
