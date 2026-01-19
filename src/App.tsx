import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useWallet();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useWallet();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/welcome" element={isAuthenticated ? <Navigate to="/home" replace /> : <Welcome />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/create-wallet" element={<ProtectedRoute><CreateWallet /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
      <Route path="/receive" element={<ProtectedRoute><Receive /></ProtectedRoute>} />
      <Route path="/asset/:symbol" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
      <Route path="/profile/wallets" element={<ProtectedRoute><WalletManagement /></ProtectedRoute>} />
      <Route path="/profile/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <BrowserRouter>
          <PhoneFrame>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </PhoneFrame>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
