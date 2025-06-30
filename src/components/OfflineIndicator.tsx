import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            You're offline
          </span>
          <span className="text-xs text-yellow-600">
            Some features may be limited
          </span>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator; 