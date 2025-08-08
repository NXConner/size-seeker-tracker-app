"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const recharts_1 = require("recharts");
function DataAnalytics({ onBack }) {
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const [measurements, setMeasurements] = (0, react_1.useState)([]);
    const [timeRange, setTimeRange] = (0, react_1.useState)('month');
    (0, react_1.useEffect)(() => {
        // Load session data from localStorage
        const savedSessions = localStorage.getItem('pumpingSessions');
        if (savedSessions) {
            setSessions(JSON.parse(savedSessions));
        }
        // Load measurement data from localStorage
        const savedMeasurements = localStorage.getItem('measurements');
        if (savedMeasurements) {
            setMeasurements(JSON.parse(savedMeasurements));
        }
    }, []);
    const getFilteredData = () => {
        const now = new Date();
        const filterDate = new Date();
        switch (timeRange) {
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                filterDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        return {
            sessions: sessions.filter(session => new Date(session.date) >= filterDate),
            measurements: measurements.filter(measurement => new Date(measurement.date) >= filterDate)
        };
    };
    const { sessions: filteredSessions, measurements: filteredMeasurements } = getFilteredData();
    const calculateStats = () => {
        if (filteredSessions.length === 0)
            return null;
        const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
        const totalSets = filteredSessions.reduce((sum, session) => sum + session.sets, 0);
        const avgDuration = totalDuration / filteredSessions.length;
        const avgSets = totalSets / filteredSessions.length;
        const focusBreakdown = filteredSessions.reduce((acc, session) => {
            acc[session.focus] = (acc[session.focus] || 0) + 1;
            return acc;
        }, {});
        const pressureBreakdown = filteredSessions.reduce((acc, session) => {
            acc[session.pressure] = (acc[session.pressure] || 0) + 1;
            return acc;
        }, {});
        return {
            totalSessions: filteredSessions.length,
            totalDuration,
            totalSets,
            avgDuration,
            avgSets,
            focusBreakdown,
            pressureBreakdown
        };
    };
    const stats = calculateStats();
    const getProgressData = () => {
        if (filteredMeasurements.length < 2)
            return [];
        return filteredMeasurements
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((measurement, index) => ({
            date: new Date(measurement.date).toLocaleDateString(),
            length: measurement.length || 0,
            girth: measurement.girth || 0,
            index
        }));
    };
    const getFocusChartData = () => {
        if (!stats)
            return [];
        return Object.entries(stats.focusBreakdown).map(([focus, count]) => ({
            name: focus.charAt(0).toUpperCase() + focus.slice(1),
            value: count,
            color: focus === 'length' ? '#3b82f6' : focus === 'girth' ? '#ef4444' : '#10b981'
        }));
    };
    const getPressureChartData = () => {
        if (!stats)
            return [];
        return Object.entries(stats.pressureBreakdown).map(([pressure, count]) => ({
            name: pressure,
            value: count,
            color: pressure.includes('Low') ? '#10b981' : pressure.includes('Medium') ? '#f59e0b' : '#ef4444'
        }));
    };
    const formatDuration = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };
    const getConsistencyScore = () => {
        if (filteredSessions.length === 0)
            return 0;
        const daysWithSessions = new Set(filteredSessions.map(s => s.date.split('T')[0])).size;
        const totalDays = Math.ceil((new Date().getTime() - new Date(filteredSessions[0].date).getTime()) / (1000 * 60 * 60 * 24));
        return Math.min(100, (daysWithSessions / totalDays) * 100);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Data Analytics" }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2", children: ['week', 'month', 'quarter', 'year'].map((range) => ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: timeRange === range ? 'default' : 'outline', size: "sm", onClick: () => setTimeRange(range), children: range.charAt(0).toUpperCase() + range.slice(1) }, range))) })] }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: "overview", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid grid-cols-4 w-full", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "overview", children: "Overview" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "progress", children: "Progress" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "sessions", children: "Sessions" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "insights", children: "Insights" })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "overview", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Total Sessions" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: stats?.totalSessions || 0 }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: ["Last ", timeRange] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Total Time" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: formatDuration(stats?.totalDuration || 0) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: [stats ? formatDuration(stats.avgDuration) : '0m', " avg per session"] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Total Sets" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: stats?.totalSets || 0 }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: [stats?.avgSets.toFixed(1) || '0', " avg per session"] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Consistency" }), (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [getConsistencyScore().toFixed(0), "%"] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: getConsistencyScore(), className: "mt-2" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Focus Distribution" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: getFocusChartData(), cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: getFocusChartData().map((entry, index) => ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, `cell-${index}`))) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {})] }) }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Pressure Usage" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: getPressureChartData(), cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: getPressureChartData().map((entry, index) => ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, `cell-${index}`))) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {})] }) }) })] })] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "progress", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Progress Tracking" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: filteredMeasurements.length > 1 ? ((0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: getProgressData(), children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {}), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "length", stroke: "#3b82f6", name: "Length" }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "girth", stroke: "#ef4444", name: "Girth" })] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Not enough measurement data to show progress" }) })) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "sessions", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Recent Sessions" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: filteredSessions.length > 0 ? (filteredSessions
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .slice(0, 10)
                                            .map((session) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium", children: session.routineName }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: session.focus }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: session.pressure })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [formatDuration(session.duration), " \u2022 ", session.sets, " sets"] }), session.notes && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: session.notes }))] }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: new Date(session.date).toLocaleDateString() })] }, session.id)))) : ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "No sessions recorded in this time period" }) })) }) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "insights", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Performance Insights" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "space-y-4", children: stats ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { children: "Average Session Duration" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: formatDuration(stats.avgDuration) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { children: "Average Sets per Session" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: stats.avgSets.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { children: "Most Used Focus" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: Object.entries(stats.focusBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { children: "Most Used Pressure" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: Object.entries(stats.pressureBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A' })] })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "No data available for insights" })) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Recommendations" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "space-y-3", children: stats ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [getConsistencyScore() < 70 && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-yellow-50 border border-yellow-200 rounded", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-yellow-800", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Improve Consistency:" }), " Try to maintain a more regular routine schedule."] }) })), stats.avgDuration < 30 && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-blue-800", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Increase Duration:" }), " Consider longer sessions for better results."] }) })), stats.avgSets < 2 && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-green-50 border border-green-200 rounded", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-green-800", children: [(0, jsx_runtime_1.jsx)("strong", { children: "More Sets:" }), " Try increasing the number of sets per session."] }) }))] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Start recording sessions to get personalized recommendations" })) })] })] }) })] })] }));
}
exports.default = DataAnalytics;
