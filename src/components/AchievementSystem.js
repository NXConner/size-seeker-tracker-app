"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const canvas_confetti_1 = __importDefault(require("canvas-confetti"));
const AchievementSystem = () => {
    const [achievements, setAchievements] = (0, react_1.useState)([
        {
            id: 'first-measurement',
            title: 'First Steps',
            description: 'Complete your first measurement',
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-5 w-5" }),
            category: 'measurement',
            progress: 1,
            maxProgress: 1,
            unlocked: true,
            unlockedDate: new Date().toISOString(),
            rarity: 'common',
            points: 10
        },
        {
            id: 'week-streak',
            title: 'Week Warrior',
            description: 'Track measurements for 7 consecutive days',
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-5 w-5" }),
            category: 'consistency',
            progress: 3,
            maxProgress: 7,
            unlocked: false,
            rarity: 'rare',
            points: 25
        },
        {
            id: 'progress-milestone',
            title: 'Progress Pioneer',
            description: 'Achieve 10% growth in measurements',
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-5 w-5" }),
            category: 'milestone',
            progress: 5,
            maxProgress: 10,
            unlocked: false,
            rarity: 'epic',
            points: 50
        },
        {
            id: 'community-contributor',
            title: 'Community Champion',
            description: 'Share 5 posts in the community',
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-5 w-5" }),
            category: 'community',
            progress: 2,
            maxProgress: 5,
            unlocked: false,
            rarity: 'legendary',
            points: 100
        }
    ]);
    const [showConfetti, setShowConfetti] = (0, react_1.useState)(false);
    const [totalPoints, setTotalPoints] = (0, react_1.useState)(10);
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return 'bg-gray-500';
            case 'rare': return 'bg-blue-500';
            case 'epic': return 'bg-purple-500';
            case 'legendary': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };
    const getRarityText = (rarity) => {
        switch (rarity) {
            case 'common': return 'Common';
            case 'rare': return 'Rare';
            case 'epic': return 'Epic';
            case 'legendary': return 'Legendary';
            default: return 'Common';
        }
    };
    const triggerConfetti = () => {
        (0, canvas_confetti_1.default)({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };
    const unlockAchievement = (achievementId) => {
        setAchievements(prev => prev.map(achievement => {
            if (achievement.id === achievementId && !achievement.unlocked) {
                triggerConfetti();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                return {
                    ...achievement,
                    unlocked: true,
                    unlockedDate: new Date().toISOString(),
                    progress: achievement.maxProgress
                };
            }
            return achievement;
        }));
    };
    const getProgressPercentage = (achievement) => {
        return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
    };
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trophy, { className: "h-6 w-6 text-yellow-500" }), (0, jsx_runtime_1.jsx)("span", { children: "Achievements" })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-4 text-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-green-600", children: totalPoints }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Total Points" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-blue-600", children: unlockedAchievements.length }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Unlocked" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-purple-600", children: achievements.length }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Total" })] })] }) })] }), unlockedAchievements.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-5 w-5 text-yellow-500" }), (0, jsx_runtime_1.jsx)("span", { children: "Unlocked Achievements" })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: unlockedAchievements.map((achievement, index) => ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, children: (0, jsx_runtime_1.jsx)(card_1.Card, { className: "border-2 border-green-200 bg-green-50/50", children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: `p-2 rounded-lg ${getRarityColor(achievement.rarity)} text-white`, animate: { rotate: [0, 10, -10, 0] }, transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }, children: achievement.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: achievement.title }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: getRarityColor(achievement.rarity), children: getRarityText(achievement.rarity) })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mb-2", children: achievement.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["+", achievement.points, " points"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Unlocked ", achievement.unlockedDate ? new Date(achievement.unlockedDate).toLocaleDateString() : ''] })] })] })] }) }) }) }, achievement.id))) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-5 w-5 text-gray-500" }), (0, jsx_runtime_1.jsx)("span", { children: "Available Achievements" })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: lockedAchievements.map((achievement, index) => ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, children: (0, jsx_runtime_1.jsx)(card_1.Card, { className: "opacity-75 hover:opacity-100 transition-opacity", children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `p-2 rounded-lg ${getRarityColor(achievement.rarity)} text-white opacity-50`, children: achievement.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold text-gray-600", children: achievement.title }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: getRarityColor(achievement.rarity), children: getRarityText(achievement.rarity) })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-2", children: achievement.description }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(progress_1.Progress, { value: getProgressPercentage(achievement), className: "h-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: [achievement.progress, "/", achievement.maxProgress] }), (0, jsx_runtime_1.jsxs)("span", { children: ["+", achievement.points, " points"] })] })] })] })] }) }) }) }, achievement.id))) })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: showConfetti && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "fixed inset-0 pointer-events-none z-50 flex items-center justify-center", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "text-center", initial: { scale: 0 }, animate: { scale: 1 }, exit: { scale: 0 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Award, { className: "h-16 w-16 text-yellow-500 mx-auto mb-2" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg font-bold text-white bg-black/50 px-4 py-2 rounded-lg", children: "Achievement Unlocked!" })] }) })) })] }));
};
exports.default = AchievementSystem;
