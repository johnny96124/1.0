import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';

const sections = [
  {
    title: '一、服务条款',
    content: `欢迎使用 Cobo Wallet 服务。在使用本服务之前，请仔细阅读以下条款。使用本服务即表示您同意遵守这些条款。

本服务提供数字资产管理功能，包括但不限于数字货币的存储、转账和接收。我们致力于为用户提供安全、便捷的服务体验。`,
  },
  {
    title: '二、用户责任与义务',
    content: `用户在使用本服务时应当：

• 提供真实、准确的个人信息
• 妥善保管账户密码和私钥
• 遵守相关法律法规
• 不得利用本服务从事违法活动
• 对自己账户下的所有行为负责`,
  },
  {
    title: '三、账户安全',
    content: `用户应当采取合理措施保护账户安全：

• 设置高强度密码
• 启用双重身份验证
• 定期更新安全设置
• 不向他人透露账户信息
• 发现异常及时联系客服

我们采用业界领先的安全技术保护用户资产，但用户因自身原因导致的损失，我们不承担责任。`,
  },
  {
    title: '四、知识产权',
    content: `本服务中的所有内容，包括但不限于文字、图片、软件、商标等，均受相关知识产权法律保护。未经授权，用户不得复制、修改、传播或用于商业目的。`,
  },
  {
    title: '五、免责声明',
    content: `在法律允许的范围内，我们对以下情况不承担责任：

• 因不可抗力导致的服务中断
• 用户因操作不当造成的损失
• 第三方服务导致的问题
• 网络延迟或系统故障
• 用户违反本协议造成的后果`,
  },
  {
    title: '六、争议解决',
    content: `如发生争议，双方应首先通过友好协商解决。协商不成的，任何一方可向有管辖权的人民法院提起诉讼。`,
  },
  {
    title: '七、协议修改',
    content: `我们保留随时修改本协议的权利。修改后的协议将通过应用内通知或其他适当方式告知用户。如您不同意修改后的条款，请停止使用本服务。`,
  },
];

export default function TermsPage() {
  return (
    <AppLayout showNav={false} title="用户协议" showBack>
      <div className="px-4 py-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted-foreground mb-4">
            最后更新：2026年2月1日
          </p>
        </motion.div>

        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <h2 className="text-base font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sections.length * 0.05 }}
          className="pt-4 pb-8"
        >
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Cobo. All rights reserved.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
