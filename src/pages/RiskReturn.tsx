import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, 
  Fingerprint, Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { CryptoIcon } from '@/components/CryptoIcon';
import { NetworkFeeSelector } from '@/components/NetworkFeeSelector';
import { toast } from '@/hooks/use-toast';

type Step = 'confirm' | 'fee' | 'auth' | 'processing' | 'success';

// Helper to format address
const formatAddress = (address: string) => {
  if (address.length <= 16) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
};

export default function RiskReturn() {
  const navigate = useNavigate();
  const { txId } = useParams<{ txId: string }>();
  const { getRiskTransactions, returnRiskFunds } = useWallet();
  
  const [step, setStep] = useState<Step>('confirm');
  const [selectedFee, setSelectedFee] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Find the transaction
  const riskTransactions = getRiskTransactions();
  const transaction = riskTransactions.find(tx => tx.id === txId);
  
  // Redirect if transaction not found
  useEffect(() => {
    if (!transaction) {
      toast({ title: '交易未找到', variant: 'destructive' });
      navigate('/risk-management');
    }
  }, [transaction, navigate]);
  
  if (!transaction) return null;
  
  const feeAmounts = {
    slow: 0.5,
    standard: 1.2,
    fast: 2.5,
  };
  
  const handleContinue = () => {
    if (step === 'confirm') {
      setStep('fee');
    } else if (step === 'fee') {
      setStep('auth');
    }
  };
  
  const handleAuth = async () => {
    setIsProcessing(true);
    setStep('processing');
    
    try {
      await returnRiskFunds(transaction.id);
      setStep('success');
      toast({ title: '资金已成功退回', description: '交易已从待处置列表中移除' });
    } catch (error) {
      toast({ title: '退回失败，请重试', variant: 'destructive' });
      setStep('auth');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <AppLayout showNav={false}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          {step !== 'processing' && step !== 'success' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (step === 'confirm') {
                  navigate(-1);
                } else if (step === 'fee') {
                  setStep('confirm');
                } else if (step === 'auth') {
                  setStep('fee');
                }
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="font-semibold text-foreground">
            {step === 'success' ? '退回成功' : '退回资金'}
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Warning */}
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-medium text-destructive">退回操作不可撤销</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    资金将全额退回至原发送方地址，此操作一旦执行无法取消。网络费用由您承担。
                  </p>
                </div>
                
                {/* Amount Card */}
                <div className="p-4 rounded-xl bg-card border border-border mb-4">
                  <p className="text-sm text-muted-foreground mb-2">退回金额</p>
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={transaction.symbol} size="lg" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {transaction.amount.toLocaleString()} {transaction.symbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ ${transaction.usdValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Destination */}
                <div className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2">退回至</p>
                  <p className="font-mono text-sm text-foreground break-all">
                    {transaction.counterparty}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    网络: {transaction.network}
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Fee Selection */}
            {step === 'fee' && (
              <motion.div
                key="fee"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-muted-foreground mb-4">
                  选择网络费用，费用越高到账越快
                </p>
                
                <NetworkFeeSelector
                  selectedTier={selectedFee}
                  onSelect={setSelectedFee}
                />
                
                {/* Summary */}
                <div className="mt-6 p-4 rounded-xl bg-muted/30 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">退回金额</span>
                    <span className="text-foreground">{transaction.amount} {transaction.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">网络费用</span>
                    <span className="text-foreground">${feeAmounts[selectedFee]}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">预计到账</span>
                    <span className="text-foreground">
                      {selectedFee === 'fast' ? '~1分钟' : selectedFee === 'standard' ? '~3分钟' : '~10分钟'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Auth */}
            {step === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Fingerprint className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">验证身份</h2>
                <p className="text-sm text-muted-foreground text-center mb-8">
                  使用生物识别或密码确认退回操作
                </p>
                
                <Button
                  size="lg"
                  className="w-full max-w-xs"
                  onClick={handleAuth}
                >
                  <Fingerprint className="w-5 h-5 mr-2" />
                  验证并退回
                </Button>
              </motion.div>
            )}
            
            {/* Step 4: Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">正在处理</h2>
                <p className="text-sm text-muted-foreground text-center">
                  正在广播交易，请稍候...
                </p>
              </motion.div>
            )}
            
            {/* Step 5: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </motion.div>
                <h2 className="text-xl font-semibold text-foreground mb-2">退回成功</h2>
                <p className="text-sm text-muted-foreground text-center mb-2">
                  资金已成功退回至原地址
                </p>
                <p className="text-xs text-muted-foreground text-center mb-8">
                  {formatAddress(transaction.counterparty)}
                </p>
                
                <div className="space-y-2 w-full max-w-xs">
                  <Button
                    className="w-full"
                    onClick={() => navigate('/risk-management')}
                  >
                    返回风险处置
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/home')}
                  >
                    返回首页
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Bottom Action */}
        {(step === 'confirm' || step === 'fee') && (
          <div className="p-4 border-t border-border/50">
            <Button
              className="w-full"
              variant={step === 'confirm' ? 'destructive' : 'default'}
              onClick={handleContinue}
            >
              {step === 'confirm' ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  确认退回
                </>
              ) : (
                '继续'
              )}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
