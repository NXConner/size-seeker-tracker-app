import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Ruler, Save, Trash2, MousePointer, Circle, Square, RotateCcw, Eye, EyeOff, Target, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { secureStorage } from '@/utils/secureStorage';
import { imageStorage } from '@/utils/imageStorage';
import { imageAnalyzer, MeasurementResult, ImageAnalysisOptions } from '@/utils/imageAnalysis';
import { useTheme } from '@/contexts/ThemeContext';

interface MeasurementViewProps {
  onBack: () => void;
}

interface MeasurementPoint {
  x: number;
  y: number;
}

interface ManualMeasurement {
  type: 'length' | 'girth' | 'area';
  startPoint: MeasurementPoint;
  endPoint?: MeasurementPoint;
  centerPoint?: MeasurementPoint;
  radius?: number;
  measurements: {
    length?: number;
    girth?: number;
    area?: number;
  };
}

interface ReferencePoints {
  length?: MeasurementPoint;
  girth?: MeasurementPoint;
}

const MeasurementView: React.FC<MeasurementViewProps> = ({ onBack }) => {
  const { unit, setUnit } = useTheme();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [lengthMeasurement, setLengthMeasurement] = useState('');
  const [girthMeasurement, setGirthMeasurement] = useState('');
  const [referenceMeasurement, setReferenceMeasurement] = useState('2.5');
  const [autoMeasurement, setAutoMeasurement] = useState<MeasurementResult | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Enhanced measurement tools
  const [toolMode, setToolMode] = useState<'none' | 'length' | 'girth' | 'area' | 'highlight' | 'reference'>('none');
  const [manualMeasurements, setManualMeasurements] = useState<ManualMeasurement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<MeasurementPoint[]>([]);
  const [showObjectOutline, setShowObjectOutline] = useState(false);
  const [objectOutline, setObjectOutline] = useState<MeasurementPoint[]>([]);
  const [highlightedObject, setHighlightedObject] = useState<MeasurementPoint[]>([]);
  const [referencePoints, setReferencePoints] = useState<ReferencePoints>({});
  const [canvasMode, setCanvasMode] = useState<'view' | 'measure' | 'highlight' | 'reference'>('view');
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load measurements from both IndexedDB and localStorage
  const loadMeasurements = async () => {
    try {
      setIsLoading(true);
      
      // Load from IndexedDB (new images)
      const indexedDBImages = await imageStorage.getAllImages();
      
      // Load from localStorage (old measurements)
      const localStorageMeasurements = secureStorage.getItem('measurements') || [];
      
      // Combine both sources, prioritizing IndexedDB
      const allMeasurements = [...indexedDBImages];
      
      // Add localStorage measurements that don't exist in IndexedDB
      localStorageMeasurements.forEach((localItem: any) => {
        const exists = allMeasurements.find((item: any) => item.id === localItem.id);
        if (!exists) {
          allMeasurements.push(localItem);
        }
      });
      
      setMeasurements(allMeasurements);
    } catch (error) {
      console.error('Error loading measurements:', error);
      toast({
        title: "Load Error",
        description: "Failed to load measurements. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  const analyzeAutomatically = async (image: string) => {
    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      // Create analysis options with reference points
      const options: ImageAnalysisOptions = {
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

      const result = await imageAnalyzer.analyzeImage(image, options);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setAutoMeasurement(result);
      
      // Auto-fill manual measurements with automatic results
      setLengthMeasurement(result.length.toString());
      setGirthMeasurement(result.girth.toString());
      
      // Create enhanced overlay image with measurements
      const overlay = await imageAnalyzer.createEnhancedOverlay(
        image, 
        result, 
        manualMeasurements, 
        highlightedObject
      );
      setOverlayImage(overlay);
      
      toast({
        title: "Analysis Complete",
        description: "Automatic measurements have been calculated and displayed.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not automatically analyze image. Please use manual tools.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  useEffect(() => {
    if (selectedImage && selectedImage.image) {
      // Don't auto-analyze, let user click button
      setOverlayImage(null);
      setAutoMeasurement(null);
      clearCanvas();
    }
  }, [selectedImage]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || toolMode === 'none') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const point = { x, y };
    
    if (toolMode === 'highlight') {
      handleObjectHighlight(x, y);
    } else if (toolMode === 'reference') {
      handleReferencePoint(x, y);
    } else if (toolMode === 'length' || toolMode === 'girth') {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawingPoints([point]);
      } else {
        setIsDrawing(false);
        setDrawingPoints([]);
        
        const measurement: ManualMeasurement = {
          type: toolMode,
          startPoint: drawingPoints[0],
          endPoint: point,
          measurements: {}
        };
        
        // Calculate measurement based on reference object
        const distance = Math.sqrt(
          Math.pow(point.x - drawingPoints[0].x, 2) + 
          Math.pow(point.y - drawingPoints[0].y, 2)
        );
        const scaleFactor = parseFloat(referenceMeasurement) / 50; // Assuming 50px = reference size
        const measurementValue = distance * scaleFactor;
        
        if (toolMode === 'length') {
          measurement.measurements.length = measurementValue;
          setLengthMeasurement(measurementValue.toFixed(1));
        } else {
          measurement.measurements.girth = measurementValue;
          setGirthMeasurement(measurementValue.toFixed(1));
        }
        
        setManualMeasurements([...manualMeasurements, measurement]);
        setToolMode('none');
      }
    }
  };

  const handleObjectHighlight = async (x: number, y: number) => {
    if (!selectedImage?.image) return;

    try {
      // Use the enhanced object detection
      const objectPoints = await imageAnalyzer.detectObjectAtPoint(selectedImage.image, x, y);
      
      if (objectPoints.length > 0) {
        setHighlightedObject(objectPoints);
        setObjectOutline(objectPoints);
        drawCanvas();
        toast({
          title: "Object Highlighted",
          description: "Object has been highlighted and outlined for measurement.",
        });
      } else {
        toast({
          title: "No Object Found",
          description: "Click on a visible object to highlight it.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Object detection error:', error);
      toast({
        title: "Detection Failed",
        description: "Could not detect object at this point.",
        variant: "destructive"
      });
    }
  };

  const handleReferencePoint = (x: number, y: number) => {
    if (!referencePoints.length) {
      setReferencePoints({ length: { x, y } });
      toast({
        title: "Length Reference Set",
        description: "Length reference point has been set. Click again to set girth reference.",
      });
    } else if (!referencePoints.girth) {
      setReferencePoints(prev => ({ ...prev, girth: { x, y } }));
      toast({
        title: "Girth Reference Set",
        description: "Both reference points have been set. You can now auto-analyze with reference points.",
      });
    } else {
      setReferencePoints({ length: { x, y } });
      toast({
        title: "Reference Reset",
        description: "Length reference point has been reset.",
      });
    }
    drawCanvas();
  };

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw highlighted object
    if (highlightedObject.length > 0) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(highlightedObject[0].x * canvas.width / imageRef.current.naturalWidth, 
                 highlightedObject[0].y * canvas.height / imageRef.current.naturalHeight);
      for (let i = 1; i < highlightedObject.length; i++) {
        ctx.lineTo(highlightedObject[i].x * canvas.width / imageRef.current.naturalWidth, 
                   highlightedObject[i].y * canvas.height / imageRef.current.naturalHeight);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw manual measurements
    manualMeasurements.forEach(measurement => {
      if (measurement.startPoint && measurement.endPoint) {
        const startX = measurement.startPoint.x * canvas.width / imageRef.current.naturalWidth;
        const startY = measurement.startPoint.y * canvas.height / imageRef.current.naturalHeight;
        const endX = measurement.endPoint.x * canvas.width / imageRef.current.naturalWidth;
        const endY = measurement.endPoint.y * canvas.height / imageRef.current.naturalHeight;

        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.arc(startX, startY, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw reference points
    if (referencePoints.length) {
      const x = referencePoints.length.x * canvas.width / imageRef.current.naturalWidth;
      const y = referencePoints.length.y * canvas.height / imageRef.current.naturalHeight;
      
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('Length Ref', x + 10, y - 5);
    }

    if (referencePoints.girth) {
      const x = referencePoints.girth.x * canvas.width / imageRef.current.naturalWidth;
      const y = referencePoints.girth.y * canvas.height / imageRef.current.naturalHeight;
      
      ctx.fillStyle = '#0000ff';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('Girth Ref', x + 10, y - 5);
    }

    // Draw current drawing
    if (isDrawing && drawingPoints.length > 0) {
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x * canvas.width / imageRef.current.naturalWidth, 
                 drawingPoints[0].y * canvas.height / imageRef.current.naturalHeight);
      ctx.lineTo(canvas.width / 2, canvas.height / 2); // Temporary line to cursor
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [highlightedObject, manualMeasurements, referencePoints, isDrawing, drawingPoints]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const clearCanvas = () => {
    setManualMeasurements([]);
    setDrawingPoints([]);
    setObjectOutline([]);
    setHighlightedObject([]);
    setReferencePoints({});
    setToolMode('none');
    setIsDrawing(false);
  };

  const saveMeasurement = async () => {
    if (!selectedImage || !lengthMeasurement || !girthMeasurement) {
      toast({
        title: "Missing Information",
        description: "Please fill in all measurements.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update the selected image with measurements
      const updatedImage = {
        ...selectedImage,
        measurements: {
          length: parseFloat(lengthMeasurement),
          girth: parseFloat(girthMeasurement),
          reference: parseFloat(referenceMeasurement),
          measuredAt: new Date().toISOString(),
          autoMeasurement: autoMeasurement,
          manualMeasurements: manualMeasurements,
          referencePoints: referencePoints,
          objectOutline: highlightedObject
        }
      };

      // Save back to IndexedDB
      await imageStorage.saveImage(updatedImage);
      
      // Update local state
      const updatedMeasurements = measurements.map((m: any) =>
        m.id === selectedImage.id ? updatedImage : m
      );
      setMeasurements(updatedMeasurements);
      
      toast({
        title: "Measurement Saved",
        description: "Your measurements have been saved successfully."
      });

      setSelectedImage(null);
      setLengthMeasurement('');
      setGirthMeasurement('');
      setAutoMeasurement(null);
      setOverlayImage(null);
      clearCanvas();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save measurements. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      // Delete from IndexedDB
      await imageStorage.deleteImage(id);
      
      // Update local state
      const filtered = measurements.filter((m: any) => m.id !== id);
      setMeasurements(filtered);
      setSelectedImage(null);
      
      toast({
        title: "Measurement Deleted",
        description: "The measurement has been removed."
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete measurement. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (selectedImage) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedImage(null)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to List</span>
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analyze Measurement</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => analyzeAutomatically(selectedImage.image)}
              disabled={isAnalyzing}
              className="flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isAnalyzing ? 'Analyzing...' : 'Auto Analyze'}</span>
            </Button>
            <Button 
              onClick={clearCanvas}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear Tools</span>
            </Button>
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="p-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing image with enhanced detection...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Analysis Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Image Analysis</h3>
                <div className="flex gap-2">
                  <Button
                    variant={toolMode === 'highlight' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToolMode(toolMode === 'highlight' ? 'none' : 'highlight')}
                    className="flex items-center space-x-2"
                  >
                    <MousePointer className="h-4 w-4" />
                    <span>Highlight Object</span>
                  </Button>
                  <Button
                    variant={toolMode === 'reference' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToolMode(toolMode === 'reference' ? 'none' : 'reference')}
                    className="flex items-center space-x-2"
                  >
                    <Target className="h-4 w-4" />
                    <span>Set Reference</span>
                  </Button>
                  <Button
                    variant={toolMode === 'length' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToolMode(toolMode === 'length' ? 'none' : 'length')}
                    className="flex items-center space-x-2"
                  >
                    <Ruler className="h-4 w-4" />
                    <span>Length</span>
                  </Button>
                  <Button
                    variant={toolMode === 'girth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToolMode(toolMode === 'girth' ? 'none' : 'girth')}
                    className="flex items-center space-x-2"
                  >
                    <Circle className="h-4 w-4" />
                    <span>Girth</span>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                {overlayImage ? (
                  <img 
                    src={overlayImage} 
                    alt="Measurement Overlay" 
                    className="w-full h-auto rounded-lg border-2 border-dashed border-gray-300"
                  />
                ) : (
                  <div className="relative">
                    <img 
                      ref={imageRef}
                      src={selectedImage.image} 
                      alt="Measurement" 
                      className="w-full h-auto rounded-lg border-2 border-dashed border-gray-300"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                      onClick={handleCanvasClick}
                      style={{ pointerEvents: toolMode !== 'none' ? 'auto' : 'none' }}
                    />
                  </div>
                )}
                
                {toolMode !== 'none' && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                    {toolMode === 'highlight' && 'Click on object to highlight and outline'}
                    {toolMode === 'reference' && 'Click to set reference points for length/girth'}
                    {toolMode === 'length' && 'Click start and end points for length measurement'}
                    {toolMode === 'girth' && 'Click start and end points for girth measurement'}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Captured: {new Date(selectedImage.timestamp).toLocaleString()}
              </p>
              
              {autoMeasurement && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Automatic Measurement</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-green-700 dark:text-green-300">
                        Length: {unit === 'in' 
                          ? `${imageAnalyzer.cmToInches(autoMeasurement.length)}"` 
                          : `${autoMeasurement.length} cm`
                        }
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        Girth: {unit === 'in' 
                          ? `${imageAnalyzer.cmToInches(autoMeasurement.girth)}"` 
                          : `${autoMeasurement.girth} cm`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">
                        Confidence: {Math.round(autoMeasurement.confidence * 100)}%
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        Reference: {autoMeasurement.referenceObjectDetected ? 'Detected' : 'Manual'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reference Points Status */}
              {(referencePoints.length || referencePoints.girth) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Reference Points Set</h4>
                  <div className="flex gap-4">
                    {referencePoints.length && (
                      <Badge variant="outline" className="bg-red-100 dark:bg-red-900/20">
                        Length Reference ✓
                      </Badge>
                    )}
                    {referencePoints.girth && (
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20">
                        Girth Reference ✓
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Measurements */}
              {manualMeasurements.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Manual Measurements:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {manualMeasurements.map((measurement, index) => (
                      <div key={index} className="text-sm text-orange-700 dark:text-orange-300">
                        {measurement.type}: {measurement.measurements.length || measurement.measurements.girth}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Manual Measurement Entry */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Measurement Entry</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reference">Reference Object Size (cm)</Label>
                <Input
                  id="reference"
                  type="number"
                  step="0.1"
                  value={referenceMeasurement}
                  onChange={(e) => setReferenceMeasurement(e.target.value)}
                  placeholder="e.g., 2.5 for quarter coin"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use a coin, ruler, or known object for scale reference
                </p>
              </div>

              <div>
                <Label htmlFor="length">Length ({unit === 'in' ? 'inches' : 'cm'})</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={lengthMeasurement}
                  onChange={(e) => setLengthMeasurement(e.target.value)}
                  placeholder="Enter length measurement"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {unit === 'in' 
                    ? `Inches: ${imageAnalyzer.cmToInches(Number(lengthMeasurement) || 0)}"`
                    : `Centimeters: ${Number(lengthMeasurement) || 0} cm`
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="girth">Girth/Circumference ({unit === 'in' ? 'inches' : 'cm'})</Label>
                <Input
                  id="girth"
                  type="number"
                  step="0.1"
                  value={girthMeasurement}
                  onChange={(e) => setGirthMeasurement(e.target.value)}
                  placeholder="Enter girth measurement"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {unit === 'in' 
                    ? `Inches: ${imageAnalyzer.cmToInches(Number(girthMeasurement) || 0)}"`
                    : `Centimeters: ${Number(girthMeasurement) || 0} cm`
                  }
                </p>
              </div>

              <div className="flex gap-2 items-center mb-4">
                <span className="font-semibold">Units:</span>
                <Button
                  variant={unit === 'in' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUnit('in')}
                >
                  Inches
                </Button>
                <Button
                  variant={unit === 'cm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUnit('cm')}
                >
                  Centimeters
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Enhanced Measurement Tips:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Use "Highlight Object" to click and outline objects</li>
                  <li>• Use "Set Reference" to mark length/girth reference points</li>
                  <li>• Use "Length" tool to measure from base to tip</li>
                  <li>• Use "Girth" tool to measure circumference</li>
                  <li>• Set reference object size for accurate scaling</li>
                  <li>• Auto-analyze uses reference points for better accuracy</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button onClick={saveMeasurement} className="flex-1 flex items-center justify-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Measurements</span>
                </Button>
                <Button 
                  onClick={() => deleteMeasurement(selectedImage.id)} 
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        {autoMeasurement && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Personalized Recommendations</h3>
            {(() => {
              const rec = imageAnalyzer.generateRecommendations(autoMeasurement);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">Cylinder Size</h4>
                      <p className="text-purple-700 dark:text-purple-300">
                        Length: {unit === 'in' 
                          ? `${imageAnalyzer.cmToInches(rec.cylinderSize.length)}"` 
                          : `${rec.cylinderSize.length} cm`
                        }
                      </p>
                      <p className="text-purple-700 dark:text-purple-300">
                        Diameter: {unit === 'in' 
                          ? `${imageAnalyzer.cmToInches(rec.cylinderSize.diameter)}"` 
                          : `${rec.cylinderSize.diameter} cm`
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Recommended Routine</h4>
                      <p className="text-green-700 dark:text-green-300">{rec.routine.name}</p>
                      <p className="text-green-700 dark:text-green-300">
                        {rec.routine.duration} min, {rec.routine.pressure} Hg, {rec.routine.sets} sets
                      </p>
                      <p className="text-green-700 dark:text-green-300">{rec.routine.frequency}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Tips for Best Results:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {rec.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Measurement Analysis</h2>
        <Button 
          variant="outline" 
          onClick={loadMeasurements} 
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Loading Measurements...</h3>
          <p className="text-gray-500 dark:text-gray-400">Please wait while we load your images.</p>
        </Card>
      ) : measurements.length === 0 ? (
        <Card className="p-12 text-center">
          <Ruler className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Images to Analyze</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Capture some photos first to begin measurement analysis.</p>
          <Button onClick={onBack} variant="outline">
            Go to Camera
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {measurements.map((measurement: any) => (
            <Card key={measurement.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div onClick={() => setSelectedImage(measurement)}>
                <img 
                  src={measurement.image} 
                  alt="Measurement" 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {new Date(measurement.timestamp).toLocaleDateString()}
                </p>
                {measurement.measurements ? (
                  <div className="text-sm space-y-1">
                    <p className="text-green-600 dark:text-green-400 font-medium">✓ Analyzed</p>
                    <p className="dark:text-gray-300">
                      Length: {unit === 'in' 
                        ? `${imageAnalyzer.cmToInches(measurement.measurements.length)}"` 
                        : `${measurement.measurements.length} cm`
                      }
                    </p>
                    <p className="dark:text-gray-300">
                      Girth: {unit === 'in' 
                        ? `${imageAnalyzer.cmToInches(measurement.measurements.girth)}"` 
                        : `${measurement.measurements.girth} cm`
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Pending Analysis</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeasurementView;
