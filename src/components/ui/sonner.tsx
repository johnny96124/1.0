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
    <div 
      style={{
        position: 'absolute',
        bottom: '100px',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <Sonner
        theme="light"
        className="toaster group"
        position="bottom-center"
        containerAriaLabel="通知"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "w-full flex flex-col gap-1 p-4 rounded-2xl shadow-xl pointer-events-auto",
            title: "font-semibold text-base text-slate-900",
            description: "text-sm text-slate-500",
          },
          style: {
            background: '#f5f5f7',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
        {...props}
      />
    </div>
  );

  return createPortal(toasterElement, container);
};

export { Toaster, toast };
