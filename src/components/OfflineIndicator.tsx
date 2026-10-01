import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-600/95 text-white text-xs font-medium shadow-xl backdrop-blur-md animate-in slide-in-from-top-3 duration-200 select-none">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>Offline Mode — All saved chats and outputs are available locally</span>
    </div>
  );
};
