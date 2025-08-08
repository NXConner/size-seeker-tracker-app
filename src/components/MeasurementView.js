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
const use_toast_1 = require("@/hooks/use-toast");
const secureStorage_1 = require("@/utils/secureStorage");
const imageStorage_1 = require("@/utils/imageStorage");
const imageAnalysis_1 = require("@/utils/imageAnalysis");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const MeasurementView = ({ onBack }) => {
    const { unit, setUnit } = (0, ThemeContext_1.useTheme)();
    const [measurements, setMeasurements] = (0, react_1.useState)([]);
    const [selectedImage, setSelectedImage] = (0, react_1.useState)(null);
    const [lengthMeasurement, setLengthMeasurement] = (0, react_1.useState)('');
    const [girthMeasurement, setGirthMeasurement] = (0, react_1.useState)('');
    const [referenceMeasurement, setReferenceMeasurement] = (0, react_1.useState)('2.5');
    const [autoMeasurement, setAutoMeasurement] = (0, react_1.useState)(null);
    const [overlayImage, setOverlayImage] = (0, react_1.useState)(null);
    const [showManual, setShowManual] = (0, react_1.useState)(false);
    const [isAnalyzing, setIsAnalyzing] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [analysisProgress, setAnalysisProgress] = (0, react_1.useState)(0);
    // Enhanced measurement tools with snap-to-shape
    const [toolMode, setToolMode] = (0, react_1.useState)('none');
    const [manualMeasurements, setManualMeasurements] = (0, react_1.useState)([]);
    const [isDrawing, setIsDrawing] = (0, react_1.useState)(false);
    const [drawingPoints, setDrawingPoints] = (0, react_1.useState)([]);
    const [showObjectOutline, setShowObjectOutline] = (0, react_1.useState)(false);
    const [objectOutline, setObjectOutline] = (0, react_1.useState)([]);
    const [highlightedObject, setHighlightedObject] = (0, react_1.useState)([]);
    const [referencePoints, setReferencePoints] = (0, react_1.useState)({});
    const [canvasMode, setCanvasMode] = (0, react_1.useState)('view');
    // Snap-to-shape specific state
    const [snapToShapeResult, setSnapToShapeResult] = (0, react_1.useState)(null);
    const [isSnapping, setIsSnapping] = (0, react_1.useState)(false);
    const [snapConfidence, setSnapConfidence] = (0, react_1.useState)(0);
    const [snapTolerance, setSnapTolerance] = (0, react_1.useState)(10);
    const [snapMode, setSnapMode] = (0, react_1.useState)('auto');
    // Canvas refs
    const canvasRef = (0, react_1.useRef)(null);
    const imageRef = (0, react_1.useRef)(null);
    const containerRef = (0, react_1.useRef)(null);
    // Load measurements from both IndexedDB and localStorage
    const loadMeasurements = async () => {
        try {
            setIsLoading(true);
            // Load from IndexedDB (new images)
            const indexedDBImages = await imageStorage_1.imageStorage.getAllImages();
            // Load from localStorage (old measurements)
            const localStorageMeasurements = (await secureStorage_1.secureStorage.getItem('measurements')) || [];
            // Combine both sources, prioritizing IndexedDB
            const allMeasurements = [...indexedDBImages];
            // Add localStorage measurements that don't exist in IndexedDB
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
        try {
            setIsAnalyzing(true);
            setAnalysisProgress(0);
            // Create analysis options with reference points
            const options = {
                referenceObjectSize: parseFloat(referenceMeasurement),
                minConfidence: 0.6,
                enableAutoDetection: true,
                referencePoints: Object.keys(referencePoints).length > 0 ? referencePoints : undefined
            };
            // Simulate progress
            const progressInterval = setInterval(() => {
                setAnalysisProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);
            const result = await imageAnalysis_1.imageAnalyzer.analyzeImage(image, options);
            clearInterval(progressInterval);
            setAnalysisProgress(100);
            setAutoMeasurement(result);
            // Auto-fill manual measurements with automatic results
            setLengthMeasurement(result.length.toString());
            setGirthMeasurement(result.girth.toString());
            // Create enhanced overlay image with measurements
            const overlay = await imageAnalysis_1.imageAnalyzer.createEnhancedOverlay(image, result, manualMeasurements, highlightedObject);
            setOverlayImage(overlay);
            (0, use_toast_1.toast)({
                title: "Analysis Complete",
                description: "Automatic measurements have been calculated and displayed.",
            });
        }
        catch (error) {
            console.error('Analysis error:', error);
            (0, use_toast_1.toast)({
                title: "Analysis Failed",
                description: "Could not automatically analyze image. Please use manual tools.",
                variant: "destructive"
            });
        }
        finally {
            setIsAnalyzing(false);
            setAnalysisProgress(0);
        }
    };
    (0, react_1.useEffect)(() => {
        if (selectedImage && selectedImage.image) {
            // Don't auto-analyze, let user click button
            setOverlayImage(null);
            setAutoMeasurement(null);
            clearCanvas();
        }
    }, [selectedImage]);
    // Enhanced snap-to-shape functionality
    const handleSnapToShape = async (x, y) => {
        if (!selectedImage?.image)
            return;
        try {
            setIsSnapping(true);
            setSnapConfidence(0);
            // Simulate AI-powered object detection and shape snapping
            const result = await imageAnalysis_1.imageAnalyzer.detectAndSnapToShape(selectedImage.image, { x, y }, {
                tolerance: snapTolerance,
                mode: snapMode,
                minArea: 100,
                maxArea: 10000
            });
            setSnapToShapeResult(result);
            setSnapConfidence(result.confidence);
            setObjectOutline(result.outline);
            setShowObjectOutline(true);
            // Auto-calculate measurements based on snapped shape
            if (result.objectType === 'rectangle') {
                const length = result.boundingBox.width * (parseFloat(referenceMeasurement) / 100);
                const girth = result.boundingBox.height * (parseFloat(referenceMeasurement) / 100);
                setLengthMeasurement(length.toFixed(1));
                setGirthMeasurement(girth.toFixed(1));
            }
            else if (result.objectType === 'circle') {
                const diameter = Math.max(result.boundingBox.width, result.boundingBox.height) * (parseFloat(referenceMeasurement) / 100);
                const circumference = Math.PI * diameter;
                setLengthMeasurement(diameter.toFixed(1));
                setGirthMeasurement(circumference.toFixed(1));
            }
            (0, use_toast_1.toast)({
                title: "Shape Detected",
                description: `${result.objectType} detected with ${(result.confidence * 100).toFixed(1)}% confidence`,
            });
        }
        catch (error) {
            console.error('Snap to shape error:', error);
            (0, use_toast_1.toast)({
                title: "Shape Detection Failed",
                description: "Could not detect shape. Try adjusting tolerance or mode.",
                variant: "destructive"
            });
        }
        finally {
            setIsSnapping(false);
        }
    };
    const handleCanvasClick = (event) => {
        if (!canvasRef.current || toolMode === 'none')
            return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const point = { x, y };
        if (toolMode === 'snap') {
            handleSnapToShape(x, y);
        }
        else if (toolMode === 'highlight') {
            handleObjectHighlight(x, y);
        }
        else if (toolMode === 'reference') {
            handleReferencePoint(x, y);
        }
        else if (toolMode === 'length' || toolMode === 'girth') {
            if (!isDrawing) {
                setIsDrawing(true);
                setDrawingPoints([point]);
            }
            else {
                setIsDrawing(false);
                setDrawingPoints(prev => [...prev, point]);
                // Create measurement
                const measurement = {
                    type: toolMode,
                    startPoint: drawingPoints[0],
                    endPoint: point,
                    measurements: {}
                };
                // Calculate measurement based on reference
                const distance = Math.sqrt(Math.pow(point.x - drawingPoints[0].x, 2) +
                    Math.pow(point.y - drawingPoints[0].y, 2));
                const pixelToCmRatio = parseFloat(referenceMeasurement) / 100; // Assuming reference is in cm
                const actualMeasurement = distance * pixelToCmRatio;
                measurement.measurements[toolMode] = actualMeasurement;
                setManualMeasurements(prev => [...prev, measurement]);
                setDrawingPoints([]);
                setToolMode('none');
            }
        }
    };
    const handleObjectHighlight = async (x, y) => {
        if (!selectedImage?.image)
            return;
        try {
            // Use AI to detect object boundaries around the clicked point
            const boundaries = await imageAnalysis_1.imageAnalyzer.detectObjectBoundaries(selectedImage.image, { x, y }, { tolerance: 20, minArea: 100 });
            setHighlightedObject(boundaries);
            setShowObjectOutline(true);
            (0, use_toast_1.toast)({
                title: "Object Highlighted",
                description: "Object boundaries have been detected and highlighted.",
            });
        }
        catch (error) {
            console.error('Highlight error:', error);
            (0, use_toast_1.toast)({
                title: "Highlight Failed",
                description: "Could not highlight object. Please try again.",
                variant: "destructive"
            });
        }
    };
    const handleReferencePoint = (x, y) => {
        const point = { x, y };
        if (!referencePoints.length) {
            setReferencePoints({ length: point });
            (0, use_toast_1.toast)({
                title: "Length Reference Set",
                description: "Click another point to set girth reference.",
            });
        }
        else if (!referencePoints.girth) {
            setReferencePoints(prev => ({ ...prev, girth: point }));
            (0, use_toast_1.toast)({
                title: "Reference Points Set",
                description: "Both length and girth reference points have been set.",
            });
        }
        else {
            // Reset and set new length reference
            setReferencePoints({ length: point });
            (0, use_toast_1.toast)({
                title: "Reference Reset",
                description: "Length reference point has been updated.",
            });
        }
    };
    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
    const saveMeasurement = async () => {
        if (!selectedImage) {
            (0, use_toast_1.toast)({
                title: "No Image Selected",
                description: "Please select an image first.",
                variant: "destructive"
            });
            return;
        }
        const measurementData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            image: selectedImage.image,
            overlay: overlayImage,
            length: parseFloat(lengthMeasurement) || 0,
            girth: parseFloat(girthMeasurement) || 0,
            referenceMeasurement: parseFloat(referenceMeasurement),
            autoMeasurement,
            manualMeasurements,
            highlightedObject,
            referencePoints,
            snapToShapeResult,
            unit
        };
        try {
            // Save to IndexedDB
            await imageStorage_1.imageStorage.saveImage(measurementData);
            // Also save to localStorage for backward compatibility
            const existingMeasurements = (await secureStorage_1.secureStorage.getItem('measurements')) || [];
            secureStorage_1.secureStorage.setItem('measurements', [...existingMeasurements, measurementData]);
            setMeasurements(prev => [measurementData, ...prev]);
            (0, use_toast_1.toast)({
                title: "Measurement Saved",
                description: "Your measurement has been saved successfully.",
            });
            // Reset form
            setSelectedImage(null);
            setLengthMeasurement('');
            setGirthMeasurement('');
            setOverlayImage(null);
            setAutoMeasurement(null);
            clearCanvas();
        }
        catch (error) {
            console.error('Save error:', error);
            (0, use_toast_1.toast)({
                title: "Save Failed",
                description: "Failed to save measurement. Please try again.",
                variant: "destructive"
            });
        }
    };
    const deleteMeasurement = async (id) => {
        try {
            // Remove from IndexedDB
            await imageStorage_1.imageStorage.deleteImage(id);
            // Remove from localStorage
            const existingMeasurements = (await secureStorage_1.secureStorage.getItem('measurements')) || [];
            const filteredMeasurements = existingMeasurements.filter((m) => m.id !== id);
            secureStorage_1.secureStorage.setItem('measurements', filteredMeasurements);
            setMeasurements(prev => prev.filter(m => m.id !== id));
            (0, use_toast_1.toast)({
                title: "Measurement Deleted",
                description: "Measurement has been removed.",
            });
        }
        catch (error) {
            console.error('Delete error:', error);
            (0, use_toast_1.toast)({
                title: "Delete Failed",
                description: "Failed to delete measurement. Please try again.",
                variant: "destructive"
            });
        }
    };
    const handleImageSelect = (measurement) => {
        setSelectedImage(measurement);
        setLengthMeasurement(measurement.length?.toString() || '');
        setGirthMeasurement(measurement.girth?.toString() || '');
        setOverlayImage(measurement.overlay);
        setAutoMeasurement(measurement.autoMeasurement);
        setManualMeasurements(measurement.manualMeasurements || []);
        setHighlightedObject(measurement.highlightedObject || []);
        setReferencePoints(measurement.referencePoints || {});
        setSnapToShapeResult(measurement.snapToShapeResult || null);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto p-4 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: onBack, variant: "outline", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), "Back to Dashboard"] }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Measurement Analysis" }), (0, jsx_runtime_1.jsx)("div", { className: "w-20" }), " "] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-4", children: "Select Image" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: measurements.map((measurement) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedImage?.id === measurement.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`, onClick: () => handleImageSelect(measurement), children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium", children: new Date(measurement.date).toLocaleDateString() }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["L: ", measurement.length?.toFixed(1), "cm, G: ", measurement.girth?.toFixed(1), "cm"] })] }, measurement.id))) })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-4", children: "Measurement Tools" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "reference", children: "Reference Object Size (cm)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "reference", type: "number", value: referenceMeasurement, onChange: (e) => setReferenceMeasurement(e.target.value), step: "0.1", min: "0" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "snapTolerance", children: "Snap Tolerance (px)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "snapTolerance", type: "number", value: snapTolerance, onChange: (e) => setSnapTolerance(parseInt(e.target.value)), min: "1", max: "50" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "snapMode", children: "Snap Mode" }), (0, jsx_runtime_1.jsxs)("select", { id: "snapMode", value: snapMode, onChange: (e) => setSnapMode(e.target.value), className: "w-full p-2 border rounded", title: "Snap Mode", children: [(0, jsx_runtime_1.jsx)("option", { value: "auto", children: "Auto Detect" }), (0, jsx_runtime_1.jsx)("option", { value: "manual", children: "Manual Snap" }), (0, jsx_runtime_1.jsx)("option", { value: "edge", children: "Edge Detection" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: toolMode === 'snap' ? 'default' : 'outline', size: "sm", onClick: () => setToolMode(toolMode === 'snap' ? 'none' : 'snap'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Magnet, { className: "h-4 w-4 mr-1" }), "Snap to Shape"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: toolMode === 'length' ? 'default' : 'outline', size: "sm", onClick: () => setToolMode(toolMode === 'length' ? 'none' : 'length'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ruler, { className: "h-4 w-4 mr-1" }), "Length"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: toolMode === 'girth' ? 'default' : 'outline', size: "sm", onClick: () => setToolMode(toolMode === 'girth' ? 'none' : 'girth'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Circle, { className: "h-4 w-4 mr-1" }), "Girth"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: toolMode === 'highlight' ? 'default' : 'outline', size: "sm", onClick: () => setToolMode(toolMode === 'highlight' ? 'none' : 'highlight'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4 mr-1" }), "Highlight"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: toolMode === 'reference' ? 'default' : 'outline', size: "sm", onClick: () => setToolMode(toolMode === 'reference' ? 'none' : 'reference'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 mr-1" }), "Reference"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: toolMode === 'crop' ? 'default' : 'outline', size: "sm", onClick: () => setToolMode(toolMode === 'crop' ? 'none' : 'crop'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Crop, { className: "h-4 w-4 mr-1" }), "Crop"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => selectedImage && analyzeAutomatically(selectedImage.image), disabled: !selectedImage || isAnalyzing, className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-4 w-4 mr-2" }), isAnalyzing ? 'Analyzing...' : 'Auto Analyze'] }), isAnalyzing && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)(progress_1.Progress, { value: analysisProgress, className: "w-full" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 mt-1", children: [analysisProgress, "% Complete"] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-3", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "length", children: "Length (cm)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "length", type: "number", value: lengthMeasurement, onChange: (e) => setLengthMeasurement(e.target.value), step: "0.1", min: "0" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "girth", children: "Girth (cm)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "girth", type: "number", value: girthMeasurement, onChange: (e) => setGirthMeasurement(e.target.value), step: "0.1", min: "0" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: saveMeasurement, className: "w-full", disabled: !selectedImage, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }), "Save Measurement"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: clearCanvas, variant: "outline", className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }), "Clear Canvas"] })] })] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "lg:col-span-2", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Measurement Canvas" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: showObjectOutline ? 'default' : 'secondary', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-3 w-3 mr-1" }), "Outline"] }), (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: Object.keys(referencePoints).length > 0 ? 'default' : 'secondary', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-3 w-3 mr-1" }), "Reference"] }), snapToShapeResult && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "default", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Magnet, { className: "h-3 w-3 mr-1" }), snapToShapeResult.objectType] }))] })] }), (0, jsx_runtime_1.jsx)("div", { ref: containerRef, className: "relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900", children: selectedImage ? ((0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef, className: "w-full h-auto cursor-crosshair", onClick: handleCanvasClick, style: { maxHeight: '600px' } })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-64 text-gray-500", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ruler, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "Select an image to begin measurement analysis" })] }) })) }), snapToShapeResult && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Shape Detection Results" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Object Type:" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 font-medium capitalize", children: snapToShapeResult.objectType })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Confidence:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [(snapToShapeResult.confidence * 100).toFixed(1), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Width:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [snapToShapeResult.boundingBox.width.toFixed(1), "px"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Height:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [snapToShapeResult.boundingBox.height.toFixed(1), "px"] })] })] })] })), autoMeasurement && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Automatic Analysis Results" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Length:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [autoMeasurement.length.toFixed(1), "cm"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Girth:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [autoMeasurement.girth.toFixed(1), "cm"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Confidence:" }), (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 font-medium", children: [(autoMeasurement.confidence * 100).toFixed(1), "%"] })] })] })] })), manualMeasurements.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Manual Measurements" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: manualMeasurements.map((measurement, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "capitalize", children: [measurement.type, ":"] }), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: [measurement.measurements[measurement.type]?.toFixed(1), "cm"] })] }, index))) })] }))] }) }) })] })] }));
};
exports.default = MeasurementView;
