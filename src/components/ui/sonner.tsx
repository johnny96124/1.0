import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";
import { getDrawerContainer } from "@/components/layout/PhoneFrame";
import { createPortal } from "react-dom";

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
      expand={false}
      richColors={false}
      closeButton={false}
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
            "w-full flex flex-col gap-1 p-4 rounded-lg shadow-xl pointer-events-auto bg-[hsl(var(--toast-surface))] text-[hsl(var(--toast-surface-foreground))] data-[swipe=move]:translate-y-[var(--y)] data-[swipe=cancel]:translate-y-0 data-[swipe=end]:animate-out data-[swipe=end]:fade-out-80",
          title: "font-semibold text-base",
          description: "text-sm opacity-80",
          success: "border-l-4 border-l-success",
          error: "border-l-4 border-l-destructive",
          warning: "border-l-4 border-l-warning",
          info: "border-l-4 border-l-accent",
        },
        style: {
          background: "hsl(var(--toast-surface))",
          color: "hsl(var(--toast-surface-foreground))",
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.1)",
        },
      }}
      {...props}
    />
  );

  return createPortal(toasterElement, container);
};

export { Toaster, toast };
