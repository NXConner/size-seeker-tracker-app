import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Ruler, Save, Trash2, MousePointer, Circle, Square, RotateCcw, Eye, EyeOff, Target, Zap, Settings, Magnet, Crop, Move } from 'lucide-react';
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

interface SnapToShapeResult {
  outline: MeasurementPoint[];
  confidence: number;
  objectType: 'rectangle' | 'circle' | 'polygon' | 'custom';
  boundingBox: { x: number; y: number; width: number; height: number };
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
  
  // Enhanced measurement tools with snap-to-shape
  const [toolMode, setToolMode] = useState<'none' | 'length' | 'girth' | 'area' | 'highlight' | 'reference' | 'snap' | 'crop' | 'move'>('none');
  const [manualMeasurements, setManualMeasurements] = useState<ManualMeasurement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<MeasurementPoint[]>([]);
  const [showObjectOutline, setShowObjectOutline] = useState(false);
  const [objectOutline, setObjectOutline] = useState<MeasurementPoint[]>([]);
  const [highlightedObject, setHighlightedObject] = useState<MeasurementPoint[]>([]);
  const [referencePoints, setReferencePoints] = useState<ReferencePoints>({});
  const [canvasMode, setCanvasMode] = useState<'view' | 'measure' | 'highlight' | 'reference'>('view');
  
  // Snap-to-shape specific state
  const [snapToShapeResult, setSnapToShapeResult] = useState<SnapToShapeResult | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapConfidence, setSnapConfidence] = useState(0);
  const [snapTolerance, setSnapTolerance] = useState(10);
  const [snapMode, setSnapMode] = useState<'auto' | 'manual' | 'edge'>('auto');
  
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

  // Enhanced snap-to-shape functionality
  const handleSnapToShape = async (x: number, y: number) => {
    if (!selectedImage?.image) return;
    
    try {
      setIsSnapping(true);
      setSnapConfidence(0);
      
      // Simulate AI-powered object detection and shape snapping
      const result = await imageAnalyzer.detectAndSnapToShape(
        selectedImage.image,
        { x, y },
        {
          tolerance: snapTolerance,
          mode: snapMode,
          minArea: 100,
          maxArea: 10000
        }
      );
      
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
      } else if (result.objectType === 'circle') {
        const diameter = Math.max(result.boundingBox.width, result.boundingBox.height) * (parseFloat(referenceMeasurement) / 100);
        const circumference = Math.PI * diameter;
        setLengthMeasurement(diameter.toFixed(1));
        setGirthMeasurement(circumference.toFixed(1));
      }
      
      toast({
        title: "Shape Detected",
        description: `${result.objectType} detected with ${(result.confidence * 100).toFixed(1)}% confidence`,
      });
    } catch (error) {
      console.error('Snap to shape error:', error);
      toast({
        title: "Shape Detection Failed",
        description: "Could not detect shape. Try adjusting tolerance or mode.",
        variant: "destructive"
      });
    } finally {
      setIsSnapping(false);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || toolMode === 'none') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const point = { x, y };
    
    if (toolMode === 'snap') {
      handleSnapToShape(x, y);
    } else if (toolMode === 'highlight') {
      handleObjectHighlight(x, y);
    } else if (toolMode === 'reference') {
      handleReferencePoint(x, y);
    } else if (toolMode === 'length' || toolMode === 'girth') {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawingPoints([point]);
      } else {
        setIsDrawing(false);
        setDrawingPoints(prev => [...prev, point]);
        
        // Create measurement
        const measurement: ManualMeasurement = {
          type: toolMode,
          startPoint: drawingPoints[0],
          endPoint: point,
          measurements: {}
        };
        
        // Calculate measurement based on reference
        const distance = Math.sqrt(
          Math.pow(point.x - drawingPoints[0].x, 2) + 
          Math.pow(point.y - drawingPoints[0].y, 2)
        );
        
        const pixelToCmRatio = parseFloat(referenceMeasurement) / 100; // Assuming reference is in cm
        const actualMeasurement = distance * pixelToCmRatio;
        
        measurement.measurements[toolMode] = actualMeasurement;
        
        setManualMeasurements(prev => [...prev, measurement]);
        setDrawingPoints([]);
        setToolMode('none');
      }
    }
  };

  const handleObjectHighlight = async (x: number, y: number) => {
    if (!selectedImage?.image) return;
    
    try {
      // Use AI to detect object boundaries around the clicked point
      const boundaries = await imageAnalyzer.detectObjectBoundaries(
        selectedImage.image, 
        { x, y }, 
        { tolerance: 20, minArea: 100 }
      );
      
      setHighlightedObject(boundaries);
      setShowObjectOutline(true);
      
      toast({
        title: "Object Highlighted",
        description: "Object boundaries have been detected and highlighted.",
      });
    } catch (error) {
      console.error('Highlight error:', error);
      toast({
        title: "Highlight Failed",
        description: "Could not highlight object. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReferencePoint = (x: number, y: number) => {
    const point = { x, y };
    
    if (!referencePoints.length) {
      setReferencePoints({ length: point });
      toast({
        title: "Length Reference Set",
        description: "Click another point to set girth reference.",
      });
    } else if (!referencePoints.girth) {
      setReferencePoints(prev => ({ ...prev, girth: point }));
      toast({
        title: "Reference Points Set",
        description: "Both length and girth reference points have been set.",
      });
    } else {
      // Reset and set new length reference
      setReferencePoints({ length: point });
      toast({
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
      toast({
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
      await imageStorage.saveImage(measurementData);
      
      // Also save to localStorage for backward compatibility
      const existingMeasurements = secureStorage.getItem('measurements') || [];
      secureStorage.setItem('measurements', [...existingMeasurements, measurementData]);
      
      setMeasurements(prev => [measurementData, ...prev]);
      
      toast({
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
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save measurement. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      // Remove from IndexedDB
      await imageStorage.deleteImage(id);
      
      // Remove from localStorage
      const existingMeasurements = secureStorage.getItem('measurements') || [];
      const filteredMeasurements = existingMeasurements.filter((m: any) => m.id !== id);
      secureStorage.setItem('measurements', filteredMeasurements);
      
      setMeasurements(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Measurement Deleted",
        description: "Measurement has been removed.",
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

  const handleImageSelect = (measurement: any) => {
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Measurement Analysis</h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Image Selection and Tools */}
        <div className="space-y-4">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Select Image</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedImage?.id === measurement.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleImageSelect(measurement)}
                  >
                    <div className="text-sm font-medium">
                      {new Date(measurement.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      L: {measurement.length?.toFixed(1)}cm, G: {measurement.girth?.toFixed(1)}cm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Measurement Tools</h3>
              
              {/* Reference Settings */}
              <div className="space-y-3 mb-4">
                <Label htmlFor="reference">Reference Object Size (cm)</Label>
                <Input
                  id="reference"
                  type="number"
                  value={referenceMeasurement}
                  onChange={(e) => setReferenceMeasurement(e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>

              {/* Snap-to-Shape Settings */}
              <div className="space-y-3 mb-4">
                <Label htmlFor="snapTolerance">Snap Tolerance (px)</Label>
                <Input
                  id="snapTolerance"
                  type="number"
                  value={snapTolerance}
                  onChange={(e) => setSnapTolerance(parseInt(e.target.value))}
                  min="1"
                  max="50"
                />
                
                <Label htmlFor="snapMode">Snap Mode</Label>
                <select
                  id="snapMode"
                  value={snapMode}
                  onChange={(e) => setSnapMode(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="auto">Auto Detect</option>
                  <option value="manual">Manual Snap</option>
                  <option value="edge">Edge Detection</option>
                </select>
              </div>

              {/* Tool Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={toolMode === 'snap' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setToolMode(toolMode === 'snap' ? 'none' : 'snap')}
                >
                  <Magnet className="h-4 w-4 mr-1" />
                  Snap to Shape
                </Button>
                <Button
                  variant={toolMode === 'length' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setToolMode(toolMode === 'length' ? 'none' : 'length')}
                >
                  <Ruler className="h-4 w-4 mr-1" />
                  Length
                </Button>
                <Button
                  variant={toolMode === 'girth' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setToolMode(toolMode === 'girth' ? 'none' : 'girth')}
                >
                  <Circle className="h-4 w-4 mr-1" />
                  Girth
                </Button>
                <Button
                  variant={toolMode === 'highlight' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setToolMode(toolMode === 'highlight' ? 'none' : 'highlight')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Highlight
                </Button>
                <Button
                  variant={toolMode === 'reference' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setToolMode(toolMode === 'reference' ? 'none' : 'reference')}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Reference
                </Button>
                <Button
                  variant={toolMode === 'crop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setToolMode(toolMode === 'crop' ? 'none' : 'crop')}
                >
                  <Crop className="h-4 w-4 mr-1" />
                  Crop
                </Button>
              </div>

              {/* Auto Analysis */}
              <div className="mt-4">
                <Button
                  onClick={() => selectedImage && analyzeAutomatically(selectedImage.image)}
                  disabled={!selectedImage || isAnalyzing}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Auto Analyze'}
                </Button>
                
                {isAnalyzing && (
                  <div className="mt-2">
                    <Progress value={analysisProgress} className="w-full" />
                    <p className="text-xs text-gray-500 mt-1">{analysisProgress}% Complete</p>
                  </div>
                )}
              </div>

              {/* Manual Measurements */}
              <div className="mt-4 space-y-3">
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  value={lengthMeasurement}
                  onChange={(e) => setLengthMeasurement(e.target.value)}
                  step="0.1"
                  min="0"
                />
                
                <Label htmlFor="girth">Girth (cm)</Label>
                <Input
                  id="girth"
                  type="number"
                  value={girthMeasurement}
                  onChange={(e) => setGirthMeasurement(e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <Button onClick={saveMeasurement} className="w-full" disabled={!selectedImage}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Measurement
                </Button>
                <Button onClick={clearCanvas} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Canvas
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Panel - Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Measurement Canvas</h3>
                <div className="flex gap-2">
                  <Badge variant={showObjectOutline ? 'default' : 'secondary'}>
                    <Eye className="h-3 w-3 mr-1" />
                    Outline
                  </Badge>
                  <Badge variant={Object.keys(referencePoints).length > 0 ? 'default' : 'secondary'}>
                    <Target className="h-3 w-3 mr-1" />
                    Reference
                  </Badge>
                  {snapToShapeResult && (
                    <Badge variant="default">
                      <Magnet className="h-3 w-3 mr-1" />
                      {snapToShapeResult.objectType}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div 
                ref={containerRef}
                className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
              >
                {selectedImage ? (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto cursor-crosshair"
                    onClick={handleCanvasClick}
                    style={{ maxHeight: '600px' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select an image to begin measurement analysis</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Snap-to-Shape Results */}
              {snapToShapeResult && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Shape Detection Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Object Type:</span>
                      <span className="ml-2 font-medium capitalize">{snapToShapeResult.objectType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-medium">{(snapToShapeResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Width:</span>
                      <span className="ml-2 font-medium">{snapToShapeResult.boundingBox.width.toFixed(1)}px</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <span className="ml-2 font-medium">{snapToShapeResult.boundingBox.height.toFixed(1)}px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Measurement Results */}
              {autoMeasurement && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Automatic Analysis Results</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Length:</span>
                      <span className="ml-2 font-medium">{autoMeasurement.length.toFixed(1)}cm</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Girth:</span>
                      <span className="ml-2 font-medium">{autoMeasurement.girth.toFixed(1)}cm</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="ml-2 font-medium">{(autoMeasurement.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Measurements Display */}
              {manualMeasurements.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Manual Measurements</h4>
                  <div className="space-y-2">
                    {manualMeasurements.map((measurement, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="capitalize">{measurement.type}:</span>
                        <span className="font-medium">
                          {measurement.measurements[measurement.type]?.toFixed(1)}cm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeasurementView;
