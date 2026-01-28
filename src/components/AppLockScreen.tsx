import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAppLock } from '@/contexts/AppLockContext';
import { UnlockDrawer } from './UnlockDrawer';
import coboLogo from '@/assets/cobo-logo.svg';

export function AppLockScreen() {
  const { isLocked, unlock } = useAppLock();
  const [showUnlockDrawer, setShowUnlockDrawer] = useState(false);

  const handleIconClick = () => {
    setShowUnlockDrawer(true);
  };

  const handleUnlock = () => {
    unlock();
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-foreground/5 dark:to-muted/30 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-muted/30 dark:to-foreground/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1.1, 1, 1.1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Lock icon with pulse animation */}
            <div className="relative">
              {/* Outer pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 dark:from-white/25 dark:to-white/15"
                style={{ 
                  width: 140, 
                  height: 140, 
                  marginLeft: -22, 
                  marginTop: -22,
                }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ 
                  scale: [1, 1.4, 1.8],
                  opacity: [0.5, 0.25, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              {/* Inner pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 to-primary/15 dark:from-white/35 dark:to-white/20"
                style={{ 
                  width: 140, 
                  height: 140, 
                  marginLeft: -22, 
                  marginTop: -22,
                }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ 
                  scale: [1, 1.4, 1.8],
                  opacity: [0.5, 0.25, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.8
                }}
              />
              
              {/* Lock icon container */}
              <motion.button
                onClick={handleIconClick}
                className="w-24 h-24 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center shadow-xl cursor-pointer hover:bg-primary/20 dark:hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Lock className="w-12 h-12 text-primary dark:text-white" strokeWidth={1.5} />
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
