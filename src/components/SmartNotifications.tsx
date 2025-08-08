import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Settings, X, CheckCircle, AlertCircle, Info, TrendingUp, Target, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { imageStorage } from '@/utils/imageStorage';
import { secureStorage } from '@/utils/secureStorage';

interface SmartNotificationsProps {
  onBack?: () => void;
}

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'goal' | 'trend' | 'recommendation' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
  action?: {
    type: 'measure' | 'goal' | 'analysis' | 'routine';
    label: string;
  };
  data?: any;
}

interface NotificationSettings {
  enabled: boolean;
  reminders: boolean;
  achievements: boolean;
  goals: boolean;
  trends: boolean;
  recommendations: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminders: true,
    achievements: true,
    goals: true,
    trends: true,
    recommendations: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'daily'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadSettings();
    generateSmartNotifications();
  }, []);

  const loadData = async () => {
    try {
      const storedMeasurements = await imageStorage.getAllImages();
      setMeasurements(storedMeasurements);
      
      const storedGoals = (await secureStorage.getItem<any[]>('goals')) || [];
      setGoals(storedGoals);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSettings = async () => {
    const storedSettings = await secureStorage.getItem<NotificationSettings>('notificationSettings');
    if (storedSettings) {
      setSettings({ ...settings, ...storedSettings });
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    secureStorage.setItem('notificationSettings', newSettings);
  };

  const generateSmartNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const lastMeasurement = measurements[measurements.length - 1];
    
    // Check for measurement reminders
    if (lastMeasurement) {
      const daysSinceLastMeasurement = Math.ceil(
        (now.getTime() - new Date(lastMeasurement.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastMeasurement >= 7 && settings.reminders) {
        newNotifications.push({
          id: `reminder-${Date.now()}`,
          type: 'reminder',
          title: 'Time for a Measurement',
          message: `It's been ${daysSinceLastMeasurement} days since your last measurement. Regular tracking helps monitor progress.`,
          priority: 'medium',
          timestamp: now,
          read: false,
          action: {
            type: 'measure',
            label: 'Take Measurement'
          }
        });
      }
    }

    // Check for goal progress
    goals.forEach(goal => {
      if (goal.status === 'active' && settings.goals) {
        const progress = (goal.currentValue / goal.targetValue) * 100;
        const targetDate = new Date(goal.targetDate);
        const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (progress >= 80 && daysUntilTarget > 7) {
          newNotifications.push({
            id: `goal-progress-${goal.id}`,
            type: 'goal',
            title: 'Goal Progress Update',
            message: `You're ${progress.toFixed(1)}% to your ${goal.type} goal! Keep up the great work.`,
            priority: 'high',
            timestamp: now,
            read: false,
            action: {
              type: 'goal',
              label: 'View Goals'
            },
            data: { goalId: goal.id }
          });
        } else if (daysUntilTarget <= 7 && progress < 50) {
          newNotifications.push({
            id: `goal-urgent-${goal.id}`,
            type: 'alert',
            title: 'Goal Deadline Approaching',
            message: `Your ${goal.type} goal deadline is in ${daysUntilTarget} days. Current progress: ${progress.toFixed(1)}%`,
            priority: 'high',
            timestamp: now,
            read: false,
            action: {
              type: 'goal',
              label: 'Review Goal'
            },
            data: { goalId: goal.id }
          });
        }
      }
    });

    // Generate trend-based recommendations
    if (measurements.length >= 3 && settings.trends) {
      const recentMeasurements = measurements.slice(-3);
      const lengthTrend = recentMeasurements.map(m => m.measurements?.length || 0);
      const girthTrend = recentMeasurements.map(m => m.measurements?.girth || 0);
      
      // Check for plateau
      const lengthVariation = Math.max(...lengthTrend) - Math.min(...lengthTrend);
      const girthVariation = Math.max(...girthTrend) - Math.min(...girthTrend);
      
      if (lengthVariation < 0.1 && girthVariation < 0.1) {
        newNotifications.push({
          id: `plateau-${Date.now()}`,
          type: 'recommendation',
          title: 'Progress Plateau Detected',
          message: 'Your measurements have been stable. Consider adjusting your routine or consulting with a professional.',
          priority: 'medium',
          timestamp: now,
          read: false,
          action: {
            type: 'analysis',
            label: 'View Analysis'
          }
        });
      }
      
      // Check for positive trends
      if (lengthTrend[lengthTrend.length - 1] > lengthTrend[0] || girthTrend[girthTrend.length - 1] > girthTrend[0]) {
        newNotifications.push({
          id: `positive-trend-${Date.now()}`,
          type: 'trend',
          title: 'Positive Progress Trend',
          message: 'Great news! Your measurements show positive progress. Keep maintaining your routine.',
          priority: 'low',
          timestamp: now,
          read: false,
          action: {
            type: 'analysis',
            label: 'View Details'
          }
        });
      }
    }

    // Add new notifications
    setNotifications(prev => [...newNotifications, ...prev]);
  }, [measurements, goals, settings]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id);
    
    switch (notification.action?.type) {
      case 'measure':
        // Navigate to measurement tab
        toast({
          title: "Measurement",
          description: "Opening measurement interface...",
        });
        break;
      case 'goal':
        // Navigate to goals
        toast({
          title: "Goals",
          description: "Opening goals interface...",
        });
        break;
      case 'analysis':
        // Navigate to analysis
        toast({
          title: "Analysis",
          description: "Opening analysis interface...",
        });
        break;
      case 'routine':
        // Navigate to routine
        toast({
          title: "Routine",
          description: "Opening routine interface...",
        });
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Calendar className="h-4 w-4" />;
      case 'achievement':
        return <CheckCircle className="h-4 w-4" />;
      case 'goal':
        return <Target className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'recommendation':
        return <Zap className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} size="sm">
              ← Back
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Smart Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-500 text-center">
                You're all caught up! Smart notifications will appear here based on your progress and goals.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 ${
                notification.read ? 'opacity-75' : 'border-l-4 border-l-blue-500'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleDateString()} at{' '}
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                        {notification.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNotificationAction(notification)}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <Switch
                id="notifications-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, enabled: checked })
                }
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Reminders</Label>
                <Switch
                  checked={settings.reminders}
                  onCheckedChange={(checked) =>
                    saveSettings({ ...settings, reminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Achievements</Label>
                <Switch
                  checked={settings.achievements}
                  onCheckedChange={(checked) =>
                    saveSettings({ ...settings, achievements: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Goals</Label>
                <Switch
                  checked={settings.goals}
                  onCheckedChange={(checked) =>
                    saveSettings({ ...settings, goals: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Trends</Label>
                <Switch
                  checked={settings.trends}
                  onCheckedChange={(checked) =>
                    saveSettings({ ...settings, trends: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Recommendations</Label>
                <Switch
                  checked={settings.recommendations}
                  onCheckedChange={(checked) =>
                    saveSettings({ ...settings, recommendations: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quiet Hours</Label>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    saveSettings({
                      ...settings,
                      quietHours: { ...settings.quietHours, enabled: checked }
                    })
                  }
                />
              </div>
              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        saveSettings({
                          ...settings,
                          quietHours: { ...settings.quietHours, start: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) =>
                        saveSettings({
                          ...settings,
                          quietHours: { ...settings.quietHours, end: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="frequency">Notification Frequency</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value: 'immediate' | 'daily' | 'weekly') =>
                  saveSettings({ ...settings, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartNotifications;