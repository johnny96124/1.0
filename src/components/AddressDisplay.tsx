import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AddressDisplayProps {
  address: string;
  label?: string;
  className?: string;
  showFull?: boolean;
}

export function AddressDisplay({ 
  address, 
  label,
  className,
  showFull = false 
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatAddress = (addr: string) => {
    if (showFull || addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "已复制",
        description: "地址已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制地址",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors group",
        className
      )}
    >
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
      <span className="font-mono text-xs text-foreground/80">
        {formatAddress(address)}
      </span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="w-3.5 h-3.5 text-success" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
