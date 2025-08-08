"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const switch_1 = require("@/components/ui/switch");
const select_1 = require("@/components/ui/select");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const dialog_1 = require("@/components/ui/dialog");
const use_toast_1 = require("@/hooks/use-toast");
const imageStorage_1 = require("@/utils/imageStorage");
const secureStorage_1 = require("@/utils/secureStorage");
const SmartNotifications = ({ onBack }) => {
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [settings, setSettings] = (0, react_1.useState)({
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
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [measurements, setMeasurements] = (0, react_1.useState)([]);
    const [goals, setGoals] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadData();
        loadSettings();
        generateSmartNotifications();
    }, []);
    const loadData = async () => {
        try {
            const storedMeasurements = await imageStorage_1.imageStorage.getAllImages();
            setMeasurements(storedMeasurements);
            const storedGoals = (await secureStorage_1.secureStorage.getItem('goals')) || [];
            setGoals(storedGoals);
        }
        catch (error) {
            console.error('Error loading data:', error);
        }
    };
    const loadSettings = async () => {
        const storedSettings = await secureStorage_1.secureStorage.getItem('notificationSettings');
        if (storedSettings) {
            setSettings({ ...settings, ...storedSettings });
        }
    };
    const saveSettings = (newSettings) => {
        setSettings(newSettings);
        secureStorage_1.secureStorage.setItem('notificationSettings', newSettings);
    };
    const generateSmartNotifications = (0, react_1.useCallback)(() => {
        const newNotifications = [];
        const now = new Date();
        const lastMeasurement = measurements[measurements.length - 1];
        // Check for measurement reminders
        if (lastMeasurement) {
            const daysSinceLastMeasurement = Math.ceil((now.getTime() - new Date(lastMeasurement.timestamp).getTime()) / (1000 * 60 * 60 * 24));
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
                }
                else if (daysUntilTarget <= 7 && progress < 50) {
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
    const markAsRead = (notificationId) => {
        setNotifications(prev => prev.map(notification => notification.id === notificationId
            ? { ...notification, read: true }
            : notification));
    };
    const deleteNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };
    const handleNotificationAction = (notification) => {
        markAsRead(notification.id);
        switch (notification.action?.type) {
            case 'measure':
                // Navigate to measurement tab
                (0, use_toast_1.toast)({
                    title: "Measurement",
                    description: "Opening measurement interface...",
                });
                break;
            case 'goal':
                // Navigate to goals
                (0, use_toast_1.toast)({
                    title: "Goals",
                    description: "Opening goals interface...",
                });
                break;
            case 'analysis':
                // Navigate to analysis
                (0, use_toast_1.toast)({
                    title: "Analysis",
                    description: "Opening analysis interface...",
                });
                break;
            case 'routine':
                // Navigate to routine
                (0, use_toast_1.toast)({
                    title: "Routine",
                    description: "Opening routine interface...",
                });
                break;
        }
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'reminder':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4" });
            case 'achievement':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4" });
            case 'goal':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4" });
            case 'trend':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4" });
            case 'recommendation':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-4 w-4" });
            case 'alert':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-4 w-4" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "h-4 w-4" });
        }
    };
    const getPriorityColor = (priority) => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [onBack && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onBack, size: "sm", children: "\u2190 Back" })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-6 w-6" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Smart Notifications" }), unreadCount > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "destructive", className: "ml-2", children: unreadCount }))] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setShowSettings(true), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Settings" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: notifications.length === 0 ? ((0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "flex flex-col items-center justify-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-12 w-12 text-gray-400 mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Notifications" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center", children: "You're all caught up! Smart notifications will appear here based on your progress and goals." })] }) })) : (notifications.map(notification => ((0, jsx_runtime_1.jsx)(card_1.Card, { className: `transition-all duration-200 ${notification.read ? 'opacity-75' : 'border-l-4 border-l-blue-500'}`, children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-3 flex-1", children: [(0, jsx_runtime_1.jsx)("div", { className: `p-2 rounded-full ${getPriorityColor(notification.priority)}`, children: getNotificationIcon(notification.type) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-900", children: notification.title }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-xs", children: notification.priority })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm mb-2", children: notification.message }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: [notification.timestamp.toLocaleDateString(), " at", ' ', notification.timestamp.toLocaleTimeString()] }), notification.action && ((0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "outline", onClick: () => handleNotificationAction(notification), children: notification.action.label }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [!notification.read && ((0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "ghost", onClick: () => markAsRead(notification.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4" }) })), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "ghost", onClick: () => deleteNotification(notification.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })] }) }) }, notification.id)))) }), (0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: showSettings, onOpenChange: setShowSettings, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "max-w-md", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Notification Settings" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "notifications-enabled", children: "Enable Notifications" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "notifications-enabled", checked: settings.enabled, onCheckedChange: (checked) => saveSettings({ ...settings, enabled: checked }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Reminders" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.reminders, onCheckedChange: (checked) => saveSettings({ ...settings, reminders: checked }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Achievements" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.achievements, onCheckedChange: (checked) => saveSettings({ ...settings, achievements: checked }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Goals" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.goals, onCheckedChange: (checked) => saveSettings({ ...settings, goals: checked }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Trends" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.trends, onCheckedChange: (checked) => saveSettings({ ...settings, trends: checked }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Recommendations" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.recommendations, onCheckedChange: (checked) => saveSettings({ ...settings, recommendations: checked }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Quiet Hours" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.quietHours.enabled, onCheckedChange: (checked) => saveSettings({
                                                        ...settings,
                                                        quietHours: { ...settings.quietHours, enabled: checked }
                                                    }) })] }), settings.quietHours.enabled && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "quiet-start", children: "Start Time" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "quiet-start", type: "time", value: settings.quietHours.start, onChange: (e) => saveSettings({
                                                                ...settings,
                                                                quietHours: { ...settings.quietHours, start: e.target.value }
                                                            }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "quiet-end", children: "End Time" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "quiet-end", type: "time", value: settings.quietHours.end, onChange: (e) => saveSettings({
                                                                ...settings,
                                                                quietHours: { ...settings.quietHours, end: e.target.value }
                                                            }) })] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "frequency", children: "Notification Frequency" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: settings.frequency, onValueChange: (value) => saveSettings({ ...settings, frequency: value }), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "immediate", children: "Immediate" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "daily", children: "Daily Summary" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "weekly", children: "Weekly Summary" })] })] })] })] })] }) })] }));
};
exports.default = SmartNotifications;
