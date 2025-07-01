import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Palette, Volume2, Bell, Database, Download, Upload, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { secureStorage } from '@/utils/secureStorage';
import { imageStorage } from '@/utils/imageStorage';

interface AdvancedSettingsProps {
  onBack: () => void;
}

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  soundVolume: number;
  customSoundFile: string | null;
  notifications: {
    enabled: boolean;
    sessionReminders: boolean;
    progressAlerts: boolean;
    restDayReminders: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  performance: {
    backgroundTimer: boolean;
    autoSave: boolean;
    dataCompression: boolean;
  };
  display: {
    showTimer: boolean;
    showProgress: boolean;
    showStats: boolean;
    compactMode: boolean;
  };
}

const defaultSettings: Settings = {
  theme: 'auto',
  soundEnabled: true,
  soundVolume: 70,
  customSoundFile: null,
  notifications: {
    enabled: true,
    sessionReminders: true,
    progressAlerts: true,
    restDayReminders: false,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    crashReports: false,
  },
  performance: {
    backgroundTimer: false,
    autoSave: true,
    dataCompression: true,
  },
  display: {
    showTimer: true,
    showProgress: true,
    showStats: true,
    compactMode: false,
  },
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdvancedSettings Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function AdvancedSettings({ onBack }: AdvancedSettingsProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState(() => {
    try {
      return secureStorage.getStorageInfo();
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setHasError(true);
      setErrorMessage('Failed to load settings from storage');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Update Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateNestedSetting = <K extends keyof Settings, N extends keyof Settings[K]>(
    key: K,
    nestedKey: N,
    value: Settings[K][N]
  ) => {
    try {
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], [nestedKey]: value }
      }));
    } catch (error) {
      console.error('Error updating nested setting:', error);
      toast({
        title: "Update Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          updateSetting('customSoundFile', result);
          toast({
            title: "Custom Sound Uploaded",
            description: "Your custom sound has been saved.",
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    try {
      const exportData = {
        settings,
        routines: JSON.parse(localStorage.getItem('pumpingRoutines') || '[]'),
        sessions: JSON.parse(localStorage.getItem('pumpingSessions') || '[]'),
        measurements: JSON.parse(localStorage.getItem('measurements') || '[]'),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `size-seeker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            
            if (importedData.settings) {
              setSettings(importedData.settings);
            }
            if (importedData.routines) {
              localStorage.setItem('pumpingRoutines', JSON.stringify(importedData.routines));
            }
            if (importedData.sessions) {
              localStorage.setItem('pumpingSessions', JSON.stringify(importedData.sessions));
            }
            if (importedData.measurements) {
              localStorage.setItem('measurements', JSON.stringify(importedData.measurements));
            }

            toast({
              title: "Data Imported",
              description: "Your data has been imported successfully.",
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid file format. Please check your export file.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Error",
        description: "Failed to import data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetAllData = () => {
    try {
      localStorage.clear();
      setSettings(defaultSettings);
      toast({
        title: "Data Reset",
        description: "All data has been reset to default settings.",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Reset Error",
        description: "Failed to reset data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearSessions = () => {
    try {
      localStorage.removeItem('pumpingSessions');
      toast({
        title: "Sessions Cleared",
        description: "All session data has been removed.",
      });
    } catch (error) {
      console.error('Error clearing sessions:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear sessions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearMeasurements = () => {
    try {
      localStorage.removeItem('measurements');
      toast({
        title: "Measurements Cleared",
        description: "All measurement data has been removed.",
      });
    } catch (error) {
      console.error('Error clearing measurements:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear measurements. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      try {
        secureStorage.clear();
        localStorage.clear();
        await imageStorage.clearAll();
        setStorageInfo(secureStorage.getStorageInfo());
        toast({
          title: "Data Cleared",
          description: "All stored measurements, images, and settings have been removed.",
        });
      } catch (error) {
        console.error('Error clearing data:', error);
        toast({
          title: "Clear Error",
          description: "Some data may not have been cleared. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const refreshStorageInfo = () => {
    try {
      setStorageInfo(secureStorage.getStorageInfo());
    } catch (error) {
      console.error('Error refreshing storage info:', error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh storage information.",
        variant: "destructive"
      });
    }
  };

  // Error fallback UI
  if (hasError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Settings</h2>
          <div></div>
        </div>
        
        <Card className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-16 w-16 mx-auto text-red-500" />
            <h3 className="text-lg font-semibold text-red-800">Settings Error</h3>
            <p className="text-gray-600">{errorMessage}</p>
            <Button 
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
                window.location.reload();
              }}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h2 className="text-2xl font-bold text-gray-800">Advanced Settings</h2>
            <div></div>
          </div>
          
          <Card className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-16 w-16 mx-auto text-red-500" />
              <h3 className="text-lg font-semibold text-red-800">Component Error</h3>
              <p className="text-gray-600">Something went wrong loading the settings. Please try refreshing the page.</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Settings</h2>
          <div></div>
        </div>

        <style>{`.storage-bar-width { width: ${storageInfo.percentage}%; }`}</style>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Theme Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value as 'light' | 'dark' | 'auto')} title="Theme">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Display Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-timer">Show Timer</Label>
                        <Switch
                          id="show-timer"
                          checked={settings.display.showTimer}
                          onCheckedChange={(checked) => updateNestedSetting('display', 'showTimer', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-progress">Show Progress</Label>
                        <Switch
                          id="show-progress"
                          checked={settings.display.showProgress}
                          onCheckedChange={(checked) => updateNestedSetting('display', 'showProgress', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-stats">Show Statistics</Label>
                        <Switch
                          id="show-stats"
                          checked={settings.display.showStats}
                          onCheckedChange={(checked) => updateNestedSetting('display', 'showStats', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compact-mode">Compact Mode</Label>
                        <Switch
                          id="compact-mode"
                          checked={settings.display.compactMode}
                          onCheckedChange={(checked) => updateNestedSetting('display', 'compactMode', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sound">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5" />
                  <span>Sound Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled">Enable Sounds</Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>

                {settings.soundEnabled && (
                  <>
                    <div>
                      <Label>Volume</Label>
                      <Slider
                        value={[settings.soundVolume]}
                        onValueChange={([value]) => updateSetting('soundVolume', value)}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-600 mt-1">{settings.soundVolume}%</p>
                    </div>

                    <div>
                      <Label>Custom Sound</Label>
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="mt-1"
                      />
                      {settings.customSoundFile && (
                        <p className="text-sm text-green-600 mt-1">Custom sound uploaded</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                  <Switch
                    id="notifications-enabled"
                    checked={settings.notifications.enabled}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'enabled', checked)}
                  />
                </div>

                {settings.notifications.enabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="session-reminders">Session Reminders</Label>
                      <Switch
                        id="session-reminders"
                        checked={settings.notifications.sessionReminders}
                        onCheckedChange={(checked) => updateNestedSetting('notifications', 'sessionReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="progress-alerts">Progress Alerts</Label>
                      <Switch
                        id="progress-alerts"
                        checked={settings.notifications.progressAlerts}
                        onCheckedChange={(checked) => updateNestedSetting('notifications', 'progressAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rest-day-reminders">Rest Day Reminders</Label>
                      <Switch
                        id="rest-day-reminders"
                        checked={settings.notifications.restDayReminders}
                        onCheckedChange={(checked) => updateNestedSetting('notifications', 'restDayReminders', checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <Switch
                    id="data-collection"
                    checked={settings.privacy.dataCollection}
                    onCheckedChange={(checked) => updateNestedSetting('privacy', 'dataCollection', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics">Analytics</Label>
                  <Switch
                    id="analytics"
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => updateNestedSetting('privacy', 'analytics', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="crash-reports">Crash Reports</Label>
                  <Switch
                    id="crash-reports"
                    checked={settings.privacy.crashReports}
                    onCheckedChange={(checked) => updateNestedSetting('privacy', 'crashReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Performance Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="background-timer">Background Timer</Label>
                  <Switch
                    id="background-timer"
                    checked={settings.performance.backgroundTimer}
                    onCheckedChange={(checked) => updateNestedSetting('performance', 'backgroundTimer', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <Switch
                    id="auto-save"
                    checked={settings.performance.autoSave}
                    onCheckedChange={(checked) => updateNestedSetting('performance', 'autoSave', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-compression">Data Compression</Label>
                  <Switch
                    id="data-compression"
                    checked={settings.performance.dataCompression}
                    onCheckedChange={(checked) => updateNestedSetting('performance', 'dataCompression', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Data Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Storage Usage</h4>
                      <p className="text-sm text-gray-600">
                        Used: {storageInfo.used} MB / {storageInfo.total} MB
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full storage-bar-width"
                        ></div>
                      </div>
                      <Button 
                        onClick={refreshStorageInfo} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Refresh
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          onClick={clearSessions} 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          Clear Sessions
                        </Button>
                        <Button 
                          onClick={clearMeasurements} 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          Clear Measurements
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Export Data</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Export all your data including settings, routines, sessions, and measurements.
                          </p>
                          <Button onClick={exportData} className="w-full">
                            Export Now
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Import Data</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Import previously exported data. This will overwrite existing data.
                          </p>
                          <Input
                            type="file"
                            accept=".json"
                            onChange={importData}
                            className="mt-1"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset All Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset All Data</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-red-600">
                            This will permanently delete all your data including settings, routines, sessions, and measurements. This action cannot be undone.
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={clearAllData} 
                              variant="destructive" 
                              className="flex-1"
                            >
                              Confirm Reset
                            </Button>
                            <Button 
                              onClick={() => setIsResetDialogOpen(false)} 
                              variant="outline" 
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      onClick={resetAllData} 
                      variant="outline" 
                      className="w-full"
                    >
                      Reset Settings Only
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
} 