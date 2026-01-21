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
      position="bottom-center"
      containerAriaLabel="通知"
      /**
       * Sonner's default CSS sets the toaster to `position: fixed`.
       * We override to `absolute` so it positions INSIDE PhoneFrame.
       */
      style={{
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        width: "auto",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-full flex flex-col gap-1 p-4 rounded-2xl shadow-xl pointer-events-auto",
          title: "font-semibold text-base text-foreground",
          description: "text-sm text-muted-foreground",
        },
        style: {
          background: "hsl(var(--toast-surface))",
          color: "hsl(var(--toast-surface-foreground))",
          boxShadow: "var(--shadow-xl)",
        },
      }}
      {...props}
    />
  );

  return createPortal(toasterElement, container);
};

export { Toaster, toast };
