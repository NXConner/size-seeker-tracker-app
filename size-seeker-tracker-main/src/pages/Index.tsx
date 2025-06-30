import React, { useState } from 'react';
import { Camera, TrendingUp, Ruler, BookOpen, BarChart3, Clock, Users, Zap, Settings, Heart, Trophy, Database } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import MeasurementView from '../components/MeasurementView';
import ProgressDashboard from '../components/ProgressDashboard';
import TipsSection from '../components/TipsSection';
import PrivacyNotice from '../components/PrivacyNotice';
import RoutineTimer from '../components/RoutineTimer';
import RedditFeed from '../components/RedditFeed';
import EnhancedTipsSection from '../components/EnhancedTipsSection';
import DataAnalytics from '../components/DataAnalytics';
import AdvancedSettings from '../components/AdvancedSettings';
import HealthSafety from '../components/HealthSafety';
import CommunityFeatures from '../components/CommunityFeatures';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeView, setActiveView] = useState('home');

  const renderActiveView = () => {
    switch (activeView) {
      case 'camera':
        return <CameraCapture onBack={() => setActiveView('home')} />;
      case 'measure':
        return <MeasurementView onBack={() => setActiveView('home')} />;
      case 'progress':
        return <ProgressDashboard onBack={() => setActiveView('home')} />;
      case 'tips':
        return <TipsSection onBack={() => setActiveView('home')} />;
      case 'routine-timer':
        return <RoutineTimer onBack={() => setActiveView('home')} />;
      case 'reddit-feed':
        return <RedditFeed onBack={() => setActiveView('home')} />;
      case 'enhanced-tips':
        return <EnhancedTipsSection onBack={() => setActiveView('home')} />;
      case 'data-analytics':
        return <DataAnalytics onBack={() => setActiveView('home')} />;
      case 'advanced-settings':
        return <AdvancedSettings onBack={() => setActiveView('home')} />;
      case 'health-safety':
        return <HealthSafety onBack={() => setActiveView('home')} />;
      case 'community-features':
        return <CommunityFeatures onBack={() => setActiveView('home')} />;
      default:
        return <HomeView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Size Seeker Tracker
          </h1>
          <p className="text-gray-600">Professional measurement tracking and routine management</p>
        </header>
        
        {renderActiveView()}
      </div>
    </div>
  );
};

const HomeView = ({ setActiveView }: { setActiveView: (view: string) => void }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PrivacyNotice />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => setActiveView('camera')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Capture Image</h3>
              <p className="text-gray-600">Take a new measurement photo</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('measure')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Ruler className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Measure & Analyze</h3>
              <p className="text-gray-600">Analyze captured images</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('progress')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Progress Tracking</h3>
              <p className="text-gray-600">View your measurement history</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('routine-timer')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Routine Timer</h3>
              <p className="text-gray-600">Advanced pumping routines with timer</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('data-analytics')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Data Analytics</h3>
              <p className="text-gray-600">Advanced progress tracking & insights</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('enhanced-tips')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <Zap className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Enhanced Tips</h3>
              <p className="text-gray-600">Comprehensive guides and routines</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('health-safety')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Health & Safety</h3>
              <p className="text-gray-600">Monitor health events & rest days</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('community-features')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-pink-100 rounded-full">
              <Trophy className="h-8 w-8 text-pink-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Community</h3>
              <p className="text-gray-600">Achievements & social features</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('reddit-feed')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Reddit Feed</h3>
              <p className="text-gray-600">Community discussions & tips</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('advanced-settings')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Advanced Settings</h3>
              <p className="text-gray-600">Customize app preferences</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView('tips')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Basic Tips</h3>
              <p className="text-gray-600">Measurement and safety tips</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold text-blue-600 mb-2">Advanced Timer</h3>
            <p className="text-sm text-gray-600">
              Customizable pumping routines with editable steps, local storage, and custom sounds.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-cyan-600 mb-2">Data Analytics</h3>
            <p className="text-sm text-gray-600">
              Comprehensive progress tracking with charts, insights, and performance recommendations.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-red-600 mb-2">Health Monitoring</h3>
            <p className="text-sm text-gray-600">
              Track health events, rest days, and safety guidelines with automated recommendations.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-pink-600 mb-2">Community Features</h3>
            <p className="text-sm text-gray-600">
              Achievements, leaderboards, and social features to stay motivated and connected.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index; 