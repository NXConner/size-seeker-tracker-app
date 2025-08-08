"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const tabs_1 = require("@/components/ui/tabs");
const select_1 = require("@/components/ui/select");
const use_toast_1 = require("@/hooks/use-toast");
const secureStorage_1 = require("@/utils/secureStorage");
const imageStorage_1 = require("@/utils/imageStorage");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const IntegratedMeasurementAnalysis = ({ onBack }) => {
    const { unit, setUnit } = (0, ThemeContext_1.useTheme)();
    // Camera capture state
    const videoRef = (0, react_1.useRef)(null);
    const canvasRef = (0, react_1.useRef)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const [stream, setStream] = (0, react_1.useState)(null);
    const [isStreaming, setIsStreaming] = (0, react_1.useState)(false);
    const [capturedImage, setCapturedImage] = (0, react_1.useState)(null);
    // Measurement analysis state
    const [measurements, setMeasurements] = (0, react_1.useState)([]);
    const [selectedImage, setSelectedImage] = (0, react_1.useState)(null);
    const [lengthMeasurement, setLengthMeasurement] = (0, react_1.useState)('');
    const [girthMeasurement, setGirthMeasurement] = (0, react_1.useState)('');
    const [referenceMeasurement, setReferenceMeasurement] = (0, react_1.useState)('');
    const [measurementUnit, setMeasurementUnit] = (0, react_1.useState)('cm');
    const [autoMeasurement, setAutoMeasurement] = (0, react_1.useState)(null);
    const [overlayImage, setOverlayImage] = (0, react_1.useState)(null);
    const [showManual, setShowManual] = (0, react_1.useState)(false);
    const [isAnalyzing, setIsAnalyzing] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [analysisProgress, setAnalysisProgress] = (0, react_1.useState)(0);
    const [showAnalysisPoints, setShowAnalysisPoints] = (0, react_1.useState)(false);
    // Measurement tools state
    const [selectedTool, setSelectedTool] = (0, react_1.useState)('none');
    const [toolSize, setToolSize] = (0, react_1.useState)(10); // Size in cm/inches
    const [showGrid, setShowGrid] = (0, react_1.useState)(false);
    const [gridSize, setGridSize] = (0, react_1.useState)(1); // Grid size in cm/inches
    const [measurementHistory, setMeasurementHistory] = (0, react_1.useState)([]);
    // Enhanced measurement tools
    const [toolMode, setToolMode] = (0, react_1.useState)('none');
    const [manualMeasurements, setManualMeasurements] = (0, react_1.useState)([]);
    const [isDrawing, setIsDrawing] = (0, react_1.useState)(false);
    const [drawingPoints, setDrawingPoints] = (0, react_1.useState)([]);
    const [showObjectOutline, setShowObjectOutline] = (0, react_1.useState)(false);
    const [objectOutline, setObjectOutline] = (0, react_1.useState)([]);
    const [highlightedObject, setHighlightedObject] = (0, react_1.useState)([]);
    const [referencePoints, setReferencePoints] = (0, react_1.useState)({});
    const [canvasMode, setCanvasMode] = (0, react_1.useState)('view');
    // Snap-to-shape state
    const [snapToShapeResult, setSnapToShapeResult] = (0, react_1.useState)(null);
    const [isSnapping, setIsSnapping] = (0, react_1.useState)(false);
    const [snapConfidence, setSnapConfidence] = (0, react_1.useState)(0);
    const [snapTolerance, setSnapTolerance] = (0, react_1.useState)(10);
    const [snapMode, setSnapMode] = (0, react_1.useState)('auto');
    // Analysis state
    const [analysisData, setAnalysisData] = (0, react_1.useState)(null);
    const [analysisFilters, setAnalysisFilters] = (0, react_1.useState)({
        dateRange: '30d',
        measurementType: 'both',
        includePumping: true,
        minConfidence: 0.7,
        unit: 'cm'
    });
    const [activeTab, setActiveTab] = (0, react_1.useState)('capture');
    const [showAdvancedMetrics, setShowAdvancedMetrics] = (0, react_1.useState)(false);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(false);
    // Pumping session state
    const [isPumpingSessionActive, setIsPumpingSessionActive] = (0, react_1.useState)(false);
    const [pumpingTimer, setPumpingTimer] = (0, react_1.useState)(0);
    const [pumpingInterval, setPumpingInterval] = (0, react_1.useState)(null);
    const [pumpingPressure, setPumpingPressure] = (0, react_1.useState)(5);
    const [pumpingSets, setPumpingSets] = (0, react_1.useState)(3);
    const [pumpingFocus, setPumpingFocus] = (0, react_1.useState)('both');
    const [pumpingSessions, setPumpingSessions] = (0, react_1.useState)([]);
    // Progress state
    const [progressData, setProgressData] = (0, react_1.useState)([]);
    const [progressUnit, setProgressUnit] = (0, react_1.useState)('cm');
    // Canvas refs
    const measurementCanvasRef = (0, react_1.useRef)(null);
    const imageRef = (0, react_1.useRef)(null);
    const containerRef = (0, react_1.useRef)(null);
    // Camera functions
    (0, react_1.useEffect)(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);
    const startCamera = (0, react_1.useCallback)(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setIsStreaming(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        }
        catch (error) {
            console.error('Camera access error:', error);
            (0, use_toast_1.toast)({
                title: "Camera Error",
                description: "Unable to access camera. Please check permissions.",
                variant: "destructive"
            });
        }
    }, []);
    const stopCamera = (0, react_1.useCallback)(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsStreaming(false);
        }
    }, [stream]);
    const saveImageData = async (imageData) => {
        try {
            const imageSize = new Blob([imageData]).size;
            if (imageSize > 5 * 1024 * 1024) {
                (0, use_toast_1.toast)({
                    title: "Image Too Large",
                    description: "Please select a smaller image or reduce quality.",
                    variant: "destructive"
                });
                return;
            }
            const newMeasurement = {
                id: Date.now().toString(),
                image: imageData,
                timestamp: new Date().toISOString(),
                measurements: null
            };
            await imageStorage_1.imageStorage.saveImage(newMeasurement);
            (0, use_toast_1.toast)({
                title: "Image Saved Securely",
                description: "Image stored in secure database on your device only."
            });
            // Switch to measurement tab after capture
            setActiveTab('measurement');
            setSelectedImage(newMeasurement);
            loadMeasurements();
        }
        catch (error) {
            console.error('Save error:', error);
            (0, use_toast_1.toast)({
                title: "Save Error",
                description: "Failed to save image. Please try again.",
                variant: "destructive"
            });
        }
    };
    const capturePhoto = (0, react_1.useCallback)(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            if (context) {
                context.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageData);
                saveImageData(imageData);
                stopCamera();
            }
        }
    }, [stopCamera]);
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                (0, use_toast_1.toast)({
                    title: "File Too Large",
                    description: "Please select an image smaller than 5MB.",
                    variant: "destructive"
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target?.result;
                setCapturedImage(imageData);
                saveImageData(imageData);
                stopCamera();
            };
            reader.readAsDataURL(file);
        }
        else {
            (0, use_toast_1.toast)({
                title: "Invalid File",
                description: "Please select a valid image file.",
                variant: "destructive"
            });
        }
    };
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };
    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };
    // Measurement functions
    const loadMeasurements = async () => {
        try {
            setIsLoading(true);
            const indexedDBImages = await imageStorage_1.imageStorage.getAllImages();
            const localStorageMeasurements = (await secureStorage_1.secureStorage.getItem('measurements')) || [];
            const allMeasurements = [...indexedDBImages];
            localStorageMeasurements.forEach((localItem) => {
                const exists = allMeasurements.find((item) => item.id === localItem.id);
                if (!exists) {
                    allMeasurements.push(localItem);
                }
            });
            setMeasurements(allMeasurements);
        }
        catch (error) {
            console.error('Error loading measurements:', error);
            (0, use_toast_1.toast)({
                title: "Load Error",
                description: "Failed to load measurements. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadMeasurements();
    }, []);
    const analyzeAutomatically = async (image) => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        // Simulate analysis progress
        const progressInterval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockAnalysis = {
                length: Math.random() * 5 + 10,
                girth: Math.random() * 3 + 8,
                confidence: Math.random() * 0.3 + 0.7,
                points: {
                    lengthStart: { x: 50, y: 100 },
                    lengthEnd: { x: 50, y: 200 },
                    girthCenter: { x: 150, y: 150 },
                    girthRadius: 30
                }
            };
            setAutoMeasurement(mockAnalysis);
            setShowAnalysisPoints(true);
            setAnalysisProgress(100);
        }
        catch (error) {
            console.error('Analysis failed:', error);
        }
        finally {
            setIsAnalyzing(false);
            clearInterval(progressInterval);
        }
    };
    const saveMeasurement = async () => {
        if (!selectedImage || (!lengthMeasurement && !girthMeasurement))
            return;
        const newMeasurement = {
            ...selectedImage,
            length: lengthMeasurement ? parseFloat(lengthMeasurement) : undefined,
            girth: girthMeasurement ? parseFloat(girthMeasurement) : undefined,
            unit: measurementUnit,
            referenceMeasurement: referenceMeasurement ? parseFloat(referenceMeasurement) : undefined,
            analysisPoints: autoMeasurement?.points
        };
        const updatedMeasurements = measurements.map(m => m.id === selectedImage.id ? newMeasurement : m);
        setMeasurements(updatedMeasurements);
        // Save to localStorage
        localStorage.setItem('measurements', JSON.stringify(updatedMeasurements));
        // Clear form
        setLengthMeasurement('');
        setGirthMeasurement('');
        setAutoMeasurement(null);
        setShowAnalysisPoints(false);
    };
    const clearCanvas = () => {
        if (measurementCanvasRef.current) {
            const ctx = measurementCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, measurementCanvasRef.current.width, measurementCanvasRef.current.height);
            }
        }
        setManualMeasurements([]);
        setHighlightedObject([]);
        setReferencePoints({});
        setDrawingPoints([]);
        setToolMode('none');
        setSnapToShapeResult(null);
        setObjectOutline([]);
        setShowObjectOutline(false);
    };
    // Pumping session functions
    const startPumpingSession = () => {
        setIsPumpingSessionActive(true);
        const interval = setInterval(() => {
            setPumpingTimer(prev => prev + 1);
        }, 1000);
        setPumpingInterval(interval);
    };
    const pausePumpingSession = () => {
        setIsPumpingSessionActive(false);
        if (pumpingInterval) {
            clearInterval(pumpingInterval);
            setPumpingInterval(null);
        }
    };
    const stopPumpingSession = () => {
        setIsPumpingSessionActive(false);
        if (pumpingInterval) {
            clearInterval(pumpingInterval);
            setPumpingInterval(null);
        }
        // Save session
        const session = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            duration: pumpingTimer,
            pressure: pumpingPressure,
            sets: pumpingSets,
            focus: pumpingFocus
        };
        const updatedSessions = [...pumpingSessions, session];
        setPumpingSessions(updatedSessions);
        localStorage.setItem('pumpingSessions', JSON.stringify(updatedSessions));
        // Reset timer
        setPumpingTimer(0);
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const loadAnalysisData = () => {
        const filteredMeasurements = measurements.filter(m => {
            const measurementDate = new Date(m.date || m.timestamp);
            const now = new Date();
            const daysDiff = (now.getTime() - measurementDate.getTime()) / (1000 * 60 * 60 * 24);
            switch (analysisFilters.dateRange) {
                case '7d': return daysDiff <= 7;
                case '30d': return daysDiff <= 30;
                case '90d': return daysDiff <= 90;
                case '1y': return daysDiff <= 365;
                default: return true;
            }
        });
        const trends = {
            length: filteredMeasurements.map(m => convertUnit(m.length || 0, m.unit, analysisFilters.unit)),
            girth: filteredMeasurements.map(m => convertUnit(m.girth || 0, m.unit, analysisFilters.unit)),
            dates: filteredMeasurements.map(m => new Date(m.date || m.timestamp).toLocaleDateString())
        };
        const statistics = {
            totalMeasurements: filteredMeasurements.length,
            averageLength: filteredMeasurements.length > 0
                ? trends.length.reduce((a, b) => a + b, 0) / trends.length.length
                : 0,
            averageGirth: filteredMeasurements.length > 0
                ? trends.girth.reduce((a, b) => a + b, 0) / trends.girth.length
                : 0,
            totalSessions: pumpingSessions.length,
            totalSessionTime: pumpingSessions.reduce((total, session) => total + session.duration, 0)
        };
        const recommendations = [];
        if (statistics.averageLength > 0) {
            if (statistics.averageLength < 12) {
                recommendations.push("Consider focusing on length exercises");
            }
            if (statistics.averageGirth < 10) {
                recommendations.push("Include more girth-focused routines");
            }
            if (statistics.totalSessionTime < 3600) { // Less than 1 hour total
                recommendations.push("Increase session frequency for better results");
            }
        }
        setAnalysisData({
            measurements: filteredMeasurements,
            pumpingSessions,
            recommendations,
            trends,
            statistics
        });
    };
    const loadProgressData = () => {
        const progress = measurements
            .filter(m => m.length || m.girth)
            .map(m => ({
            date: new Date(m.date || m.timestamp).toLocaleDateString(),
            length: convertUnit(m.length || 0, m.unit, progressUnit),
            girth: convertUnit(m.girth || 0, m.unit, progressUnit),
            unit: progressUnit
        }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setProgressData(progress);
    };
    (0, react_1.useEffect)(() => {
        loadMeasurements();
        loadAnalysisData();
        loadProgressData();
    }, [analysisFilters, progressUnit]);
    const renderAnalysisPoints = () => {
        if (!selectedImage || !showAnalysisPoints || !autoMeasurement?.points)
            return null;
        return ((0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 pointer-events-none", children: [(0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("line", { x1: `${autoMeasurement.points.lengthStart.x}%`, y1: `${autoMeasurement.points.lengthStart.y}%`, x2: `${autoMeasurement.points.lengthEnd.x}%`, y2: `${autoMeasurement.points.lengthEnd.y}%`, stroke: "red", strokeWidth: "2", strokeDasharray: "5,5" }), (0, jsx_runtime_1.jsx)("circle", { cx: `${autoMeasurement.points.lengthStart.x}%`, cy: `${autoMeasurement.points.lengthStart.y}%`, r: "4", fill: "red" }), (0, jsx_runtime_1.jsx)("circle", { cx: `${autoMeasurement.points.lengthEnd.x}%`, cy: `${autoMeasurement.points.lengthEnd.y}%`, r: "4", fill: "red" })] }), (0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("circle", { cx: `${autoMeasurement.points.girthCenter.x}%`, cy: `${autoMeasurement.points.girthCenter.y}%`, r: `${autoMeasurement.points.girthRadius}%`, fill: "none", stroke: "blue", strokeWidth: "2", strokeDasharray: "5,5" }), (0, jsx_runtime_1.jsx)("circle", { cx: `${autoMeasurement.points.girthCenter.x}%`, cy: `${autoMeasurement.points.girthCenter.y}%`, r: "4", fill: "blue" })] })] }));
    };
    const convertUnit = (value, from, to) => {
        if (from === to)
            return value;
        if (from === 'cm' && to === 'in')
            return value / 2.54;
        if (from === 'in' && to === 'cm')
            return value * 2.54;
        return value;
    };
    const renderMeasurementTools = () => {
        if (!selectedImage)
            return null;
        return ((0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 pointer-events-none", children: [showGrid && ((0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsx)("pattern", { id: "grid", width: `${gridSize * 10}%`, height: `${gridSize * 10}%`, patternUnits: "userSpaceOnUse", children: (0, jsx_runtime_1.jsx)("path", { d: `M ${gridSize * 10}% 0 L 0 0 0 ${gridSize * 10}%`, fill: "none", stroke: "rgba(0,0,0,0.1)", strokeWidth: "1" }) }) }), (0, jsx_runtime_1.jsx)("rect", { width: "100%", height: "100%", fill: "url(#grid)" })] })), selectedTool === 'ruler' && ((0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("line", { x1: "10%", y1: "10%", x2: `${10 + toolSize * 5}%`, y2: "10%", stroke: "black", strokeWidth: "3", strokeDasharray: "2,2" }), (0, jsx_runtime_1.jsxs)("text", { x: "10%", y: "8%", className: "text-xs font-bold", fill: "black", children: [toolSize, measurementUnit] })] })), selectedTool === 'tape' && ((0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("path", { d: "M 10% 10% Q 20% 5% 30% 10% T 50% 10%", fill: "none", stroke: "blue", strokeWidth: "2", strokeDasharray: "5,5" }), (0, jsx_runtime_1.jsxs)("text", { x: "10%", y: "8%", className: "text-xs font-bold", fill: "blue", children: [toolSize, measurementUnit] })] })), selectedTool === 'caliper' && ((0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "50%", cy: "50%", r: `${toolSize * 2}%`, fill: "none", stroke: "green", strokeWidth: "2", strokeDasharray: "3,3" }), (0, jsx_runtime_1.jsxs)("text", { x: "50%", y: "45%", className: "text-xs font-bold", fill: "green", textAnchor: "middle", children: [toolSize, measurementUnit] })] })), selectedTool === 'protractor' && ((0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("path", { d: `M 50% 50% A ${toolSize * 3}% ${toolSize * 3}% 0 0 1 ${50 + toolSize * 3}% 50%`, fill: "none", stroke: "purple", strokeWidth: "2" }), (0, jsx_runtime_1.jsx)("text", { x: "50%", y: "45%", className: "text-xs font-bold", fill: "purple", textAnchor: "middle", children: "90\u00B0" })] })), selectedTool === 'compass' && ((0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "50%", cy: "50%", r: `${toolSize * 2}%`, fill: "none", stroke: "orange", strokeWidth: "2" }), (0, jsx_runtime_1.jsx)("line", { x1: "50%", y1: "50%", x2: `${50 + toolSize * 2}%`, y2: "50%", stroke: "orange", strokeWidth: "1" }), (0, jsx_runtime_1.jsxs)("text", { x: "50%", y: "45%", className: "text-xs font-bold", fill: "orange", textAnchor: "middle", children: [toolSize, measurementUnit] })] }))] }));
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [onBack && ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: onBack, className: "border-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Dashboard"] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-slate-900 dark:text-slate-100", children: "Integrated Analysis" }), (0, jsx_runtime_1.jsx)("p", { className: "text-slate-600 dark:text-slate-400", children: "Capture, measure, analyze, and track your progress" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-2", children: (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "flex items-center space-x-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-3 h-3" }), (0, jsx_runtime_1.jsx)("span", { children: "Live" })] }) })] }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-5", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "capture", children: "Capture" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "measurement", children: "Measurement" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "analysis", children: "Analysis" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "sessions", children: "Sessions" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "progress", children: "Progress" })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "capture", className: "space-y-6", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between mb-4", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "Capture or Upload Image" }) }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-green-800 flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-green-600", children: "\uD83D\uDD12" }), (0, jsx_runtime_1.jsx)("span", { children: "All images are stored securely on your device only. No data leaves your phone." })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: !capturedImage ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "relative bg-black rounded-lg overflow-hidden", style: { aspectRatio: '16/9' }, children: isStreaming ? ((0, jsx_runtime_1.jsx)("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full h-full object-cover" })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full text-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-16 w-16 mx-auto mb-4 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg mb-4", children: "Camera Preview" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 justify-center", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: startCamera, variant: "secondary", children: "Start Camera" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: triggerFileUpload, variant: "secondary", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Upload Image" })] })] })] }) })) }), isStreaming && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: capturePhoto, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Capture Photo" })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: stopCamera, variant: "outline", children: "Stop Camera" })] })), (0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center p-4 bg-black rounded-lg overflow-hidden", children: (0, jsx_runtime_1.jsx)("img", { src: capturedImage, alt: "Captured", className: "max-w-full max-h-[400px] object-contain", style: {
                                                                width: 'auto',
                                                                height: 'auto'
                                                            } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: retakePhoto, variant: "outline", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RotateCw, { className: "h-4 w-4 mr-2" }), "Retake"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => setActiveTab('measurement'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Continue to Measurement" })] })] })] })) })] }) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "measurement", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-4", children: "Select Image" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: measurements.map((measurement) => ((0, jsx_runtime_1.jsx)("div", { className: `p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedImage?.id === measurement.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`, onClick: () => setSelectedImage(measurement), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 rounded border overflow-hidden flex-shrink-0", children: (0, jsx_runtime_1.jsx)("img", { src: measurement.image, alt: "Preview", className: "w-full h-full object-cover" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium", children: new Date(measurement.date || measurement.timestamp).toLocaleDateString() }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["L: ", measurement.length?.toFixed(1), measurement.unit, ", G: ", measurement.girth?.toFixed(1), measurement.unit] })] })] }) }, measurement.id))) })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-4", children: "Measurement Tools" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "unit", children: "Measurement Unit" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: measurementUnit, onValueChange: (value) => setMeasurementUnit(value), title: "Measurement Unit", children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "cm", children: "Centimeters (cm)" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "in", children: "Inches (in)" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Measurement Tools" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: selectedTool === 'ruler' ? 'default' : 'outline', size: "sm", onClick: () => setSelectedTool(selectedTool === 'ruler' ? 'none' : 'ruler'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ruler, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Ruler" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: selectedTool === 'tape' ? 'default' : 'outline', size: "sm", onClick: () => setSelectedTool(selectedTool === 'tape' ? 'none' : 'tape'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Tape" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: selectedTool === 'caliper' ? 'default' : 'outline', size: "sm", onClick: () => setSelectedTool(selectedTool === 'caliper' ? 'none' : 'caliper'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Circle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Caliper" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: selectedTool === 'protractor' ? 'default' : 'outline', size: "sm", onClick: () => setSelectedTool(selectedTool === 'protractor' ? 'none' : 'protractor'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Protractor" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: selectedTool === 'compass' ? 'default' : 'outline', size: "sm", onClick: () => setSelectedTool(selectedTool === 'compass' ? 'none' : 'compass'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Circle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Compass" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: showGrid ? 'default' : 'outline', size: "sm", onClick: () => setShowGrid(!showGrid), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Square, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Grid" })] })] })] }), selectedTool !== 'none' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [(0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "toolSize", children: ["Tool Size (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "toolSize", type: "number", value: toolSize, onChange: (e) => setToolSize(parseFloat(e.target.value)), step: "0.1", min: "0.1", max: "100" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: [selectedTool === 'ruler' && 'Set ruler length for accurate measurements', selectedTool === 'tape' && 'Set tape measure length for flexible measurements', selectedTool === 'caliper' && 'Set caliper opening for precise diameter measurements', selectedTool === 'protractor' && 'Set protractor radius for angle measurements', selectedTool === 'compass' && 'Set compass radius for circular measurements'] })] })), showGrid && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [(0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "gridSize", children: ["Grid Size (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "gridSize", type: "number", value: gridSize, onChange: (e) => setGridSize(parseFloat(e.target.value)), step: "0.1", min: "0.1", max: "10" }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500", children: "Grid helps with precise measurements and alignment" })] })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "reference", children: ["Reference Object Size (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "reference", type: "number", value: referenceMeasurement, onChange: (e) => setReferenceMeasurement(e.target.value), step: "0.1", min: "0" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Measurement Tools" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setSelectedTool('ruler'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ruler, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Ruler" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setSelectedTool('tape'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Tape" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setSelectedTool('caliper'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Circle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Caliper" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setSelectedTool('protractor'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Protractor" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setSelectedTool('compass'), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Circle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Compass" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setShowGrid(!showGrid), className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Square, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Grid" })] })] })] }), selectedTool !== 'none' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [(0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "toolSize", children: ["Tool Size (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "toolSize", type: "number", value: toolSize, onChange: (e) => setToolSize(parseFloat(e.target.value)), step: "0.1", min: "0.1", max: "100" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: [selectedTool === 'ruler' && 'Set ruler length for accurate measurements', selectedTool === 'tape' && 'Set tape measure length for flexible measurements', selectedTool === 'caliper' && 'Set caliper opening for precise diameter measurements', selectedTool === 'protractor' && 'Set protractor radius for angle measurements', selectedTool === 'compass' && 'Set compass radius for circular measurements'] })] })), showGrid && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [(0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "gridSize", children: ["Grid Size (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "gridSize", type: "number", value: gridSize, onChange: (e) => setGridSize(parseFloat(e.target.value)), step: "0.1", min: "0.1", max: "10" }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500", children: "Grid helps with precise measurements and alignment" })] })), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => selectedImage && analyzeAutomatically(selectedImage.image), disabled: !selectedImage || isAnalyzing, className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-4 w-4 mr-2" }), isAnalyzing ? 'Analyzing...' : 'Auto Analyze'] }), isAnalyzing && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)(progress_1.Progress, { value: analysisProgress, className: "w-full" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 mt-1", children: [analysisProgress, "% Complete"] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "length", children: ["Length (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "length", type: "number", value: lengthMeasurement, onChange: (e) => setLengthMeasurement(e.target.value), step: "0.1", min: "0" }), (0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: "girth", children: ["Girth (", measurementUnit, ")"] }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "girth", type: "number", value: girthMeasurement, onChange: (e) => setGirthMeasurement(e.target.value), step: "0.1", min: "0" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: saveMeasurement, className: "w-full", disabled: !selectedImage, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }), "Save Measurement"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: clearCanvas, variant: "outline", className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }), "Clear Canvas"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => setShowAnalysisPoints(!showAnalysisPoints), variant: "outline", className: "w-full", disabled: !autoMeasurement, children: [showAnalysisPoints ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-4 w-4 mr-2" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }), showAnalysisPoints ? 'Hide' : 'Show', " Analysis Points"] })] })] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "lg:col-span-2", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Measurement Canvas" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: triggerFileUpload, variant: "outline", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }), "Upload Image"] })] }), (0, jsx_runtime_1.jsx)("div", { ref: containerRef, className: "relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900", children: selectedImage ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center items-center p-4", children: [(0, jsx_runtime_1.jsx)("img", { src: selectedImage.image, alt: "Selected", className: "max-w-full max-h-[600px] object-contain", style: {
                                                                        width: 'auto',
                                                                        height: 'auto'
                                                                    } }), renderAnalysisPoints(), renderMeasurementTools()] })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-64 text-gray-500", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ruler, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "Select an image or upload a new one to begin measurement analysis" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: triggerFileUpload, variant: "outline", className: "mt-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }), "Upload Image"] })] }) })) }), autoMeasurement && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Automatic Analysis Results" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Length:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [convertUnit(autoMeasurement.length, 'cm', measurementUnit).toFixed(1), measurementUnit] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Girth:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [convertUnit(autoMeasurement.girth, 'cm', measurementUnit).toFixed(1), measurementUnit] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Confidence:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [(autoMeasurement.confidence * 100).toFixed(1), "%"] })] })] })] }))] }) }) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "analysis", className: "space-y-6", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "Data Analysis" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: analysisFilters.unit, onValueChange: (value) => setAnalysisFilters(prev => ({ ...prev, unit: value })), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-24", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "cm", children: "cm" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "in", children: "in" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: analysisFilters.dateRange, onValueChange: (value) => setAnalysisFilters(prev => ({ ...prev, dateRange: value })), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-32", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "7d", children: "Last 7 days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "30d", children: "Last 30 days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "90d", children: "Last 90 days" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "1y", children: "Last year" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "all", children: "All time" })] })] })] })] }), analysisData ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "h-4 w-4 text-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Total Measurements" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold", children: analysisData.statistics.totalMeasurements })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ruler, { className: "h-4 w-4 text-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Avg Length" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-2xl font-bold", children: [analysisData.statistics.averageLength.toFixed(1), analysisFilters.unit] })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 text-purple-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Avg Girth" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-2xl font-bold", children: [analysisData.statistics.averageGirth.toFixed(1), analysisFilters.unit] })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 text-orange-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "Total Sessions" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold", children: analysisData.statistics.totalSessions })] }) })] }), analysisData.recommendations.length > 0 && ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Recommendations" })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: analysisData.recommendations.map((rec, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: rec })] }, index))) }) })] })), analysisData.trends.dates.length > 0 && ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Measurement Trends" }), (0, jsx_runtime_1.jsxs)(card_1.CardDescription, { children: ["Progress over time in ", analysisFilters.unit] })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { className: "text-slate-600 dark:text-slate-400", children: "Chart visualization would be implemented here" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 space-y-2", children: analysisData.trends.dates.map((date, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "text-xs", children: [date, ": L: ", analysisData.trends.length[index]?.toFixed(1), analysisFilters.unit, ", G: ", analysisData.trends.girth[index]?.toFixed(1), analysisFilters.unit] }, index))) })] }) }) })] }))] })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg", children: (0, jsx_runtime_1.jsx)("p", { className: "text-slate-600 dark:text-slate-400", children: "No data available for analysis" }) }))] }) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "sessions", className: "space-y-6", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4", children: "Pumping Sessions" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "pressure", children: "Pressure (Hg)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "pressure", type: "number", value: pumpingPressure, onChange: (e) => setPumpingPressure(parseInt(e.target.value)), min: "1", max: "15" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "sets", children: "Sets" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "sets", type: "number", value: pumpingSets, onChange: (e) => setPumpingSets(parseInt(e.target.value)), min: "1", max: "10" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "focus", children: "Focus" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: pumpingFocus, onValueChange: (value) => setPumpingFocus(value), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "length", children: "Length" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "girth", children: "Girth" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "both", children: "Both" })] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2", children: formatTime(pumpingTimer) }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center space-x-2", children: !isPumpingSessionActive ? ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: startPumpingSession, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Play, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Start" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: pausePumpingSession, variant: "outline", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pause, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Pause" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: stopPumpingSession, variant: "destructive", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Square, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Stop" })] })] })) })] }) })] })] }) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "progress", className: "space-y-6", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "Progress Tracking" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: progressUnit, onValueChange: (value) => setProgressUnit(value), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-24", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "cm", children: "cm" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "in", children: "in" })] })] })] }), progressData.length > 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-600", children: "Total Measurements" }), (0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: progressData.length })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-600", children: "Length Change" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [progressData.length > 1
                                                                                ? (progressData[progressData.length - 1].length - progressData[0].length).toFixed(1)
                                                                                : '0.0', progressUnit] })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-600", children: "Girth Change" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: [progressData.length > 1
                                                                                ? (progressData[progressData.length - 1].girth - progressData[0].girth).toFixed(1)
                                                                                : '0.0', progressUnit] })] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Progress Over Time" }), (0, jsx_runtime_1.jsxs)(card_1.CardDescription, { children: ["Measurements in ", progressUnit] })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { className: "text-slate-600 dark:text-slate-400", children: "Chart visualization would be implemented here" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 space-y-2 max-h-32 overflow-y-auto", children: progressData.map((entry, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "text-xs", children: [entry.date, ": L: ", entry.length.toFixed(1), entry.unit, ", G: ", entry.girth.toFixed(1), entry.unit] }, index))) })] }) }) })] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg", children: (0, jsx_runtime_1.jsx)("p", { className: "text-slate-600 dark:text-slate-400", children: "No progress data available. Start taking measurements to track your progress." }) }))] }) }) })] })] }) }));
};
exports.default = IntegratedMeasurementAnalysis;
