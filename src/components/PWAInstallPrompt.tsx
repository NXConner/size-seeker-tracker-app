import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';

const PWAInstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, installApp } = usePWA();

  if (isInstalled || !canInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <h3 className="font-semibold">Install App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Install Size Seeker Tracker for a faster, more reliable experience.
            </p>
          </div>
          <Button onClick={installApp}>Install</Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt; 