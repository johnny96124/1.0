// Notification / Message Center Types

export type NotificationType = 
  | 'transaction_in'      // 转入
  | 'transaction_out'     // 转出
  | 'large_amount'        // 大额交易
  | 'risk_inflow'         // 风险资金到账
  | 'new_device'          // 新设备登录
  | 'password_change'     // 密码变更
  | 'security_alert'      // 安全警告
  | 'psp_status'          // PSP 状态变化
  | 'psp_expiring'        // PSP 即将到期
  | 'psp_announcement'    // PSP 公告
  | 'system_update'       // 系统更新
  | 'maintenance'         // 维护公告
  | 'promotion';          // 活动推广

export type NotificationPriority = 'urgent' | 'normal' | 'low';

export type NotificationCategory = 'transaction' | 'security' | 'system' | 'psp';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  
  // 可选的操作跳转
  action?: {
    label: string;
    route: string;
  };
  
  // 关联数据
  metadata?: {
    txId?: string;
    amount?: number;
    symbol?: string;
    pspId?: string;
    deviceId?: string;
  };
}
