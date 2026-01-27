import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Scan, Users, AlertTriangle, 
  CheckCircle2, Loader2, Shield,
  Info, ChevronRight, ShieldAlert
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SwipeBack } from '@/components/SwipeBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { RiskColor, SUPPORTED_CHAINS, ChainId } from '@/types/wallet';
import { QRScanner } from '@/components/QRScanner';
import { ParsedQRData } from '@/lib/qr-parser';
import { NumericKeypad } from '@/components/NumericKeypad';
import { AmountDisplay } from '@/components/AmountDisplay';
import { AddressBar } from '@/components/AddressBar';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { NetworkFeeSelector, FeeTier } from '@/components/NetworkFeeSelector';
import { ContactDrawer } from '@/components/ContactDrawer';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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

export default function SendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    assets, contacts, scanAddressRisk, sendTransaction, walletStatus,
    getLimitStatus, checkTransferLimit, isPSPAddress, getAccountRiskStatus
  } = useWallet();

  // Handle prefilled data from contact detail page or PSP detail page
  const prefilledData = location.state as { 
    prefilledAddress?: string; 
    prefilledNetwork?: ChainId;
    pspName?: string;
    fromPSP?: boolean;
  } | null;
  
  // Parse asset from URL query params (e.g., /send?asset=USDC)
  const searchParams = new URLSearchParams(location.search);
  const assetFromUrl = searchParams.get('asset');
  
  // Find the matching asset from URL param, or fall back to first asset
  const initialAsset = assetFromUrl 
    ? assets.find(a => a.symbol.toUpperCase() === assetFromUrl.toUpperCase()) || assets[0]
    : assets[0];
  
  // If coming from PSP, skip address step and go directly to amount
  const initialStep = prefilledData?.fromPSP && prefilledData?.prefilledAddress ? 'amount' : 'address';
  
  const [step, setStep] = useState<'address' | 'amount' | 'confirm' | 'auth' | 'success'>(initialStep);
  const [address, setAddress] = useState(prefilledData?.prefilledAddress || '');
  const [pspRecipientName, setPspRecipientName] = useState(prefilledData?.pspName || '');
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [memo, setMemo] = useState('');
  const [riskScore, setRiskScore] = useState<{ score: RiskColor; reasons: string[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSatoshiTest, setShowSatoshiTest] = useState(false);
  const [confirmRisk, setConfirmRisk] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [feeTier, setFeeTier] = useState<FeeTier>('standard');
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showPSPWarningDialog, setShowPSPWarningDialog] = useState(false);
  const [showPSPBlockedDialog, setShowPSPBlockedDialog] = useState(false);
  const [pspInfo, setPspInfo] = useState<{ isPSP: boolean; pspName?: string } | null>(null);

  // Get limit status
  const limitStatus = getLimitStatus();
  const currentAmount = parseFloat(amount) || 0;
  const limitCheck = checkTransferLimit(currentAmount);

  // Mock token price (in real app, fetch from API)
  const tokenPrice = selectedAsset.symbol === 'USDT' || selectedAsset.symbol === 'USDC' ? 1 : 
                     selectedAsset.symbol === 'ETH' ? 3500 : 
                     selectedAsset.symbol === 'BTC' ? 97500 : 1;

  // Scan address risk when address changes
  useEffect(() => {
    const scan = async () => {
      if (address.length > 10) {
        setIsScanning(true);
        const result = await scanAddressRisk(address);
        setRiskScore(result);
        setIsScanning(false);
        
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
    if (data.amount) setAmount(data.amount.toString());
    if (data.memo) setMemo(data.memo);
  };

  const handleKeypadInput = (key: string) => {
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      setAmount(prev => prev + key);
    }
  };

  const handleKeypadDelete = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleContinue = () => {
    if (step === 'address' && address && (!riskScore || riskScore.score !== 'red')) {
      setStep('amount');
    } else if (step === 'amount' && parseFloat(amount) > 0 && limitCheck.allowed) {
      // Check PSP address and account risk status before confirming
      const pspCheck = isPSPAddress(address);
      setPspInfo(pspCheck);
      
      if (pspCheck.isPSP) {
        const accountRisk = getAccountRiskStatus();
        if (accountRisk.status === 'restricted') {
          // Block transfer to PSP if account is restricted
          setShowPSPBlockedDialog(true);
          return;
        } else if (accountRisk.status === 'warning') {
          // Show warning dialog if account has warning status
          setShowPSPWarningDialog(true);
          return;
        }
      }
      setStep('confirm');
    } else if (step === 'confirm') {
      if (riskScore?.score === 'yellow' && !confirmRisk) return;
      setStep('auth');
    }
  };

  const handlePSPWarningConfirm = () => {
    setShowPSPWarningDialog(false);
    setStep('confirm');
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
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

  const getStepTitle = () => {
    switch (step) {
      case 'address': return '转账';
      case 'amount': return '输入金额';
      case 'confirm': return '确认转账';
      case 'auth': return '验证身份';
      case 'success': return '转账成功';
    }
  };

  return (
    <AppLayout showNav={false} showSecurityBanner={false}>
      <SwipeBack enabled={step === 'address'}>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <button
            onClick={() => {
              if (step === 'address') {
                navigate(-1);
              } else if (step === 'amount') {
                // If from PSP, go back to previous page; otherwise go to address step
                if (prefilledData?.fromPSP) {
                  navigate(-1);
                } else {
                  setStep('address');
                }
              } else if (step === 'confirm') {
                setStep('amount');
              } else {
                setStep('address');
              }
            }}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{getStepTitle()}</h1>
          <div className="w-10" />
        </div>

        {/* Limit Warning for unbacked wallet */}
        {isLimitedTransfer && step !== 'success' && (
          <div className="mx-4 mb-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
            <p className="text-sm text-warning">
              ⚠️ 未完成备份，单笔限额 {transferLimit} USDT
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 px-4 py-4 overflow-y-auto space-y-4"
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
                      className="pr-20 text-base"
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={() => setShowContactDrawer(true)}
                      >
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
                  >
                    {isScanning ? (
                      <div className="flex items-center gap-2 text-muted-foreground p-4">
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
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Contacts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground">常用联系人</h3>
                    {contacts.length > 3 && (
                      <button
                        onClick={() => setShowContactDrawer(true)}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        查看全部
                      </button>
                    )}
                  </div>
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
                              {contact.isWhitelisted && (
                                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                  白名单
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <ChainIcon chainId={contact.network as ChainId} size="xs" />
                              <p className="text-sm text-muted-foreground font-mono">
                                {contact.address.slice(0, 8)}...{contact.address.slice(-6)}
                              </p>
                            </div>
                          </div>
                          {selectedContact?.id === contact.id && (
                            <CheckCircle2 className="w-5 h-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                    
                    {contacts.length === 0 && (
                      <button
                        onClick={() => navigate('/profile/contacts/add')}
                        className="w-full p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground hover:border-accent/50 hover:text-foreground transition-colors"
                      >
                        <Users className="w-5 h-5 mx-auto mb-2" />
                        <p className="text-sm">添加常用联系人</p>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Amount - Mobile Optimized */}
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                {/* Address Bar */}
                <div className="px-4 pt-2">
                  <AddressBar
                    address={address}
                    label={pspRecipientName || selectedContact?.name}
                    onClear={prefilledData?.fromPSP ? undefined : () => setStep('address')}
                  />
                </div>

                {/* Amount Display - Centered */}
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                  <AmountDisplay
                    amount={amount}
                    symbol={selectedAsset.symbol}
                    tokenPrice={tokenPrice}
                    maxBalance={selectedAsset.balance}
                    onMaxClick={() => setAmount(selectedAsset.balance.toString())}
                  />
                  
                  {/* Balance Info with Max Button */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <span>可用:</span>
                    <button 
                      onClick={() => setShowAssetPicker(true)}
                      className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <CryptoIcon symbol={selectedAsset.symbol} size="sm" />
                      <span className="font-medium text-foreground">{selectedAsset.balance.toLocaleString()} {selectedAsset.symbol}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAmount(selectedAsset.balance.toString())}
                      className="px-3 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full hover:bg-accent/20 transition-colors"
                    >
                      全部
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <div className="px-4 pb-2">
                  <Button
                    size="lg"
                    className="w-full text-lg font-semibold"
                    onClick={handleContinue}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > selectedAsset.balance || !limitCheck.allowed}
                  >
                    发送
                  </Button>
                </div>

                {/* Numeric Keypad */}
                <NumericKeypad
                  onInput={handleKeypadInput}
                  onDelete={handleKeypadDelete}
                />
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 px-4 py-4 overflow-y-auto space-y-4"
              >
                {/* Amount Card */}
                <div className="card-elevated p-6 text-center">
                  <CryptoIcon symbol={selectedAsset.symbol} size="xl" className="mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">
                    {amount} {selectedAsset.symbol}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    ≈ ${(parseFloat(amount) * tokenPrice).toLocaleString()}
                  </p>
                </div>

                {/* Details Card */}
                <div className="card-elevated p-4 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">收款方</p>
                    <p className="font-medium text-foreground mt-1">
                      {pspRecipientName || selectedContact?.name || '未知地址'}
                    </p>
                    <p className="text-sm font-mono text-muted-foreground mt-0.5">
                      {address.slice(0, 12)}...{address.slice(-10)}
                    </p>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">网络</span>
                    <div className="flex items-center gap-2">
                      <ChainIcon chainId={selectedAsset.network} size="sm" />
                      <span className="text-sm font-medium text-foreground">
                        {SUPPORTED_CHAINS.find(c => c.id === selectedAsset.network)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee Selector */}
                <NetworkFeeSelector
                  selectedTier={feeTier}
                  onSelect={setFeeTier}
                  networkName={SUPPORTED_CHAINS.find(c => c.id === selectedAsset.network)?.name}
                />

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
                className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12"
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
                  className="w-full mt-8"
                  onClick={handleAuth}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
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
                className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12"
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
                    className="w-full"
                    onClick={() => navigate('/history')}
                  >
                    查看交易记录
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
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

        {/* Bottom Action - Only for address and confirm steps */}
        {(step === 'address' || step === 'confirm') && (
          <div className="p-4 border-t border-border shrink-0">
            <Button
              size="lg"
              className="w-full"
              onClick={handleContinue}
              disabled={
                (step === 'address' && (!address || riskScore?.score === 'red')) ||
                (step === 'confirm' && riskScore?.score === 'yellow' && !confirmRisk)
              }
            >
              {step === 'confirm' ? '确认并转账' : '继续'}
            </Button>
          </div>
        )}
      </div>
      </SwipeBack>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      {/* Contact Drawer */}
      <ContactDrawer
        open={showContactDrawer}
        onOpenChange={setShowContactDrawer}
        contacts={contacts}
        onSelect={handleSelectContact}
      />

      {/* Asset Picker Drawer */}
      <Drawer open={showAssetPicker} onOpenChange={setShowAssetPicker}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>选择币种</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-2 max-h-[60vh] overflow-y-auto">
            {assets.map((asset) => (
              <button
                key={`${asset.symbol}-${asset.network}`}
                onClick={() => {
                  setSelectedAsset(asset);
                  setAmount(''); // Reset amount when changing asset
                  setShowAssetPicker(false);
                }}
                className={cn(
                  'w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-3',
                  selectedAsset.symbol === asset.symbol && selectedAsset.network === asset.network
                    ? 'border-accent bg-accent/5' 
                    : 'border-border hover:border-accent/50'
                )}
              >
                <CryptoIcon symbol={asset.symbol} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{asset.symbol}</span>
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                      {SUPPORTED_CHAINS.find(c => c.id === asset.network)?.shortName}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {asset.balance.toLocaleString()} {asset.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    ${asset.usdValue.toLocaleString()}
                  </p>
                </div>
                {selectedAsset.symbol === asset.symbol && selectedAsset.network === asset.network && (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* PSP Warning Dialog - Account has warning status */}
      <AlertDialog open={showPSPWarningDialog} onOpenChange={setShowPSPWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-center">存在可疑来款</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              您的账户存在未处置的可疑收款，向{pspInfo?.pspName || '服务商'}转账可能导致资金被冻结。建议先处置可疑收款后再操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={() => navigate('/risk-management')}
              className="w-full bg-accent hover:bg-accent/90"
            >
              前往处置
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handlePSPWarningConfirm}
              className="w-full"
            >
              我知晓风险，继续转账
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PSP Blocked Dialog - Account is restricted */}
      <AlertDialog open={showPSPBlockedDialog} onOpenChange={setShowPSPBlockedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">转账受限</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              您的账户存在未处置的高风险收款，向{pspInfo?.pspName || '服务商'}的转账已被限制。请先处置高风险收款以解除限制。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={() => navigate('/risk-management')}
              className="w-full bg-accent hover:bg-accent/90"
            >
              前往处置
            </AlertDialogAction>
            <AlertDialogCancel className="w-full">
              取消
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
