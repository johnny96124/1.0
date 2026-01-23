import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useWallet();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      
      // Wait for exit animation before navigating
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
      className="fixed inset-0 bg-gradient-to-b from-primary via-primary to-primary/90 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pulse ring animation */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white/20"
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ 
              scale: [1, 1.4, 1.8],
              opacity: [0.3, 0.15, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            style={{ 
              width: 80, 
              height: 80, 
              marginLeft: -4, 
              marginTop: -4 
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white/20"
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ 
              scale: [1, 1.4, 1.8],
              opacity: [0.3, 0.15, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.7
            }}
            style={{ 
              width: 80, 
              height: 80, 
              marginLeft: -4, 
              marginTop: -4 
            }}
          />
          
          {/* Logo container */}
          <motion.div
            className="w-[72px] h-[72px] bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Shield className="w-9 h-9 text-white" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Brand name */}
        <motion.h1
          className="mt-6 text-2xl font-semibold text-white tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          商户钱包
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mt-2 text-sm text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        >
          安全 · 便捷 · 专业
        </motion.p>
      </div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
      >
        <p className="text-xs text-white/50">Powered by</p>
        <p className="text-sm font-medium text-white/70 tracking-wider">COBO</p>
      </motion.div>
    </motion.div>
  );
};

export default Splash;
