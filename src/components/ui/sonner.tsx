import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";
import { getDrawerContainer } from "@/components/layout/PhoneFrame";

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

  // Don't render until we have a container, to avoid flash in wrong position
  if (!container) return null;

  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      containerAriaLabel="通知"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast !bg-[#f5f5f7] !text-foreground !border-0 !shadow-xl !rounded-2xl !py-4 !px-5 !min-w-[280px]",
          title: "!text-foreground !font-semibold !text-base",
          description: "!text-muted-foreground !text-sm",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          success: "!bg-[#f5f5f7] !text-foreground !border-0",
          error: "!bg-[#f5f5f7] !text-foreground !border-0",
        },
        style: {
          background: '#f5f5f7',
          color: 'hsl(var(--foreground))',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
      style={{
        position: 'absolute',
        bottom: '100px',
        left: '0',
        right: '0',
        zIndex: 9999,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
