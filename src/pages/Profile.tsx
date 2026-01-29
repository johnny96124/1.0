import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Shield, Smartphone, Users, User, BookUser,
  Bell, HelpCircle, LogOut, ChevronRight, Building2, Moon, Sun, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useWallet } from '@/contexts/WalletContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelectDrawer } from '@/components/LanguageSelectDrawer';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Wallet, label: '钱包管理', path: '/profile/wallets', badge: null },
  { icon: Building2, label: '服务商管理', path: '/psp', badge: null },
  { icon: Shield, label: '安全与风控', path: '/profile/security', badge: null },
  { icon: Smartphone, label: '登录历史', path: '/profile/devices', badge: null },
  { icon: BookUser, label: '地址簿', path: '/profile/contacts', badge: null },
  { icon: Bell, label: '通知设置', path: '/profile/notifications', badge: null },
  { icon: HelpCircle, label: '帮助与支持', path: '/profile/help', badge: null },
];

// Stagger animation for list items
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    }
  },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userInfo, logout } = useWallet();
  const { theme, setTheme } = useTheme();
  const { language, getLabel } = useLanguage();
  const [languageDrawerOpen, setLanguageDrawerOpen] = useState(false);

  const isDark = theme === 'dark';

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
          <motion.button
            onClick={() => navigate('/profile/info')}
            className="w-full flex items-center gap-4"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Avatar className="w-16 h-16">
                <AvatarImage src={userInfo?.avatar} alt="User avatar" />
                <AvatarFallback className="bg-accent/20 text-accent text-xl font-semibold">
                  {displayName[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex-1 min-w-0 text-left">
              <h2 className="text-lg font-bold text-foreground">
                {displayName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {userInfo?.email || '未设置邮箱'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </motion.div>

        {/* Menu Items with staggered animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="card-elevated overflow-hidden mb-4"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                variants={itemVariants}
                onClick={() => {
                  if (item.path === '/profile/wallets') {
                    navigate('/profile/wallets');
                  } else {
                    navigate(item.path);
                  }
                }}
                whileTap={{ scale: 0.98, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'w-full p-4 flex items-center gap-3 transition-colors active:bg-muted/50',
                  index !== menuItems.length - 1 && 'border-b border-border'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <span className="flex-1 text-left font-medium text-foreground text-sm">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-elevated overflow-hidden mb-4"
        >
          {/* Theme Toggle */}
          <div className="p-4 flex items-center gap-3 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {isDark ? (
                <Moon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              )}
            </div>
            <span className="flex-1 font-medium text-foreground text-sm">
              {language === 'zh-CN' ? '深色模式' : 'Dark Mode'}
            </span>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          {/* Language Selection */}
          <motion.button
            onClick={() => setLanguageDrawerOpen(true)}
            whileTap={{ scale: 0.98, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-full p-4 flex items-center gap-3 transition-colors active:bg-muted/50"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <span className="flex-1 text-left font-medium text-foreground text-sm">
              {language === 'zh-CN' ? '语言' : 'Language'}
            </span>
            <span className="text-sm text-muted-foreground mr-1">
              {getLabel(language)}
            </span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </motion.div>

        <LanguageSelectDrawer 
          open={languageDrawerOpen} 
          onOpenChange={setLanguageDrawerOpen} 
        />

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            logout();
            navigate('/');
          }}
          whileTap={{ scale: 0.98 }}
          className="w-full card-elevated p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors"
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
