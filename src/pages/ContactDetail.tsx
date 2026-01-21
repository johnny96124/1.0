import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Send, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Copy, 
  Check,
  Star
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/components/ui/sonner';
import { ChainId } from '@/types/wallet';
import { ChainIcon } from '@/components/ChainIcon';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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

export default function ContactDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { contacts, removeContact, updateContact, transactions } = useWallet();

  const contact = contacts.find(c => c.id === id);
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!contact) {
    return (
      <AppLayout title="联系人详情" showBack onBack={() => navigate('/profile/contacts')}>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">联系人不存在</p>
        </div>
      </AppLayout>
    );
  }

  // Get transactions with this contact
  const contactTransactions = transactions.filter(
    tx => tx.counterparty.toLowerCase() === contact.address.toLowerCase()
  ).slice(0, 5);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contact.address);
      setCopied(true);
      toast("已复制", { description: "地址已复制到剪贴板" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("复制失败");
    }
  };

  const handleToggleWhitelist = () => {
    updateContact(contact.id, { isWhitelisted: !contact.isWhitelisted });
    toast(contact.isWhitelisted ? "已从白名单移除" : "已添加到白名单", {
      description: contact.isWhitelisted 
        ? "该地址不再享受白名单特权" 
        : "向该地址转账将跳过部分验证",
    });
  };

  const handleDelete = () => {
    removeContact(contact.id);
    toast("联系人已删除", { description: `${contact.name} 已从地址簿移除` });
    navigate('/profile/contacts');
  };

  const handleTransfer = () => {
    // Navigate to send page with pre-filled address
    navigate('/send', { 
      state: { 
        prefilledAddress: contact.address,
        prefilledNetwork: contact.network 
      } 
    });
  };

  const getAvatarText = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getChainName = (network: string) => {
    switch (network) {
      case 'ethereum': return 'Ethereum';
      case 'tron': return 'Tron';
      case 'bsc': return 'BNB Chain';
      default: return network;
    }
  };

  return (
    <AppLayout
      title="联系人详情"
      showBack
      onBack={() => navigate('/profile/contacts')}
      rightAction={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/profile/contacts/edit/${contact.id}`)}
        >
          <Edit className="w-5 h-5" />
        </Button>
      }
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4",
                getAvatarColor(contact.name)
              )}
            >
              {getAvatarText(contact.name)}
            </motion.div>

            <h2 className="text-xl font-semibold flex items-center gap-2">
              {contact.name}
              {contact.isOfficial && (
                <Star className="w-5 h-5 text-primary fill-primary" />
              )}
            </h2>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-2">
              {contact.isWhitelisted && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs">
                  <Shield className="w-3 h-3" />
                  白名单
                </span>
              )}
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Address Card */}
          <div className="px-4 mb-4">
            <div className="p-4 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <ChainIcon chainId={contact.network as ChainId} size="sm" />
                <span className="text-sm font-medium">{getChainName(contact.network)}</span>
              </div>
              <button
                onClick={handleCopyAddress}
                className="w-full flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="flex-1 font-mono text-sm text-left break-all">
                  {contact.address}
                </span>
                {copied ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {contact.lastUsed && (
                <p className="text-xs text-muted-foreground mt-3">
                  最近使用: {formatDistanceToNow(contact.lastUsed, { addSuffix: true, locale: zhCN })}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="px-4 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">备注</h3>
              <div className="p-4 rounded-2xl bg-card border border-border/50">
                <p className="text-sm">{contact.notes}</p>
              </div>
            </div>
          )}

          {/* Transaction History */}
          {contactTransactions.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">交易记录</h3>
              <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                {contactTransactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between p-4",
                      index < contactTransactions.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === 'send' ? '转出' : '转入'} {tx.amount} {tx.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(tx.timestamp, { addSuffix: true, locale: zhCN })}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      tx.status === 'confirmed' && "bg-success/10 text-success",
                      tx.status === 'pending' && "bg-warning/10 text-warning",
                      tx.status === 'failed' && "bg-destructive/10 text-destructive"
                    )}>
                      {tx.status === 'confirmed' && '已确认'}
                      {tx.status === 'pending' && '处理中'}
                      {tx.status === 'failed' && '失败'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 space-y-3 pb-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleToggleWhitelist}
            >
              {contact.isWhitelisted ? (
                <>
                  <ShieldOff className="w-5 h-5 text-muted-foreground" />
                  从白名单移除
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-success" />
                  添加到白名单
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-5 h-5" />
              删除联系人
            </Button>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-4 border-t border-border/50">
          <Button
            onClick={handleTransfer}
            className="w-full h-12 gap-2"
          >
            <Send className="w-5 h-5" />
            转账给 TA
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除联系人 "{contact.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
