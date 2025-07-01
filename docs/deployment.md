# Size Seeker Tracker - Deployment Guide

## 📖 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Web Deployment](#web-deployment)
3. [Mobile Deployment](#mobile-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Tools
- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern web browser** for testing

### Optional Tools
- **Android Studio** (for mobile deployment)
- **Xcode** (for iOS deployment, macOS only)
- **Docker** (for containerized deployment)
- **CI/CD tools** (GitHub Actions, GitLab CI, etc.)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **Network**: Stable internet connection

## 🌐 Web Deployment

### Vercel Deployment

#### Automatic Deployment
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel --prod
   ```

2. **Environment Variables**
   ```bash
   # Set environment variables
   vercel env add VITE_APP_TITLE
   vercel env add VITE_ENCRYPTION_KEY
   vercel env add VITE_ENABLE_PWA
   ```

3. **Custom Domain** (Optional)
   ```bash
   # Add custom domain
   vercel domains add yourdomain.com
   
   # Configure DNS records
   # Follow Vercel's DNS configuration guide
   ```

#### Manual Deployment
1. **Build Project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Deploy dist folder
   vercel dist --prod
   ```

### Netlify Deployment

#### Automatic Deployment
1. **Connect Git Repository**
   - Push code to GitHub/GitLab
   - Connect repository in Netlify dashboard
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   ```bash
   # In Netlify dashboard
   VITE_APP_TITLE=Size Seeker Tracker
   VITE_ENCRYPTION_KEY=your-production-key
   VITE_ENABLE_PWA=true
   ```

3. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

#### Manual Deployment
1. **Build Project**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Drag and drop `dist` folder to Netlify dashboard
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### GitHub Pages Deployment

#### Using GitHub Actions
1. **Create Workflow**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build project
           run: npm run build
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Configure Repository**
   - Go to repository Settings > Pages
   - Set source to "GitHub Actions"

#### Manual Deployment
1. **Build Project**
   ```bash
   npm run build
   ```

2. **Deploy to gh-pages**
   ```bash
   # Install gh-pages
   npm install --save-dev gh-pages
   
   # Add to package.json scripts
   "deploy": "gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

### Docker Deployment

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # PWA support
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  size-seeker:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 📱 Mobile Deployment

### Android Deployment

#### Prerequisites
1. **Install Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK
   - Set up Android Virtual Device (AVD)

2. **Install Capacitor CLI**
   ```bash
   npm install -g @capacitor/cli
   ```

#### Build Process
1. **Add Android Platform**
   ```bash
   # Add Android platform
   npx cap add android
   
   # Build web assets
   npm run build
   
   # Sync with native project
   npx cap sync android
   ```

2. **Configure Android Project**
   ```gradle
   // android/app/build.gradle
   android {
       defaultConfig {
           applicationId "com.sizeseeker.tracker"
           minSdkVersion 22
           targetSdkVersion 33
           versionCode 1
           versionName "1.0.0"
       }
       
       buildTypes {
           release {
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build APK**
   ```bash
   # Open in Android Studio
   npx cap open android
   
   # Or build from command line
   cd android
   ./gradlew assembleRelease
   ```

4. **Sign APK** (for Play Store)
   ```bash
   # Generate keystore
   keytool -genkey -v -keystore size-seeker.keystore -alias size-seeker -keyalg RSA -keysize 2048 -validity 10000
   
   # Sign APK
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore size-seeker.keystore app-release-unsigned.apk size-seeker
   
   # Optimize APK
   zipalign -v 4 app-release-unsigned.apk size-seeker-release.apk
   ```

#### Google Play Store
1. **Create Developer Account**
   - Sign up at [play.google.com/console](https://play.google.com/console)
   - Pay one-time $25 registration fee

2. **Prepare Store Listing**
   - App title and description
   - Screenshots and videos
   - Privacy policy
   - Content rating

3. **Upload APK**
   - Upload signed APK
   - Set up release tracks
   - Configure rollout strategy

### iOS Deployment

#### Prerequisites
1. **macOS Required**
   - Install Xcode from App Store
   - Install Xcode Command Line Tools
   - Set up Apple Developer Account

2. **Install Capacitor CLI**
   ```bash
   npm install -g @capacitor/cli
   ```

#### Build Process
1. **Add iOS Platform**
   ```bash
   # Add iOS platform
   npx cap add ios
   
   # Build web assets
   npm run build
   
   # Sync with native project
   npx cap sync ios
   ```

2. **Configure iOS Project**
   ```swift
   // ios/App/App/AppDelegate.swift
   import UIKit
   import Capacitor
   
   @UIApplicationMain
   class AppDelegate: UIResponder, UIApplicationDelegate {
       var window: UIWindow?
       
       func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
           return true
       }
   }
   ```

3. **Build for Device**
   ```bash
   # Open in Xcode
   npx cap open ios
   
   # Or build from command line
   xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS -archivePath App.xcarchive archive
   ```

4. **Archive and Upload**
   - Archive in Xcode
   - Upload to App Store Connect
   - Submit for review

#### App Store
1. **Create App Store Connect Account**
   - Sign up at [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Pay $99/year developer fee

2. **Prepare Store Listing**
   - App metadata and description
   - Screenshots for different devices
   - App preview videos
   - Privacy policy and terms

3. **Submit for Review**
   - Upload build
   - Complete app information
   - Submit for Apple review
   - Wait for approval (1-7 days)

## ⚙️ Environment Configuration

### Development Environment
```env
# .env.development
VITE_APP_TITLE=Size Seeker Tracker (Dev)
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:3000
VITE_ENCRYPTION_KEY=dev-encryption-key-123
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true
VITE_DEBUG_MODE=true
```

### Production Environment
```env
# .env.production
VITE_APP_TITLE=Size Seeker Tracker
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.yourdomain.com
VITE_ENCRYPTION_KEY=production-encryption-key-456
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true
VITE_DEBUG_MODE=false
```

### Environment-Specific Builds
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Staging build
npm run build:staging
```

### Security Considerations
1. **Encryption Keys**
   - Use strong, unique keys for production
   - Rotate keys regularly
   - Store keys securely (not in version control)

2. **HTTPS Only**
   - Force HTTPS in production
   - Use HSTS headers
   - Configure secure cookies

3. **Content Security Policy**
   ```html
   <!-- index.html -->
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

## 🚀 Performance Optimization

### Build Optimization
1. **Code Splitting**
   ```typescript
   // Lazy load components
   const MeasurementView = lazy(() => import('./components/MeasurementView'));
   const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));
   ```

2. **Bundle Analysis**
   ```bash
   # Analyze bundle size
   npm run analyze
   
   # Check bundle size
   npm run bundle-size
   ```

3. **Tree Shaking**
   ```typescript
   // Import only what you need
   import { Button } from '@/components/ui/button';
   import { Card } from '@/components/ui/card';
   ```

### Runtime Optimization
1. **Image Optimization**
   ```typescript
   // Compress images before storage
   const compressedImage = await compressImage(imageData, 0.8);
   ```

2. **Caching Strategy**
   ```typescript
   // Service worker caching
   const CACHE_NAME = 'size-seeker-v1';
   const urlsToCache = [
     '/',
     '/static/js/bundle.js',
     '/static/css/main.css'
   ];
   ```

3. **Memory Management**
   ```typescript
   // Clean up resources
   useEffect(() => {
     return () => {
       // Cleanup on unmount
       cleanup();
     };
   }, []);
   ```

### Monitoring Performance
1. **Lighthouse Audit**
   ```bash
   # Run Lighthouse audit
   npm run performance
   ```

2. **Core Web Vitals**
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

3. **Performance Monitoring**
   ```typescript
   // Monitor performance metrics
   if ('performance' in window) {
     const observer = new PerformanceObserver((list) => {
       for (const entry of list.getEntries()) {
         console.log('Performance:', entry.name, entry.duration);
       }
     });
     observer.observe({ entryTypes: ['measure'] });
   }
   ```

## 📊 Monitoring & Analytics

### Error Tracking
1. **Error Boundaries**
   ```typescript
   class ErrorBoundary extends React.Component {
     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
       // Log error to monitoring service
       logError(error, errorInfo);
     }
   }
   ```

2. **Global Error Handler**
   ```typescript
   window.addEventListener('error', (event) => {
     // Log unhandled errors
     logError(event.error);
   });
   ```

### User Analytics
1. **Privacy-First Analytics**
   ```typescript
   // Only collect anonymous usage data
   const analytics = {
     trackEvent: (event: string, data?: any) => {
       if (userConsent) {
         // Send anonymous event
       }
     }
   };
   ```

2. **Performance Metrics**
   ```typescript
   // Track user interactions
   const trackUserAction = (action: string) => {
     analytics.trackEvent('user_action', {
       action,
       timestamp: Date.now()
     });
   };
   ```

### Health Checks
1. **Application Health**
   ```typescript
   // Health check endpoint
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.VITE_APP_VERSION
     });
   });
   ```

2. **Database Health**
   ```typescript
   // Check IndexedDB health
   const checkDatabaseHealth = async () => {
     try {
       await imageStorage.init();
       return { status: 'healthy' };
     } catch (error) {
       return { status: 'unhealthy', error: error.message };
     }
   };
   ```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
1. **Node Version**
   ```bash
   # Check Node version
   node --version
   
   # Use correct version
   nvm use 18
   ```

2. **Dependencies**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Check TypeScript
   npx tsc --noEmit
   
   # Fix linting issues
   npm run lint -- --fix
   ```

#### Deployment Issues
1. **Environment Variables**
   ```bash
   # Check environment variables
   echo $VITE_APP_TITLE
   
   # Set missing variables
   export VITE_APP_TITLE="Size Seeker Tracker"
   ```

2. **Build Output**
   ```bash
   # Check build output
   ls -la dist/
   
   # Verify files exist
   cat dist/index.html
   ```

3. **CORS Issues**
   ```typescript
   // Configure CORS headers
   app.use(cors({
     origin: ['https://yourdomain.com'],
     credentials: true
   }));
   ```

#### Performance Issues
1. **Bundle Size**
   ```bash
   # Analyze bundle
   npm run analyze
   
   # Check for large dependencies
   npm ls --depth=0
   ```

2. **Memory Leaks**
   ```typescript
   // Check memory usage
   console.log('Memory:', performance.memory);
   
   // Monitor for leaks
   setInterval(() => {
     console.log('Memory usage:', performance.memory.usedJSHeapSize);
   }, 5000);
   ```

3. **Image Optimization**
   ```typescript
   // Check image sizes
   const checkImageSize = (imageData: string) => {
     const size = Math.ceil(imageData.length * 3 / 4);
     console.log('Image size:', size, 'bytes');
   };
   ```

### Debug Tools
1. **Browser DevTools**
   - Network tab for requests
   - Performance tab for metrics
   - Application tab for storage
   - Console for errors

2. **React DevTools**
   - Component inspection
   - State debugging
   - Performance profiling

3. **Service Worker Debugging**
   ```typescript
   // Debug service worker
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations().then(registrations => {
       console.log('SW registrations:', registrations);
     });
   }
   ```

---

**Need help with deployment?** Check our [FAQ](faq.md) or [contact support](support.md). 