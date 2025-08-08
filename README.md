# Size Seeker Tracker

Advanced measurement tracking and analysis tool with AI-powered insights, health monitoring, and comprehensive progress analytics.

## 🚀 Features

### Core Measurement Tools
- **Integrated Measurement Analysis** - Camera capture, image upload, measurement analysis
- **Advanced Measurement View** - Reference points, automatic measurement, image analysis
- **Snap-to-Shape Detection** - AI-powered object detection and measurement
- **Multi-tool Support** - Ruler, tape, caliper, protractor, compass tools

### Health & Safety
- **Health Analysis** - Peyronie's disease detection, STD indicators, skin conditions
- **Health Safety Component** - Health event tracking, rest day scheduling, safety guidelines
- **Injury Prevention** - Over-training warnings, medical consultation reminders
- **Health Metrics** - Fatigue, pain, stress, sleep quality tracking

### Analytics & Progress
- **Progress Dashboard** - Trend analysis, goal tracking, predictive analytics
- **Advanced Charts** - Interactive data visualization with Recharts
- **Goal Setting** - Personalized goal creation and tracking
- **Achievement System** - Gamification with progress milestones

### Data Management
- **Secure Storage** - Encrypted localStorage and IndexedDB (demo encryption; upgrade recommended)
- **Data Export/Import** - JSON and CSV export functionality
- **Image Storage** - Secure image storage with compression
- **Backup System** - Local and cloud backup capabilities

### PWA Features
- **Offline Support** - Installable PWA with service worker
- **App Installation** - Install as native app on mobile/desktop
- **Push Notifications** - Reminder system for sessions (planned)
- **Background Sync** - Automatic data synchronization (planned)

## 📱 Installation

### Web App
1. Visit the application URL
2. Click "Install" when prompted for PWA installation
3. Or use the browser's "Add to Home Screen" option

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/size-seeker-tracker.git
cd size-seeker-tracker

# Install dependencies
npm install

# Start development server (http://localhost:3002)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Android App
```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Add Android platform
npx cap add android

# Build and sync
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 🎯 User Guide

### Getting Started
1. **First Measurement**
   - Click "New Measurement" on the dashboard
   - Choose camera capture or image upload
   - Follow the calibration wizard for accurate measurements
   - Set reference points for length and girth
   - Save your measurement

2. **Setting Goals**
   - Navigate to Progress Dashboard
   - Click "Add Goal"
   - Choose goal type (length, girth, or both)
   - Set target value and deadline
   - Track progress over time

3. **Health Monitoring**
   - Access Health & Safety section
   - Track health metrics (fatigue, pain, stress, sleep)
   - Log health events and symptoms
   - Follow safety guidelines and recommendations

4. **Progress Analysis**
   - View trends in Progress Dashboard
   - Analyze consistency and growth patterns
   - Get 30-day predictions based on your data
   - Export data for external analysis

### Measurement Tips
- **Consistent Positioning** - Use the same position and angle for all measurements
- **Good Lighting** - Ensure adequate lighting for accurate image analysis
- **Reference Objects** - Use known-size objects for calibration
- **Regular Tracking** - Measure at consistent intervals (weekly recommended)

### Safety Guidelines
- **Start Slow** - Begin with shorter sessions and lower pressure
- **Listen to Your Body** - Stop if you experience pain or discomfort
- **Rest Days** - Include rest days in your routine
- **Medical Consultation** - Consult healthcare professionals for concerns

## 🔧 API Documentation

### Core Components

#### MeasurementView
```typescript
interface MeasurementViewProps {
  onBack: () => void;
}

// Features: Image analysis, measurement tools, reference points
```

#### IntegratedMeasurementAnalysis
```typescript
interface IntegratedMeasurementAnalysisProps {
  onBack?: () => void;
}

// Features: Camera capture, AI analysis, progress tracking
```

#### ProgressDashboard
```typescript
interface ProgressDashboardProps {
  onBack: () => void;
}

// Features: Trend analysis, goal tracking, data export
```

### Data Storage

#### Secure Storage
```typescript
// Local storage operations with demo encryption (base64). Replace with WebCrypto/AES-GCM in production.
secureStorage.setItem(key: string, value: any): void
secureStorage.getItem(key: string): any
secureStorage.removeItem(key: string): void
secureStorage.clear(): void
```

#### Image Storage
```typescript
// IndexedDB image operations
imageStorage.saveImage(imageData: StoredImage): Promise<void>
imageStorage.getImage(id: string): Promise<StoredImage | null>
imageStorage.getAllImages(): Promise<StoredImage[]>
imageStorage.deleteImage(id: string): Promise<void>
```

### Utility Functions

#### Image Analysis
```typescript
// AI-powered image analysis
analyzeImage(imageData: string): Promise<AnalysisResult>
detectObjects(imageData: string): Promise<ObjectDetectionResult>
snapToShape(imageData: string, point: Point): Promise<SnapResult>
```

#### AI Recommendations
```typescript
// Personalized recommendations
getRoutineRecommendations(measurements: Measurement[]): Routine[]
getHealthRecommendations(healthData: HealthMetrics): Recommendation[]
predictProgress(measurements: Measurement[]): Prediction
```

## 🚀 Deployment

### Web Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Web Deployment (Netlify)
```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload dist folder to Netlify dashboard
```

### Android Deployment
```bash
# Build the project
npm run build

# Sync with Capacitor
npx cap sync android

# Build Android APK
cd android
./gradlew assembleRelease
```

### Environment Variables
```env
# Development
VITE_API_URL=http://localhost:3000
VITE_ENCRYPTION_KEY=your-encryption-key

# Production
VITE_API_URL=https://your-api-domain.com
VITE_ENCRYPTION_KEY=production-encryption-key
```

## Secure storage key (production)

Set a strong key in your environment for AES-GCM encryption used by `secureStorage`.

- Create a `.env` file based on `.env.example`.
- Set `VITE_SECURE_STORAGE_KEY` to a long, random string (32+ chars recommended).
- Example:

```
VITE_SECURE_STORAGE_KEY=super-long-random-secret-generated-for-your-app
```

For local development and tests, a fallback/dev key is used, but you MUST set this in production builds.

## 🔒 Security

### Data Privacy
- **Local Storage** - All data stored locally on device
- **Encryption** - Demo obfuscation in dev; use AES-GCM (WebCrypto) for production
- **No Cloud Sync** - Data never transmitted to external servers
- **User Control** - Full control over data export and deletion

### Security Features
- **Input Validation** - All user inputs validated and sanitized
- **XSS Protection** - React's built-in XSS protection
- **CSP Headers** - Content Security Policy implementation
- **HTTPS Only** - Secure connections in production

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run e2e
```

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   ├── utils/
│   └── hooks/
├── cypress/
│   ├── e2e/
│   └── fixtures/
```

## 📊 Performance

### Optimization Features
- **Code Splitting** - Lazy loading of components
- **Image Compression** - Automatic image optimization
- **Bundle Analysis** - Vite bundle analyzer
- **Caching** - Service worker caching strategy

### Performance Monitoring
```bash
# Bundle analysis
npm run analyze

# Lighthouse audit
npm run performance

# Bundle size check
npm run bundle-size
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Cypress** - E2E testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

### Environment Setup
- Copy `.env.example` to `.env` and set `VITE_SECURE_STORAGE_KEY`

### Issues
- [Bug Reports](https://github.com/yourusername/size-seeker-tracker/issues)
- [Feature Requests](https://github.com/yourusername/size-seeker-tracker/issues)

### Community
- [Discussions](https://github.com/yourusername/size-seeker-tracker/discussions)
- [Wiki](https://github.com/yourusername/size-seeker-tracker/wiki)

---

**Size Seeker Tracker** - Advanced measurement tracking and analysis tool for health and fitness monitoring.
