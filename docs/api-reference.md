# Size Seeker Tracker - API Reference

## 📖 Table of Contents
1. [Core Components](#core-components)
2. [Data Storage](#data-storage)
3. [Utility Functions](#utility-functions)
4. [Hooks](#hooks)
5. [Types & Interfaces](#types--interfaces)
6. [Configuration](#configuration)

## 🧩 Core Components

### MeasurementView
Advanced measurement interface with image analysis and tools.

```typescript
interface MeasurementViewProps {
  onBack: () => void;
}

// Features:
// - Image upload and camera capture
// - Multiple measurement tools (ruler, tape, caliper, etc.)
// - Reference point setting
// - Snap-to-shape detection
// - Manual measurement input
// - Canvas-based measurement overlay
```

**Key Methods:**
- `handleCanvasClick(event)` - Handle canvas interactions
- `analyzeAutomatically(image)` - AI-powered image analysis
- `saveMeasurement()` - Save current measurement
- `clearCanvas()` - Clear measurement overlay

### IntegratedMeasurementAnalysis
Comprehensive measurement analysis with AI insights.

```typescript
interface IntegratedMeasurementAnalysisProps {
  onBack?: () => void;
}

// Features:
// - Camera capture integration
// - AI-powered measurement analysis
// - Progress tracking and trends
// - Health recommendations
// - Data visualization
```

**Key Methods:**
- `handleFileUpload(event)` - Process uploaded images
- `analyzeAutomatically(image)` - AI analysis
- `saveMeasurement()` - Save with analysis
- `loadAnalysisData()` - Load historical data

### ProgressDashboard
Progress tracking and analytics dashboard.

```typescript
interface ProgressDashboardProps {
  onBack: () => void;
}

// Features:
// - Trend analysis and predictions
// - Goal tracking and management
// - Data export (JSON, CSV)
// - Statistical analysis
// - Achievement system
```

**Key Methods:**
- `calculateTrendAnalysis(data)` - Compute trends
- `exportData()` - Export to JSON
- `exportCSV()` - Export to CSV
- `addGoal()` - Create new goal

### HealthSafety
Health monitoring and safety guidelines.

```typescript
interface HealthSafetyProps {
  onBack: () => void;
}

// Features:
// - Health metrics tracking
// - Safety guidelines
// - Rest day planning
// - Health event logging
// - Medical consultation reminders
```

**Key Methods:**
- `updateHealthMetrics(metric, value)` - Update health data
- `addHealthEvent()` - Log health events
- `getHealthStatus()` - Get current health status
- `getRecommendations()` - Get health recommendations

## 💾 Data Storage

### SecureStorage
Encrypted localStorage wrapper for sensitive data.

```typescript
class SecureStorage {
  // Encryption key (AES-256)
  private static readonly ENCRYPTION_KEY = 'your-encryption-key';
  
  // Set encrypted item
  static setItem(key: string, value: any): void;
  
  // Get decrypted item
  static getItem(key: string): any;
  
  // Remove item
  static removeItem(key: string): void;
  
  // Clear all data
  static clear(): void;
  
  // Check if key exists
  static hasItem(key: string): boolean;
}
```

**Usage Example:**
```typescript
import { secureStorage } from '@/utils/secureStorage';

// Store sensitive data
secureStorage.setItem('measurements', measurementData);

// Retrieve data
const measurements = secureStorage.getItem('measurements');

// Remove data
secureStorage.removeItem('measurements');
```

### ImageStorage
IndexedDB wrapper for image storage.

```typescript
interface StoredImage {
  id: string;
  image: string; // Base64 encoded
  date: string;
  length?: number;
  girth?: number;
  unit: 'cm' | 'in';
  analysis?: AnalysisResult;
  metadata?: ImageMetadata;
}

class ImageStorage {
  // Initialize database
  async init(): Promise<void>;
  
  // Save image with metadata
  async saveImage(imageData: StoredImage): Promise<void>;
  
  // Get image by ID
  async getImage(id: string): Promise<StoredImage | null>;
  
  // Get all images
  async getAllImages(): Promise<StoredImage[]>;
  
  // Delete image
  async deleteImage(id: string): Promise<void>;
  
  // Clear all images
  async clearAll(): Promise<void>;
  
  // Get storage usage
  async getStorageUsage(): Promise<StorageUsage>;
}
```

**Usage Example:**
```typescript
import { imageStorage } from '@/utils/imageStorage';

// Initialize storage
await imageStorage.init();

// Save image
const imageData: StoredImage = {
  id: 'unique-id',
  image: 'base64-encoded-image',
  date: new Date().toISOString(),
  length: 15.5,
  girth: 12.0,
  unit: 'cm'
};

await imageStorage.saveImage(imageData);

// Retrieve images
const allImages = await imageStorage.getAllImages();
```

## 🛠️ Utility Functions

### Image Analysis
AI-powered image analysis utilities.

```typescript
interface AnalysisResult {
  length: number;
  girth: number;
  confidence: number;
  detectedObjects: DetectedObject[];
  measurements: MeasurementPoint[];
}

interface ObjectDetectionResult {
  objects: DetectedObject[];
  confidence: number;
  boundingBox: BoundingBox;
}

interface SnapResult {
  outline: Point[];
  confidence: number;
  objectType: 'rectangle' | 'circle' | 'polygon' | 'custom';
  boundingBox: BoundingBox;
}

// Analyze image for measurements
export async function analyzeImage(imageData: string): Promise<AnalysisResult>;

// Detect objects in image
export async function detectObjects(imageData: string): Promise<ObjectDetectionResult>;

// Snap to detected shapes
export async function snapToShape(imageData: string, point: Point): Promise<SnapResult>;

// Enhance image quality
export async function enhanceImage(imageData: string): Promise<string>;

// Compress image
export async function compressImage(imageData: string, quality: number): Promise<string>;
```

**Usage Example:**
```typescript
import { analyzeImage, detectObjects, snapToShape } from '@/utils/imageAnalysis';

// Analyze image
const analysis = await analyzeImage(imageBase64);
console.log('Length:', analysis.length, 'Girth:', analysis.girth);

// Detect objects
const objects = await detectObjects(imageBase64);
console.log('Detected objects:', objects.objects.length);

// Snap to shape
const snapResult = await snapToShape(imageBase64, { x: 100, y: 100 });
console.log('Object type:', snapResult.objectType);
```

### AI Recommendations
AI-powered recommendation engine.

```typescript
interface Recommendation {
  type: 'routine' | 'health' | 'progress' | 'safety';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  confidence: number;
}

interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  frequency: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Get personalized recommendations
export function getRecommendations(
  measurements: Measurement[],
  healthData: HealthMetrics,
  goals: Goal[]
): Recommendation[];

// Generate routine recommendations
export function getRoutineRecommendations(
  measurements: Measurement[],
  preferences: UserPreferences
): Routine[];

// Predict progress
export function predictProgress(
  measurements: Measurement[],
  timeframe: number
): ProgressPrediction;

// Get health recommendations
export function getHealthRecommendations(
  healthData: HealthMetrics
): HealthRecommendation[];
```

**Usage Example:**
```typescript
import { getRecommendations, predictProgress } from '@/utils/aiRecommendations';

// Get recommendations
const recommendations = getRecommendations(measurements, healthData, goals);
console.log('Recommendations:', recommendations);

// Predict progress
const prediction = predictProgress(measurements, 30); // 30 days
console.log('Predicted growth:', prediction.growthRate);
```

### Performance Utilities
Performance optimization utilities.

```typescript
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

// Measure component performance
export function measurePerformance(componentName: string): PerformanceMetrics;

// Optimize images
export function optimizeImage(imageData: string, options: OptimizationOptions): Promise<string>;

// Lazy load components
export function lazyLoad<T>(importFn: () => Promise<T>): React.LazyExoticComponent<T>;

// Debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void;

// Throttle function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void;
```

**Usage Example:**
```typescript
import { measurePerformance, debounce } from '@/utils/performance';

// Measure performance
const metrics = measurePerformance('MeasurementView');
console.log('Load time:', metrics.loadTime);

// Debounce function
const debouncedSave = debounce(saveMeasurement, 1000);
```

## 🎣 Hooks

### useTheme
Theme management hook.

```typescript
interface ThemeContextType {
  isDark: boolean;
  unitPreference: 'cm' | 'inches';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUnitPreference: (unit: 'cm' | 'inches') => void;
}

export function useTheme(): ThemeContextType;
```

**Usage Example:**
```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme, unitPreference } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

### usePWA
PWA functionality hook.

```typescript
interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

export function usePWA(): PWAContextType;
```

**Usage Example:**
```typescript
import { usePWA } from '@/hooks/use-pwa';

function InstallPrompt() {
  const { canInstall, installApp } = usePWA();
  
  if (!canInstall) return null;
  
  return (
    <button onClick={installApp}>
      Install App
    </button>
  );
}
```

### useToast
Toast notification hook.

```typescript
interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast(): {
  toast: (options: ToastOptions) => void;
  dismiss: (toastId: string) => void;
  dismissAll: () => void;
};
```

**Usage Example:**
```typescript
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Measurement saved successfully.',
      variant: 'success'
    });
  };
}
```

## 📝 Types & Interfaces

### Core Types

```typescript
// Measurement data
interface Measurement {
  id: string;
  date: string;
  length: number;
  girth: number;
  unit: 'cm' | 'in';
  image?: string;
  analysis?: AnalysisResult;
  notes?: string;
}

// Goal tracking
interface Goal {
  id: string;
  type: 'length' | 'girth' | 'both';
  target: number;
  current: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  progress: number;
}

// Health metrics
interface HealthMetrics {
  fatigueLevel: number; // 1-10
  painLevel: number; // 1-10
  stressLevel: number; // 1-10
  sleepQuality: number; // 1-10
  lastUpdated: string;
}

// Health events
interface HealthEvent {
  id: string;
  type: 'injury' | 'discomfort' | 'warning' | 'rest' | 'consultation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: string;
  resolved: boolean;
  resolvedDate?: string;
  recommendations: string[];
  requiresMedicalAttention: boolean;
}

// Achievement system
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
  category: 'measurement' | 'consistency' | 'milestone' | 'community';
}

// User preferences
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  unit: 'cm' | 'in';
  notifications: {
    enabled: boolean;
    sessionReminders: boolean;
    progressAlerts: boolean;
    restDayReminders: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
}
```

### Analysis Types

```typescript
// Image analysis results
interface AnalysisResult {
  length: number;
  girth: number;
  confidence: number;
  detectedObjects: DetectedObject[];
  measurements: MeasurementPoint[];
  quality: 'low' | 'medium' | 'high';
}

// Detected objects
interface DetectedObject {
  id: string;
  type: 'rectangle' | 'circle' | 'polygon' | 'custom';
  confidence: number;
  boundingBox: BoundingBox;
  outline: Point[];
  measurements: {
    length?: number;
    girth?: number;
    area?: number;
  };
}

// Measurement points
interface MeasurementPoint {
  x: number;
  y: number;
  type: 'start' | 'end' | 'reference';
  label?: string;
}

// Bounding box
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Point coordinates
interface Point {
  x: number;
  y: number;
}
```

## ⚙️ Configuration

### Environment Variables

```env
# Development
VITE_APP_TITLE=Size Seeker Tracker
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:3000
VITE_ENCRYPTION_KEY=dev-encryption-key
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true

# Production
VITE_APP_TITLE=Size Seeker Tracker
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://your-api-domain.com
VITE_ENCRYPTION_KEY=production-encryption-key
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... more color definitions
      }
    }
  },
  plugins: []
} satisfies Config;
```

---

**For more detailed examples and advanced usage, see our [Developer Guide](developer-guide.md).** 