import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, WifiOff, ChevronRight } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

export function SecurityBanner() {
  const { walletStatus, backupStatus } = useWallet();

  const getBannerConfig = () => {
    switch (walletStatus) {
      case 'created_no_backup':
        return {
          type: 'error' as const,
          icon: ShieldAlert,
          title: '请完成资产保险箱备份',
          description: '备份未完成将限制转账功能',
          action: '立即备份',
          actionPath: '/backup',
          show: true,
        };
      case 'device_risk':
        return {
          type: 'error' as const,
          icon: AlertTriangle,
          title: '检测到设备安全风险',
          description: '当前设备可能已被破解，部分功能受限',
          show: true,
        };
      case 'service_unavailable':
        return {
          type: 'warning' as const,
          icon: WifiOff,
          title: '服务暂时不可用',
          description: '可使用自助模式转移资产',
          action: '了解更多',
          show: true,
        };
      default:
        return { show: false };
    }
  };

  const config = getBannerConfig();

  if (!config.show) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          'px-4 py-3',
          config.type === 'error' && 'bg-destructive/10 border-b border-destructive/20',
          config.type === 'warning' && 'bg-warning/10 border-b border-warning/20'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-1.5 rounded-full',
            config.type === 'error' && 'bg-destructive/20',
            config.type === 'warning' && 'bg-warning/20'
          )}>
            <Icon className={cn(
              'w-4 h-4',
              config.type === 'error' && 'text-destructive',
              config.type === 'warning' && 'text-warning'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium',
              config.type === 'error' && 'text-destructive',
              config.type === 'warning' && 'text-warning'
            )}>
              {config.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
          {config.action && (
            <button className={cn(
              'flex items-center gap-1 text-sm font-medium shrink-0',
              config.type === 'error' && 'text-destructive',
              config.type === 'warning' && 'text-warning'
            )}>
              {config.action}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
