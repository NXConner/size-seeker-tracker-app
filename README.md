# Size Seeker Tracker

A comprehensive React/TypeScript application for tracking penis pumping progress, managing routines, and monitoring health and safety. Built with modern web technologies and a focus on user experience and data privacy.

## 🚀 Features

### Core Functionality
- **Image Capture & Analysis**: Take measurement photos and analyze progress over time
- **Progress Tracking**: Comprehensive measurement history with visual charts
- **Routine Management**: Advanced timer with customizable pumping routines
- **Health Monitoring**: Track health events, rest days, and safety guidelines

### Advanced Features
- **Data Analytics**: Detailed progress insights with performance recommendations
- **Community Integration**: Reddit feed from r/gettingbigger community
- **Achievement System**: Gamified progress tracking with unlockable achievements
- **Advanced Settings**: Comprehensive customization options
- **Health & Safety**: Injury tracking, rest day management, and safety protocols

### Enhanced Guides & Tips
- **Comprehensive Routines**: Beginner to advanced pumping routines
- **Pressure Guidelines**: Safe pressure recommendations for different experience levels
- **Safety Protocols**: Detailed safety guidelines and warning signs
- **Community Resources**: Links to community resources and support

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with localStorage persistence
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd size-seeker-tracker-main
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Key Components

### Core Components
- **CameraCapture**: Image capture functionality with privacy controls
- **MeasurementView**: Image analysis and measurement tracking
- **ProgressDashboard**: Visual progress charts and statistics
- **RoutineTimer**: Advanced timer with customizable routines
- **EnhancedTipsSection**: Comprehensive guides and safety information

### Advanced Components
- **DataAnalytics**: Progress tracking with charts and insights
- **HealthSafety**: Health event tracking and safety monitoring
- **CommunityFeatures**: Achievements, leaderboards, and social features
- **AdvancedSettings**: App customization and data management
- **RedditFeed**: Community integration with Reddit API

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_REDDIT_API_URL=https://www.reddit.com/r/gettingbigger.json
```

### Local Storage Keys
The app uses localStorage for data persistence:
- `measurements`: Measurement data
- `pumpingSessions`: Session history
- `pumpingRoutines`: Custom routines
- `healthEvents`: Health event tracking
- `restDays`: Rest day records
- `appSettings`: Application settings

## 📊 Data Structure

### Measurement Data
```typescript
interface MeasurementData {
  id: string;
  date: string;
  length?: number;
  girth?: number;
  notes?: string;
}
```

### Session Data
```typescript
interface SessionData {
  id: string;
  date: string;
  routineName: string;
  duration: number;
  sets: number;
  focus: 'length' | 'girth' | 'both';
  pressure: string;
  notes?: string;
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

## 🎮 Features Overview

### Routine Timer
- **Customizable Routines**: Create and edit pumping routines
- **Multiple Phases**: Warm-up, in-pump, out-pump, massaging, and sets
- **Custom Sounds**: Upload and use custom alarm sounds
- **Local Storage**: Persistent routine data
- **Editable Steps**: Modify routine steps in real-time

### Data Analytics
- **Progress Charts**: Visual representation of measurement progress
- **Session Statistics**: Detailed session analysis
- **Performance Insights**: Automated recommendations
- **Time Range Filtering**: Week, month, quarter, and year views
- **Consistency Tracking**: Monitor routine adherence

### Health & Safety
- **Health Event Tracking**: Record injuries, discomfort, and warning signs
- **Rest Day Management**: Track rest days and recovery periods
- **Safety Guidelines**: Comprehensive safety protocols
- **Health Score**: Automated health assessment
- **Warning System**: Proactive safety recommendations

### Community Features
- **Achievement System**: Unlockable achievements for progress milestones
- **User Profiles**: Level system with experience points
- **Leaderboards**: Community rankings and comparisons
- **Social Features**: Community feed and interactions
- **Progress Sharing**: Share achievements and progress

### Advanced Settings
- **Theme Customization**: Light, dark, and auto themes
- **Sound Settings**: Volume control and custom sounds
- **Notification Preferences**: Customizable notification settings
- **Privacy Controls**: Data collection and analytics preferences
- **Data Management**: Export, import, and reset functionality

## 🔒 Privacy & Security

- **Local Storage**: All data stored locally on user's device
- **No Cloud Sync**: No data transmitted to external servers
- **Privacy Controls**: User-controlled data collection settings
- **Secure Storage**: Encrypted local storage for sensitive data
- **Data Export**: Full data export capability for user control

## 📱 Mobile Optimization

- **Responsive Design**: Optimized for mobile and desktop
- **Touch-Friendly**: Mobile-optimized touch interactions
- **Progressive Web App**: PWA capabilities for mobile installation
- **Offline Support**: Core functionality works offline
- **Mobile Navigation**: Touch-optimized navigation and controls

## 🚀 Future Enhancements

### Planned Features
- **Cloud Sync**: Optional cloud backup and sync
- **AI Recommendations**: Machine learning-based routine optimization
- **Advanced Analytics**: Predictive analytics and trend analysis
- **Social Features**: Direct messaging and community groups
- **Mobile App**: Native mobile applications

### Technical Improvements
- **Performance Optimization**: Enhanced loading and rendering
- **Accessibility**: WCAG compliance and screen reader support
- **Internationalization**: Multi-language support
- **Advanced Charts**: Interactive and animated visualizations
- **Real-time Updates**: WebSocket integration for live data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This application is for educational and personal use only. Always consult with healthcare professionals before starting any new routine. Individual results may vary, and safety should always be your top priority.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and guides within the application
- Review the community resources and Reddit integration

---

**Size Seeker Tracker** - Professional measurement tracking and routine management for informed progress monitoring.
