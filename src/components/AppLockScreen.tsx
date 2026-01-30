import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAppLock } from '@/contexts/AppLockContext';
import { UnlockDrawer } from './UnlockDrawer';
import coboLogo from '@/assets/cobo-logo.svg';

export function AppLockScreen() {
  const { isLocked, unlock } = useAppLock();
  const [showUnlockDrawer, setShowUnlockDrawer] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleIconClick = () => {
    setShowUnlockDrawer(true);
  };

  const handleUnlock = () => {
    // Start the split animation
    setIsUnlocking(true);
    setShowUnlockDrawer(false);
    
    // Wait for animation to complete before actually unlocking
    setTimeout(() => {
      unlock();
      setIsUnlocking(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <div className="absolute inset-0 z-[100] overflow-hidden">
          {/* Left panel - slides to left */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isUnlocking ? '-100%' : 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              duration: 0.5, 
              ease: [0.32, 0.72, 0, 1]
            }}
            className="absolute inset-y-0 left-0 w-1/2 bg-background/80 backdrop-blur-xl overflow-hidden"
          >
            {/* Left decorative gradient */}
            <motion.div 
              className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-foreground/5 dark:to-muted/30 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Right panel - slides to right */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isUnlocking ? '100%' : 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              duration: 0.5, 
              ease: [0.32, 0.72, 0, 1]
            }}
            className="absolute inset-y-0 right-0 w-1/2 bg-background/80 backdrop-blur-xl overflow-hidden"
          >
            {/* Right decorative gradient */}
            <motion.div 
              className="absolute bottom-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-muted/30 dark:to-foreground/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1.1, 1, 1.1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Center content - fades and scales down */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: isUnlocking ? 0 : 1, 
              scale: isUnlocking ? 0.8 : 1 
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center pointer-events-auto">
              {/* Lock icon with pulse animation */}
              <div className="relative flex items-center justify-center">
                {/* Third pulse ring (outermost) */}
                <motion.div
                  className="absolute rounded-full bg-primary/5 dark:bg-white/5"
                  style={{ width: 200, height: 200 }}
                  animate={{ 
                    scale: [0.5, 1],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 1.2
                  }}
                />
                {/* Second pulse ring */}
                <motion.div
                  className="absolute rounded-full bg-primary/10 dark:bg-white/10"
                  style={{ width: 160, height: 160 }}
                  animate={{ 
                    scale: [0.5, 1],
                    opacity: [0.7, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.6
                  }}
                />
                {/* First pulse ring (closest) */}
                <motion.div
                  className="absolute rounded-full bg-primary/15 dark:bg-white/15"
                  style={{ width: 120, height: 120 }}
                  animate={{ 
                    scale: [0.8, 1],
                    opacity: [0.8, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />
                
                {/* Lock icon container */}
                <motion.button
                  onClick={handleIconClick}
                  className="relative w-24 h-24 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/15 dark:hover:bg-white/15 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Lock className="w-10 h-10 text-primary dark:text-white" strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Brand name */}
              <motion.h1
                className="mt-8 text-2xl font-bold text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                商户钱包
              </motion.h1>

              {/* Hint text */}
              <motion.p
                className="mt-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                点击图标解锁
              </motion.p>
            </div>

            {/* Footer with COBO logo */}
            <motion.div
              className="absolute bottom-12 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xs text-muted-foreground/60">Powered by</p>
              <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
                <img 
                  src={coboLogo} 
                  alt="COBO" 
                  className="h-4"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Unlock Drawer */}
          <UnlockDrawer
            open={showUnlockDrawer}
            onOpenChange={setShowUnlockDrawer}
            onUnlock={handleUnlock}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
