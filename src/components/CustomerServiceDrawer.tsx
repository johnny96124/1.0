import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Headphones } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface CustomerServiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickQuestions = [
  { id: 'receive', text: '如何收款？' },
  { id: 'send', text: '如何转账？' },
  { id: 'security', text: '如何保护资产？' },
  { id: 'time', text: '转账需要多久？' },
];

const autoReplies: Record<string, string> = {
  receive: '您可以通过点击底部"收款"按钮，选择网络后向付款方展示二维码或复制地址即可收款。请确保付款方使用正确的网络转账。',
  send: '转账步骤：点击"转账"→ 输入收款地址 → 选择币种 → 输入金额 → 确认交易。建议首次向新地址转账时先进行小额测试。',
  security: '保护资产建议：设置强密码、启用生物识别、定期检查授权设备、开启大额交易提醒、使用白名单功能。如遇可疑情况请立即联系客服。',
  time: '转账时间取决于网络：Tron 约1-3分钟，Ethereum 约1-5分钟，BNB Chain 约15-30秒。网络拥堵时可能需要更长时间。',
  default: '感谢您的咨询！我们的客服人员将尽快为您处理。您也可以通过邮件 support@example.com 或电话 400-xxx-xxxx 联系我们。',
};

export function CustomerServiceDrawer({ open, onOpenChange }: CustomerServiceDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: '您好！欢迎使用 Cobo Wallet 在线客服。请问有什么可以帮助您的？',
      sender: 'support',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, sender: 'user' | 'support') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickQuestion = (questionId: string, questionText: string) => {
    addMessage(questionText, 'user');
    
    // Simulate response delay
    setTimeout(() => {
      const reply = autoReplies[questionId] || autoReplies.default;
      addMessage(reply, 'support');
    }, 500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    addMessage(inputValue, 'user');
    setInputValue('');
    
    // Simulate response delay
    setTimeout(() => {
      addMessage(autoReplies.default, 'support');
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh] max-h-[80vh]">
        <DrawerHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-accent" />
              </div>
              <div>
                <DrawerTitle className="text-left">在线客服</DrawerTitle>
                <p className="text-xs text-muted-foreground">工作时间 9:00-21:00</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'flex',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">快捷问题</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuickQuestion(q.id, q.text)}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="输入您的问题..."
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-12 w-12 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
