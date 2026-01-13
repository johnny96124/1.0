import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="relative w-[390px] h-[844px] bg-background rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-800">
        {/* 顶部刘海 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-slate-800 rounded-b-2xl z-50" />
        
        {/* 内容区域 */}
        <div className="h-full overflow-auto">
          {children}
        </div>
        
        {/* 底部横条 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-slate-800 rounded-full z-50" />
      </div>
    </div>
  );
}
