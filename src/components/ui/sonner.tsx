import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";
import { getDrawerContainer } from "@/components/layout/PhoneFrame";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Wait for PhoneFrame to mount
    const checkContainer = () => {
      const phoneContainer = getDrawerContainer();
      if (phoneContainer) {
        setContainer(phoneContainer);
      }
    };
    
    checkContainer();
    // Retry in case PhoneFrame isn't mounted yet
    const timer = setTimeout(checkContainer, 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render until we have a container
  if (!container) return null;

  const toasterElement = (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      containerAriaLabel="通知"
      expand={true}
      gap={8}
      visibleToasts={4}
      richColors={false}
      closeButton={true}
      icons={{
        success: <CheckCircle2 className="w-6 h-6 text-success" />,
        error: <XCircle className="w-6 h-6 text-destructive" />,
        warning: <AlertTriangle className="w-6 h-6 text-warning" />,
        info: <Info className="w-6 h-6 text-primary" />,
        close: <X className="w-4 h-4" />,
      }}
      /**
       * Sonner's default CSS sets the toaster to `position: fixed`.
       * We override to `absolute` so it positions INSIDE PhoneFrame.
       * Top position accounts for notch area (~28px) + safe spacing
       */
      style={{
        position: "absolute",
        top: 44,
        bottom: "auto",
        left: "50%",
        right: "auto",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "calc(100% - 32px)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      toastOptions={{
        unstyled: true,
        duration: 3000,
        classNames: {
          toast:
            "w-full flex items-start gap-3 p-4 rounded-xl shadow-lg pointer-events-auto bg-card border border-border/30",
          title: "font-semibold text-base text-foreground leading-tight",
          description: "text-sm text-muted-foreground mt-0.5",
          icon: "flex-shrink-0 mt-0.5",
          content: "flex-1 min-w-0",
          closeButton: "absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted",
          actionButton: "bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm font-medium",
          cancelButton: "bg-muted text-muted-foreground rounded-lg px-3 py-1.5 text-sm font-medium",
        },
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.15), 0 2px 8px -2px rgba(0, 0, 0, 0.08)",
        },
      }}
      {...props}
    />
  );

  return createPortal(toasterElement, container);
};

export { Toaster, toast };
