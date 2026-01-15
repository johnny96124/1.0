import { motion } from 'framer-motion';
import { ChevronRight, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact, ChainId } from '@/types/wallet';
import { ChainIcon } from './ChainIcon';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ContactCardProps {
  contact: Contact;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
}

export function ContactCard({ 
  contact, 
  onClick, 
  className,
  showArrow = true 
}: ContactCardProps) {
  const formatAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const getAvatarText = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

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
      {/* Avatar */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm",
        getAvatarColor(contact.name)
      )}>
        {getAvatarText(contact.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {contact.name}
          </span>
          {contact.isWhitelisted && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[10px]">
              <Shield className="w-2.5 h-2.5" />
              白名单
            </span>
          )}
          {contact.isOfficial && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
              <Star className="w-2.5 h-2.5" />
              官方
            </span>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground mt-0.5">
          {formatAddress(contact.address)}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ChainIcon chainId={contact.network as ChainId} size="xs" />
            <span>{contact.network === 'ethereum' ? 'Ethereum' : contact.network === 'tron' ? 'Tron' : 'BNB Chain'}</span>
          </div>
          {contact.lastUsed && (
            <>
              <span>·</span>
              <span>
                最近使用: {formatDistanceToNow(contact.lastUsed, { addSuffix: true, locale: zhCN })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      {showArrow && (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      )}
    </motion.button>
  );
}
