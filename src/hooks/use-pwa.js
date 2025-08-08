"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePWA = void 0;
const react_1 = require("react");
function usePWA() {
    const [isInstalled, setIsInstalled] = (0, react_1.useState)(false);
    const [canInstall, setCanInstall] = (0, react_1.useState)(false);
    const [deferredPrompt, setDeferredPrompt] = (0, react_1.useState)(null);
    const [isOnline, setIsOnline] = (0, react_1.useState)(typeof navigator !== 'undefined' ? navigator.onLine : true);
    (0, react_1.useEffect)(() => {
        // Disable service worker for development
        if (process.env.NODE_ENV === 'development') {
            console.log('PWA features disabled in development mode');
            // Still provide online status in dev
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }
        // Network status listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };
        // Listen for appinstalled event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setCanInstall(false);
            setDeferredPrompt(null);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    const installApp = async () => {
        if (!deferredPrompt)
            return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setCanInstall(false);
        }
        setDeferredPrompt(null);
    };
    return {
        isInstalled,
        canInstall,
        isOnline,
        installApp
    };
}
exports.usePWA = usePWA;
