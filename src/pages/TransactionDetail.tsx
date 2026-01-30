import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, TrendingDown, 
  CheckCircle2, XCircle, Clock, Check,
  ExternalLink, Copy,
  Shield, ShieldAlert, AlertTriangle, RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { cn, formatAddressShort, formatTxHashShort } from '@/lib/utils';
import { Transaction, SUPPORTED_CHAINS, ChainId } from '@/types/wallet';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/PageTransition';
import { toast } from '@/lib/toast';
import { RbfActionSection } from '@/components/RbfActionSection';
import { SpeedUpDrawer } from '@/components/SpeedUpDrawer';
import { CancelTxDrawer } from '@/components/CancelTxDrawer';
import { SpeedUpTier } from '@/lib/rbf-utils';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, acknowledgeRiskTx, currentWallet } = useWallet();
  
  // Find transaction by id
  const transaction = transactions.find(tx => tx.id === id);
  
  // Copy states
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSender, setCopiedSender] = useState(false);
  const [copiedReceiver, setCopiedReceiver] = useState(false);
  
  // RBF drawer states
  const [speedUpDrawerOpen, setSpeedUpDrawerOpen] = useState(false);
  const [cancelDrawerOpen, setCancelDrawerOpen] = useState(false);

  // Check if transaction is a pending risk transaction
  const isRiskTx = (tx: Transaction) => {
    return tx.type === 'receive' && 
           (tx.riskScore === 'red' || tx.riskScore === 'yellow') && 
           tx.disposalStatus === 'pending';
  };

  const handleAcknowledge = (txId: string) => {
    acknowledgeRiskTx(txId);
    toast.success('已标记为已知晓', '该交易已从待处置列表中移除');
    navigate(-1);
  };

  const handleReturn = (txId: string) => {
    navigate(`/risk-management/return/${txId}`);
  };

  // RBF handlers
  const handleSpeedUpClick = () => {
    setSpeedUpDrawerOpen(true);
  };

  const handleCancelClick = () => {
    setCancelDrawerOpen(true);
  };

  const handleSpeedUpConfirm = (tier: SpeedUpTier, newFee: number, newGasAmount: number) => {
    setSpeedUpDrawerOpen(false);
    toast.success('加速请求已提交', '新交易正在广播中');
    navigate(-1);
  };

  const handleCancelConfirm = (cancelFee: number, cancelGasAmount: number) => {
    setCancelDrawerOpen(false);
    toast.success('取消请求已提交', '原交易将被替换');
    navigate(-1);
  };

  // Copy handlers
  const handleCopySender = useCallback(() => {
    if (!transaction) return;
    const addr = transaction.type === 'receive' 
      ? transaction.counterparty 
      : (currentWallet?.addresses?.[transaction.network as ChainId] || '');
    navigator.clipboard.writeText(addr);
    setCopiedSender(true);
    toast.success('已复制', formatAddressShort(addr));
    setTimeout(() => setCopiedSender(false), 2000);
  }, [transaction, currentWallet]);

  const handleCopyReceiver = useCallback(() => {
    if (!transaction) return;
    const addr = transaction.type === 'send' 
      ? transaction.counterparty 
      : (currentWallet?.addresses?.[transaction.network as ChainId] || '');
    navigator.clipboard.writeText(addr);
    setCopiedReceiver(true);
    toast.success('已复制', formatAddressShort(addr));
    setTimeout(() => setCopiedReceiver(false), 2000);
  }, [transaction, currentWallet]);

  const handleCopyHash = useCallback(() => {
    if (!transaction?.txHash) return;
    navigator.clipboard.writeText(transaction.txHash);
    setCopiedHash(true);
    toast.success('已复制', formatTxHashShort(transaction.txHash));
    setTimeout(() => setCopiedHash(false), 2000);
  }, [transaction]);

  // If transaction not found
  if (!transaction) {
    return (
      <PageTransition>
        <AppLayout showNav={false} showBack title="交易详情">
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground">交易不存在</p>
          </div>
        </AppLayout>
      </PageTransition>
    );
  }

  const senderAddress = transaction.type === 'receive' 
    ? transaction.counterparty 
    : (currentWallet?.addresses?.[transaction.network as ChainId] || '');
  
  const receiverAddress = transaction.type === 'send' 
    ? transaction.counterparty 
    : (currentWallet?.addresses?.[transaction.network as ChainId] || '');

  return (
    <PageTransition>
      <AppLayout showNav={false} showBack title="交易详情">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6">
            {/* Hero Section: Token Icon + Amount */}
            <div className="relative mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center shadow-lg">
                    <CryptoIcon symbol={transaction.symbol} size="xl" />
                  </div>
                  {/* Chain icon badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background bg-background">
                    <ChainIcon chainId={transaction.network} size="sm" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className={cn(
                  'text-3xl font-bold tracking-tight',
                  transaction.type === 'receive' ? 'text-success' : 'text-foreground'
                )}>
                  {transaction.type === 'receive' ? '+' : '-'}{transaction.amount} {transaction.symbol}
                </p>
                <p className="text-muted-foreground mt-1">
                  ≈ ${transaction.usdValue.toLocaleString()}
                </p>
              </div>

              {/* Status Tags */}
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                  transaction.status === 'confirmed' && "bg-success/10 text-success",
                  transaction.status === 'pending' && "bg-warning/10 text-warning",
                  transaction.status === 'failed' && "bg-destructive/10 text-destructive"
                )}>
                  {transaction.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {transaction.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                  {transaction.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                  {transaction.type === 'receive' ? '收款' : '转账'}
                  {transaction.status === 'confirmed' && '已完成'}
                  {transaction.status === 'pending' && '处理中'}
                  {transaction.status === 'failed' && '失败'}
                </span>
                
                {isRiskTx(transaction) && transaction.riskScore && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                    transaction.riskScore === 'red' && "bg-destructive/10 text-destructive",
                    transaction.riskScore === 'yellow' && "bg-warning/10 text-warning"
                  )}>
                    {transaction.riskScore === 'red' && <ShieldAlert className="w-3.5 h-3.5" />}
                    {transaction.riskScore === 'yellow' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {transaction.riskScore === 'red' ? '高风险' : '可疑'}
                  </span>
                )}
              </div>
            </div>

            {/* Risk Info Section */}
            {isRiskTx(transaction) && transaction.riskReasons && (
              <div className={cn(
                "p-3 rounded-xl border mb-4",
                transaction.riskScore === 'red' 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-warning/10 border-warning/30"
              )}>
                <p className="text-sm font-medium text-foreground mb-2">风险原因</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {transaction.riskReasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-muted-foreground/50">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Failure Reason - for failed transactions */}
            {transaction.status === 'failed' && transaction.failureReason && (
              <div className="p-3 rounded-xl border bg-destructive/10 border-destructive/30 mb-4">
                <p className="text-sm font-medium text-destructive mb-1">失败原因</p>
                <p className="text-sm text-muted-foreground">{transaction.failureReason}</p>
              </div>
            )}

            {/* Details Card */}
            <div className="card-elevated p-4 rounded-xl">
              {/* Sender Address */}
              <div className="flex justify-between items-start py-3 border-b border-border">
                <span className="text-sm text-muted-foreground shrink-0">发送方</span>
                <div className="text-right flex-1 ml-4">
                  {transaction.type === 'receive' && transaction.counterpartyLabel && (
                    <p className="font-medium text-foreground">{transaction.counterpartyLabel}</p>
                  )}
                  <div className="flex items-center justify-end gap-1.5">
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {`${senderAddress.slice(0, 10)}...${senderAddress.slice(-8)}`}
                    </p>
                    <button 
                      onClick={handleCopySender}
                      className="p-1.5 hover:bg-muted rounded shrink-0"
                    >
                      {copiedSender ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Receiver Address */}
              <div className="flex justify-between items-start py-3 border-b border-border">
                <span className="text-sm text-muted-foreground shrink-0">收款方</span>
                <div className="text-right flex-1 ml-4">
                  {transaction.type === 'send' && transaction.counterpartyLabel && (
                    <p className="font-medium text-foreground">{transaction.counterpartyLabel}</p>
                  )}
                  <div className="flex items-center justify-end gap-1.5">
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {`${receiverAddress.slice(0, 10)}...${receiverAddress.slice(-8)}`}
                    </p>
                    <button 
                      onClick={handleCopyReceiver}
                      className="p-1.5 hover:bg-muted rounded shrink-0"
                    >
                      {copiedReceiver ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Network */}
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">网络</span>
                <div className="flex items-center gap-1.5">
                  <ChainIcon chainId={transaction.network} size="sm" />
                  <span className="font-medium text-foreground">
                    {SUPPORTED_CHAINS.find(c => c.id === transaction.network)?.name}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">时间</span>
                <span className="font-medium text-foreground">
                  {new Date(transaction.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>

              {/* Network Fee */}
              {transaction.fee !== undefined && transaction.fee > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">网络费用</span>
                  <div className="text-right">
                    {transaction.gasAmount && transaction.gasToken && (
                      <p className="font-medium text-foreground">
                        {transaction.gasAmount.toFixed(6)} {transaction.gasToken}
                      </p>
                    )}
                    <p className={transaction.gasAmount ? "text-sm text-muted-foreground" : "font-medium text-foreground"}>
                      ≈ ${transaction.fee.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Confirmations */}
              {transaction.status === 'confirmed' && transaction.confirmations !== undefined && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">确认数</span>
                  <span className="font-medium text-foreground">
                    {transaction.confirmations >= 100 ? '100+' : transaction.confirmations} 次确认
                  </span>
                </div>
              )}

              {/* Block Height */}
              {transaction.status === 'confirmed' && transaction.blockHeight && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">区块高度</span>
                  <span className="font-medium text-foreground font-mono">
                    #{transaction.blockHeight.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Memo */}
              {transaction.memo && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">备注</span>
                  <span className="font-medium text-foreground max-w-[60%] text-right truncate">
                    {transaction.memo}
                  </span>
                </div>
              )}

              {/* Transaction Hash */}
              {transaction.txHash && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">交易哈希</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground font-mono">
                      {transaction.txHash.slice(0, 8)}...{transaction.txHash.slice(-6)}
                    </span>
                    <button 
                      onClick={handleCopyHash}
                      className="p-1.5 hover:bg-muted rounded"
                    >
                      {copiedHash ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RBF Action Section - for pending send transactions */}
            {transaction.status === 'pending' && transaction.type === 'send' && !isRiskTx(transaction) && (
              <div className="mt-4">
                <RbfActionSection
                  transaction={transaction}
                  onSpeedUp={handleSpeedUpClick}
                  onCancel={handleCancelClick}
                />
              </div>
            )}

            {/* Risk Actions */}
            {isRiskTx(transaction) && (
              <div className="space-y-2 mt-4">
                <Button
                  variant="destructive"
                  className="w-full h-12"
                  onClick={() => handleReturn(transaction.id)}
                >
                  退回资金
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => handleAcknowledge(transaction.id)}
                >
                  我已知晓风险，保留资金
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RBF Drawers */}
        <SpeedUpDrawer
          open={speedUpDrawerOpen}
          onOpenChange={setSpeedUpDrawerOpen}
          transaction={transaction}
          onConfirm={handleSpeedUpConfirm}
        />
        <CancelTxDrawer
          open={cancelDrawerOpen}
          onOpenChange={setCancelDrawerOpen}
          transaction={transaction}
          onConfirm={handleCancelConfirm}
        />
      </AppLayout>
    </PageTransition>
  );
}
