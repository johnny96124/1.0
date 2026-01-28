import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudOff, AlertTriangle, HardDrive, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CloudRecoveryUnavailable() {
  const navigate = useNavigate();

  const handleLocalRecovery = () => {
    navigate("/tss-recovery?cloud=false");
  };

  const handleContactSupport = () => {
    navigate("/help");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Main Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <CloudOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-xl font-semibold text-foreground mb-2">
            云端恢复暂不可用
          </h1>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            您尚未在云端完成备份，无法使用此恢复方式
          </p>
        </motion.div>

        {/* Warning Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full max-w-sm mb-6"
        >
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    为什么无法使用云端恢复？
                  </p>
                  <p className="text-xs text-muted-foreground">
                    云端恢复需要您之前已将 TSS 密钥分片备份至 iCloud 或 Google Drive。由于未检测到云端备份记录，请选择其他恢复方式。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alternative Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-full max-w-sm space-y-3"
        >
          <p className="text-sm font-medium text-foreground mb-3">
            推荐操作
          </p>
          
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleLocalRecovery}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    使用本地文件恢复
                  </p>
                  <p className="text-xs text-muted-foreground">
                    通过之前导出的备份文件恢复
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleContactSupport}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    联系客服获取帮助
                  </p>
                  <p className="text-xs text-muted-foreground">
                    如有疑问，请联系我们的支持团队
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="px-4 pb-8 space-y-3"
      >
        <Button 
          onClick={handleLocalRecovery}
          className="w-full h-12"
        >
          使用本地文件恢复
        </Button>
        <Button 
          variant="outline"
          onClick={handleContactSupport}
          className="w-full h-12"
        >
          联系客服
        </Button>
      </motion.div>
    </div>
  );
}
