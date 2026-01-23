import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";

const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useWallet();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      
      setTimeout(() => {
        if (isAuthenticated) {
          navigate('/home', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 300);
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-white via-blue-50/50 to-primary/10 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-primary/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-primary/5 to-transparent rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo container with multiple pulse rings */}
        <div className="relative">
          {/* Outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{ 
              width: 120, 
              height: 120, 
              marginLeft: -18, 
              marginTop: -18,
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(210 100% 60% / 0.2))'
            }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.4, 0.2, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          {/* Inner pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{ 
              width: 120, 
              height: 120, 
              marginLeft: -18, 
              marginTop: -18,
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(210 100% 60% / 0.3))'
            }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.4, 0.2, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.8
            }}
          />
          
          {/* Logo container */}
          <motion.div
            className="w-[84px] h-[84px] rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 50%))',
              boxShadow: '0 20px 40px -10px hsl(var(--primary) / 0.4), 0 10px 20px -5px hsl(210 100% 50% / 0.3)'
            }}
            initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Inner glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
            
            {/* Logo - Stylized Wallet/Shield Icon */}
            <svg
              viewBox="0 0 48 48"
              className="w-11 h-11 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Shield outline */}
              <motion.path
                d="M24 4L6 12v12c0 11 8 17 18 20 10-3 18-9 18-20V12L24 4z"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                fill="rgba(255,255,255,0.15)"
              />
              {/* Inner hexagon pattern */}
              <motion.path
                d="M24 14l8 5v10l-8 5-8-5V19l8-5z"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                fill="rgba(255,255,255,0.25)"
              />
              {/* Center dot */}
              <motion.circle
                cx="24"
                cy="24"
                r="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 1.1 }}
                fill="white"
              />
            </svg>
          </motion.div>
        </div>

        {/* Brand name */}
        <motion.h1
          className="mt-8 text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent tracking-wide"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          商户钱包
        </motion.h1>

        {/* Tagline with animated underline */}
        <motion.div
          className="mt-3 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
        >
          <span className="text-sm text-muted-foreground font-medium">安全</span>
          <span className="w-1 h-1 rounded-full bg-primary/50" />
          <span className="text-sm text-muted-foreground font-medium">便捷</span>
          <span className="w-1 h-1 rounded-full bg-primary/50" />
          <span className="text-sm text-muted-foreground font-medium">专业</span>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
      >
        <p className="text-xs text-muted-foreground/60">Powered by</p>
        <p className="text-sm font-semibold text-primary/80 tracking-wider">COBO</p>
      </motion.div>
    </motion.div>
  );
};

export default Splash;
