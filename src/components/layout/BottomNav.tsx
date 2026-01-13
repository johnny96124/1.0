import { motion } from 'framer-motion';
import { Home, Send, QrCode, History, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/home', icon: Home, label: '首页' },
  { path: '/send', icon: Send, label: '转账' },
  { path: '/receive', icon: QrCode, label: '收款' },
  { path: '/history', icon: History, label: '记录' },
  { path: '/profile', icon: User, label: '我的' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-accent/15 rounded-xl -m-2"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 relative z-10 transition-colors',
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
