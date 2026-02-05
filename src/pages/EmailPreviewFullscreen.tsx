 import React, { useState } from 'react';
 import { Shield } from 'lucide-react';
 import coboLogo from '@/assets/cobo-logo.svg';
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
 
 const EmailPreviewFullscreen: React.FC = () => {
   const [type, setType] = useState<VerificationType>('login');
   const code = '835927';
   const expiresIn = 10;
   const typeConfig = VERIFICATION_TYPES[type];
 
   return (
     <div className="min-h-screen bg-white">
       {/* 控制面板 - 固定在顶部 */}
       <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
         <div className="max-w-[600px] mx-auto flex items-center justify-between">
           <h2 className="text-lg font-semibold text-gray-900">邮件模版预览 (全屏)</h2>
           <div className="flex items-center gap-3">
             <span className="text-sm text-gray-500">验证类型:</span>
             <Select value={type} onValueChange={(v) => setType(v as VerificationType)}>
               <SelectTrigger className="w-[180px] bg-white">
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
 
       {/* 邮件内容区域 - 模拟真实邮件客户端 */}
       <div
         style={{
           backgroundColor: '#F9FAFB',
           padding: '40px 20px',
           minHeight: 'calc(100vh - 73px)',
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
             }}
           />
         </div>
 
         {/* 主内容卡片 */}
         <div
           style={{
             backgroundColor: '#FFFFFF',
             borderRadius: '12px',
             padding: '32px',
             maxWidth: '480px',
             margin: '0 auto',
             boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
           }}
         >
           {/* 标题 */}
           <h1
             style={{
               fontSize: '20px',
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
               margin: '0 0 24px 0',
               textAlign: 'center',
             }}
           >
             {typeConfig.description}
           </p>
 
           {/* 验证码区域 */}
           <div
             style={{
               backgroundColor: '#F4F4F5',
               borderRadius: '8px',
               padding: '20px 32px',
               textAlign: 'center',
               marginBottom: '16px',
             }}
           >
             <div
               style={{
                 fontSize: '32px',
                 fontWeight: '700',
                 fontFamily: "'Courier New', monospace",
                 letterSpacing: '8px',
                 color: '#1C1C1E',
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
             验证码 {expiresIn} 分钟内有效
           </p>
 
           {/* 安全提示区域 */}
           <div
             style={{
               backgroundColor: '#FEF3C7',
               border: '1px solid rgba(245, 158, 11, 0.3)',
               borderRadius: '8px',
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
                   width: '24px',
                   height: '24px',
                   borderRadius: '50%',
                   backgroundColor: 'rgba(245, 158, 11, 0.2)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   flexShrink: 0,
                 }}
               >
                 <Shield
                   style={{
                     width: '14px',
                     height: '14px',
                     color: '#F59E0B',
                   }}
                 />
               </div>
               <div>
                 <p
                   style={{
                     fontSize: '13px',
                     fontWeight: '500',
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
                     lineHeight: '1.5',
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
     </div>
   );
 };
 
 export default EmailPreviewFullscreen;