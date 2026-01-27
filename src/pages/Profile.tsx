import { motion } from 'framer-motion';
import { 
  Wallet, Shield, Smartphone, Users, User, BookUser,
  Bell, HelpCircle, LogOut, ChevronRight, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: User, label: '个人信息', path: '/profile/info', badge: null },
  { icon: Wallet, label: '钱包管理', path: '/profile/wallets', badge: null },
  { icon: Building2, label: '服务商管理', path: '/psp', badge: null },
  { icon: Shield, label: '安全与风控', path: '/profile/security', badge: null },
  { icon: Smartphone, label: '登录历史', path: '/profile/devices', badge: null },
  { icon: BookUser, label: '地址簿', path: '/profile/contacts', badge: null },
  { icon: Bell, label: '通知设置', path: '/profile/notifications', badge: null },
  { icon: HelpCircle, label: '帮助与支持', path: '/profile/help', badge: null },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userInfo, logout } = useWallet();

  // Get user display name from nickname or email
  const displayName = userInfo?.nickname || userInfo?.email?.split('@')[0] || '用户';

  return (
    <AppLayout title="账户设置">
      <div className="px-4 py-4">

        {/* Profile Header - User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 mb-4"
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userInfo?.avatar} alt="User avatar" />
              <AvatarFallback className="bg-accent/20 text-accent text-xl font-semibold">
                {displayName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">
                {displayName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {userInfo?.email || '未设置邮箱'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated overflow-hidden mb-4"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.path === '/profile/wallets') {
                      navigate('/profile/wallets');
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors',
                    index !== menuItems.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground text-sm">
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
          transition={{ delay: 0.2 }}
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full card-elevated p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm">退出登录</span>
        </motion.button>
      </div>
    </AppLayout>
  );
}
