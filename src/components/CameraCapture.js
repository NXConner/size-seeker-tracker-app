"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const imageStorage_1 = require("@/utils/imageStorage");
const CameraCapture = ({ onBack }) => {
    const videoRef = (0, react_1.useRef)(null);
    const canvasRef = (0, react_1.useRef)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const [stream, setStream] = (0, react_1.useState)(null);
    const [isStreaming, setIsStreaming] = (0, react_1.useState)(false);
    const [capturedImage, setCapturedImage] = (0, react_1.useState)(null);
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
            // Check image size before saving
            const imageSize = new Blob([imageData]).size;
            if (imageSize > 5 * 1024 * 1024) { // 5MB limit
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
                const imageData = canvas.toDataURL('image/jpeg', 0.8); // Reduced quality for smaller size
                setCapturedImage(imageData);
                saveImageData(imageData);
                stopCamera();
            }
        }
    }, [stopCamera]);
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            // Check file size
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
                stopCamera(); // Stop camera if it was running
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Capture or Upload Image" }), (0, jsx_runtime_1.jsx)("div", {})] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-green-800 flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-green-600", children: "\uD83D\uDD12" }), (0, jsx_runtime_1.jsx)("span", { children: "All images are stored securely on your device only. No data leaves your phone." })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { className: "p-6", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: !capturedImage ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "relative bg-black rounded-lg overflow-hidden", style: { aspectRatio: '16/9' }, children: isStreaming ? ((0, jsx_runtime_1.jsx)("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full h-full object-cover" })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full text-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-16 w-16 mx-auto mb-4 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg mb-4", children: "Camera Preview" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 justify-center", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: startCamera, variant: "secondary", children: "Start Camera" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: triggerFileUpload, variant: "secondary", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Upload Image" })] })] })] }) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-blue-50 p-4 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-blue-800 mb-2", children: "Photography Tips:" }), (0, jsx_runtime_1.jsxs)("ul", { className: "text-sm text-blue-700 space-y-1", children: [(0, jsx_runtime_1.jsx)("li", { children: "\u2022 Ensure good lighting conditions" }), (0, jsx_runtime_1.jsx)("li", { children: "\u2022 Keep the camera steady and parallel" }), (0, jsx_runtime_1.jsx)("li", { children: "\u2022 Include a reference object for scale (coin, ruler)" }), (0, jsx_runtime_1.jsx)("li", { children: "\u2022 Maintain consistent distance and angle" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center gap-4", children: [isStreaming && ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: capturePhoto, size: "lg", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Capture Photo" })] })), !isStreaming && ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: triggerFileUpload, size: "lg", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Upload from Device" })] }))] }), (0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden", "aria-label": "Upload image file", title: "Upload image file" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-green-600 mb-4 flex items-center justify-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Image Ready for Analysis" })] }), (0, jsx_runtime_1.jsx)("img", { src: capturedImage, alt: "Selected", className: "max-w-full h-auto rounded-lg mx-auto" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: retakePhoto, variant: "outline", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RotateCw, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Choose Different Image" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: triggerFileUpload, variant: "outline", className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Upload Different Image" })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: onBack, className: "flex items-center space-x-2", children: (0, jsx_runtime_1.jsx)("span", { children: "Continue to Measurement" }) })] })] })) }) }), (0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef, className: "hidden" })] }));
};
exports.default = CameraCapture;
