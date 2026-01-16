import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Monitor, Tablet, MapPin, Clock, 
  Trash2, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Device } from '@/types/wallet';

interface LoginRecord {
  id: string;
  deviceName: string;
  deviceModel: string;
  timestamp: Date;
  location: string;
  ipAddress: string;
  browser?: string;
  os?: string;
}

// Mock login history data with more details
const mockLoginHistory: LoginRecord[] = [
  { 
    id: '1', 
    deviceName: 'iPhone 15 Pro', 
    deviceModel: 'iPhone',
    timestamp: new Date(), 
    location: '上海, 中国',
    ipAddress: '116.228.xxx.xxx',
    os: 'iOS 17.2',
    browser: 'Safari'
  },
  { 
    id: '2', 
    deviceName: 'MacBook Pro', 
    deviceModel: 'MacBook',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
    location: '北京, 中国',
    ipAddress: '223.104.xxx.xxx',
    os: 'macOS Sonoma',
    browser: 'Chrome 120'
  },
  { 
    id: '3', 
    deviceName: 'iPhone 15 Pro', 
    deviceModel: 'iPhone',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), 
    location: '上海, 中国',
    ipAddress: '116.228.xxx.xxx',
    os: 'iOS 17.2',
    browser: 'Safari'
  },
  { 
    id: '4', 
    deviceName: 'Windows PC', 
    deviceModel: 'Windows',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), 
    location: '杭州, 中国',
    ipAddress: '115.236.xxx.xxx',
    os: 'Windows 11',
    browser: 'Edge 120'
  },
  { 
    id: '5', 
    deviceName: 'iPad Pro', 
    deviceModel: 'iPad',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), 
    location: '上海, 中国',
    ipAddress: '116.228.xxx.xxx',
    os: 'iPadOS 17.2',
    browser: 'Safari'
  },
  { 
    id: '6', 
    deviceName: 'iPhone 15 Pro', 
    deviceModel: 'iPhone',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), 
    location: '深圳, 中国',
    ipAddress: '120.229.xxx.xxx',
    os: 'iOS 17.2',
    browser: 'Safari'
  },
];

export default function DeviceManagementPage() {
  const { devices, removeDevice } = useWallet();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  
  const currentDevice = devices.find(d => d.isCurrent);
  const allDevices = devices.filter(d => d.status === 'active');
  
  const getDeviceIcon = (model: string) => {
    if (model.toLowerCase().includes('iphone') || model.toLowerCase().includes('android')) {
      return Smartphone;
    }
    if (model.toLowerCase().includes('ipad') || model.toLowerCase().includes('tablet')) {
      return Tablet;
    }
    return Monitor;
  };
  
  const handleRemoveDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowRemoveDialog(true);
  };
  
  const confirmRemove = () => {
    if (selectedDevice) {
      removeDevice(selectedDevice.id);
    }
    setShowRemoveDialog(false);
    setSelectedDevice(null);
  };
  
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '刚刚活跃';
    if (diffMins < 60) return `${diffMins}分钟前活跃`;
    
    return formatDistanceToNow(date, { locale: zhCN, addSuffix: true }) + '活跃';
  };

  const formatRecordTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    if (isToday) {
      return `今天 ${format(date, 'HH:mm')}`;
    }
    if (isYesterday) {
      return `昨天 ${format(date, 'HH:mm')}`;
    }
    return format(date, 'MM/dd HH:mm', { locale: zhCN });
  };

  return (
    <AppLayout title="设备管理" showBack>
      <div className="px-4 py-4 space-y-4">
        {/* All Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">已登录设备</h3>
          <div className="card-elevated overflow-hidden">
            {allDevices.map((device, index) => {
              const Icon = getDeviceIcon(device.model);
              const isCurrentDevice = device.isCurrent;
              
              return (
                <div 
                  key={device.id}
                  className={cn(
                    'p-4 flex items-start gap-3',
                    index !== allDevices.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isCurrentDevice ? "bg-accent/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isCurrentDevice ? "text-accent" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{device.name}</h4>
                      {isCurrentDevice && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded">
                          当前设备
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{device.location || '未知位置'}</span>
                      <span>·</span>
                      <span>{isCurrentDevice ? '刚刚活跃' : formatLastActive(device.lastActive)}</span>
                    </div>
                  </div>
                  {!isCurrentDevice && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveDevice(device)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>


        {/* Login History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-medium text-muted-foreground">登录历史</h3>
            <button 
              className="text-xs text-accent"
              onClick={() => setShowHistoryDrawer(true)}
            >
              查看全部
            </button>
          </div>
          <div className="card-elevated overflow-hidden">
            {mockLoginHistory.slice(0, 3).map((record, index) => (
              <div 
                key={record.id}
                className={cn(
                  'p-3 flex items-center gap-3',
                  index !== 2 && 'border-b border-border'
                )}
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{record.deviceName}</p>
                  <p className="text-xs text-muted-foreground">{record.location}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(record.timestamp, 'HH:mm', { locale: zhCN })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Remove Device Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除设备</AlertDialogTitle>
            <AlertDialogDescription>
              移除后，该设备将无法访问您的钱包。设备需要重新验证才能恢复使用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedDevice && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{selectedDevice.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                最后活跃: {formatLastActive(selectedDevice.lastActive)}
              </div>
              <div className="text-xs text-muted-foreground">
                位置: {selectedDevice.location || '未知'}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Login History Drawer */}
      <Drawer open={showHistoryDrawer} onOpenChange={setShowHistoryDrawer}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <DrawerTitle>登录历史</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowHistoryDrawer(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 py-2 max-h-[70vh]">
            {mockLoginHistory.map((record, index) => {
              const Icon = getDeviceIcon(record.deviceModel);
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'py-4',
                    index !== mockLoginHistory.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground text-sm">{record.deviceName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatRecordTime(record.timestamp)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{record.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-3 h-3 text-center">🌐</span>
                          <span>IP: {record.ipAddress}</span>
                        </div>
                        {record.os && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-3 h-3 text-center">💻</span>
                            <span>{record.os}</span>
                            {record.browser && <span>· {record.browser}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}
