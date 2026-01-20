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
            "group toast !bg-background !text-foreground !border-border !shadow-lg !rounded-xl",
          title: "!text-foreground !font-medium",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          success: "!bg-background !text-foreground !border-success/30",
          error: "!bg-background !text-foreground !border-destructive/30",
        },
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
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
