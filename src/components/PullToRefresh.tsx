import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useMotionValue(0);
  
  const pullProgress = useTransform(currentY, [0, PULL_THRESHOLD], [0, 1]);
  const rotation = useTransform(currentY, [0, PULL_THRESHOLD], [0, 180]);
  const opacity = useTransform(currentY, [0, 30, PULL_THRESHOLD], [0, 0.5, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance
      const resistance = 0.5;
      const pullDistance = Math.min(deltaY * resistance, MAX_PULL);
      currentY.set(pullDistance);
    }
  }, [isPulling, isRefreshing, currentY]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    const pullDistance = currentY.get();
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      currentY.set(60); // Keep indicator visible
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        currentY.set(0);
      }
    } else {
      currentY.set(0);
    }
  }, [isPulling, currentY, isRefreshing, onRefresh]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto h-full ${className || ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute left-0 right-0 flex justify-center z-20 pointer-events-none"
            style={{ 
              top: -40,
              y: currentY 
            }}
          >
            <motion.div
              className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center"
              style={{ opacity }}
            >
              <motion.div
                style={{ rotate: isRefreshing ? undefined : rotation }}
                animate={isRefreshing ? { rotate: 360 } : undefined}
                transition={isRefreshing ? { 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: 'linear' 
                } : undefined}
              >
                <RefreshCw className="w-5 h-5 text-accent" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with transform */}
      <motion.div
        style={{ y: isPulling || isRefreshing ? currentY : 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
