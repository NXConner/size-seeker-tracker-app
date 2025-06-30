import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';

const PWAInstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, installApp } = usePWA();

  if (isInstalled || !canInstall) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg border-2 border-green-200">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Smartphone className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              Install Size Seeker Tracker
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add to home screen for quick access and offline use
            </p>
          </div>
          <div className="flex-shrink-0 flex space-x-2">
            <Button
              size="sm"
              onClick={installApp}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt; 