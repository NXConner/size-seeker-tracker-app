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
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const secureStorage_1 = require("@/utils/secureStorage");
const HealthSafety = ({ onBack }) => {
    const [healthEvents, setHealthEvents] = (0, react_1.useState)([]);
    const [restDays, setRestDays] = (0, react_1.useState)([]);
    const [healthMetrics, setHealthMetrics] = (0, react_1.useState)({
        fatigueLevel: 3,
        painLevel: 1,
        stressLevel: 4,
        sleepQuality: 7,
        lastUpdated: new Date().toISOString()
    });
    const [safetyGuidelines, setSafetyGuidelines] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [showAddEvent, setShowAddEvent] = (0, react_1.useState)(false);
    const [newEvent, setNewEvent] = (0, react_1.useState)({
        type: 'discomfort',
        severity: 'low',
        title: '',
        description: '',
        requiresMedicalAttention: false
    });
    (0, react_1.useEffect)(() => {
        loadHealthData();
        initializeSafetyGuidelines();
    }, []);
    const loadHealthData = async () => {
        const savedEvents = (await secureStorage_1.secureStorage.getItem('health_events')) || [];
        const savedRestDays = (await secureStorage_1.secureStorage.getItem('rest_days')) || [];
        const savedMetrics = (await secureStorage_1.secureStorage.getItem('health_metrics')) || healthMetrics;
        setHealthEvents(savedEvents);
        setRestDays(savedRestDays);
        setHealthMetrics(savedMetrics);
    };
    const initializeSafetyGuidelines = async () => {
        const guidelines = [
            {
                id: '1',
                title: 'Start Slowly',
                description: 'Begin with shorter sessions and gradually increase duration and intensity',
                category: 'general',
                importance: 'high',
                followed: false
            },
            {
                id: '2',
                title: 'Listen to Your Body',
                description: 'Stop immediately if you experience pain, numbness, or unusual sensations',
                category: 'general',
                importance: 'critical',
                followed: false
            },
            {
                id: '3',
                title: 'Proper Warm-up',
                description: 'Always warm up before sessions to prepare your body',
                category: 'technique',
                importance: 'high',
                followed: false
            },
            {
                id: '4',
                title: 'Rest Days',
                description: 'Take regular rest days to allow recovery and prevent overtraining',
                category: 'recovery',
                importance: 'high',
                followed: false
            },
            {
                id: '5',
                title: 'Equipment Safety',
                description: 'Use properly sized equipment and check for damage regularly',
                category: 'equipment',
                importance: 'critical',
                followed: false
            },
            {
                id: '6',
                title: 'Hydration',
                description: 'Stay well-hydrated before, during, and after sessions',
                category: 'general',
                importance: 'medium',
                followed: false
            },
            {
                id: '7',
                title: 'Medical Consultation',
                description: 'Consult a healthcare professional before starting if you have health conditions',
                category: 'general',
                importance: 'critical',
                followed: false
            }
        ];
        const savedGuidelines = (await secureStorage_1.secureStorage.getItem('safety_guidelines')) || guidelines;
        setSafetyGuidelines(savedGuidelines);
    };
    const addHealthEvent = () => {
        if (!newEvent.title.trim() || !newEvent.description.trim()) {
            (0, use_toast_1.toast)({
                title: "Missing Information",
                description: "Please fill in both title and description.",
                variant: "destructive"
            });
            return;
        }
        const event = {
            id: Date.now().toString(),
            type: newEvent.type,
            severity: newEvent.severity,
            title: newEvent.title,
            description: newEvent.description,
            date: new Date().toISOString(),
            resolved: false,
            requiresMedicalAttention: newEvent.requiresMedicalAttention,
            recommendations: getRecommendations(newEvent.type, newEvent.severity)
        };
        const updatedEvents = [event, ...healthEvents];
        setHealthEvents(updatedEvents);
        secureStorage_1.secureStorage.setItem('health_events', updatedEvents);
        // Reset form
        setNewEvent({
            type: 'discomfort',
            severity: 'low',
            title: '',
            description: '',
            requiresMedicalAttention: false
        });
        setShowAddEvent(false);
        (0, use_toast_1.toast)({
            title: "Health Event Recorded",
            description: "Your health event has been recorded. Follow the recommendations provided.",
        });
        // Check if medical attention is required
        if (newEvent.requiresMedicalAttention) {
            (0, use_toast_1.toast)({
                title: "Medical Attention Required",
                description: "Please consult a healthcare professional as soon as possible.",
                variant: "destructive"
            });
        }
    };
    const getRecommendations = (type, severity) => {
        const recommendations = {
            injury: {
                low: ['Rest the affected area', 'Apply ice if appropriate', 'Monitor for changes'],
                medium: ['Rest for 48-72 hours', 'Apply ice and compression', 'Consider consulting a healthcare provider'],
                high: ['Stop all activities immediately', 'Seek medical attention', 'Follow medical advice strictly'],
                critical: ['Seek immediate medical attention', 'Do not continue any activities', 'Follow emergency protocols']
            },
            discomfort: {
                low: ['Take a break from activities', 'Monitor symptoms', 'Reduce intensity next session'],
                medium: ['Rest for 24-48 hours', 'Apply gentle stretching', 'Consider consulting a healthcare provider'],
                high: ['Stop activities immediately', 'Seek medical attention', 'Do not resume until cleared'],
                critical: ['Seek immediate medical attention', 'Stop all activities', 'Follow emergency protocols']
            },
            warning: {
                low: ['Monitor closely', 'Reduce intensity', 'Consider taking a rest day'],
                medium: ['Take a rest day', 'Monitor symptoms', 'Consider consulting a healthcare provider'],
                high: ['Stop activities', 'Seek medical attention', 'Follow medical advice'],
                critical: ['Seek immediate medical attention', 'Stop all activities', 'Follow emergency protocols']
            },
            rest: {
                low: ['Take a light rest day', 'Gentle stretching only', 'Focus on recovery'],
                medium: ['Complete rest day', 'No activities', 'Focus on hydration and nutrition'],
                high: ['Extended rest period', 'No activities', 'Consider consulting a healthcare provider'],
                critical: ['Complete rest', 'Seek medical attention', 'Follow medical advice']
            }
        };
        return recommendations[type]?.[severity] || ['Monitor symptoms', 'Consider consulting a healthcare provider'];
    };
    const resolveHealthEvent = async (eventId) => {
        const updatedEvents = healthEvents.map(event => event.id === eventId
            ? { ...event, resolved: true, resolvedDate: new Date().toISOString() }
            : event);
        setHealthEvents(updatedEvents);
        await secureStorage_1.secureStorage.setItem('health_events', updatedEvents);
        (0, use_toast_1.toast)({
            title: "Event Resolved",
            description: "Health event has been marked as resolved.",
        });
    };
    const addRestDay = () => {
        const restDay = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            reason: 'scheduled',
            description: 'Scheduled rest day for recovery',
            duration: 1,
            completed: false
        };
        const updatedRestDays = [restDay, ...restDays];
        setRestDays(updatedRestDays);
        secureStorage_1.secureStorage.setItem('rest_days', updatedRestDays);
        (0, use_toast_1.toast)({
            title: "Rest Day Added",
            description: "Rest day has been scheduled.",
        });
    };
    const updateHealthMetrics = (metric, value) => {
        const updatedMetrics = { ...healthMetrics, [metric]: value, lastUpdated: new Date().toISOString() };
        setHealthMetrics(updatedMetrics);
        secureStorage_1.secureStorage.setItem('health_metrics', updatedMetrics);
        // Check for concerning levels
        if (value >= 8) {
            (0, use_toast_1.toast)({
                title: "High Level Detected",
                description: `Your ${metric.replace('Level', '').toLowerCase()} level is high. Consider taking a rest day.`,
                variant: "destructive"
            });
        }
    };
    const toggleSafetyGuideline = (guidelineId) => {
        const updatedGuidelines = safetyGuidelines.map(guideline => guideline.id === guidelineId ? { ...guideline, followed: !guideline.followed } : guideline);
        setSafetyGuidelines(updatedGuidelines);
        secureStorage_1.secureStorage.setItem('safety_guidelines', updatedGuidelines);
    };
    const getHealthStatus = () => {
        const activeEvents = healthEvents.filter(e => !e.resolved);
        const criticalEvents = activeEvents.filter(e => e.severity === 'critical');
        const highEvents = activeEvents.filter(e => e.severity === 'high');
        if (criticalEvents.length > 0)
            return 'critical';
        if (highEvents.length > 0)
            return 'warning';
        if (activeEvents.length > 0)
            return 'caution';
        return 'good';
    };
    const getHealthScore = () => {
        const baseScore = 100;
        const activeEvents = healthEvents.filter(e => !e.resolved);
        const eventPenalty = activeEvents.reduce((penalty, event) => {
            const severityPenalty = { low: 5, medium: 15, high: 30, critical: 50 }[event.severity];
            return penalty + severityPenalty;
        }, 0);
        const metricsPenalty = (10 - healthMetrics.fatigueLevel) * 2 +
            (10 - healthMetrics.sleepQuality) * 2 +
            healthMetrics.painLevel * 3 +
            healthMetrics.stressLevel * 2;
        return Math.max(0, baseScore - eventPenalty - metricsPenalty);
    };
    const healthStatus = getHealthStatus();
    const healthScore = getHealthScore();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto p-4 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: onBack, variant: "outline", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), "Back to Dashboard"] }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Health & Safety Monitor" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => setShowAddEvent(true), variant: "outline", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "Add Event"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: addRestDay, variant: "outline", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 mr-2" }), "Add Rest Day"] })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid grid-cols-5 w-full", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "overview", children: "Overview" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "events", children: "Health Events" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "rest", children: "Rest Days" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "guidelines", children: "Safety Guidelines" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "metrics", children: "Health Metrics" })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "overview", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { className: `border-2 ${healthStatus === 'critical' ? 'border-red-500 bg-red-50' :
                                            healthStatus === 'warning' ? 'border-orange-500 bg-orange-50' :
                                                healthStatus === 'caution' ? 'border-yellow-500 bg-yellow-50' :
                                                    'border-green-500 bg-green-50'}`, children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Health Status" }), healthStatus === 'critical' ? (0, jsx_runtime_1.jsx)(AlertCircle, { className: "h-4 w-4 text-red-600" }) :
                                                        healthStatus === 'warning' ? (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-orange-600" }) :
                                                            healthStatus === 'caution' ? (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-yellow-600" }) :
                                                                (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold capitalize", children: healthStatus }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: healthStatus === 'critical' ? 'Immediate attention required' :
                                                            healthStatus === 'warning' ? 'Monitor closely' :
                                                                healthStatus === 'caution' ? 'Proceed with caution' :
                                                                    'All systems normal' })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Health Score" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [healthScore, "/100"] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: healthScore, className: "mt-2" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground mt-1", children: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor' })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Active Events" }), (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: healthEvents.filter(e => !e.resolved).length }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: [healthEvents.filter(e => !e.resolved && e.requiresMedicalAttention).length, " require medical attention"] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Rest Days" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: restDays.filter(r => !r.completed).length }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: [restDays.filter(r => r.completed).length, " completed"] })] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "mt-6", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Quick Actions" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => setShowAddEvent(true), variant: "outline", className: "h-20", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-6 w-6 mx-auto mb-2" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: "Report Health Event" })] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: addRestDay, variant: "outline", className: "h-20", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-6 w-6 mx-auto mb-2" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: "Schedule Rest Day" })] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => setActiveTab('metrics'), variant: "outline", className: "h-20", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "h-6 w-6 mx-auto mb-2" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: "Update Health Metrics" })] }) })] }) })] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "events", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Health Events" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => setShowAddEvent(true), size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "Add Event"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [healthEvents.map((event) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: event.resolved ? 'opacity-60' : '', children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-lg", children: event.title }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "capitalize", children: event.type }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: event.severity === 'critical' ? 'destructive' :
                                                                                    event.severity === 'high' ? 'default' :
                                                                                        event.severity === 'medium' ? 'secondary' : 'outline', children: event.severity }), event.requiresMedicalAttention && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(AlertCircle, { className: "h-3 w-3 mr-1" }), "Medical Attention Required"] })), event.resolved && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "default", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-3 w-3 mr-1" }), "Resolved"] }))] })] }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500", children: new Date(event.date).toLocaleDateString() })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 mb-4", children: event.description }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium", children: "Recommendations:" }), (0, jsx_runtime_1.jsx)("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-600", children: event.recommendations.map((rec, index) => ((0, jsx_runtime_1.jsx)("li", { children: rec }, index))) })] }), !event.resolved && ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => resolveHealthEvent(event.id), className: "mt-4", variant: "outline", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2" }), "Mark as Resolved"] }))] })] }, event.id))), healthEvents.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No health events recorded. Keep monitoring your health!" })] }))] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "rest", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Rest Days" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: addRestDay, size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "Add Rest Day"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [restDays.map((restDay) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: restDay.completed ? 'opacity-60' : '', children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "text-sm capitalize", children: [restDay.reason, " Rest"] }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: restDay.completed ? 'default' : 'secondary', children: restDay.completed ? 'Completed' : 'Scheduled' })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-3", children: restDay.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Duration: ", restDay.duration, " day(s)"] }), (0, jsx_runtime_1.jsx)("span", { children: new Date(restDay.date).toLocaleDateString() })] }), !restDay.completed && ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => {
                                                                const updatedRestDays = restDays.map(rd => rd.id === restDay.id ? { ...rd, completed: true } : rd);
                                                                setRestDays(updatedRestDays);
                                                                secureStorage_1.secureStorage.setItem('rest_days', updatedRestDays);
                                                            }, className: "mt-3 w-full", variant: "outline", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2" }), "Mark Complete"] }))] })] }, restDay.id))), restDays.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 col-span-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No rest days scheduled. Consider adding rest days for recovery!" })] }))] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "guidelines", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Safety Guidelines" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: safetyGuidelines.map((guideline) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: guideline.followed ? 'border-green-200 bg-green-50' : '', children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-lg", children: guideline.title }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "capitalize", children: guideline.category }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: guideline.importance === 'critical' ? 'destructive' :
                                                                                guideline.importance === 'high' ? 'default' :
                                                                                    guideline.importance === 'medium' ? 'secondary' : 'outline', children: guideline.importance }), guideline.followed && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "default", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-3 w-3 mr-1" }), "Following"] }))] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: guideline.followed ? "default" : "outline", size: "sm", onClick: () => toggleSafetyGuideline(guideline.id), children: guideline.followed ? 'Following' : 'Mark as Following' })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700", children: guideline.description }) })] }, guideline.id))) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "metrics", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Health Metrics" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Fatigue Level (1-10)" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Low Energy" }), (0, jsx_runtime_1.jsx)("span", { children: "High Energy" })] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "1", max: "10", value: healthMetrics.fatigueLevel, onChange: (e) => updateHealthMetrics('fatigueLevel', parseInt(e.target.value)), className: "w-full" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center font-medium", children: [healthMetrics.fatigueLevel, "/10"] })] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Pain Level (1-10)" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "No Pain" }), (0, jsx_runtime_1.jsx)("span", { children: "Severe Pain" })] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "1", max: "10", value: healthMetrics.painLevel, onChange: (e) => updateHealthMetrics('painLevel', parseInt(e.target.value)), className: "w-full" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center font-medium", children: [healthMetrics.painLevel, "/10"] })] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Stress Level (1-10)" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Relaxed" }), (0, jsx_runtime_1.jsx)("span", { children: "Very Stressed" })] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "1", max: "10", value: healthMetrics.stressLevel, onChange: (e) => updateHealthMetrics('stressLevel', parseInt(e.target.value)), className: "w-full" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center font-medium", children: [healthMetrics.stressLevel, "/10"] })] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Sleep Quality (1-10)" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Poor Sleep" }), (0, jsx_runtime_1.jsx)("span", { children: "Excellent Sleep" })] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "1", max: "10", value: healthMetrics.sleepQuality, onChange: (e) => updateHealthMetrics('sleepQuality', parseInt(e.target.value)), className: "w-full" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center font-medium", children: [healthMetrics.sleepQuality, "/10"] })] }) })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Last Updated" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: new Date(healthMetrics.lastUpdated).toLocaleString() }) })] })] }) })] }), showAddEvent && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "w-full max-w-md mx-4", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Add Health Event" }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium", children: "Event Type" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newEvent.type, onValueChange: (value) => setNewEvent(prev => ({ ...prev, type: value })), title: "Event Type", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "injury", children: "Injury" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "discomfort", children: "Discomfort" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "warning", children: "Warning Sign" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "rest", children: "Rest Day" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium", children: "Severity" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newEvent.severity, onValueChange: (value) => setNewEvent(prev => ({ ...prev, severity: value })), title: "Severity", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "critical", children: "Critical" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium", children: "Title" }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: newEvent.title, onChange: (e) => setNewEvent(prev => ({ ...prev, title: e.target.value })), placeholder: "Brief description of the event..." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium", children: "Description" }), (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: newEvent.description, onChange: (e) => setNewEvent(prev => ({ ...prev, description: e.target.value })), placeholder: "Detailed description of what happened...", rows: 4 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: "medical-attention", checked: newEvent.requiresMedicalAttention, onChange: (e) => setNewEvent(prev => ({ ...prev, requiresMedicalAttention: e.target.checked })), className: "rounded" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "medical-attention", className: "text-sm", children: "Requires medical attention" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: addHealthEvent, className: "flex-1", children: "Add Event" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => setShowAddEvent(false), children: "Cancel" })] })] })] }) }))] }));
};
exports.default = CommunityFeatures;
