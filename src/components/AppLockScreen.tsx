import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAppLock } from '@/contexts/AppLockContext';
import { UnlockDrawer } from './UnlockDrawer';
import coboLogo from '@/assets/cobo-logo.svg';
import { useState } from 'react';

export function AppLockScreen() {
  const { isLocked, unlock } = useAppLock();
  const [showUnlockDrawer, setShowUnlockDrawer] = useState(false);

  const handleIconClick = () => {
    console.log('[AppLock] icon click -> open unlock drawer');
    setShowUnlockDrawer(true);
  };

  const handleUnlock = () => {
    console.log('[AppLock] onUnlock received -> calling unlock()');
    setShowUnlockDrawer(false);
    // Unlock immediately; the overlay will unmount and AnimatePresence will run exit animation.
    unlock();
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div 
          className="absolute inset-0 z-[100] overflow-hidden bg-gradient-to-b from-muted/80 via-background to-background"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0,
            borderRadius: '50%',
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.32, 0.72, 0, 1]
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
          
          {/* Content container */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Lock icon container */}
            <motion.button
              onClick={handleIconClick}
              className="relative flex items-center justify-center cursor-pointer focus:outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute w-28 h-28 rounded-full bg-primary/10"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Icon background */}
              <div className="relative w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
            </motion.button>

            {/* Brand name */}
            <h1 className="mt-8 text-2xl font-bold text-foreground">
              商户钱包
            </h1>

            {/* Hint text */}
            <p className="mt-3 text-sm text-muted-foreground">
              点击图标解锁
            </p>
          </div>

          {/* Footer with COBO logo */}
          <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground/60">Powered by</p>
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
              <img 
                src={coboLogo} 
                alt="COBO" 
                className="h-4"
              />
            </div>
          </div>

          {/* Unlock Drawer */}
          <UnlockDrawer
            open={showUnlockDrawer}
            onOpenChange={setShowUnlockDrawer}
            onUnlock={handleUnlock}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
