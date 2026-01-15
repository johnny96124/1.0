import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Scan, Users, AlertTriangle, 
  CheckCircle2, Loader2, Shield, ChevronDown,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { RiskColor } from '@/types/wallet';
import { QRScanner } from '@/components/QRScanner';
import { TransferLimitCard } from '@/components/TransferLimitCard';
import { ParsedQRData } from '@/lib/qr-parser';

export default function SendPage() {
  const navigate = useNavigate();
  const { 
    assets, contacts, scanAddressRisk, sendTransaction, walletStatus,
    getLimitStatus, checkTransferLimit 
  } = useWallet();
  
  const [step, setStep] = useState<'address' | 'amount' | 'confirm' | 'auth' | 'success'>('address');
  const [address, setAddress] = useState('');
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [memo, setMemo] = useState('');
  const [riskScore, setRiskScore] = useState<{ score: RiskColor; reasons: string[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSatoshiTest, setShowSatoshiTest] = useState(false);
  const [confirmRisk, setConfirmRisk] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Get limit status
  const limitStatus = getLimitStatus();
  const currentAmount = parseFloat(amount) || 0;
  const limitCheck = checkTransferLimit(currentAmount);

  // Scan address risk when address changes
  useEffect(() => {
    const scan = async () => {
      if (address.length > 10) {
        setIsScanning(true);
        const result = await scanAddressRisk(address);
        setRiskScore(result);
        setIsScanning(false);
        
        // Show satoshi test for new/unknown addresses
        if (result.score === 'yellow' || !contacts.find(c => c.address.includes(address.slice(0, 10)))) {
          setShowSatoshiTest(true);
        }
      }
    };
    scan();
  }, [address, scanAddressRisk, contacts]);

  const handleSelectContact = (contact: typeof contacts[0]) => {
    setSelectedContact(contact);
    setAddress(contact.address);
  };

  const handleQRScan = (data: ParsedQRData) => {
    setAddress(data.address);
    setSelectedContact(null);
    
    // Auto-fill amount if provided
    if (data.amount) {
      setAmount(data.amount.toString());
    }
    
    // Auto-fill memo if provided
    if (data.memo) {
      setMemo(data.memo);
    }
  };

  const handleContinue = () => {
    if (step === 'address' && address && (!riskScore || riskScore.score !== 'red')) {
      setStep('amount');
    } else if (step === 'amount' && parseFloat(amount) > 0 && limitCheck.allowed) {
      setStep('confirm');
    } else if (step === 'confirm') {
      if (riskScore?.score === 'yellow' && !confirmRisk) return;
      setStep('auth');
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      // Simulate biometric auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendTransaction(address, parseFloat(amount), selectedAsset.symbol, memo);
      setStep('success');
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLimitedTransfer = walletStatus === 'created_no_backup';
  const transferLimit = isLimitedTransfer ? 50 : limitStatus.singleLimit;

  return (
    <AppLayout showNav={false} showSecurityBanner={false}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === 'address' ? navigate(-1) : setStep('address')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">转账</h1>
        </div>

        {/* Limit Warning for unbacked wallet */}
        {isLimitedTransfer && (
          <div className="mx-4 mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl">
            <p className="text-sm text-warning">
              ⚠️ 未完成备份，单笔限额 {transferLimit} USDT
            </p>
          </div>
        )}

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    收款地址
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="粘贴地址或选择联系人"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setSelectedContact(null);
                      }}
                      className="h-14 pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={() => setShowQRScanner(true)}
                      >
                        <Scan className="w-5 h-5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Risk Score */}
                {address && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    {isScanning ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">风险评估中…</span>
                      </div>
                    ) : riskScore && (
                      <div className={cn(
                        'p-4 rounded-xl border',
                        riskScore.score === 'green' && 'bg-success/5 border-success/20',
                        riskScore.score === 'yellow' && 'bg-warning/5 border-warning/20',
                        riskScore.score === 'red' && 'bg-destructive/5 border-destructive/20'
                      )}>
                        <div className="flex items-center gap-2">
                          {riskScore.score === 'green' && (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-success" />
                              <span className="font-medium text-success">该地址信誉良好</span>
                            </>
                          )}
                          {riskScore.score === 'yellow' && (
                            <>
                              <AlertTriangle className="w-5 h-5 text-warning" />
                              <span className="font-medium text-warning">该地址缺少足够记录，请谨慎</span>
                            </>
                          )}
                          {riskScore.score === 'red' && (
                            <>
                              <Shield className="w-5 h-5 text-destructive" />
                              <span className="font-medium text-destructive">该地址存在高风险，已阻止转账</span>
                            </>
                          )}
                        </div>
                        {riskScore.reasons.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {riskScore.reasons.map((reason, i) => (
                              <p key={i} className="text-sm text-muted-foreground">• {reason}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Contacts */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">常用联系人</h3>
                  <div className="space-y-2">
                    {contacts.slice(0, 3).map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className={cn(
                          'w-full p-4 rounded-xl border text-left transition-colors',
                          selectedContact?.id === contact.id 
                            ? 'border-accent bg-accent/5' 
                            : 'border-border hover:border-accent/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{contact.name}</p>
                              {contact.isOfficial && (
                                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                  官方
                                </span>
                              )}
                              {contact.isWhitelisted && (
                                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                  白名单
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono mt-1">
                              {contact.address.slice(0, 10)}...{contact.address.slice(-8)}
                            </p>
                          </div>
                          {selectedContact?.id === contact.id && (
                            <CheckCircle2 className="w-5 h-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Amount */}
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    转账金额
                  </label>
                  <div className="card-elevated p-4">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                        <span className="text-xl">{selectedAsset.icon}</span>
                        <span className="font-medium">{selectedAsset.symbol}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        可用余额: {selectedAsset.balance.toLocaleString()} {selectedAsset.symbol}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAmount(selectedAsset.balance.toString())}
                      >
                        全部转出
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Transfer Limit Card */}
                {!isLimitedTransfer && (
                  <TransferLimitCard 
                    limitStatus={{
                      singleLimit: limitStatus.singleLimit,
                      dailyLimit: limitStatus.dailyLimit,
                      dailyUsed: limitStatus.dailyUsed,
                      monthlyLimit: limitStatus.monthlyLimit,
                      monthlyUsed: limitStatus.monthlyUsed,
                    }}
                    currentAmount={currentAmount}
                  />
                )}

                {/* Fee estimate */}
                <div className="card-elevated p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">预计网络费用</span>
                    <span className="text-sm font-medium">~$2.50</span>
                  </div>
                </div>

                {/* Memo */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    备注（可选）
                  </label>
                  <Input
                    placeholder="添加对账信息"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="h-12"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="card-elevated p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">转账金额</p>
                  <p className="text-3xl font-bold text-foreground">
                    {amount} {selectedAsset.symbol}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    ≈ ${(parseFloat(amount) || 0).toLocaleString()}
                  </p>
                </div>

                <div className="card-elevated p-4 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">收款方</p>
                    <p className="font-medium text-foreground mt-1">
                      {selectedContact?.name || '未知地址'}
                    </p>
                    <p className="text-sm font-mono text-muted-foreground mt-0.5">
                      {address.slice(0, 16)}...{address.slice(-12)}
                    </p>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">网络</span>
                    <span className="text-sm font-medium">Ethereum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">网络费用</span>
                    <span className="text-sm font-medium">~$2.50</span>
                  </div>
                  {memo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">备注</span>
                      <span className="text-sm font-medium">{memo}</span>
                    </div>
                  )}
                </div>

                {/* Satoshi Test Suggestion */}
                {showSatoshiTest && (
                  <div className="card-elevated p-4 border-accent/30 bg-accent/5">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">建议先进行小额测试</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          确认对方地址可正常到账后再转大额
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setAmount('0.01')}
                        >
                          进行测试转账（0.01 {selectedAsset.symbol}）
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Warning Confirm */}
                {riskScore?.score === 'yellow' && (
                  <label className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmRisk}
                      onChange={(e) => setConfirmRisk(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-warning"
                    />
                    <span className="text-sm text-foreground">
                      我理解该地址存在潜在风险，仍要继续转账
                    </span>
                  </label>
                )}
              </motion.div>
            )}

            {/* Step 4: Auth */}
            {step === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6"
                >
                  <Shield className="w-12 h-12 text-accent" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  验证身份
                </h2>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  请使用面容 ID 或指纹验证以确认转账
                </p>
                
                <Button
                  size="lg"
                  className="w-full h-14 mt-8"
                  onClick={handleAuth}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : null}
                  确认并转账
                </Button>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  转账已提交
                </h2>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  交易正在处理中，请在记录页面查看状态
                </p>
                
                <div className="w-full space-y-3 mt-8">
                  <Button
                    size="lg"
                    className="w-full h-14"
                    onClick={() => navigate('/history')}
                  >
                    查看交易记录
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14"
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
        {(step === 'address' || step === 'amount' || step === 'confirm') && (
          <div className="p-4 border-t border-border">
            <Button
              size="lg"
              className="w-full h-14"
              onClick={handleContinue}
              disabled={
                (step === 'address' && (!address || riskScore?.score === 'red')) ||
                (step === 'amount' && (!amount || parseFloat(amount) <= 0 || !limitCheck.allowed)) ||
                (step === 'confirm' && riskScore?.score === 'yellow' && !confirmRisk)
              }
            >
              {step === 'confirm' ? '确认并转账' : '继续'}
            </Button>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </AppLayout>
  );
}
