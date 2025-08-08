"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedCharts = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const recharts_1 = require("recharts");
const card_1 = require("@/components/ui/card");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const AdvancedCharts = ({ data, unit }) => {
    const [chartType, setChartType] = (0, react_1.useState)('line');
    const [timeRange, setTimeRange] = (0, react_1.useState)('30d');
    const [metric, setMetric] = (0, react_1.useState)('both');
    const filteredData = (0, react_1.useMemo)(() => {
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
        }
        return data.filter(item => new Date(item.date) >= filterDate);
    }, [data, timeRange]);
    const trendAnalysis = (0, react_1.useMemo)(() => {
        if (filteredData.length < 2)
            return null;
        const recent = filteredData.slice(-3);
        const older = filteredData.slice(-6, -3);
        if (older.length === 0)
            return null;
        const recentAvg = recent.reduce((sum, item) => sum + (item.length + item.girth) / 2, 0) / recent.length;
        const olderAvg = older.reduce((sum, item) => sum + (item.length + item.girth) / 2, 0) / older.length;
        const trend = recentAvg - olderAvg;
        const percentage = (trend / olderAvg) * 100;
        return {
            trend,
            percentage,
            direction: trend > 0 ? 'up' : 'down',
            strength: Math.abs(percentage) > 10 ? 'strong' : Math.abs(percentage) > 5 ? 'moderate' : 'weak'
        };
    }, [filteredData]);
    const consistencyData = (0, react_1.useMemo)(() => {
        return filteredData.map(item => ({
            date: item.date,
            consistency: item.consistency * 100,
            sessions: item.sessions
        }));
    }, [filteredData]);
    const radarData = (0, react_1.useMemo)(() => {
        if (filteredData.length === 0)
            return [];
        const latest = filteredData[filteredData.length - 1];
        const average = filteredData.reduce((sum, item) => sum + (item.length + item.girth) / 2, 0) / filteredData.length;
        return [
            {
                subject: 'Length',
                current: latest.length,
                average: average,
                fullMark: Math.max(...filteredData.map(d => d.length)) * 1.2
            },
            {
                subject: 'Girth',
                current: latest.girth,
                average: average,
                fullMark: Math.max(...filteredData.map(d => d.girth)) * 1.2
            },
            {
                subject: 'Consistency',
                current: latest.consistency * 100,
                average: (filteredData.reduce((sum, item) => sum + item.consistency, 0) / filteredData.length) * 100,
                fullMark: 100
            },
            {
                subject: 'Sessions',
                current: latest.sessions,
                average: filteredData.reduce((sum, item) => sum + item.sessions, 0) / filteredData.length,
                fullMark: Math.max(...filteredData.map(d => d.sessions)) * 1.2
            }
        ];
    }, [filteredData]);
    const renderChart = () => {
        switch (chartType) {
            case 'line':
                return ((0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: filteredData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { formatter: (value) => [`${value.toFixed(2)} ${unit}`, ''], labelFormatter: (label) => new Date(label).toLocaleDateString() }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (metric === 'both' || metric === 'length') && ((0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "length", stroke: "#0088FE", strokeWidth: 2, dot: { fill: '#0088FE', strokeWidth: 2, r: 4 }, activeDot: { r: 6 } })), (metric === 'both' || metric === 'girth') && ((0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "girth", stroke: "#00C49F", strokeWidth: 2, dot: { fill: '#00C49F', strokeWidth: 2, r: 4 }, activeDot: { r: 6 } }))] }) }));
            case 'area':
                return ((0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.AreaChart, { data: filteredData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { formatter: (value) => [`${value.toFixed(2)} ${unit}`, ''], labelFormatter: (label) => new Date(label).toLocaleDateString() }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (metric === 'both' || metric === 'length') && ((0, jsx_runtime_1.jsx)(recharts_1.Area, { type: "monotone", dataKey: "length", stackId: "1", stroke: "#0088FE", fill: "#0088FE", fillOpacity: 0.6 })), (metric === 'both' || metric === 'girth') && ((0, jsx_runtime_1.jsx)(recharts_1.Area, { type: "monotone", dataKey: "girth", stackId: "1", stroke: "#00C49F", fill: "#00C49F", fillOpacity: 0.6 }))] }) }));
            case 'bar':
                return ((0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.BarChart, { data: filteredData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { formatter: (value) => [`${value.toFixed(2)} ${unit}`, ''], labelFormatter: (label) => new Date(label).toLocaleDateString() }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (metric === 'both' || metric === 'length') && ((0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "length", fill: "#0088FE" })), (metric === 'both' || metric === 'girth') && ((0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "girth", fill: "#00C49F" }))] }) }));
            case 'radar':
                return ((0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.RadarChart, { data: radarData, children: [(0, jsx_runtime_1.jsx)(recharts_1.PolarGrid, {}), (0, jsx_runtime_1.jsx)(recharts_1.PolarAngleAxis, { dataKey: "subject" }), (0, jsx_runtime_1.jsx)(recharts_1.PolarRadiusAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Radar, { name: "Current", dataKey: "current", stroke: "#0088FE", fill: "#0088FE", fillOpacity: 0.6 }), (0, jsx_runtime_1.jsx)(recharts_1.Radar, { name: "Average", dataKey: "average", stroke: "#00C49F", fill: "#00C49F", fillOpacity: 0.6 }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {})] }) }));
            default:
                return null;
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Advanced Analytics" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: chartType, onValueChange: (value) => setChartType(value), title: "Chart Type", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-32", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "line", children: "Line Chart" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "area", children: "Area Chart" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "bar", children: "Bar Chart" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "radar", children: "Radar Chart" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: timeRange, onValueChange: (value) => setTimeRange(value), title: "Time Range", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-24", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "7d", children: "7 Days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "30d", children: "30 Days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "90d", children: "90 Days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "1y", children: "1 Year" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: metric, onValueChange: (value) => setMetric(value), title: "Metric", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-24", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "both", children: "Both" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "length", children: "Length" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "girth", children: "Girth" })] })] })] })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: renderChart() })] }), trendAnalysis && ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Trend Analysis" })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center space-x-2 mb-2", children: [trendAnalysis.direction === 'up' ? ((0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-5 w-5 text-green-600" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.TrendingDown, { className: "h-5 w-5 text-red-600" })), (0, jsx_runtime_1.jsxs)("span", { className: "text-lg font-semibold", children: [trendAnalysis.direction === 'up' ? '+' : '', trendAnalysis.percentage.toFixed(1), "%"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Growth Rate" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: trendAnalysis.strength === 'strong' ? 'default' : 'secondary', className: "text-lg px-3 py-1", children: trendAnalysis.strength.toUpperCase() }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-2", children: "Trend Strength" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-lg font-semibold", children: [trendAnalysis.trend > 0 ? '+' : '', trendAnalysis.trend.toFixed(2), " ", unit] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Net Change" })] })] }) })] })), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Consistency & Sessions" })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.AreaChart, { data: consistencyData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { yAxisId: "left" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { yAxisId: "right", orientation: "right" }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { formatter: (value, name) => [
                                            name === 'consistency' ? `${value.toFixed(1)}%` : value.toString(),
                                            name === 'consistency' ? 'Consistency' : 'Sessions'
                                        ], labelFormatter: (label) => new Date(label).toLocaleDateString() }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (0, jsx_runtime_1.jsx)(recharts_1.Area, { yAxisId: "left", type: "monotone", dataKey: "consistency", stroke: "#8884D8", fill: "#8884D8", fillOpacity: 0.6, name: "Consistency %" }), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { yAxisId: "right", dataKey: "sessions", fill: "#82CA9D", name: "Sessions" })] }) }) })] })] }));
};
exports.AdvancedCharts = AdvancedCharts;
exports.default = exports.AdvancedCharts;
