import { ReactNode, useRef, useEffect } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

// Global reference for drawer container
let drawerContainerRef: HTMLDivElement | null = null;

export function getDrawerContainer() {
  return drawerContainerRef;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      drawerContainerRef = containerRef.current;
    }
    return () => {
      drawerContainerRef = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-black flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        id="phone-frame-container"
        className="relative w-[390px] h-[844px] bg-background rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 dark:border-slate-700"
      >
        {/* 顶部刘海 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-slate-800 dark:bg-slate-700 rounded-b-2xl z-50" />
        
        {/* 内容区域 - 为刘海和底部横条留出空间 */}
        <div className="h-full overflow-auto pt-7 pb-6 relative">
          {children}
        </div>
        
        {/* 底部横条 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-slate-800 dark:bg-slate-700 rounded-full z-50" />
      </div>
    </div>
  );
}
