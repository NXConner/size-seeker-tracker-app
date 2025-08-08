"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const switch_1 = require("@/components/ui/switch");
const label_1 = require("@/components/ui/label");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const slider_1 = require("@/components/ui/slider");
const use_toast_1 = require("@/hooks/use-toast");
const dialog_1 = require("@/components/ui/dialog");
const secureStorage_1 = require("@/utils/secureStorage");
const imageStorage_1 = require("@/utils/imageStorage");
const defaultSettings = {
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
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('AdvancedSettings Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}
function AdvancedSettings({ onBack }) {
    const [settings, setSettings] = (0, react_1.useState)(defaultSettings);
    const [isExportDialogOpen, setIsExportDialogOpen] = (0, react_1.useState)(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = (0, react_1.useState)(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = (0, react_1.useState)(false);
    const [storageInfo, setStorageInfo] = (0, react_1.useState)(() => {
        try {
            return secureStorage_1.secureStorage.getStorageInfo();
        }
        catch (error) {
            console.error('Error getting storage info:', error);
            return { used: 0, total: 0, percentage: 0 };
        }
    });
    const [hasError, setHasError] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            }
        }
        catch (error) {
            console.error('Error loading settings:', error);
            setHasError(true);
            setErrorMessage('Failed to load settings from storage');
        }
    }, []);
    (0, react_1.useEffect)(() => {
        try {
            localStorage.setItem('appSettings', JSON.stringify(settings));
        }
        catch (error) {
            console.error('Error saving settings:', error);
            (0, use_toast_1.toast)({
                title: "Save Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive"
            });
        }
    }, [settings]);
    const updateSetting = (key, value) => {
        try {
            setSettings(prev => ({ ...prev, [key]: value }));
        }
        catch (error) {
            console.error('Error updating setting:', error);
            (0, use_toast_1.toast)({
                title: "Update Error",
                description: "Failed to update setting. Please try again.",
                variant: "destructive"
            });
        }
    };
    const updateNestedSetting = (key, nestedKey, value) => {
        try {
            setSettings(prev => ({
                ...prev,
                [key]: { ...prev[key], [nestedKey]: value }
            }));
        }
        catch (error) {
            console.error('Error updating nested setting:', error);
            (0, use_toast_1.toast)({
                title: "Update Error",
                description: "Failed to update setting. Please try again.",
                variant: "destructive"
            });
        }
    };
    const handleFileUpload = (event) => {
        try {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result;
                    updateSetting('customSoundFile', result);
                    (0, use_toast_1.toast)({
                        title: "Custom Sound Uploaded",
                        description: "Your custom sound has been saved.",
                    });
                };
                reader.readAsDataURL(file);
            }
        }
        catch (error) {
            console.error('Error uploading file:', error);
            (0, use_toast_1.toast)({
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
            (0, use_toast_1.toast)({
                title: "Data Exported",
                description: "Your data has been exported successfully.",
            });
        }
        catch (error) {
            console.error('Error exporting data:', error);
            (0, use_toast_1.toast)({
                title: "Export Error",
                description: "Failed to export data. Please try again.",
                variant: "destructive"
            });
        }
    };
    const importData = (event) => {
        try {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target?.result);
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
                        (0, use_toast_1.toast)({
                            title: "Data Imported",
                            description: "Your data has been imported successfully.",
                        });
                    }
                    catch (error) {
                        (0, use_toast_1.toast)({
                            title: "Import Failed",
                            description: "Invalid file format. Please check your export file.",
                            variant: "destructive",
                        });
                    }
                };
                reader.readAsText(file);
            }
        }
        catch (error) {
            console.error('Error importing data:', error);
            (0, use_toast_1.toast)({
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
            (0, use_toast_1.toast)({
                title: "Data Reset",
                description: "All data has been reset to default settings.",
            });
        }
        catch (error) {
            console.error('Error resetting data:', error);
            (0, use_toast_1.toast)({
                title: "Reset Error",
                description: "Failed to reset data. Please try again.",
                variant: "destructive"
            });
        }
    };
    const clearSessions = () => {
        try {
            localStorage.removeItem('pumpingSessions');
            (0, use_toast_1.toast)({
                title: "Sessions Cleared",
                description: "All session data has been removed.",
            });
        }
        catch (error) {
            console.error('Error clearing sessions:', error);
            (0, use_toast_1.toast)({
                title: "Clear Error",
                description: "Failed to clear sessions. Please try again.",
                variant: "destructive"
            });
        }
    };
    const clearMeasurements = () => {
        try {
            localStorage.removeItem('measurements');
            (0, use_toast_1.toast)({
                title: "Measurements Cleared",
                description: "All measurement data has been removed.",
            });
        }
        catch (error) {
            console.error('Error clearing measurements:', error);
            (0, use_toast_1.toast)({
                title: "Clear Error",
                description: "Failed to clear measurements. Please try again.",
                variant: "destructive"
            });
        }
    };
    const clearAllData = async () => {
        if (window.confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
            try {
                secureStorage_1.secureStorage.clear();
                localStorage.clear();
                await imageStorage_1.imageStorage.clearAll();
                setStorageInfo(secureStorage_1.secureStorage.getStorageInfo());
                (0, use_toast_1.toast)({
                    title: "Data Cleared",
                    description: "All stored measurements, images, and settings have been removed.",
                });
            }
            catch (error) {
                console.error('Error clearing data:', error);
                (0, use_toast_1.toast)({
                    title: "Clear Error",
                    description: "Some data may not have been cleared. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };
    const refreshStorageInfo = () => {
        try {
            setStorageInfo(secureStorage_1.secureStorage.getStorageInfo());
        }
        catch (error) {
            console.error('Error refreshing storage info:', error);
            (0, use_toast_1.toast)({
                title: "Refresh Error",
                description: "Failed to refresh storage information.",
                variant: "destructive"
            });
        }
    };
    // Error fallback UI
    if (hasError) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Advanced Settings" }), (0, jsx_runtime_1.jsx)("div", {})] }), (0, jsx_runtime_1.jsx)(card_1.Card, { className: "p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center space-y-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-16 w-16 mx-auto text-red-500" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-red-800", children: "Settings Error" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: errorMessage }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => {
                                    setHasError(false);
                                    setErrorMessage('');
                                    window.location.reload();
                                }, variant: "outline", children: "Retry" })] }) })] }));
    }
    return ((0, jsx_runtime_1.jsx)(ErrorBoundary, { fallback: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Advanced Settings" }), (0, jsx_runtime_1.jsx)("div", {})] }), (0, jsx_runtime_1.jsx)(card_1.Card, { className: "p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center space-y-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-16 w-16 mx-auto text-red-500" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-red-800", children: "Component Error" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Something went wrong loading the settings. Please try refreshing the page." }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => window.location.reload(), variant: "outline", children: "Refresh Page" })] }) })] }), children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Advanced Settings" }), (0, jsx_runtime_1.jsx)("div", {})] }), (0, jsx_runtime_1.jsx)("style", { children: `.storage-bar-width { width: ${storageInfo.percentage}%; }` }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: "appearance", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid grid-cols-6 w-full", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "appearance", children: "Appearance" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "sound", children: "Sound" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "notifications", children: "Notifications" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "privacy", children: "Privacy" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "performance", children: "Performance" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "data", children: "Data" })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "appearance", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Palette, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Theme Settings" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Theme" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: settings.theme, onValueChange: (value) => updateSetting('theme', value), title: "Theme", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "light", children: "Light" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "dark", children: "Dark" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "auto", children: "Auto (System)" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Display Options" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "show-timer", children: "Show Timer" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "show-timer", checked: settings.display.showTimer, onCheckedChange: (checked) => updateNestedSetting('display', 'showTimer', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "show-progress", children: "Show Progress" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "show-progress", checked: settings.display.showProgress, onCheckedChange: (checked) => updateNestedSetting('display', 'showProgress', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "show-stats", children: "Show Statistics" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "show-stats", checked: settings.display.showStats, onCheckedChange: (checked) => updateNestedSetting('display', 'showStats', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "compact-mode", children: "Compact Mode" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "compact-mode", checked: settings.display.compactMode, onCheckedChange: (checked) => updateNestedSetting('display', 'compactMode', checked) })] })] })] })] })] }) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "sound", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Volume2, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Sound Settings" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "sound-enabled", children: "Enable Sounds" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "sound-enabled", checked: settings.soundEnabled, onCheckedChange: (checked) => updateSetting('soundEnabled', checked) })] }), settings.soundEnabled && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Volume" }), (0, jsx_runtime_1.jsx)(slider_1.Slider, { value: [settings.soundVolume], onValueChange: ([value]) => updateSetting('soundVolume', value), max: 100, step: 1, className: "mt-2" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 mt-1", children: [settings.soundVolume, "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Custom Sound" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "file", accept: "audio/*", onChange: handleFileUpload, className: "mt-1" }), settings.customSoundFile && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-600 mt-1", children: "Custom sound uploaded" }))] })] }))] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "notifications", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Notification Settings" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "notifications-enabled", children: "Enable Notifications" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "notifications-enabled", checked: settings.notifications.enabled, onCheckedChange: (checked) => updateNestedSetting('notifications', 'enabled', checked) })] }), settings.notifications.enabled && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "session-reminders", children: "Session Reminders" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "session-reminders", checked: settings.notifications.sessionReminders, onCheckedChange: (checked) => updateNestedSetting('notifications', 'sessionReminders', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "progress-alerts", children: "Progress Alerts" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "progress-alerts", checked: settings.notifications.progressAlerts, onCheckedChange: (checked) => updateNestedSetting('notifications', 'progressAlerts', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "rest-day-reminders", children: "Rest Day Reminders" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "rest-day-reminders", checked: settings.notifications.restDayReminders, onCheckedChange: (checked) => updateNestedSetting('notifications', 'restDayReminders', checked) })] })] }))] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "privacy", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Privacy Settings" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "data-collection", children: "Data Collection" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "data-collection", checked: settings.privacy.dataCollection, onCheckedChange: (checked) => updateNestedSetting('privacy', 'dataCollection', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "analytics", children: "Analytics" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "analytics", checked: settings.privacy.analytics, onCheckedChange: (checked) => updateNestedSetting('privacy', 'analytics', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "crash-reports", children: "Crash Reports" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "crash-reports", checked: settings.privacy.crashReports, onCheckedChange: (checked) => updateNestedSetting('privacy', 'crashReports', checked) })] })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "performance", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Performance Settings" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "background-timer", children: "Background Timer" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "background-timer", checked: settings.performance.backgroundTimer, onCheckedChange: (checked) => updateNestedSetting('performance', 'backgroundTimer', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "auto-save", children: "Auto Save" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "auto-save", checked: settings.performance.autoSave, onCheckedChange: (checked) => updateNestedSetting('performance', 'autoSave', checked) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "data-compression", children: "Data Compression" }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "data-compression", checked: settings.performance.dataCompression, onCheckedChange: (checked) => updateNestedSetting('performance', 'dataCompression', checked) })] })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "data", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Data Management" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Storage Usage" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: ["Used: ", storageInfo.used, " MB / ", storageInfo.total, " MB"] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-2 mt-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-600 h-2 rounded-full storage-bar-width" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: refreshStorageInfo, variant: "outline", size: "sm", className: "mt-2", children: "Refresh" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 border rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Quick Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: clearSessions, variant: "outline", size: "sm", className: "w-full", children: "Clear Sessions" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: clearMeasurements, variant: "outline", size: "sm", className: "w-full", children: "Clear Measurements" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)(dialog_1.Dialog, { open: isExportDialogOpen, onOpenChange: setIsExportDialogOpen, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }), "Export Data"] }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Export Data" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Export all your data including settings, routines, sessions, and measurements." }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: exportData, className: "w-full", children: "Export Now" })] })] })] }), (0, jsx_runtime_1.jsxs)(dialog_1.Dialog, { open: isImportDialogOpen, onOpenChange: setIsImportDialogOpen, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }), "Import Data"] }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Import Data" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Import previously exported data. This will overwrite existing data." }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "file", accept: ".json", onChange: importData, className: "mt-1" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)(dialog_1.Dialog, { open: isResetDialogOpen, onOpenChange: setIsResetDialogOpen, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "destructive", className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Reset All Data"] }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Reset All Data" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600", children: "This will permanently delete all your data including settings, routines, sessions, and measurements. This action cannot be undone." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: clearAllData, variant: "destructive", className: "flex-1", children: "Confirm Reset" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => setIsResetDialogOpen(false), variant: "outline", className: "flex-1", children: "Cancel" })] })] })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: resetAllData, variant: "outline", className: "w-full", children: "Reset Settings Only" })] })] })] }) }) })] })] }) }));
}
exports.default = AdvancedSettings;
