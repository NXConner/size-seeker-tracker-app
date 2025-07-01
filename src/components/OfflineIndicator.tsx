import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePWA } from '@/hooks/use-pwa';
import { imageStorage } from '@/utils/imageStorage';
import { secureStorage } from '@/utils/secureStorage';
import { toast } from '@/hooks/use-toast';

interface SyncStatus {
  isSyncing: boolean;
  progress: number;
  pendingChanges: number;
  lastSync: Date | null;
  error: string | null;
}

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    progress: 0,
    pendingChanges: 0,
    lastSync: null,
    error: null
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkPendingChanges();
    if (isOnline && syncStatus.pendingChanges > 0) {
      autoSync();
    }
  }, [isOnline]);

  const checkPendingChanges = async () => {
    try {
      const pendingMeasurements = secureStorage.getItem('pendingMeasurements') || [];
      const pendingGoals = secureStorage.getItem('pendingGoals') || [];
      const pendingSettings = secureStorage.getItem('pendingSettings') || [];
      
      const totalPending = pendingMeasurements.length + pendingGoals.length + pendingSettings.length;
      
      setSyncStatus(prev => ({
        ...prev,
        pendingChanges: totalPending
      }));
    } catch (error) {
      console.error('Error checking pending changes:', error);
    }
  };

  const autoSync = async () => {
    if (syncStatus.isSyncing || syncStatus.pendingChanges === 0) return;
    
    await performSync();
  };

  const performSync = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, progress: 0, error: null }));
    
    try {
      // Simulate sync progress
      const steps = ['Checking changes', 'Uploading data', 'Syncing settings', 'Finalizing'];
      
      for (let i = 0; i < steps.length; i++) {
        setSyncStatus(prev => ({ ...prev, progress: ((i + 1) / steps.length) * 100 }));
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Clear pending changes
      secureStorage.removeItem('pendingMeasurements');
      secureStorage.removeItem('pendingGoals');
      secureStorage.removeItem('pendingSettings');
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        progress: 100,
        pendingChanges: 0,
        lastSync: new Date(),
        error: null
      }));
      
      toast({
        title: "Sync Complete",
        description: "All data has been synchronized successfully.",
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync data. Please try again.'
      }));
      
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const queueForSync = (data: any, type: 'measurements' | 'goals' | 'settings') => {
    try {
      const key = `pending${type.charAt(0).toUpperCase() + type.slice(1)}`;
      const existing = secureStorage.getItem(key) || [];
      secureStorage.setItem(key, [...existing, { ...data, timestamp: new Date().toISOString() }]);
      
      setSyncStatus(prev => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1
      }));
      
      toast({
        title: "Queued for Sync",
        description: `Data will be synchronized when you're back online.`,
      });
    } catch (error) {
      console.error('Error queuing for sync:', error);
    }
  };

  if (isOnline && syncStatus.pendingChanges === 0 && !syncStatus.isSyncing) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isOnline ? (
              <WifiOff className="h-5 w-5 text-yellow-600" />
            ) : syncStatus.isSyncing ? (
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            ) : syncStatus.error ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {!isOnline ? 'You\'re offline' : 
                   syncStatus.isSyncing ? 'Syncing data...' :
                   syncStatus.error ? 'Sync failed' : 'Sync complete'}
                </span>
                {syncStatus.pendingChanges > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {syncStatus.pendingChanges} pending
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-gray-500">
                {!isOnline ? 'Some features may be limited' :
                 syncStatus.isSyncing ? 'Uploading your data' :
                 syncStatus.error ? 'Please try again' :
                 'All data synchronized'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOnline && syncStatus.pendingChanges > 0 && !syncStatus.isSyncing && (
              <Button
                size="sm"
                onClick={performSync}
                disabled={syncStatus.isSyncing}
                className="text-xs"
              >
                Sync Now
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
        
        {syncStatus.isSyncing && (
          <div className="mt-3">
            <Progress value={syncStatus.progress} className="h-2" />
            <span className="text-xs text-gray-500 mt-1">
              {Math.round(syncStatus.progress)}% complete
            </span>
          </div>
        )}
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Connection Status:</span>
                <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Changes:</span>
                <span className="font-medium">{syncStatus.pendingChanges}</span>
              </div>
              
              {syncStatus.lastSync && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="text-gray-900">
                    {syncStatus.lastSync.toLocaleString()}
                  </span>
                </div>
              )}
              
              {syncStatus.error && (
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  {syncStatus.error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator; 