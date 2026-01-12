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
      <div className="px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {currentWallet?.name || '我的钱包'}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                {currentWallet?.address || '未创建'}
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
            'card-elevated p-4 mb-6',
            securityScore < 60 ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {securityScore >= 80 ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
              <span className="font-medium text-foreground">安全等级</span>
            </div>
            <span className={cn(
              'text-2xl font-bold',
              securityScore >= 80 ? 'text-success' : 'text-warning'
            )}>
              {securityScore}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
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
          <div className="mt-3 text-sm text-muted-foreground">
            {!backupStatus.cloudBackup && <p>• 未完成云备份</p>}
            {securityScore === 100 && <p>✓ 已开启全部安全保护</p>}
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated overflow-hidden mb-6"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors',
                  index !== menuItems.length - 1 && 'border-b border-border'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
          className="w-full card-elevated p-4 flex items-center gap-4 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">退出登录</span>
        </motion.button>
      </div>
    </AppLayout>
  );
}
