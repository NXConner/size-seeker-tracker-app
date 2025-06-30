# Size Seeker Tracker

A comprehensive React/TypeScript application for tracking penis pumping routines, measurements, and progress with advanced features for health monitoring and community engagement.

## 🚀 Features

### Core Features
- **Image Capture & Analysis**: Take photos and analyze measurements
- **Progress Tracking**: Comprehensive measurement history and analytics
- **Advanced Routine Timer**: Customizable pumping routines with local storage
- **Data Analytics**: Charts, insights, and performance recommendations
- **Enhanced Tips & Guides**: Comprehensive pumping guides and safety protocols
- **Health & Safety Monitoring**: Track health events, rest days, and safety guidelines
- **Community Features**: User profiles, achievements, and leaderboards
- **Reddit Integration**: Community discussions and tips feed
- **Advanced Settings**: Customization options and data management
- **Basic Tips**: Measurement and safety guidelines

### Advanced Features
- **Customizable Routines**: Create, edit, and save custom pumping routines
- **Local Storage**: All data persists locally for privacy
- **Custom Sounds**: Upload custom alarm sounds for timer
- **Data Export/Import**: Backup and restore your data
- **Health Scoring**: Automated health risk assessment
- **Achievement System**: Gamified progress tracking
- **Responsive Design**: Mobile-optimized interface
- **Privacy-Focused**: No external data collection

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd size-seeker-tracker-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── CameraCapture.tsx
│   ├── MeasurementView.tsx
│   ├── ProgressDashboard.tsx
│   ├── RoutineTimer.tsx
│   ├── DataAnalytics.tsx
│   ├── EnhancedTipsSection.tsx
│   ├── HealthSafety.tsx
│   ├── CommunityFeatures.tsx
│   ├── RedditFeed.tsx
│   ├── AdvancedSettings.tsx
│   └── TipsSection.tsx
├── pages/              # Page components
│   ├── Index.tsx       # Main application page
│   └── NotFound.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
└── utils/              # Helper functions
```

## 🎯 Key Components

### 1. CameraCapture
- Camera access and photo capture
- Image processing and analysis
- Measurement extraction

### 2. RoutineTimer
- Customizable pumping routines
- Editable steps with durations
- Local storage persistence
- Custom sound support
- Progress tracking

### 3. DataAnalytics
- Comprehensive progress charts
- Session statistics
- Performance insights
- Time-based filtering
- Recommendations engine

### 4. EnhancedTipsSection
- Multiple pumping routines (Beginner, Intermediate, Advanced)
- Pressure guidelines and safety protocols
- Length and girth focus options
- Community resources

### 5. HealthSafety
- Health event tracking
- Rest day management
- Safety guidelines
- Risk assessment
- Warning sign monitoring

### 6. CommunityFeatures
- User profiles and levels
- Achievement system
- Leaderboards
- Progress gamification

### 7. AdvancedSettings
- Theme customization
- Sound settings
- Notification preferences
- Privacy controls
- Data export/import

## 📊 Data Structures

### Measurement Data
```typescript
interface Measurement {
  id: string;
  date: string;
  length?: number;
  girth?: number;
  notes?: string;
}
```

### Routine Data
```typescript
interface Routine {
  id: string;
  name: string;
  steps: RoutineStep[];
  totalDuration: number;
}

interface RoutineStep {
  id: string;
  name: string;
  duration: number;
  description: string;
}
```

### Health Event Data
```typescript
interface HealthEvent {
  id: string;
  date: string;
  type: 'injury' | 'discomfort' | 'rest_day' | 'warning_sign';
  severity: 'low' | 'medium' | 'high';
  description: string;
  symptoms: string[];
  actionTaken: string;
  resolved: boolean;
  resolvedDate?: string;
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_APP_TITLE=Size Seeker Tracker
VITE_API_URL=http://localhost:3000
```

### Local Storage Keys
- `measurements`: Measurement history
- `pumpingRoutines`: Custom routines
- `pumpingSessions`: Session data
- `healthEvents`: Health tracking data
- `restDays`: Rest day records
- `appSettings`: Application settings
- `userProfile`: User profile data
- `leaderboard`: Community leaderboard

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🔒 Privacy & Security

- **Local Storage**: All data stored locally in browser
- **No External APIs**: No data sent to external servers
- **Optional Analytics**: User-controlled data collection
- **Data Export**: Full control over data backup
- **No Registration**: No account creation required

## 🎨 Customization

### Themes
- Light, Dark, and Auto themes
- Customizable color schemes
- Responsive design system

### Sounds
- Custom alarm sound upload
- Volume control
- Multiple sound options

### Display Options
- Compact mode
- Progress visibility toggles
- Statistics display preferences

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interface
- Mobile camera integration
- Offline functionality

## 🔄 Data Management

### Export Data
- Complete data backup
- JSON format export
- Includes all settings and history

### Import Data
- Restore from backup
- Merge with existing data
- Validation and error handling

### Clear Data
- Selective data clearing
- Complete reset option
- Confirmation dialogs

## 🏆 Achievement System

### Available Achievements
- **First Steps**: Complete first session
- **Week Warrior**: 7-day streak
- **Monthly Master**: 30-day streak
- **Century Club**: 100 total sessions
- **Time Master**: 100 hours total time
- **Consistency King**: 80% consistency for 3 months

### Level System
- Experience-based progression
- Level rewards and milestones
- Community leaderboards

## 🚨 Safety Features

### Health Monitoring
- Real-time health scoring
- Warning sign detection
- Rest day recommendations
- Injury tracking

### Safety Guidelines
- Pressure recommendations
- Session duration limits
- Warning sign education
- Emergency stop procedures

## 🤝 Community Features

### Reddit Integration
- r/gettingbigger community feed
- Discussion threads
- Tips and advice
- Community resources

### Social Features
- User profiles
- Achievement sharing
- Progress milestones
- Community support

## 📈 Analytics & Insights

### Performance Metrics
- Session consistency
- Progress tracking
- Time analysis
- Goal achievement

### Recommendations
- Personalized suggestions
- Safety recommendations
- Progress optimization
- Routine adjustments

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component-based architecture

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the documentation
- Review safety guidelines
- Consult healthcare professionals
- Join the community discussions

## ⚠️ Disclaimer

This application is for educational and tracking purposes only. Always consult with healthcare professionals before starting any new routine. Individual results may vary, and safety should always be your top priority.

---

**Size Seeker Tracker** - Professional measurement tracking and routine management for your health and progress journey. 