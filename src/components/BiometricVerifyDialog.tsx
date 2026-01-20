import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Loader2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BiometricVerifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function BiometricVerifyDialog({
  isOpen,
  onClose,
  onSuccess,
  title = '安全验证',
  description = '请完成生物识别验证以继续操作',
}: BiometricVerifyDialogProps) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

  const handleVerify = async () => {
    setStatus('verifying');
    
    // Simulate biometric verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success (in real app, this would be actual biometric check)
    setStatus('success');
    
    // Short delay to show success state before closing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSuccess();
    setStatus('idle');
  };

  const handleClose = () => {
    if (status === 'verifying') return; // Don't allow closing during verification
    setStatus('idle');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-xl"
          >
            {/* Close button */}
            {status !== 'verifying' && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                animate={status === 'verifying' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center",
                  status === 'success' ? "bg-success/10" : "bg-accent/10"
                )}
              >
                {status === 'success' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </motion.div>
                ) : status === 'verifying' ? (
                  <Loader2 className="w-10 h-10 text-accent animate-spin" />
                ) : (
                  <Fingerprint className="w-10 h-10 text-accent" />
                )}
              </motion.div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {status === 'success' ? '验证成功' : title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {status === 'success' 
                  ? '正在处理您的请求...' 
                  : status === 'verifying'
                  ? '请在设备上完成验证'
                  : description
                }
              </p>
            </div>

            {/* Action Button */}
            {status === 'idle' && (
              <div className="space-y-2">
                <Button
                  onClick={handleVerify}
                  className="w-full h-11 gap-2 gradient-accent"
                >
                  <Fingerprint className="w-5 h-5" />
                  开始验证
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="w-full"
                >
                  取消
                </Button>
              </div>
            )}

            {status === 'verifying' && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>等待生物识别...</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
