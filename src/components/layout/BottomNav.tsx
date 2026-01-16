import { motion } from 'framer-motion';
import { Home, History, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    path: '/home', 
    icon: Home,
    label: '首页' 
  },
  { 
    path: '/history', 
    icon: History,
    label: '记录' 
  },
  { 
    path: '/profile', 
    icon: User,
    label: '我的' 
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute w-12 h-12 bg-accent/10 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 relative z-10 transition-all duration-200',
                      isActive 
                        ? 'text-accent stroke-[2.5px]' 
                        : 'text-muted-foreground stroke-[1.5px]'
                    )}
                    fill={isActive ? 'currentColor' : 'none'}
                    fillOpacity={isActive ? 0.15 : 0}
                  />
                </motion.div>
              </div>
              <motion.span
                className={cn(
                  'text-[10px] mt-1.5 font-medium transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}
                animate={{
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
