 import React, { useState } from 'react';
 import { Shield, ChevronDown } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import coboLogo from '@/assets/cobo-logo.svg';
import { Monitor } from 'lucide-react';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 
 // 验证类型配置
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
 
 interface EmailTemplateProps {
   code?: string;
   type?: VerificationType;
   expiresIn?: number;
 }
 
 // 邮件模版主体组件
 export const EmailTemplate: React.FC<EmailTemplateProps> = ({
   code = '835927',
   type = 'login',
   expiresIn = 10,
 }) => {
   const typeConfig = VERIFICATION_TYPES[type];
 
   return (
     <div
       style={{
        background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
         padding: '40px 20px',
         fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
       }}
     >
       {/* Logo 区域 */}
       <div
         style={{
           textAlign: 'center',
           marginBottom: '24px',
         }}
       >
         <img
           src={coboLogo}
           alt="Cobo"
           style={{
             height: '32px',
             width: 'auto',
            display: 'inline-block',
           }}
         />
       </div>
 
       {/* 主内容卡片 */}
       <div
         style={{
           backgroundColor: '#FFFFFF',
          borderRadius: '16px',
           padding: '32px',
           maxWidth: '480px',
           margin: '0 auto',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
         }}
       >
         {/* 标题 */}
         <h1
           style={{
            fontSize: '22px',
             fontWeight: '600',
             color: '#1C1C1E',
             margin: '0 0 8px 0',
             textAlign: 'center',
           }}
         >
           {typeConfig.title}
         </h1>
 
         {/* 描述 */}
         <p
           style={{
             fontSize: '14px',
             color: '#6B7280',
            margin: '0 0 28px 0',
             textAlign: 'center',
           }}
         >
           {typeConfig.description}
         </p>
 
         {/* 验证码区域 */}
         <div
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
         </div>
 
         {/* 有效期提示 */}
         <p
           style={{
             fontSize: '13px',
             color: '#6B7280',
             margin: '0 0 24px 0',
             textAlign: 'center',
           }}
         >
          验证码 <span style={{ fontWeight: 600, color: '#374151' }}>{expiresIn} 分钟</span>内有效
         </p>
 
         {/* 安全提示区域 */}
         <div
           style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
             padding: '16px',
           }}
         >
           <div
             style={{
               display: 'flex',
               alignItems: 'flex-start',
               gap: '12px',
             }}
           >
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
               <Shield
                 style={{
                   width: '14px',
                   height: '14px',
                  color: '#FFFFFF',
                 }}
               />
             </div>
             <div>
               <p
                 style={{
                   fontSize: '13px',
                  fontWeight: '600',
                   color: '#92400E',
                   margin: '0 0 4px 0',
                 }}
               >
                 安全提示
               </p>
               <p
                 style={{
                   fontSize: '12px',
                   color: '#A16207',
                   margin: '0',
                  lineHeight: '1.6',
                 }}
               >
                 请勿将验证码分享给任何人，包括 Cobo 工作人员。我们不会以任何方式索取您的验证码。
               </p>
             </div>
           </div>
         </div>
       </div>
 
       {/* 页脚 */}
       <div
         style={{
           textAlign: 'center',
           marginTop: '24px',
         }}
       >
         <p
           style={{
             fontSize: '12px',
             color: '#9CA3AF',
             margin: '0 0 8px 0',
           }}
         >
           此邮件由系统自动发送，请勿直接回复
         </p>
         <p
           style={{
             fontSize: '12px',
             color: '#9CA3AF',
             margin: '0',
           }}
         >
           © 2024 Cobo. 保留所有权利
         </p>
       </div>
     </div>
   );
 };
 
 // 预览容器组件（带控制面板）
 export const EmailTemplatePreview: React.FC = () => {
   const [type, setType] = useState<VerificationType>('login');
   const [code] = useState('835927');
 
   return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
       {/* 控制面板 */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 p-4">
         <div className="max-w-[480px] mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            邮件模版预览
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
              移动端
            </span>
          </h2>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 rounded-xl border border-gray-200/50">
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
 
       {/* 邮件预览 */}
      <div className="py-4">
         <EmailTemplate code={code} type={type} expiresIn={10} />
       </div>

      {/* 切换到桌面端 */}
      <div className="pb-6 text-center">
        <a
          href="/email-preview-fullscreen"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 bg-white/60 hover:bg-white/80 rounded-full border border-gray-200/50 backdrop-blur-sm transition-all duration-200"
        >
          <Monitor className="w-4 h-4" />
          切换到桌面端预览
        </a>
      </div>
     </div>
   );
 };
 
 export default EmailTemplatePreview;