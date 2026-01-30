import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact } from '@/types/wallet';

interface ContactCardProps {
  contact: Contact;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
}

const getChainLabel = (network: string) => {
  switch (network) {
    case 'ethereum': return 'EVM';
    case 'tron': return 'TRX';
    case 'bsc': return 'BSC';
    default: return network.toUpperCase();
  }
};

export function ContactCard({ 
  contact, 
  onClick, 
  className,
  showArrow = true 
}: ContactCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl bg-card border border-border/50",
        "flex items-center gap-3 text-left",
        "hover:bg-muted/50 transition-colors",
        className
      )}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {contact.name || '未命名地址'}
          </span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded flex-shrink-0">
            {getChainLabel(contact.network)}
          </span>
        </div>
        <p className="font-mono text-sm text-muted-foreground break-all mt-1">
          {contact.address}
        </p>
      </div>

      {/* Arrow */}
      {showArrow && (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
    </motion.button>
  );
}
