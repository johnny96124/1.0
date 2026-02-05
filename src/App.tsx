import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { AppLockProvider } from "@/contexts/AppLockContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { AppLockScreen } from "@/components/AppLockScreen";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import CreateWallet from "./pages/CreateWallet";
import Home from "./pages/Home";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import History from "./pages/History";
import Profile from "./pages/Profile";
import WalletManagement from "./pages/WalletManagement";
import Security from "./pages/Security";
import DeviceManagement from "./pages/DeviceManagement";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import PersonalInfo from "./pages/PersonalInfo";
import Contacts from "./pages/Contacts";
import ContactForm from "./pages/ContactForm";
import ContactDetail from "./pages/ContactDetail";
import AssetDetail from "./pages/AssetDetail";
import PSPCenter from "./pages/PSPCenter";
import PSPConnect from "./pages/PSPConnect";
import PSPDetail from "./pages/PSPDetail";
import PSPPermissions from "./pages/PSPPermissions";
import RiskManagement from "./pages/RiskManagement";
import RiskReturn from "./pages/RiskReturn";
import MessageCenter from "./pages/MessageCenter";
import WalletRecovery from "./pages/WalletRecovery";
import WalletEscape from "./pages/WalletEscape";
import AuthorizeDevice from "./pages/AuthorizeDevice";
import TssKeyRecovery from "./pages/TssKeyRecovery";
import TSSBackupManagement from "./pages/TSSBackupManagement";
import CloudRecoveryUnavailable from "./pages/CloudRecoveryUnavailable";
import DeviceKicked from "./pages/DeviceKicked";
import SecurityRequired from "./pages/SecurityRequired";
import SetPassword from "./pages/SetPassword";
import BindEmailDemo from "./pages/BindEmailDemo";
import LockScreenDemo from "./pages/LockScreenDemo";
import NotFound from "./pages/NotFound";
import TransactionDetail from "./pages/TransactionDetail";
import EmailPreview from "./pages/EmailPreview";
import EmailPreviewFullscreen from "./pages/EmailPreviewFullscreen";

const queryClient = new QueryClient();

function ProtectedRoute({ children, bypassAuth = false }: { children: React.ReactNode; bypassAuth?: boolean }) {
  const { isAuthenticated, devModeLogin } = useWallet();
  
  // If bypassAuth is true, auto-login and render children
  if (bypassAuth && !isAuthenticated) {
    devModeLogin();
    return null; // Will re-render after login
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/create-wallet" element={<ProtectedRoute><CreateWallet /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute bypassAuth><Home /></ProtectedRoute>} />
      <Route path="/send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
      <Route path="/receive" element={<ProtectedRoute><Receive /></ProtectedRoute>} />
      <Route path="/asset/:symbol" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/transaction/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
      <Route path="/profile/wallets" element={<ProtectedRoute><WalletManagement /></ProtectedRoute>} />
      <Route path="/profile/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
      <Route path="/profile/security/tss-backup" element={<ProtectedRoute><TSSBackupManagement /></ProtectedRoute>} />
      <Route path="/profile/devices" element={<ProtectedRoute><DeviceManagement /></ProtectedRoute>} />
      <Route path="/profile/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      <Route path="/profile/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
      <Route path="/profile/contacts/add" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
      <Route path="/profile/contacts/edit/:id" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
      <Route path="/profile/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
      <Route path="/profile/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/psp" element={<ProtectedRoute><PSPCenter /></ProtectedRoute>} />
      <Route path="/psp/connect" element={<ProtectedRoute><PSPConnect /></ProtectedRoute>} />
      <Route path="/psp/:id" element={<ProtectedRoute><PSPDetail /></ProtectedRoute>} />
      <Route path="/psp/:id/permissions" element={<ProtectedRoute><PSPPermissions /></ProtectedRoute>} />
      <Route path="/risk-management" element={<ProtectedRoute><RiskManagement /></ProtectedRoute>} />
      <Route path="/risk-management/return/:txId" element={<ProtectedRoute><RiskReturn /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessageCenter /></ProtectedRoute>} />
      <Route path="/wallet/recovery" element={<WalletRecovery />} />
      <Route path="/wallet/escape/:id" element={<ProtectedRoute><WalletEscape /></ProtectedRoute>} />
      <Route path="/profile/devices/authorize" element={<ProtectedRoute><AuthorizeDevice /></ProtectedRoute>} />
      <Route path="/tss-recovery" element={<TssKeyRecovery />} />
      <Route path="/cloud-recovery-unavailable" element={<CloudRecoveryUnavailable />} />
      <Route path="/device-kicked" element={<DeviceKicked />} />
      <Route path="/security-required" element={<SecurityRequired />} />
      <Route path="/set-password" element={<ProtectedRoute><SetPassword /></ProtectedRoute>} />
      <Route path="/bind-email-demo" element={<BindEmailDemo />} />
      <Route path="/lock-screen-demo" element={<LockScreenDemo />} />
      <Route path="/email-preview" element={<EmailPreview />} />
      <Route path="/email-preview-fullscreen" element={<EmailPreviewFullscreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <WalletProvider>
          <AppLockProvider>
            <TooltipProvider>
              <BrowserRouter>
                <PhoneFrame>
                  <Toaster />
                  <AppLockScreen />
                  <AppRoutes />
                </PhoneFrame>
              </BrowserRouter>
            </TooltipProvider>
          </AppLockProvider>
        </WalletProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
