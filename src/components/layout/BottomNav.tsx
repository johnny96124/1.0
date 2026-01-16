import { motion, useAnimation } from 'framer-motion';
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
      className="absolute bg-accent/20 rounded-full pointer-events-none"
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
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y, path }]);
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Clean up ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 500);
    
    navigate(path);
  }, [navigate]);

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const itemRipples = ripples.filter(r => r.path === item.path);

          return (
            <motion.button
              key={item.path}
              onClick={(e) => handleClick(e, item.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full overflow-hidden"
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {/* Ripple effects */}
              {itemRipples.map(ripple => (
                <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
              ))}
              
              <div className="relative flex items-center justify-center">
                {/* Active background circle */}
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute w-12 h-12 bg-accent/10 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Icon with bounce animation on active */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
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
              
              {/* Label with fade animation */}
              <motion.span
                className={cn(
                  'text-[10px] mt-1.5 font-medium transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}
                animate={{
                  fontWeight: isActive ? 600 : 500,
                  y: isActive ? 0 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {item.label}
              </motion.span>
              
              {/* Active indicator dot */}
              <motion.div
                className="absolute bottom-1 w-1 h-1 bg-accent rounded-full"
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
