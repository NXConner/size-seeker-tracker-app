import type { MeasurementResult, PumpingSession, Recommendation, ImageAnalysisOptions, SnapToShapeResult } from '@/types/measurement'

export interface ObjectBoundaryOptions {
  tolerance: number;
  minArea: number;
}

export interface SnapToShapeOptions {
  tolerance: number;
  mode: 'auto' | 'manual' | 'edge';
  minArea: number;
  maxArea: number;
}

// Performance optimization: Cache for processed images
const imageCache = new Map<string, MeasurementResult>();
const CACHE_SIZE_LIMIT = 50;

// Performance optimization: Web Worker for heavy computations
class ImageAnalysisWorker {
  private worker: Worker | null = null;
  private callbacks = new Map<string, (result: any) => void>();

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(URL.createObjectURL(new Blob([`
        self.onmessage = function(e) {
          const { id, type, data } = e.data;
          
          switch (type) {
            case 'detectEdges':
              const edges = detectEdges(data.imageData, data.width, data.height);
              self.postMessage({ id, result: edges });
              break;
            case 'findObjects':
              const objects = findObjects(data.edges, data.width, data.height);
              self.postMessage({ id, result: objects });
              break;
          }
        };

        function detectEdges(data, width, height) {
          const edges = new Uint8ClampedArray(data.length);
          
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const idx = (y * width + x) * 4;
              
              // Optimized Sobel operators
              const gx = (data[idx + 4] + 2 * data[idx + 4] + data[idx + 4]) - 
                         (data[idx - 4] + 2 * data[idx - 4] + data[idx - 4]);
              const gy = (data[idx + width * 4] + 2 * data[idx + width * 4] + data[idx + width * 4]) - 
                         (data[idx - width * 4] + 2 * data[idx - width * 4] + data[idx - width * 4]);
              const magnitude = Math.sqrt(gx * gx + gy * gy);
              
              if (magnitude > 30) {
                edges[idx] = 255;
                edges[idx + 1] = 255;
                edges[idx + 2] = 255;
                edges[idx + 3] = 255;
              }
            }
          }
          
          return edges;
        }

        function findObjects(edges, width, height) {
          const visited = new Set();
          const objects = [];
          
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              const key = \`\${x},\${y}\`;
              
              if (edges[idx] > 0 && !visited.has(key)) {
                const object = traceObject(edges, width, height, x, y, visited);
                if (object.points.length > 50) {
                  objects.push(object);
                }
              }
            }
          }
          
          return objects;
        }

        function traceObject(edges, width, height, startX, startY, visited) {
          const points = [];
          const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
          
          let x = startX;
          let y = startY;
          
          do {
            points.push({ x, y });
            visited.add(\`\${x},\${y}\`);
            
            let found = false;
            for (const [dx, dy] of directions) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                const key = \`\${nx},\${ny}\`;
                
                if (edges[idx] > 0 && !visited.has(key)) {
                  x = nx;
                  y = ny;
                  found = true;
                  break;
                }
              }
            }
            
            if (!found) break;
          } while (x !== startX || y !== startY);
          
          return { points };
        }
      `], { type: 'application/javascript' })));

      this.worker.onmessage = (e) => {
        const { id, result } = e.data;
        const callback = this.callbacks.get(id);
        if (callback) {
          callback(result);
          this.callbacks.delete(id);
        }
      };
    }
  }

  async processImage(imageData: ImageData, type: 'detectEdges' | 'findObjects', edges?: Uint8ClampedArray): Promise<any> {
    if (!this.worker) {
      // Fallback to main thread if Web Workers are not available
      return this.fallbackProcess(imageData, type, edges);
    }

    return new Promise((resolve) => {
      const id = Math.random().toString(36).substr(2, 9);
      this.callbacks.set(id, resolve);
      
      this.worker!.postMessage({
        id,
        type,
        data: { imageData, width: imageData.width, height: imageData.height, edges }
      });
    });
  }

  private fallbackProcess(imageData: ImageData, type: 'detectEdges' | 'findObjects', edges?: Uint8ClampedArray): any {
    if (type === 'detectEdges') {
      return this.detectEdges(imageData.data, imageData.width, imageData.height);
    } else if (type === 'findObjects' && edges) {
      return this.findObjects(edges, imageData.width, imageData.height);
    }
    return [];
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(data.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Enhanced gradient calculation using Sobel operators
        const gx = (data[idx + 4] + 2 * data[idx + 4] + data[idx + 4]) - 
                   (data[idx - 4] + 2 * data[idx - 4] + data[idx - 4]);
        const gy = (data[idx + width * 4] + 2 * data[idx + width * 4] + data[idx + width * 4]) - 
                   (data[idx - width * 4] + 2 * data[idx - width * 4] + data[idx - width * 4]);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        if (magnitude > 30) { // Increased threshold for better detection
          edges[idx] = 255;
          edges[idx + 1] = 255;
          edges[idx + 2] = 255;
          edges[idx + 3] = 255;
        }
      }
    }
    
    return edges;
  }

  private findObjects(edges: Uint8ClampedArray, width: number, height: number): any[] {
    const visited = new Set();
    const objects: any[] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const key = `${x},${y}`;
        
        if (edges[idx] > 0 && !visited.has(key)) {
          const object = this.traceObject(edges, width, height, x, y, visited);
          if (object.points.length > 50) { // Increased minimum size
            objects.push(object);
          }
        }
      }
    }
    
    return objects;
  }

  private traceObject(edges: Uint8ClampedArray, width: number, height: number, startX: number, startY: number, visited: Set<string>): any {
    const points: any[] = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    
    let x = startX;
    let y = startY;
    
    do {
      points.push({ x, y });
      visited.add(`${x},${y}`);
      
      let found = false;
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = (ny * width + nx) * 4;
          const key = `${nx},${ny}`;
          
          if (edges[idx] > 0 && !visited.has(key)) {
            x = nx;
            y = ny;
            found = true;
            break;
          }
        }
      }
      
      if (!found) break;
    } while (x !== startX || y !== startY);
    
    return { points };
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Performance optimization: Singleton worker instance
const analysisWorker = new ImageAnalysisWorker();

export class ImageAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.image = new Image();
  }

  async analyzeImage(imageData: string, options: ImageAnalysisOptions): Promise<MeasurementResult> {
    // Simulate AI analysis with realistic delays
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic measurements based on image analysis
    const baseLength = 12 + Math.random() * 4; // 12-16cm range
    const baseGirth = 10 + Math.random() * 3; // 10-13cm range
    const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence
    
    return {
      length: parseFloat(baseLength.toFixed(1)),
      girth: parseFloat(baseGirth.toFixed(1)),
      confidence: parseFloat(confidence.toFixed(2)),
      timestamp: new Date().toISOString()
    };
  }

  async detectObjectBoundaries(
    imageData: string, 
    clickPoint: { x: number; y: number }, 
    options: ObjectBoundaryOptions
  ): Promise<{ x: number; y: number }[]> {
    // Simulate object boundary detection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate boundary points around the clicked area
    const centerX = clickPoint.x;
    const centerY = clickPoint.y;
    const radius = 50 + Math.random() * 30;
    
    const boundaryPoints: { x: number; y: number }[] = [];
    const numPoints = 12;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      boundaryPoints.push({ x, y });
    }
    
    return boundaryPoints;
  }

  async detectAndSnapToShape(
    imageData: string,
    clickPoint: { x: number; y: number },
    options: SnapToShapeOptions
  ): Promise<SnapToShapeResult> {
    // Simulate AI-powered shape detection and snapping
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const centerX = clickPoint.x;
    const centerY = clickPoint.y;
    
    // Determine object type based on click position and mode
    let objectType: 'rectangle' | 'circle' | 'polygon' | 'custom';
    let outline: { x: number; y: number }[];
    let confidence: number;
    
    if (options.mode === 'auto') {
      // Auto-detect shape type
      const shapeTypes = ['rectangle', 'circle', 'polygon'];
      objectType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)] as any;
      confidence = 0.8 + Math.random() * 0.15; // 80-95% confidence
    } else if (options.mode === 'edge') {
      objectType = 'polygon';
      confidence = 0.9 + Math.random() * 0.1; // 90-100% confidence
    } else {
      objectType = 'custom';
      confidence = 0.7 + Math.random() * 0.2; // 70-90% confidence
    }
    
    // Generate outline based on object type
    if (objectType === 'rectangle') {
      const width = 80 + Math.random() * 60;
      const height = 60 + Math.random() * 40;
      outline = [
        { x: centerX - width/2, y: centerY - height/2 },
        { x: centerX + width/2, y: centerY - height/2 },
        { x: centerX + width/2, y: centerY + height/2 },
        { x: centerX - width/2, y: centerY + height/2 }
      ];
    } else if (objectType === 'circle') {
      const radius = 40 + Math.random() * 30;
      const numPoints = 16;
      outline = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        outline.push({ x, y });
      }
    } else {
      // Polygon or custom shape
      const numPoints = 6 + Math.floor(Math.random() * 4);
      const radius = 30 + Math.random() * 40;
      outline = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        outline.push({ x, y });
      }
    }
    
    // Calculate bounding box
    const xs = outline.map(p => p.x);
    const ys = outline.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      outline,
      confidence,
      objectType,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    };
  }

  async createEnhancedOverlay(
    imageData: string,
    measurements: MeasurementResult,
    manualMeasurements: any[],
    highlightedObject: any[]
  ): Promise<string> {
    // Create a canvas overlay with measurements
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageData;

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageData;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Draw measurement overlays
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00ff00';
    
    // Draw automatic measurements
    if (measurements) {
      ctx.fillText(`Length: ${measurements.length}cm`, 10, 30);
      ctx.fillText(`Girth: ${measurements.girth}cm`, 10, 50);
      ctx.fillText(`Confidence: ${(measurements.confidence * 100).toFixed(1)}%`, 10, 70);
    }
    
    // Draw manual measurements
    manualMeasurements.forEach((measurement, index) => {
      if (measurement.startPoint && measurement.endPoint) {
        ctx.beginPath();
        ctx.moveTo(measurement.startPoint.x, measurement.startPoint.y);
        ctx.lineTo(measurement.endPoint.x, measurement.endPoint.y);
        ctx.stroke();
        
        const midX = (measurement.startPoint.x + measurement.endPoint.x) / 2;
        const midY = (measurement.startPoint.y + measurement.endPoint.y) / 2;
        ctx.fillText(
          `${measurement.type}: ${measurement.measurements[measurement.type]?.toFixed(1)}cm`,
          midX, midY
        );
      }
    });
    
    // Draw highlighted object
    if (highlightedObject.length > 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(highlightedObject[0].x, highlightedObject[0].y);
      highlightedObject.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    
    return canvas.toDataURL();
  }

  // Convert cm to inches
  static cmToInches(cm: number): string {
    return (cm / 2.54).toFixed(2);
  }

  // Convert inches to cm
  static inchesToCm(inches: number): string {
    return (inches * 2.54).toFixed(2);
  }

  // Generate recommendations based on measurements and pumping history
  static generateRecommendations(
    measurements: MeasurementResult,
    pumpingHistory: PumpingSession[] = []
  ): Recommendation {
    const { length, girth } = measurements;
    
    // Calculate cylinder size recommendations
    const cylinderLength = Math.round((length + 2) * 10) / 10; // Add 2cm for comfort
    const cylinderDiameter = Math.round((girth / Math.PI + 0.5) * 10) / 10; // Add 0.5cm for comfort
    
    // Analyze pumping history
    const avgDuration = pumpingHistory.length > 0 
      ? pumpingHistory.reduce((sum, session) => sum + session.duration, 0) / pumpingHistory.length 
      : 15;
    const avgPressure = pumpingHistory.length > 0 
      ? pumpingHistory.reduce((sum, session) => sum + session.pressure, 0) / pumpingHistory.length 
      : 5;
    
    // Determine focus based on measurements and history
    let focus: 'length' | 'girth' | 'both' = 'both';
    if (length < 12 && girth < 10) {
      focus = 'both';
    } else if (length < 12) {
      focus = 'length';
    } else if (girth < 10) {
      focus = 'girth';
    }
    
    // Generate routine recommendations
    const routine = {
      name: focus === 'length' ? 'Length Focus Routine' : focus === 'girth' ? 'Girth Focus Routine' : 'Balanced Routine',
      duration: Math.min(avgDuration + 5, 30), // Increase gradually, max 30 min
      pressure: Math.min(avgPressure + 1, 7), // Increase gradually, max 7 Hg
      sets: 3,
      frequency: 'Every other day',
      focus
    };
    
    // Generate tips
    const tips = [
      'Always warm up for 5-10 minutes before pumping',
      'Start with lower pressure and gradually increase',
      'Take breaks between sets to allow blood flow',
      'Stay hydrated during sessions',
      'Monitor for any discomfort or discoloration'
    ];
    
    return {
      cylinderSize: {
        length: cylinderLength,
        diameter: cylinderDiameter
      },
      routine,
      tips
    };
  }

  // Create measurement visualization overlay
  static createMeasurementOverlay(
    imageData: string, 
    measurements: MeasurementResult
  ): string | Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        if ((measurements as any).measurementPoints) {
          const { lengthStart, lengthEnd, girthCenter, girthRadius } = measurements.measurementPoints;
          
          // Draw object outline if available
          if (measurements.objectOutline && measurements.objectOutline.length > 0) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(measurements.objectOutline[0].x, measurements.objectOutline[0].y);
            for (let i = 1; i < measurements.objectOutline.length; i++) {
              ctx.lineTo(measurements.objectOutline[i].x, measurements.objectOutline[i].y);
            }
            ctx.closePath();
            ctx.stroke();
          }
          
          // Draw length measurement line
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(lengthStart.x, lengthStart.y);
          ctx.lineTo(lengthEnd.x, lengthEnd.y);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw length measurement points
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(lengthStart.x, lengthStart.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(lengthEnd.x, lengthEnd.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw girth measurement circle
          ctx.strokeStyle = '#0000ff';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.arc(girthCenter.x, girthCenter.y, girthRadius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Add measurement labels with background
          ctx.font = 'bold 18px Arial';
          
          // Length label
          const lengthText = `${measurements.length} cm (${this.cmToInches(measurements.length)}")`;
          const lengthMetrics = ctx.measureText(lengthText);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(lengthStart.x + 10, lengthStart.y - 25, lengthMetrics.width + 10, 25);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(lengthText, lengthStart.x + 15, lengthStart.y - 8);
          
          // Girth label
          const girthText = `${measurements.girth} cm (${this.cmToInches(measurements.girth)}")`;
          const girthMetrics = ctx.measureText(girthText);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(girthCenter.x + girthRadius + 10, girthCenter.y - 12, girthMetrics.width + 10, 25);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(girthText, girthCenter.x + girthRadius + 15, girthCenter.y + 5);
          
          // Confidence indicator
          const confidenceText = `Confidence: ${Math.round(measurements.confidence * 100)}%`;
          const confidenceMetrics = ctx.measureText(confidenceText);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(10, 10, confidenceMetrics.width + 10, 25);
          
          ctx.fillStyle = measurements.confidence > 0.7 ? '#00ff00' : measurements.confidence > 0.5 ? '#ffff00' : '#ff0000';
          ctx.fillText(confidenceText, 15, 27);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageData;
    });
  }

  // Enhanced object detection for highlighting
  static async detectObjectAtPoint(imageData: string, x: number, y: number): Promise<any[]> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const analyzer = new ImageAnalyzer();
        
        // Enhanced edge detection
        const edges = analyzer.detectEdges(imageData.data, canvas.width, canvas.height);
        const objects = analyzer.findObjects(edges, canvas.width, canvas.height);
        
        // Find object at click point with better tolerance
        const clickedObject = objects.find(obj => 
          obj.points.some((point: any) => 
            Math.abs(point.x - x) < 20 && Math.abs(point.y - y) < 20
          )
        );

        resolve(clickedObject ? clickedObject.points : []);
      };
      img.src = imageData;
    });
  }

  // Advanced edge detection for precise shape snapping
  async detectEdges(imageData: string, region: { x: number; y: number; width: number; height: number }): Promise<{ x: number; y: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const edges: { x: number; y: number }[] = [];
    const step = 5;
    
    for (let x = region.x; x < region.x + region.width; x += step) {
      for (let y = region.y; y < region.y + region.height; y += step) {
        if (Math.random() > 0.7) { // Simulate edge detection
          edges.push({ x, y });
        }
      }
    }
    
    return edges;
  }

  // Contour detection for complex shapes
  async detectContours(imageData: string, seedPoint: { x: number; y: number }): Promise<{ x: number; y: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const contour: { x: number; y: number }[] = [];
    const radius = 60;
    const numPoints = 20;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = seedPoint.x + radius * Math.cos(angle);
      const y = seedPoint.y + radius * Math.sin(angle);
      contour.push({ x, y });
    }
    
    return contour;
  }
}

export const imageAnalyzer = new ImageAnalyzer();

// Web Worker wrapper for analyzeImage
let worker: Worker | null = null;

function getWorker() {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (!worker) {
    worker = new Worker(new URL('./imageWorker.js', import.meta.url), { type: 'module' });
  }
  return worker;
}

export const analyzeImage = async (imageData: string, options: ImageAnalysisOptions = {}) => {
  const w = getWorker();
  if (w) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      function handleMessage(e: MessageEvent) {
        if (e.data && e.data.id === id) {
          w.removeEventListener('message', handleMessage);
          resolve(e.data.result);
        }
      }
      w.addEventListener('message', handleMessage);
      w.postMessage({ id, imageData, options });
    });
  } else {
    // Fallback to main thread
    const analyzer = new ImageAnalyzer();
    return analyzer.analyzeImage(imageData, options);
  }
};

// Cleanup function for Web Worker
export const cleanupImageAnalysis = () => {
  analysisWorker.terminate();
  imageCache.clear();
};
