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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const toaster_1 = require("@/components/ui/toaster");
const sonner_1 = require("@/components/ui/sonner");
const tooltip_1 = require("@/components/ui/tooltip");
const react_query_1 = require("@tanstack/react-query");
const react_router_dom_1 = require("react-router-dom");
const ThemeContext_1 = require("./contexts/ThemeContext");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const skeleton_1 = require("@/components/ui/skeleton");
const PWAInstallPrompt_1 = __importDefault(require("@/components/PWAInstallPrompt"));
const OfflineIndicator_1 = __importDefault(require("@/components/OfflineIndicator"));
require("./App.css");
// Lazy load components for better performance
const Index = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/Index"))));
const NotFound = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./pages/NotFound"))));
// Create a stable QueryClient instance
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
// Loading component for Suspense fallback
const LoadingFallback = () => ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center min-h-screen", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 w-full max-w-md", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-3/4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-1/2" })] }) }));
const ThemeToggle = react_1.default.memo(() => {
    const { isDark, toggleTheme } = (0, ThemeContext_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(button_1.Button, { onClick: toggleTheme, variant: "outline", size: "icon", className: "fixed top-4 right-4 z-50", "aria-label": "Toggle theme", children: isDark ? (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "h-4 w-4" }) }));
});
ThemeToggle.displayName = 'ThemeToggle';
const AppContent = react_1.default.memo(() => {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ThemeToggle, {}), (0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: queryClient, children: (0, jsx_runtime_1.jsxs)(tooltip_1.TooltipProvider, { children: [(0, jsx_runtime_1.jsx)(toaster_1.Toaster, {}), (0, jsx_runtime_1.jsx)(sonner_1.Toaster, {}), (0, jsx_runtime_1.jsx)(OfflineIndicator_1.default, {}), (0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)(LoadingFallback, {}), children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Index, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(NotFound, {}) })] }) }) }), (0, jsx_runtime_1.jsx)(PWAInstallPrompt_1.default, {})] }) })] }));
});
AppContent.displayName = 'AppContent';
const App = () => {
    return ((0, jsx_runtime_1.jsx)(ThemeContext_1.ThemeProvider, { children: (0, jsx_runtime_1.jsx)(AppContent, {}) }));
};
exports.default = App;
