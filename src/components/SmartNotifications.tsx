import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Target, 
  Heart, 
  TrendingUp, 
  Settings, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'health' | 'progress' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  icon: React.ReactNode;
  category: string;
}

const SmartNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'reminder',
      title: 'Measurement Time',
      message: 'It\'s time for your weekly measurement tracking',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      icon: <Target className="h-4 w-4" />,
      category: 'schedule'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'Congratulations! You\'ve completed 7 days of tracking',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: <CheckCircle className="h-4 w-4" />,
      category: 'achievement'
    },
    {
      id: '3',
      type: 'health',
      title: 'Rest Day Reminder',
      message: 'Consider taking a rest day today for optimal recovery',
      priority: 'low',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: <Heart className="h-4 w-4" />,
      category: 'health'
    },
    {
      id: '4',
      type: 'progress',
      title: 'Progress Milestone',
      message: 'You\'ve achieved 5% growth in your measurements!',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      read: true,
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'progress'
    }
  ]);

  const [settings, setSettings] = useState({
    reminders: true,
    achievements: true,
    health: true,
    progress: true,
    system: false,
    sound: true,
    vibration: true
  });

  const [showSettings, setShowSettings] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-6 w-6 text-blue-500" />
              <span>Smart Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key}</span>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {urgentNotifications.map(notification => (
            <Card key={notification.id} className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800">{notification.title}</h4>
                    <p className="text-sm text-red-600">{notification.message}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* All Notifications */}
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${notification.read ? 'opacity-75' : 'border-l-4 border-l-blue-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)} text-white`}>
                    {notification.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={getPriorityColor(notification.priority)}
                      >
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                      
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h3>
            <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartNotifications; 