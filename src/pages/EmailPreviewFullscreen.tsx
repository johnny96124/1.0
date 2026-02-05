import React, { useState } from 'react';
import { Shield, Mail, Sparkles, Monitor, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import coboLogo from '@/assets/cobo-logo.svg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VERIFICATION_TYPES = {
  login: {
    title: '登录验证',
    description: '您正在登录 Cobo 钱包',
  },
  bind_email: {
    title: '绑定邮箱',
    description: '您正在绑定邮箱到您的账户',
  },
  rebind_email: {
    title: '换绑邮箱',
    description: '您正在更换绑定的邮箱地址',
  },
  reset_password: {
    title: '重置密码',
    description: '您正在重置登录密码',
  },
  security_verify: {
    title: '安全验证',
    description: '您正在进行敏感操作的安全验证',
  },
} as const;

type VerificationType = keyof typeof VERIFICATION_TYPES;

const EmailPreviewFullscreen: React.FC = () => {
  const [type, setType] = useState<VerificationType>('login');
  const code = '835927';
  const expiresIn = 10;
  const typeConfig = VERIFICATION_TYPES[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-full blur-3xl" />
      </div>

      {/* 控制面板 */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                邮件模版预览
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                  <Monitor className="w-3 h-3" />
                  桌面端
                </span>
              </h2>
              <p className="text-sm text-gray-500">模拟用户在邮箱客户端看到的效果</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600">验证类型:</span>
            <Select value={type} onValueChange={(v) => setType(v as VerificationType)}>
              <SelectTrigger className="w-[140px] bg-white border-gray-200 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VERIFICATION_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 邮件内容区域 */}
      <div className="relative py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-[600px] mx-auto"
        >
          {/* 浏览器窗口装饰 */}
          <div className="bg-gray-100 rounded-t-2xl px-4 py-3 flex items-center gap-3 border border-gray-200 border-b-0">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 border border-gray-200 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                mail.example.com
              </div>
            </div>
          </div>

          {/* 邮件内容 */}
          <div
            className="rounded-b-2xl shadow-2xl shadow-gray-300/50 overflow-hidden border border-gray-200 border-t-0"
            style={{
              backgroundColor: '#F9FAFB',
              padding: '40px 20px',
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{ textAlign: 'center', marginBottom: '24px' }}
            >
              <img src={coboLogo} alt="Cobo" style={{ height: '32px', width: 'auto' }} />
            </motion.div>

            {/* 主内容卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1C1C1E', margin: '0 0 8px 0', textAlign: 'center' }}>
                {typeConfig.title}
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px 0', textAlign: 'center' }}>
                {typeConfig.description}
              </p>

              {/* 验证码 */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3, type: 'spring' }}
                style={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                  borderRadius: '12px',
                  padding: '24px 32px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    fontFamily: "'SF Mono', 'Courier New', monospace",
                    letterSpacing: '12px',
                    color: '#1F32D6',
                    textShadow: '0 1px 2px rgba(31, 50, 214, 0.1)',
                  }}
                >
                  {code}
                </div>
              </motion.div>

              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 24px 0', textAlign: 'center' }}>
                验证码 <span style={{ fontWeight: 600, color: '#374151' }}>{expiresIn} 分钟</span>内有效
              </p>

              {/* 安全提示 */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <Shield style={{ width: '14px', height: '14px', color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400E', margin: '0 0 4px 0' }}>
                      安全提示
                    </p>
                    <p style={{ fontSize: '12px', color: '#A16207', margin: '0', lineHeight: '1.6' }}>
                      请勿将验证码分享给任何人，包括 Cobo 工作人员。我们不会以任何方式索取您的验证码。
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 页脚 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{ textAlign: 'center', marginTop: '24px' }}
            >
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px 0' }}>
                此邮件由系统自动发送，请勿直接回复
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0' }}>
                © 2024 Cobo. 保留所有权利
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* 切换到移动端 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <a
            href="/email-preview"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 bg-white/60 hover:bg-white/80 rounded-full border border-gray-200/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
          >
            <Smartphone className="w-4 h-4" />
            切换到移动端预览
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailPreviewFullscreen;