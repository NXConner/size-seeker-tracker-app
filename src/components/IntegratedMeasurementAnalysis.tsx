import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, 
  RotateCw, 
  ArrowLeft, 
  Check, 
  Upload,
  Ruler, 
  Save, 
  Trash2, 
  MousePointer, 
  Circle, 
  Square, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Target, 
  Zap, 
  Settings, 
  Magnet, 
  Crop, 
  Move,
  BarChart3, 
  TrendingUp, 
  Filter,
  Download,
  Share2,
  Calendar,
  Clock,
  Activity,
  Plus,
  Image,
  Play,
  Pause,
  Square as StopIcon,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { secureStorage } from '@/utils/secureStorage';
import { imageStorage } from '@/utils/imageStorage';
import { imageAnalyzer, MeasurementResult, PumpingSession, Recommendation, ImageAnalysisOptions } from '@/utils/imageAnalysis';
import { useTheme } from '@/contexts/ThemeContext';

interface IntegratedMeasurementAnalysisProps {
  onBack?: () => void;
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

interface AnalysisData {
  measurements: MeasurementResult[];
  pumpingSessions: PumpingSession[];
  recommendations: Recommendation[];
  trends: {
    length: number[];
    girth: number[];
    dates: string[];
  };
  statistics: {
    totalMeasurements: number;
    averageLength: number;
    averageGirth: number;
    totalSessions: number;
    totalSessionTime: number;
  };
}

interface AnalysisFilters {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'all';
  measurementType: 'length' | 'girth' | 'both';
  includePumping: boolean;
  minConfidence: number;
  unit: 'cm' | 'in';
}

interface ProgressData {
  date: string;
  length: number;
  girth: number;
  unit: 'cm' | 'in';
}

const IntegratedMeasurementAnalysis: React.FC<IntegratedMeasurementAnalysisProps> = ({ onBack }) => {
  const { unit, setUnit } = useTheme();
  
  // Camera capture state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Measurement analysis state
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<MeasurementResult | null>(null);
  const [lengthMeasurement, setLengthMeasurement] = useState('');
  const [girthMeasurement, setGirthMeasurement] = useState('');
  const [referenceMeasurement, setReferenceMeasurement] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'in'>('cm');
  const [autoMeasurement, setAutoMeasurement] = useState<any>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysisPoints, setShowAnalysisPoints] = useState(false);
  
  // Measurement tools state
  const [selectedTool, setSelectedTool] = useState<'ruler' | 'tape' | 'caliper' | 'protractor' | 'compass' | 'grid' | 'none'>('none');
  const [toolSize, setToolSize] = useState(10); // Size in cm/inches
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(1); // Grid size in cm/inches
  const [measurementHistory, setMeasurementHistory] = useState<Array<{tool: string, value: number, unit: string, timestamp: number}>>([]);
  
  // Enhanced measurement tools
  const [toolMode, setToolMode] = useState<'none' | 'length' | 'girth' | 'area' | 'highlight' | 'reference' | 'snap' | 'crop' | 'move'>('none');
  const [manualMeasurements, setManualMeasurements] = useState<ManualMeasurement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<MeasurementPoint[]>([]);
  const [showObjectOutline, setShowObjectOutline] = useState(false);
  const [objectOutline, setObjectOutline] = useState<MeasurementPoint[]>([]);
  const [highlightedObject, setHighlightedObject] = useState<MeasurementPoint[]>([]);
  const [referencePoints, setReferencePoints] = useState<ReferencePoints>({});
  const [canvasMode, setCanvasMode] = useState<'view' | 'measure' | 'highlight' | 'reference'>('view');
  
  // Snap-to-shape state
  const [snapToShapeResult, setSnapToShapeResult] = useState<SnapToShapeResult | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapConfidence, setSnapConfidence] = useState(0);
  const [snapTolerance, setSnapTolerance] = useState(10);
  const [snapMode, setSnapMode] = useState<'auto' | 'manual' | 'edge'>('auto');
  
  // Analysis state
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisFilters, setAnalysisFilters] = useState<AnalysisFilters>({
    dateRange: '30d',
    measurementType: 'both',
    includePumping: true,
    minConfidence: 0.7,
    unit: 'cm'
  });
  const [activeTab, setActiveTab] = useState('capture');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Pumping session state
  const [isPumpingSessionActive, setIsPumpingSessionActive] = useState(false);
  const [pumpingTimer, setPumpingTimer] = useState(0);
  const [pumpingInterval, setPumpingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pumpingPressure, setPumpingPressure] = useState(5);
  const [pumpingSets, setPumpingSets] = useState(3);
  const [pumpingFocus, setPumpingFocus] = useState('both');
  const [pumpingSessions, setPumpingSessions] = useState<PumpingSession[]>([]);
  
  // Progress state
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [progressUnit, setProgressUnit] = useState<'cm' | 'in'>('cm');
  
  // Canvas refs
  const measurementCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera functions
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
      const imageSize = new Blob([imageData]).size;
      
      if (imageSize > 5 * 1024 * 1024) {
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
        timestamp: new Date().toISOString(),
        measurements: null
      };
      
      await imageStorage.saveImage(newMeasurement);
      
      toast({
        title: "Image Saved Securely",
        description: "Image stored in secure database on your device only."
      });
      
      // Switch to measurement tab after capture
      setActiveTab('measurement');
      setSelectedImage(newMeasurement);
      loadMeasurements();
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
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        saveImageData(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
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
        stopCamera();
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

  // Measurement functions
  const loadMeasurements = async () => {
    try {
      setIsLoading(true);
      
      const indexedDBImages = await imageStorage.getAllImages();
      const localStorageMeasurements = secureStorage.getItem('measurements') || [];
      
      const allMeasurements = [...indexedDBImages];
      
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
        length: Math.random() * 5 + 10, // 10-15 cm
        girth: Math.random() * 3 + 8,   // 8-11 cm
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
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
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
  };

  const saveMeasurement = async () => {
    if (!selectedImage || (!lengthMeasurement && !girthMeasurement)) return;

    const newMeasurement: MeasurementResult = {
      ...selectedImage,
      length: lengthMeasurement ? parseFloat(lengthMeasurement) : undefined,
      girth: girthMeasurement ? parseFloat(girthMeasurement) : undefined,
      unit: measurementUnit,
      referenceMeasurement: referenceMeasurement ? parseFloat(referenceMeasurement) : undefined,
      analysisPoints: autoMeasurement?.points
    };

    const updatedMeasurements = measurements.map(m => 
      m.id === selectedImage.id ? newMeasurement : m
    );
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
    const session: PumpingSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: pumpingTimer,
      pressure: pumpingPressure,
      sets: pumpingSets,
      focus: pumpingFocus as 'length' | 'girth' | 'both'
    };
    
    const updatedSessions = [...pumpingSessions, session];
    setPumpingSessions(updatedSessions);
    localStorage.setItem('pumpingSessions', JSON.stringify(updatedSessions));
    
    // Reset timer
    setPumpingTimer(0);
  };

  const formatTime = (seconds: number) => {
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

  useEffect(() => {
    loadMeasurements();
    loadAnalysisData();
    loadProgressData();
  }, [analysisFilters, progressUnit]);

  const renderAnalysisPoints = () => {
    if (!selectedImage || !showAnalysisPoints || !autoMeasurement?.points) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Length measurement line */}
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1={`${autoMeasurement.points.lengthStart.x}%`}
            y1={`${autoMeasurement.points.lengthStart.y}%`}
            x2={`${autoMeasurement.points.lengthEnd.x}%`}
            y2={`${autoMeasurement.points.lengthEnd.y}%`}
            stroke="red"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <circle
            cx={`${autoMeasurement.points.lengthStart.x}%`}
            cy={`${autoMeasurement.points.lengthStart.y}%`}
            r="4"
            fill="red"
          />
          <circle
            cx={`${autoMeasurement.points.lengthEnd.x}%`}
            cy={`${autoMeasurement.points.lengthEnd.y}%`}
            r="4"
            fill="red"
          />
        </svg>
        
        {/* Girth measurement circle */}
        <svg className="absolute inset-0 w-full h-full">
          <circle
            cx={`${autoMeasurement.points.girthCenter.x}%`}
            cy={`${autoMeasurement.points.girthCenter.y}%`}
            r={`${autoMeasurement.points.girthRadius}%`}
            fill="none"
            stroke="blue"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <circle
            cx={`${autoMeasurement.points.girthCenter.x}%`}
            cy={`${autoMeasurement.points.girthCenter.y}%`}
            r="4"
            fill="blue"
          />
        </svg>
      </div>
    );
  };

  const convertUnit = (value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number => {
    if (from === to) return value;
    if (from === 'cm' && to === 'in') return value / 2.54;
    if (from === 'in' && to === 'cm') return value * 2.54;
    return value;
  };

  const renderMeasurementTools = () => {
    if (!selectedImage) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width={`${gridSize * 10}%`} height={`${gridSize * 10}%`} patternUnits="userSpaceOnUse">
                <path d={`M ${gridSize * 10}% 0 L 0 0 0 ${gridSize * 10}%`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )}
        
        {/* Ruler */}
        {selectedTool === 'ruler' && (
          <svg className="absolute inset-0 w-full h-full">
            <line
              x1="10%"
              y1="10%"
              x2={`${10 + toolSize * 5}%`}
              y2="10%"
              stroke="black"
              strokeWidth="3"
              strokeDasharray="2,2"
            />
            <text x="10%" y="8%" className="text-xs font-bold" fill="black">
              {toolSize}{measurementUnit}
            </text>
          </svg>
        )}
        
        {/* Tape Measure */}
        {selectedTool === 'tape' && (
          <svg className="absolute inset-0 w-full h-full">
            <path
              d="M 10% 10% Q 20% 5% 30% 10% T 50% 10%"
              fill="none"
              stroke="blue"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text x="10%" y="8%" className="text-xs font-bold" fill="blue">
              {toolSize}{measurementUnit}
            </text>
          </svg>
        )}
        
        {/* Caliper */}
        {selectedTool === 'caliper' && (
          <svg className="absolute inset-0 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r={`${toolSize * 2}%`}
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            <text x="50%" y="45%" className="text-xs font-bold" fill="green" textAnchor="middle">
              {toolSize}{measurementUnit}
            </text>
          </svg>
        )}
        
        {/* Protractor */}
        {selectedTool === 'protractor' && (
          <svg className="absolute inset-0 w-full h-full">
            <path
              d={`M 50% 50% A ${toolSize * 3}% ${toolSize * 3}% 0 0 1 ${50 + toolSize * 3}% 50%`}
              fill="none"
              stroke="purple"
              strokeWidth="2"
            />
            <text x="50%" y="45%" className="text-xs font-bold" fill="purple" textAnchor="middle">
              90°
            </text>
          </svg>
        )}
        
        {/* Compass */}
        {selectedTool === 'compass' && (
          <svg className="absolute inset-0 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r={`${toolSize * 2}%`}
              fill="none"
              stroke="orange"
              strokeWidth="2"
            />
            <line
              x1="50%"
              y1="50%"
              x2={`${50 + toolSize * 2}%`}
              y2="50%"
              stroke="orange"
              strokeWidth="1"
            />
            <text x="50%" y="45%" className="text-xs font-bold" fill="orange" textAnchor="middle">
              {toolSize}{measurementUnit}
            </text>
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="border-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Integrated Analysis
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Capture, measure, analyze, and track your progress
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Live</span>
            </Badge>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="capture">Capture</TabsTrigger>
            <TabsTrigger value="measurement">Measurement</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Capture Tab */}
          <TabsContent value="capture" className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Capture or Upload Image
                  </h3>
                </div>

                {/* Privacy reminder */}
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center space-x-2">
                    <span className="text-green-600">🔒</span>
                    <span>All images are stored securely on your device only. No data leaves your phone.</span>
                  </p>
                </div>

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

                      {isStreaming && (
                        <div className="flex justify-center space-x-4">
                          <Button onClick={capturePhoto} className="flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>Capture Photo</span>
                          </Button>
                          <Button onClick={stopCamera} variant="outline">
                            Stop Camera
                          </Button>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center items-center p-4 bg-black rounded-lg overflow-hidden">
                        <img
                          src={capturedImage}
                          alt="Captured"
                          className="max-w-full max-h-[400px] object-contain"
                          style={{ 
                            width: 'auto',
                            height: 'auto'
                          }}
                        />
                      </div>
                      <div className="flex justify-center space-x-4">
                        <Button onClick={retakePhoto} variant="outline">
                          <RotateCw className="h-4 w-4 mr-2" />
                          Retake
                        </Button>
                        <Button onClick={() => setActiveTab('measurement')} className="flex items-center space-x-2">
                          <Check className="h-4 w-4" />
                          <span>Continue to Measurement</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Measurement Tab */}
          <TabsContent value="measurement" className="space-y-6">
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
                          onClick={() => setSelectedImage(measurement)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                              <img
                                src={measurement.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">
                                {new Date(measurement.date || measurement.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                L: {measurement.length?.toFixed(1)}{measurement.unit}, G: {measurement.girth?.toFixed(1)}{measurement.unit}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Measurement Tools</h3>
                    
                    {/* Unit Selection */}
                    <div className="space-y-3 mb-4">
                      <Label htmlFor="unit">Measurement Unit</Label>
                      <Select value={measurementUnit} onValueChange={(value: 'cm' | 'in') => setMeasurementUnit(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">Centimeters (cm)</SelectItem>
                          <SelectItem value="in">Inches (in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Measurement Tools */}
                    <div className="space-y-3 mb-4">
                      <Label>Measurement Tools</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={selectedTool === 'ruler' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool(selectedTool === 'ruler' ? 'none' : 'ruler')}
                          className="flex items-center space-x-2"
                        >
                          <Ruler className="h-4 w-4" />
                          <span>Ruler</span>
                        </Button>
                        <Button
                          variant={selectedTool === 'tape' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool(selectedTool === 'tape' ? 'none' : 'tape')}
                          className="flex items-center space-x-2"
                        >
                          <Minus className="h-4 w-4" />
                          <span>Tape</span>
                        </Button>
                        <Button
                          variant={selectedTool === 'caliper' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool(selectedTool === 'caliper' ? 'none' : 'caliper')}
                          className="flex items-center space-x-2"
                        >
                          <Circle className="h-4 w-4" />
                          <span>Caliper</span>
                        </Button>
                        <Button
                          variant={selectedTool === 'protractor' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool(selectedTool === 'protractor' ? 'none' : 'protractor')}
                          className="flex items-center space-x-2"
                        >
                          <Target className="h-4 w-4" />
                          <span>Protractor</span>
                        </Button>
                        <Button
                          variant={selectedTool === 'compass' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool(selectedTool === 'compass' ? 'none' : 'compass')}
                          className="flex items-center space-x-2"
                        >
                          <Circle className="h-4 w-4" />
                          <span>Compass</span>
                        </Button>
                        <Button
                          variant={showGrid ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setShowGrid(!showGrid)}
                          className="flex items-center space-x-2"
                        >
                          <Square className="h-4 w-4" />
                          <span>Grid</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Tool Settings */}
                    {selectedTool !== 'none' && (
                      <div className="space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Label htmlFor="toolSize">Tool Size ({measurementUnit})</Label>
                        <Input
                          id="toolSize"
                          type="number"
                          value={toolSize}
                          onChange={(e) => setToolSize(parseFloat(e.target.value))}
                          step="0.1"
                          min="0.1"
                          max="100"
                        />
                        <div className="text-xs text-gray-500">
                          {selectedTool === 'ruler' && 'Set ruler length for accurate measurements'}
                          {selectedTool === 'tape' && 'Set tape measure length for flexible measurements'}
                          {selectedTool === 'caliper' && 'Set caliper opening for precise diameter measurements'}
                          {selectedTool === 'protractor' && 'Set protractor radius for angle measurements'}
                          {selectedTool === 'compass' && 'Set compass radius for circular measurements'}
                        </div>
                      </div>
                    )}
                    
                    {/* Grid Settings */}
                    {showGrid && (
                      <div className="space-y-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Label htmlFor="gridSize">Grid Size ({measurementUnit})</Label>
                        <Input
                          id="gridSize"
                          type="number"
                          value={gridSize}
                          onChange={(e) => setGridSize(parseFloat(e.target.value))}
                          step="0.1"
                          min="0.1"
                          max="10"
                        />
                        <div className="text-xs text-gray-500">
                          Grid helps with precise measurements and alignment
                        </div>
                      </div>
                    )}
                    
                    {/* Reference Settings */}
                    <div className="space-y-3 mb-4">
                      <Label htmlFor="reference">Reference Object Size ({measurementUnit})</Label>
                      <Input
                        id="reference"
                        type="number"
                        value={referenceMeasurement}
                        onChange={(e) => setReferenceMeasurement(e.target.value)}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    
                    {/* Measurement Tools */}
                    <div className="space-y-3 mb-4">
                      <Label>Measurement Tools</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTool('ruler')}
                          className="flex items-center space-x-2"
                        >
                          <Ruler className="h-4 w-4" />
                          <span>Ruler</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTool('tape')}
                          className="flex items-center space-x-2"
                        >
                          <Minus className="h-4 w-4" />
                          <span>Tape</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTool('caliper')}
                          className="flex items-center space-x-2"
                        >
                          <Circle className="h-4 w-4" />
                          <span>Caliper</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTool('protractor')}
                          className="flex items-center space-x-2"
                        >
                          <Target className="h-4 w-4" />
                          <span>Protractor</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTool('compass')}
                          className="flex items-center space-x-2"
                        >
                          <Circle className="h-4 w-4" />
                          <span>Compass</span>
                        </Button>
                                                <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGrid(!showGrid)}
                          className="flex items-center space-x-2"
                        >
                          <Square className="h-4 w-4" />
                          <span>Grid</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Tool Settings */}
                    {selectedTool !== 'none' && (
                      <div className="space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Label htmlFor="toolSize">Tool Size ({measurementUnit})</Label>
                        <Input
                          id="toolSize"
                          type="number"
                          value={toolSize}
                          onChange={(e) => setToolSize(parseFloat(e.target.value))}
                          step="0.1"
                          min="0.1"
                          max="100"
                        />
                        <div className="text-xs text-gray-500">
                          {selectedTool === 'ruler' && 'Set ruler length for accurate measurements'}
                          {selectedTool === 'tape' && 'Set tape measure length for flexible measurements'}
                          {selectedTool === 'caliper' && 'Set caliper opening for precise diameter measurements'}
                          {selectedTool === 'protractor' && 'Set protractor radius for angle measurements'}
                          {selectedTool === 'compass' && 'Set compass radius for circular measurements'}
                        </div>
                      </div>
                    )}
                    
                    {/* Grid Settings */}
                    {showGrid && (
                      <div className="space-y-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Label htmlFor="gridSize">Grid Size ({measurementUnit})</Label>
                        <Input
                          id="gridSize"
                          type="number"
                          value={gridSize}
                          onChange={(e) => setGridSize(parseFloat(e.target.value))}
                          step="0.1"
                          min="0.1"
                          max="10"
                        />
                        <div className="text-xs text-gray-500">
                          Grid helps with precise measurements and alignment
                        </div>
                      </div>
                    )}
                    
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
                      <Label htmlFor="length">Length ({measurementUnit})</Label>
                      <Input
                        id="length"
                        type="number"
                        value={lengthMeasurement}
                        onChange={(e) => setLengthMeasurement(e.target.value)}
                        step="0.1"
                        min="0"
                      />
                      
                      <Label htmlFor="girth">Girth ({measurementUnit})</Label>
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
                      <Button 
                        onClick={() => setShowAnalysisPoints(!showAnalysisPoints)} 
                        variant="outline" 
                        className="w-full"
                        disabled={!autoMeasurement}
                      >
                        {showAnalysisPoints ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showAnalysisPoints ? 'Hide' : 'Show'} Analysis Points
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
                      <Button onClick={triggerFileUpload} variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>

                    <div 
                      ref={containerRef}
                      className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
                    >
                      {selectedImage ? (
                        <div className="flex justify-center items-center p-4">
                          <img
                            src={selectedImage.image}
                            alt="Selected"
                            className="max-w-full max-h-[600px] object-contain"
                            style={{ 
                              width: 'auto',
                              height: 'auto'
                            }}
                          />
                          {renderAnalysisPoints()}
                          {renderMeasurementTools()}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          <div className="text-center">
                            <Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Select an image or upload a new one to begin measurement analysis</p>
                            <Button onClick={triggerFileUpload} variant="outline" className="mt-4">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Measurement Results */}
                    {autoMeasurement && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold mb-2">Automatic Analysis Results</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Length:</span>
                            <span className="ml-2 font-medium">{convertUnit(autoMeasurement.length, 'cm', measurementUnit).toFixed(1)}{measurementUnit}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Girth:</span>
                            <span className="ml-2 font-medium">{convertUnit(autoMeasurement.girth, 'cm', measurementUnit).toFixed(1)}{measurementUnit}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">{(autoMeasurement.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Data Analysis
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Select value={analysisFilters.unit} onValueChange={(value: 'cm' | 'in') => setAnalysisFilters(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={analysisFilters.dateRange} onValueChange={(value: any) => setAnalysisFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {analysisData ? (
                  <div className="space-y-6">
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Total Measurements</span>
                          </div>
                          <p className="text-2xl font-bold">{analysisData.statistics.totalMeasurements}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Ruler className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Avg Length</span>
                          </div>
                          <p className="text-2xl font-bold">{analysisData.statistics.averageLength.toFixed(1)}{analysisFilters.unit}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Avg Girth</span>
                          </div>
                          <p className="text-2xl font-bold">{analysisData.statistics.averageGirth.toFixed(1)}{analysisFilters.unit}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Total Sessions</span>
                          </div>
                          <p className="text-2xl font-bold">{analysisData.statistics.totalSessions}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommendations */}
                    {analysisData.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Recommendations</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {analysisData.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Trends Chart */}
                    {analysisData.trends.dates.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Measurement Trends</CardTitle>
                          <CardDescription>
                            Progress over time in {analysisFilters.unit}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-slate-600 dark:text-slate-400">
                                Chart visualization would be implemented here
                              </p>
                              <div className="mt-4 space-y-2">
                                {analysisData.trends.dates.map((date, index) => (
                                  <div key={index} className="text-xs">
                                    {date}: L: {analysisData.trends.length[index]?.toFixed(1)}{analysisFilters.unit}, 
                                    G: {analysisData.trends.girth[index]?.toFixed(1)}{analysisFilters.unit}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-600 dark:text-slate-400">
                      No data available for analysis
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Pumping Sessions
                </h3>
                
                {/* Session Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pressure">Pressure (Hg)</Label>
                      <Input
                        id="pressure"
                        type="number"
                        value={pumpingPressure}
                        onChange={(e) => setPumpingPressure(parseInt(e.target.value))}
                        min="1"
                        max="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sets">Sets</Label>
                      <Input
                        id="sets"
                        type="number"
                        value={pumpingSets}
                        onChange={(e) => setPumpingSets(parseInt(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="focus">Focus</Label>
                      <Select value={pumpingFocus} onValueChange={(value: any) => setPumpingFocus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="length">Length</SelectItem>
                          <SelectItem value="girth">Girth</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {formatTime(pumpingTimer)}
                      </div>
                      <div className="flex justify-center space-x-2">
                        {!isPumpingSessionActive ? (
                          <Button onClick={startPumpingSession} className="flex items-center space-x-2">
                            <Play className="h-4 w-4" />
                            <span>Start</span>
                          </Button>
                        ) : (
                          <>
                            <Button onClick={pausePumpingSession} variant="outline" className="flex items-center space-x-2">
                              <Pause className="h-4 w-4" />
                              <span>Pause</span>
                            </Button>
                            <Button onClick={stopPumpingSession} variant="destructive" className="flex items-center space-x-2">
                              <StopIcon className="h-4 w-4" />
                              <span>Stop</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Progress Tracking
                  </h3>
                  <Select value={progressUnit} onValueChange={(value: 'cm' | 'in') => setProgressUnit(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {progressData.length > 0 ? (
                  <div className="space-y-6">
                    {/* Progress Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm font-medium text-gray-600">Total Measurements</div>
                          <div className="text-2xl font-bold">{progressData.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm font-medium text-gray-600">Length Change</div>
                          <div className="text-2xl font-bold">
                            {progressData.length > 1 
                              ? (progressData[progressData.length - 1].length - progressData[0].length).toFixed(1)
                              : '0.0'
                            }{progressUnit}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm font-medium text-gray-600">Girth Change</div>
                          <div className="text-2xl font-bold">
                            {progressData.length > 1 
                              ? (progressData[progressData.length - 1].girth - progressData[0].girth).toFixed(1)
                              : '0.0'
                            }{progressUnit}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Progress Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Progress Over Time</CardTitle>
                        <CardDescription>
                          Measurements in {progressUnit}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-slate-600 dark:text-slate-400">
                              Chart visualization would be implemented here
                            </p>
                            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                              {progressData.map((entry, index) => (
                                <div key={index} className="text-xs">
                                  {entry.date}: L: {entry.length.toFixed(1)}{entry.unit}, G: {entry.girth.toFixed(1)}{entry.unit}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-600 dark:text-slate-400">
                      No progress data available. Start taking measurements to track your progress.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntegratedMeasurementAnalysis; 