import React, { useState, useEffect, useRef } from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(false);
  const prevOnlineRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Trigger display for 1 second when the user goes offline
    if (!isOnline && (prevOnlineRef.current === true || prevOnlineRef.current === null)) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 1000);
      prevOnlineRef.current = false;
      return () => clearTimeout(timer);
    } else if (isOnline) {
      setShow(false);
    }

    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-600/95 dark:bg-amber-700/95 text-white text-xs font-medium shadow-xl backdrop-blur-md select-none transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>Offline Mode — All saved chats and outputs are available locally</span>
    </div>
  );
};
