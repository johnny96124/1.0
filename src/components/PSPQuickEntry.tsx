import { motion } from 'framer-motion';
import { Building2, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

interface PSPQuickEntryProps {
  className?: string;
}

export function PSPQuickEntry({ className }: PSPQuickEntryProps) {
  const navigate = useNavigate();
  const { pspConnections } = useWallet();

  const activeConnections = pspConnections?.filter(c => c.status === 'active') || [];
  const hasConnections = activeConnections.length > 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/psp')}
      className={cn(
        'w-full card-elevated p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left',
        className
      )}
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-accent" />
        </div>
        {hasConnections && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
            <span className="text-[10px] font-bold text-success-foreground">{activeConnections.length}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">我的服务商</p>
        <p className="text-xs text-muted-foreground truncate">
          {hasConnections 
            ? `${activeConnections.length} 个服务商已连接` 
            : '连接服务商，享受专属服务'
          }
        </p>
      </div>

      {/* Action */}
      {hasConnections ? (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      ) : (
        <div className="flex items-center gap-1 text-accent shrink-0">
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">添加</span>
        </div>
      )}
    </motion.button>
  );
}
