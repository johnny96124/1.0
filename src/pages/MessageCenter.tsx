import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownLeft, ArrowUpRight, Shield, ShieldAlert, AlertTriangle,
  Smartphone, Bell, Megaphone, Info, Building2, Gift, Wrench,
  CheckCheck, ChevronRight, Inbox
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Notification, NotificationCategory, NotificationType } from '@/types/wallet';
import { MessageListSkeleton } from '@/components/skeletons/MessageListSkeleton';
import { EmptyState } from '@/components/EmptyState';

type FilterTab = 'all' | NotificationCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'transaction', label: '交易' },
  { key: 'security', label: '安全' },
  { key: 'system', label: '系统' },
];

// Icon mapping based on notification type
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'transaction_in':
      return { icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10' };
    case 'transaction_out':
      return { icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'large_amount':
      return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' };
    case 'risk_inflow':
      return { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10' };
    case 'new_device':
      return { icon: Smartphone, color: 'text-destructive', bg: 'bg-destructive/10' };
    case 'password_change':
    case 'security_alert':
      return { icon: Shield, color: 'text-warning', bg: 'bg-warning/10' };
    case 'psp_status':
    case 'psp_expiring':
    case 'psp_announcement':
      return { icon: Building2, color: 'text-primary', bg: 'bg-primary/10' };
    case 'system_update':
      return { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' };
    case 'maintenance':
      return { icon: Wrench, color: 'text-muted-foreground', bg: 'bg-muted' };
    case 'promotion':
      return { icon: Gift, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    default:
      return { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

// Format timestamp
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// Group notifications by date
function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: { label: string; items: Notification[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '更早', items: [] },
  ];

  notifications.forEach(n => {
    const nDate = new Date(n.timestamp.getFullYear(), n.timestamp.getMonth(), n.timestamp.getDate());
    if (nDate.getTime() === today.getTime()) {
      groups[0].items.push(n);
    } else if (nDate.getTime() === yesterday.getTime()) {
      groups[1].items.push(n);
    } else {
      groups[2].items.push(n);
    }
  });

  return groups.filter(g => g.items.length > 0);
}

export default function MessageCenter() {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, unreadNotificationCount } = useWallet();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.category === activeTab);
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    return groupByDate(filteredNotifications);
  }, [filteredNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    if (notification.action?.route) {
      navigate(notification.action.route);
    }
  };

  return (
    <AppLayout 
      showNav={false} 
      title="消息中心"
      showBack
      rightAction={
        unreadNotificationCount > 0 ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary h-8 px-2"
            onClick={markAllNotificationsAsRead}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            全部已读
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col h-full">
        {/* Filter Tabs */}
        <div className="px-4 py-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
            <TabsList className="w-full grid grid-cols-4 h-9">
              {FILTER_TABS.map(tab => {
                const count = tab.key === 'all' 
                  ? unreadNotificationCount 
                  : notifications.filter(n => n.category === tab.key && !n.isRead).length;
                
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="text-xs relative">
                    {tab.label}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <MessageListSkeleton count={5} />
          ) : groupedNotifications.length === 0 ? (
            <div className="pt-12">
              <EmptyState
                icon={Inbox}
                title="暂无消息"
                description="所有通知消息都会显示在这里"
              />
            </div>
          ) : (
            <div className="px-4 py-2">
              <AnimatePresence>
                {groupedNotifications.map(group => (
                  <div key={group.label} className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2 px-1">{group.label}</p>
                    <div className="space-y-2">
                      {group.items.map((notification, index) => {
                        const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                        const isUrgent = notification.priority === 'urgent';
                        
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`
                              relative p-3 rounded-xl bg-card border border-border/50
                              ${isUrgent ? 'border-l-2 border-l-destructive' : ''}
                              ${notification.isRead ? 'opacity-70' : ''}
                              active:scale-[0.98] transition-transform
                            `}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex gap-3">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatTime(notification.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notification.content}
                                </p>
                                {notification.action && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                    <span>{notification.action.label}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
