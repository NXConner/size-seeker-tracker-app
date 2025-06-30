import React, { useState, Suspense, lazy } from 'react';
import { Camera, TrendingUp, Ruler, BookOpen, BarChart3, Clock, Users, Zap, Settings, Heart, Trophy, Database, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load all components for better performance
const CameraCapture = lazy(() => import('../components/CameraCapture'));
const MeasurementView = lazy(() => import('../components/MeasurementView'));
const IntegratedMeasurementAnalysis = lazy(() => import('../components/IntegratedMeasurementAnalysis'));
const ProgressDashboard = lazy(() => import('../components/ProgressDashboard'));
const TipsSection = lazy(() => import('../components/TipsSection'));
const PrivacyNotice = lazy(() => import('../components/PrivacyNotice'));
const RoutineTimer = lazy(() => import('../components/RoutineTimer'));
const RedditFeed = lazy(() => import('../components/RedditFeed'));
const EnhancedTipsSection = lazy(() => import('../components/EnhancedTipsSection'));
const DataAnalytics = lazy(() => import('../components/DataAnalytics'));
const AdvancedSettings = lazy(() => import('../components/AdvancedSettings'));
const HealthSafety = lazy(() => import('../components/HealthSafety'));
const CommunityFeatures = lazy(() => import('../components/CommunityFeatures'));
const PumpingSessionTracker = lazy(() => import('../components/PumpingSessionTracker'));

// Loading component for Suspense fallback
const ComponentLoader: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

// Memoized feature card component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
}> = React.memo(({ icon, title, description, onClick, color = "bg-blue-500" }) => (
  <Card 
    className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color} text-white group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
      </div>
    </div>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

const Index: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const features = [
    {
      id: 'integrated-analysis',
      icon: <Target className="h-6 w-6" />,
      title: 'Integrated Analysis',
      description: 'Camera capture with measurement analysis, health detection, and routine recommendations',
      color: 'bg-violet-500',
      component: IntegratedMeasurementAnalysis
    },
    {
      id: 'camera',
      icon: <Camera className="h-6 w-6" />,
      title: 'Camera Capture',
      description: 'Take photos for measurement analysis',
      color: 'bg-green-500',
      component: CameraCapture
    },
    {
      id: 'measurement',
      icon: <Ruler className="h-6 w-6" />,
      title: 'Measurement Analysis',
      description: 'Analyze measurements with AI assistance',
      color: 'bg-blue-500',
      component: MeasurementView
    },
    {
      id: 'progress',
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Progress Dashboard',
      description: 'Track your progress over time',
      color: 'bg-purple-500',
      component: ProgressDashboard
    },
    {
      id: 'timer',
      icon: <Clock className="h-6 w-6" />,
      title: 'Routine Timer',
      description: 'Track your pumping sessions',
      color: 'bg-orange-500',
      component: RoutineTimer
    },
    {
      id: 'sessions',
      icon: <Database className="h-6 w-6" />,
      title: 'Session Tracker',
      description: 'Log and manage pumping sessions',
      color: 'bg-indigo-500',
      component: PumpingSessionTracker
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Advanced data analytics and insights',
      color: 'bg-teal-500',
      component: DataAnalytics
    },
    {
      id: 'tips',
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Tips & Guidance',
      description: 'Expert tips and best practices',
      color: 'bg-emerald-500',
      component: EnhancedTipsSection
    },
    {
      id: 'community',
      icon: <Users className="h-6 w-6" />,
      title: 'Community',
      description: 'Connect with the community',
      color: 'bg-pink-500',
      component: CommunityFeatures
    },
    {
      id: 'reddit',
      icon: <Trophy className="h-6 w-6" />,
      title: 'Reddit Feed',
      description: 'Latest posts from r/gettingbigger',
      color: 'bg-red-500',
      component: RedditFeed
    },
    {
      id: 'health',
      icon: <Heart className="h-6 w-6" />,
      title: 'Health & Safety',
      description: 'Important health information',
      color: 'bg-rose-500',
      component: HealthSafety
    },
    {
      id: 'settings',
      icon: <Settings className="h-6 w-6" />,
      title: 'Advanced Settings',
      description: 'Customize your experience',
      color: 'bg-gray-500',
      component: AdvancedSettings
    },
    {
      id: 'privacy',
      icon: <Zap className="h-6 w-6" />,
      title: 'Privacy Notice',
      description: 'Learn about data privacy',
      color: 'bg-yellow-500',
      component: PrivacyNotice
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    setActiveComponent(featureId);
  };

  const handleBack = () => {
    setActiveComponent(null);
  };

  // Render active component if one is selected
  if (activeComponent) {
    const feature = features.find(f => f.id === activeComponent);
    if (feature) {
      const Component = feature.component;
      return (
        <Suspense fallback={<ComponentLoader />}>
          <Component onBack={handleBack} />
        </Suspense>
      );
    }
  }

  // Render main dashboard
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Size Seeker Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Comprehensive tracking and analysis for your fitness journey. 
          Monitor progress, analyze measurements, and stay connected with the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            onClick={() => handleFeatureClick(feature.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Index);

