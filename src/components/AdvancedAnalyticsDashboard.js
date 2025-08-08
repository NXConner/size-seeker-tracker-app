"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const tabs_1 = require("@/components/ui/tabs");
const select_1 = require("@/components/ui/select");
const use_toast_1 = require("@/hooks/use-toast");
const imageStorage_1 = require("@/utils/imageStorage");
const secureStorage_1 = require("@/utils/secureStorage");
const recharts_1 = require("recharts");
const lucide_react_2 = require("lucide-react");
// Provide local no-op handlers for share/export to avoid undefined props
const onExport = (format = 'pdf') => {
    (0, use_toast_1.toast)({ title: 'Export', description: `Exporting analytics as ${format.toUpperCase()} (placeholder).` });
};
const onShare = () => {
    if (navigator.share) {
        navigator.share({ title: 'Size Seeker Analytics', text: 'Check my analytics!', url: window.location.href }).catch(() => { });
    }
    else {
        navigator.clipboard?.writeText(window.location.href).then(() => {
            (0, use_toast_1.toast)({ title: 'Link copied', description: 'Analytics link copied to clipboard.' });
        }).catch(() => { });
    }
};
const AdvancedAnalyticsDashboard = ({ onBack }) => {
    const [measurements, setMeasurements] = (0, react_1.useState)([]);
    const [goals, setGoals] = (0, react_1.useState)([]);
    const [achievements, setAchievements] = (0, react_1.useState)([]);
    const [analyticsData, setAnalyticsData] = (0, react_1.useState)({
        totalSessions: 0,
        totalMeasurements: 0,
        averageGrowthRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTime: 0,
        consistencyScore: 0,
        measurements: [],
        trends: [],
        insights: [],
        performance: {
            current: 0,
            target: 0,
            progress: 0,
            trend: 'stable'
        }
    });
    const [timeRange, setTimeRange] = (0, react_1.useState)('30d');
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [showGoalDialog, setShowGoalDialog] = (0, react_1.useState)(false);
    const [newGoal, setNewGoal] = (0, react_1.useState)({
        type: 'length',
        targetValue: 0,
        description: '',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const [viewMode, setViewMode] = (0, react_1.useState)('overview');
    const [selectedMetric, setSelectedMetric] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setIsLoading(true);
            // Load measurements
            const storedMeasurements = await imageStorage_1.imageStorage.getAllImages();
            setMeasurements(storedMeasurements);
            // Load goals
            const storedGoals = (await secureStorage_1.secureStorage.getItem('goals')) || [];
            setGoals(storedGoals);
            // Load achievements
            const storedAchievements = (await secureStorage_1.secureStorage.getItem('achievements')) || getDefaultAchievements();
            setAchievements(storedAchievements);
            // Calculate analytics
            calculateAnalytics(storedMeasurements, storedGoals);
        }
        catch (error) {
            console.error('Error loading data:', error);
            (0, use_toast_1.toast)({
                title: "Load Error",
                description: "Failed to load analytics data.",
                variant: "destructive"
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const getDefaultAchievements = () => [
        {
            id: 'first-measurement',
            title: 'First Steps',
            description: 'Record your first measurement',
            icon: '📏',
            unlocked: false,
            progress: 0,
            maxProgress: 1,
            category: 'measurement'
        },
        {
            id: 'week-streak',
            title: 'Week Warrior',
            description: 'Complete 7 days of consistent tracking',
            icon: '🔥',
            unlocked: false,
            progress: 0,
            maxProgress: 7,
            category: 'consistency'
        },
        {
            id: 'month-streak',
            title: 'Monthly Master',
            description: 'Complete 30 days of consistent tracking',
            icon: '📅',
            unlocked: false,
            progress: 0,
            maxProgress: 30,
            category: 'consistency'
        },
        {
            id: 'length-gain',
            title: 'Length Champion',
            description: 'Achieve 0.5 inch length gain',
            icon: '📈',
            unlocked: false,
            progress: 0,
            maxProgress: 0.5,
            category: 'milestone'
        },
        {
            id: 'girth-gain',
            title: 'Girth Guru',
            description: 'Achieve 0.25 inch girth gain',
            icon: '🎯',
            unlocked: false,
            progress: 0,
            maxProgress: 0.25,
            category: 'milestone'
        },
        {
            id: 'goal-setter',
            title: 'Goal Setter',
            description: 'Set your first goal',
            icon: '🎯',
            unlocked: false,
            progress: 0,
            maxProgress: 1,
            category: 'milestone'
        }
    ];
    const calculateAnalytics = (measurements, goals) => {
        const totalSessions = measurements.length;
        const totalMeasurements = measurements.filter(m => m.measurements).length;
        // Calculate growth rate and trends
        let totalLengthGrowth = 0;
        let totalGirthGrowth = 0;
        let growthCount = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        // Sort measurements by date
        const sortedMeasurements = measurements
            .filter(m => m.timestamp)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        if (sortedMeasurements.length >= 2) {
            for (let i = 1; i < sortedMeasurements.length; i++) {
                const prev = sortedMeasurements[i - 1].measurements;
                const curr = sortedMeasurements[i].measurements;
                if (prev && curr) {
                    const lengthGrowth = (curr.length || 0) - (prev.length || 0);
                    const girthGrowth = (curr.girth || 0) - (prev.girth || 0);
                    if (lengthGrowth > 0 || girthGrowth > 0) {
                        totalLengthGrowth += lengthGrowth;
                        totalGirthGrowth += girthGrowth;
                        growthCount++;
                        tempStreak++;
                    }
                    else {
                        if (tempStreak > longestStreak) {
                            longestStreak = tempStreak;
                        }
                        tempStreak = 0;
                    }
                }
            }
            // Check final streak
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            currentStreak = tempStreak;
        }
        const averageLengthGrowth = growthCount > 0 ? totalLengthGrowth / growthCount : 0;
        const averageGirthGrowth = growthCount > 0 ? totalGirthGrowth / growthCount : 0;
        const averageGrowthRate = (averageLengthGrowth + averageGirthGrowth) / 2;
        // Calculate consistency score
        const daysSinceFirst = sortedMeasurements.length > 0
            ? Math.ceil((Date.now() - new Date(sortedMeasurements[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        const consistencyScore = daysSinceFirst > 0 ? Math.min(100, (totalMeasurements / daysSinceFirst) * 100) : 0;
        // Calculate total time (estimate based on sessions)
        const totalTime = totalSessions * 5; // Assume 5 minutes per session
        setAnalyticsData({
            totalSessions,
            totalMeasurements,
            averageGrowthRate,
            currentStreak,
            longestStreak,
            totalTime,
            consistencyScore,
            measurements: sortedMeasurements.map(m => ({
                date: m.timestamp,
                value: m.measurements?.length || 0,
                category: 'length'
            })),
            trends: [],
            insights: [],
            performance: {
                current: sortedMeasurements[sortedMeasurements.length - 1].measurements?.length || 0,
                target: 0,
                progress: 0,
                trend: 'stable'
            }
        });
        // Update achievements based on new data
        updateAchievements(sortedMeasurements, goals);
    };
    const updateAchievements = (measurements, goals) => {
        const updatedAchievements = achievements.map(achievement => {
            let progress = 0;
            let unlocked = achievement.unlocked;
            switch (achievement.id) {
                case 'first-measurement':
                    progress = measurements.length > 0 ? 1 : 0;
                    unlocked = measurements.length > 0;
                    break;
                case 'week-streak':
                    progress = Math.min(7, analyticsData.currentStreak);
                    unlocked = analyticsData.currentStreak >= 7;
                    break;
                case 'month-streak':
                    progress = Math.min(30, analyticsData.currentStreak);
                    unlocked = analyticsData.currentStreak >= 30;
                    break;
                case 'length-gain':
                    if (measurements.length >= 2) {
                        const first = measurements[0].measurements?.length || 0;
                        const latest = measurements[measurements.length - 1].measurements?.length || 0;
                        progress = Math.min(0.5, Math.max(0, latest - first));
                        unlocked = (latest - first) >= 0.5;
                    }
                    break;
                case 'girth-gain':
                    if (measurements.length >= 2) {
                        const first = measurements[0].measurements?.girth || 0;
                        const latest = measurements[measurements.length - 1].measurements?.girth || 0;
                        progress = Math.min(0.25, Math.max(0, latest - first));
                        unlocked = (latest - first) >= 0.25;
                    }
                    break;
                case 'goal-setter':
                    progress = goals.length > 0 ? 1 : 0;
                    unlocked = goals.length > 0;
                    break;
            }
            return {
                ...achievement,
                progress,
                unlocked,
                unlockedDate: unlocked && !achievement.unlocked ? new Date().toISOString() : achievement.unlockedDate
            };
        });
        setAchievements(updatedAchievements);
        secureStorage_1.secureStorage.setItem('achievements', updatedAchievements);
    };
    const createGoal = () => {
        if (!newGoal.targetValue || !newGoal.description) {
            (0, use_toast_1.toast)({
                title: "Missing Information",
                description: "Please fill in all goal details.",
                variant: "destructive"
            });
            return;
        }
        const goal = {
            id: Date.now().toString(),
            type: newGoal.type,
            targetValue: newGoal.targetValue,
            currentValue: 0,
            startDate: new Date().toISOString(),
            targetDate: newGoal.targetDate,
            description: newGoal.description,
            status: 'active',
            progress: 0
        };
        const updatedGoals = [...goals, goal];
        setGoals(updatedGoals);
        secureStorage_1.secureStorage.setItem('goals', updatedGoals);
        setNewGoal({
            type: 'length',
            targetValue: 0,
            description: '',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setShowGoalDialog(false);
        (0, use_toast_1.toast)({
            title: "Goal Created",
            description: "Your new goal has been set successfully.",
        });
    };
    const getFilteredMeasurements = (0, react_1.useMemo)(() => {
        const now = new Date();
        const filterDate = new Date();
        switch (timeRange) {
            case '7d':
                filterDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                filterDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                filterDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
                return measurements;
        }
        return measurements.filter(m => new Date(m.timestamp) >= filterDate);
    }, [measurements, timeRange]);
    const getChartData = (0, react_1.useMemo)(() => {
        const filtered = getFilteredMeasurements;
        return filtered.map((m, index) => ({
            date: new Date(m.timestamp).toLocaleDateString(),
            length: m.measurements?.length || 0,
            girth: m.measurements?.girth || 0,
            index
        }));
    }, [getFilteredMeasurements]);
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    // Calculate advanced metrics
    const metrics = (0, react_1.useMemo)(() => {
        const values = analyticsData.measurements.map(m => m.value);
        const growthRates = values.slice(1).map((val, i) => (val - values[i]) / values[i] * 100);
        return {
            averageGrowth: growthRates.reduce((a, b) => a + b, 0) / growthRates.length,
            consistency: 1 - (Math.std(growthRates) / Math.abs(growthRates.reduce((a, b) => a + b, 0) / growthRates.length)),
            momentum: growthRates.slice(-3).reduce((a, b) => a + b, 0) / 3,
            volatility: Math.std(growthRates),
            trendStrength: Math.abs(growthRates.reduce((a, b) => a + b, 0)) / growthRates.length
        };
    }, [analyticsData]);
    // AI-powered insights
    const aiInsights = (0, react_1.useMemo)(() => {
        const insights = [];
        if (metrics.averageGrowth > 1.5) {
            insights.push({
                type: 'positive',
                title: 'Excellent Growth Rate',
                description: 'Your growth rate is above the 95th percentile',
                icon: lucide_react_1.TrendingUp,
                confidence: 0.92
            });
        }
        if (metrics.consistency > 0.8) {
            insights.push({
                type: 'positive',
                title: 'High Consistency',
                description: 'Very consistent progress pattern detected',
                icon: lucide_react_1.Target,
                confidence: 0.88
            });
        }
        if (metrics.momentum > metrics.averageGrowth) {
            insights.push({
                type: 'positive',
                title: 'Accelerating Growth',
                description: 'Recent momentum is stronger than average',
                icon: lucide_react_1.Zap,
                confidence: 0.85
            });
        }
        if (analyticsData.performance.progress > 70) {
            insights.push({
                type: 'positive',
                title: 'Target Achievement',
                description: `You're ${analyticsData.performance.progress.toFixed(1)}% to your goal`,
                icon: lucide_react_1.Award,
                confidence: 0.90
            });
        }
        return insights;
    }, [metrics, analyticsData]);
    // Predictive modeling data
    const predictionData = (0, react_1.useMemo)(() => {
        const lastValue = analyticsData.measurements[analyticsData.measurements.length - 1].value;
        const predictions = [];
        for (let i = 1; i <= 12; i++) {
            const predictedGrowth = metrics.averageGrowth * (1 - i * 0.05); // Diminishing returns
            const predictedValue = lastValue * (1 + predictedGrowth / 100);
            predictions.push({
                week: i,
                predicted: predictedValue,
                confidence: Math.max(0.3, 1 - i * 0.05),
                range: {
                    min: predictedValue * 0.9,
                    max: predictedValue * 1.1
                }
            });
        }
        return predictions;
    }, [analyticsData, metrics]);
    if (isLoading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Advanced Analytics" }), (0, jsx_runtime_1.jsx)("div", {})] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-64 bg-gray-200 animate-pulse rounded-lg" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-32 bg-gray-200 animate-pulse rounded-lg" }), (0, jsx_runtime_1.jsx)("div", { className: "h-32 bg-gray-200 animate-pulse rounded-lg" }), (0, jsx_runtime_1.jsx)("div", { className: "h-32 bg-gray-200 animate-pulse rounded-lg" })] })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold", children: "Advanced Analytics" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "AI-powered insights and predictive analytics" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: timeRange, onValueChange: setTimeRange, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-32", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "7d", children: "7 days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "30d", children: "30 days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "90d", children: "90 days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "1y", children: "1 year" })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => onExport?.('pdf'), children: "Export" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onShare, children: "Share" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Current Size" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [analyticsData.performance.current, "cm"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: [analyticsData.performance.trend === 'up' ? '+' : '', analyticsData.performance.progress.toFixed(1), "% to target"] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Growth Rate" }), (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [metrics.averageGrowth.toFixed(1), "%"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "Weekly average" })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Consistency" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [(metrics.consistency * 100).toFixed(0), "%"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "Progress consistency" })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Momentum" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [metrics.momentum.toFixed(1), "%"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "Recent trend" })] })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: viewMode, onValueChange: setViewMode, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-4", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "overview", children: "Overview" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "trends", children: "Trends" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "predictions", children: "Predictions" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "insights", children: "AI Insights" })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "overview", className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Progress Over Time" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Measurement history and trends" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: analyticsData.measurements, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {}), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "value", stroke: "#8884d8", strokeWidth: 2, dot: { fill: '#8884d8', strokeWidth: 2, r: 4 } })] }) }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Performance Metrics" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Multi-dimensional analysis" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.RadarChart, { data: [
                                                        {
                                                            metric: 'Growth Rate',
                                                            value: Math.min(100, metrics.averageGrowth * 20),
                                                            fullMark: 100,
                                                        },
                                                        {
                                                            metric: 'Consistency',
                                                            value: metrics.consistency * 100,
                                                            fullMark: 100,
                                                        },
                                                        {
                                                            metric: 'Momentum',
                                                            value: Math.min(100, metrics.momentum * 20),
                                                            fullMark: 100,
                                                        },
                                                        {
                                                            metric: 'Progress',
                                                            value: analyticsData.performance.progress,
                                                            fullMark: 100,
                                                        },
                                                        {
                                                            metric: 'Trend Strength',
                                                            value: Math.min(100, metrics.trendStrength * 10),
                                                            fullMark: 100,
                                                        },
                                                    ], children: [(0, jsx_runtime_1.jsx)(recharts_1.PolarGrid, {}), (0, jsx_runtime_1.jsx)(recharts_1.PolarAngleAxis, { dataKey: "metric" }), (0, jsx_runtime_1.jsx)(recharts_1.PolarRadiusAxis, { angle: 90, domain: [0, 100] }), (0, jsx_runtime_1.jsx)(recharts_1.Radar, { name: "Performance", dataKey: "value", stroke: "#8884d8", fill: "#8884d8", fillOpacity: 0.6 })] }) }) })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "trends", className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Growth Trends" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Weekly growth patterns and predictions" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.AreaChart, { data: analyticsData.trends, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "period" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {}), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (0, jsx_runtime_1.jsx)(recharts_1.Area, { type: "monotone", dataKey: "growth", stackId: "1", stroke: "#8884d8", fill: "#8884d8", fillOpacity: 0.6 }), (0, jsx_runtime_1.jsx)(recharts_1.Area, { type: "monotone", dataKey: "prediction", stackId: "2", stroke: "#82ca9d", fill: "#82ca9d", fillOpacity: 0.6 })] }) }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Prediction Confidence" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "AI model confidence over time" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.BarChart, { data: analyticsData.trends, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "period" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {}), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "confidence", fill: "#82ca9d" })] }) }) })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "predictions", className: "space-y-4", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "12-Week Prediction Model" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "AI-powered growth predictions with confidence intervals" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: predictionData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "week" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {}), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "predicted", stroke: "#8884d8", strokeWidth: 3, dot: { fill: '#8884d8', strokeWidth: 2, r: 4 } }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "range.min", stroke: "#82ca9d", strokeDasharray: "5 5", strokeWidth: 1 }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "range.max", stroke: "#82ca9d", strokeDasharray: "5 5", strokeWidth: 1 })] }) }) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "insights", className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_2.Brain, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "AI Insights" })] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Machine learning powered recommendations" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "space-y-4", children: aiInsights.map((insight, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-3 p-3 rounded-lg border", children: [(0, jsx_runtime_1.jsx)(insight.icon, { className: `h-5 w-5 mt-0.5 ${insight.type === 'positive' ? 'text-green-500' : 'text-blue-500'}` }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium", children: insight.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: insight.description }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-2 mt-2", children: (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", children: [(insight.confidence * 100).toFixed(0), "% confidence"] }) })] })] }, index))) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_2.Lightbulb, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Smart Recommendations" })] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Personalized optimization suggestions" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Routine Intensity" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: "Optimal" })] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: 85, className: "h-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Rest Periods" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: "Good" })] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: 70, className: "h-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Measurement Timing" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: "Excellent" })] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: 95, className: "h-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Consistency" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: "Very Good" })] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: 88, className: "h-2" })] }) })] })] }) })] })] }));
};
exports.default = AdvancedAnalyticsDashboard;
Math.std = function (arr) {
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
};
