import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';

const sections = [
  {
    title: '一、信息收集范围',
    content: `我们可能收集以下类型的信息：

• 账户信息：手机号码、邮箱地址
• 身份信息：姓名、身份证号（如适用）
• 设备信息：设备型号、操作系统版本
• 使用数据：功能使用频率、操作记录
• 位置信息：仅在您授权时收集`,
  },
  {
    title: '二、信息使用目的',
    content: `我们使用收集的信息用于：

• 提供和改进服务
• 验证用户身份
• 保障账户安全
• 发送服务通知
• 进行数据分析以优化产品
• 遵守法律法规要求`,
  },
  {
    title: '三、信息存储与保护',
    content: `我们采取多种安全措施保护您的信息：

• 数据加密传输和存储
• 访问权限严格控制
• 定期安全审计
• 数据备份机制
• 异常监控和预警

您的数据存储在安全的服务器中，保存期限符合法律要求。`,
  },
  {
    title: '四、信息共享规则',
    content: `除以下情况外，我们不会向第三方共享您的信息：

• 获得您的明确同意
• 法律法规要求
• 政府机关依法要求
• 为保护用户或公众安全
• 与关联公司共享（受同等保护）`,
  },
  {
    title: '五、用户权利',
    content: `您对个人信息享有以下权利：

• 访问权：查看您的个人信息
• 更正权：修改不准确的信息
• 删除权：申请删除个人信息
• 撤回权：撤回已授予的权限
• 注销权：注销账户

如需行使上述权利，请通过应用内客服联系我们。`,
  },
  {
    title: '六、Cookie 使用说明',
    content: `我们使用 Cookie 和类似技术来：

• 记住您的登录状态
• 分析服务使用情况
• 个性化您的体验

您可以通过浏览器设置管理 Cookie，但这可能影响部分功能的使用。`,
  },
  {
    title: '七、未成年人保护',
    content: `我们非常重视未成年人隐私保护。如果您是未满 18 周岁的未成年人，请在监护人的陪同下阅读本政策，并在获得监护人同意后使用本服务。`,
  },
  {
    title: '八、政策更新通知',
    content: `我们可能不时更新本隐私政策。重大变更时，我们将通过应用内通知、弹窗或其他方式告知您。建议您定期查阅本政策以了解最新信息。`,
  },
];

export default function PrivacyPage() {
  return (
    <AppLayout showNav={false} title="隐私政策" showBack>
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
