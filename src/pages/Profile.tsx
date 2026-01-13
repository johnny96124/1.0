import { motion } from 'framer-motion';
import { 
  User, Wallet, Shield, Smartphone, Users, 
  Bell, HelpCircle, LogOut, ChevronRight,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Wallet, label: '钱包管理', path: '/profile/wallets', badge: null },
  { icon: Shield, label: '安全与风控', path: '/profile/security', badge: null },
  { icon: Smartphone, label: '设备管理', path: '/profile/devices', badge: null },
  { icon: Users, label: '地址簿', path: '/profile/contacts', badge: null },
  { icon: Bell, label: '通知设置', path: '/profile/notifications', badge: null },
  { icon: HelpCircle, label: '帮助与支持', path: '/profile/help', badge: null },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentWallet, walletStatus, backupStatus, logout } = useWallet();

  const securityScore = walletStatus === 'fully_secure' ? 100 : 
                        walletStatus === 'backup_complete' ? 80 :
                        walletStatus === 'created_no_backup' ? 40 : 0;

  return (
    <AppLayout>
      <div className="px-4 py-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground">
                {currentWallet?.name || '我的钱包'}
              </h2>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {currentWallet?.addresses?.ethereum 
                  ? `${currentWallet.addresses.ethereum.slice(0, 8)}...${currentWallet.addresses.ethereum.slice(-6)}`
                  : '未创建'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'card-elevated p-3 mb-4',
            securityScore < 60 ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {securityScore >= 80 ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
              <span className="font-medium text-foreground text-sm">安全等级</span>
            </div>
            <span className={cn(
              'text-xl font-bold',
              securityScore >= 80 ? 'text-success' : 'text-warning'
            )}>
              {securityScore}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={cn(
                'h-full rounded-full',
                securityScore >= 80 ? 'bg-success' : 'bg-warning'
              )}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {!backupStatus.cloudBackup && <p>• 未完成云备份</p>}
            {securityScore === 100 && <p>✓ 已开启全部安全保护</p>}
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated overflow-hidden mb-4"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors',
                  index !== menuItems.length - 1 && 'border-b border-border'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground text-sm">
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full card-elevated p-3 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">退出登录</span>
        </motion.button>
      </div>
    </AppLayout>
  );
}
