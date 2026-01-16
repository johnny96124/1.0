import { motion } from 'framer-motion';
import { Home, History, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

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

// Ripple effect component
function Ripple({ x, y }: { x: number; y: number }) {
  return (
    <motion.span
      className="absolute bg-white/30 rounded-full pointer-events-none"
      style={{ left: x, top: y, x: '-50%', y: '-50%' }}
      initial={{ width: 0, height: 0, opacity: 0.5 }}
      animate={{ width: 80, height: 80, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  );
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; path: string }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, path: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y, path }]);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 500);
    
    navigate(path);
  }, [navigate]);

  return (
    <nav className="absolute bottom-2 left-3 right-3 z-40">
      {/* Liquid Glass Container */}
      <div className="relative rounded-[22px] overflow-hidden">
        {/* Glass background layers */}
        <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl" />
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 dark:to-transparent" />
        
        {/* Top highlight - liquid glass edge */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30" />
        
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
        
        {/* Outer glow */}
        <div className="absolute -inset-[1px] rounded-[23px] bg-gradient-to-b from-white/50 to-white/20 dark:from-white/20 dark:to-white/5 -z-10 blur-[0.5px]" />
        
                <div className="relative flex items-center justify-around h-14 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const itemRipples = ripples.filter(r => r.path === item.path);

            return (
              <motion.button
                key={item.path}
                onClick={(e) => handleClick(e, item.path)}
                className="relative flex items-center justify-center w-14 h-14 overflow-hidden rounded-2xl"
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {/* Ripple effects */}
                {itemRipples.map(ripple => (
                  <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}
                
                <div className="relative flex items-center justify-center">
                  {/* Active glass pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute w-12 h-12 rounded-full overflow-hidden"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {/* Active pill glass effect */}
                      <div className="absolute inset-0 bg-accent/15 dark:bg-accent/25" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/10" />
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]" />
                    </motion.div>
                  )}
                  
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      className={cn(
                        'w-[22px] h-[22px] relative z-10 transition-all duration-200',
                        isActive 
                          ? 'text-accent stroke-[2px]' 
                          : 'text-muted-foreground/80 stroke-[1.5px]'
                      )}
                      fill={isActive ? 'currentColor' : 'none'}
                      fillOpacity={isActive ? 0.2 : 0}
                    />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
