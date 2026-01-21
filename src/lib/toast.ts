import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
}

/**
 * Unified Toast API
 * 
 * This wraps the sonner toast library to provide a consistent
 * interface across the entire application.
 * 
 * Usage:
 *   import { toast } from '@/lib/toast';
 *   toast.show({ title: '成功', description: '操作已完成' });
 *   toast.success('保存成功');
 *   toast.error('操作失败', '请重试');
 */
export const toast = {
  /**
   * Show a default toast notification
   */
  show: (options: ToastOptions) => {
    sonnerToast(options.title, { description: options.description });
  },

  /**
   * Show a success toast notification
   */
  success: (title: string, description?: string) => {
    sonnerToast.success(title, { description });
  },

  /**
   * Show an error toast notification
   */
  error: (title: string, description?: string) => {
    sonnerToast.error(title, { description });
  },

  /**
   * Show a warning toast notification
   */
  warning: (title: string, description?: string) => {
    sonnerToast.warning(title, { description });
  },

  /**
   * Show an info toast notification
   */
  info: (title: string, description?: string) => {
    sonnerToast.info(title, { description });
  },

  /**
   * Compatibility method for legacy code using variant: 'destructive'
   */
  destructive: (title: string, description?: string) => {
    sonnerToast.error(title, { description });
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
