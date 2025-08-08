import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCw, ArrowLeft, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { imageStorage } from '@/utils/imageStorage';

interface CameraCaptureProps {
  onBack: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setIsStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  const saveImageData = async (imageData: string) => {
    try {
      // Check image size before saving
      const imageSize = new Blob([imageData]).size;
      
      if (imageSize > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Image Too Large",
          description: "Please select a smaller image or reduce quality.",
          variant: "destructive"
        });
        return;
      }
      
      const newMeasurement = {
        id: Date.now().toString(),
        image: imageData,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        measurements: null
      };
      
      await imageStorage.saveImage(newMeasurement);
      
      toast({
        title: "Image Saved Securely",
        description: "Image stored in secure database on your device only."
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = useCallback(() => {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        saveImageData(imageData);
        stopCamera(); // Stop camera if it was running
      };
      reader.readAsDataURL(file);
    } else {
      toast({
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Capture or Upload Image</h2>
        <div></div>
      </div>

      {/* Privacy reminder */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800 flex items-center space-x-2">
          <span className="text-green-600">🔒</span>
          <span>All images are stored securely on your device only. No data leaves your phone.</span>
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {!capturedImage ? (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {isStreaming ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-4">Camera Preview</p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={startCamera} variant="secondary">
                          Start Camera
                        </Button>
                        <Button onClick={triggerFileUpload} variant="secondary" className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload Image</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Photography Tips:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ensure good lighting conditions</li>
                  <li>• Keep the camera steady and parallel</li>
                  <li>• Include a reference object for scale (coin, ruler)</li>
                  <li>• Maintain consistent distance and angle</li>
                </ul>
              </div>

              <div className="flex justify-center gap-4">
                {isStreaming && (
                  <Button onClick={capturePhoto} size="lg" className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Capture Photo</span>
                  </Button>
                )}
                {!isStreaming && (
                  <Button onClick={triggerFileUpload} size="lg" className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload from Device</span>
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload image file"
                title="Upload image file"
              />
            </>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5" />
                  <span>Image Ready for Analysis</span>
                </h3>
                <img src={capturedImage} alt="Selected" className="max-w-full h-auto rounded-lg mx-auto" />
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={retakePhoto} variant="outline" className="flex items-center space-x-2">
                  <RotateCw className="h-4 w-4" />
                  <span>Choose Different Image</span>
                </Button>
                <Button onClick={triggerFileUpload} variant="outline" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Different Image</span>
                </Button>
                <Button onClick={onBack} className="flex items-center space-x-2">
                  <span>Continue to Measurement</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
