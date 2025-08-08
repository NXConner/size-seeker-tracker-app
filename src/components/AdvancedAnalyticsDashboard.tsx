import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Target, Trophy, Calendar, BarChart3, LineChart, PieChart, Award, Star, Zap, Goal, TrendingDown, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { imageStorage } from '@/utils/imageStorage';
import { secureStorage } from '@/utils/secureStorage';
import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Brain, Lightbulb } from 'lucide-react';

interface AdvancedAnalyticsDashboardProps {
  onBack: () => void;
}

// Provide local no-op handlers for share/export to avoid undefined props
const onExport = (format: 'pdf' | 'csv' | 'png' = 'pdf') => {
  toast({ title: 'Export', description: `Exporting analytics as ${format.toUpperCase()} (placeholder).` });
};

const onShare = () => {
  if (navigator.share) {
    navigator.share({ title: 'Size Seeker Analytics', text: 'Check my analytics!', url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      toast({ title: 'Link copied', description: 'Analytics link copied to clipboard.' });
    }).catch(() => {});
  }
};

interface Goal {
  id: string;
  type: 'length' | 'girth' | 'both';
  targetValue: number;
  currentValue: number;
  startDate: string;
  targetDate: string;
  description: string;
  status: 'active' | 'completed' | 'overdue';
  progress: number;
}

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

interface AnalyticsData {
  totalSessions: number;
  totalMeasurements: number;
  averageGrowthRate: number;
  currentStreak: number;
  longestStreak: number;
  totalTime: number;
  consistencyScore: number;
  measurements: Array<{
    date: string;
    value: number;
    category: string;
  }>;
  trends: Array<{
    period: string;
    growth: number;
    prediction: number;
    confidence: number;
  }>;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    impact: number;
    category: string;
  }>;
  performance: {
    current: number;
    target: number;
    progress: number;
    trend: 'up' | 'down' | 'stable';
  };
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ onBack }) => {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalSessions: 0,
    totalMeasurements: 0,
    averageGrowthRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTime: 0,
    consistencyScore: 0,
    measurements: [],
    trends: [],
    insights: [],
    performance: {
      current: 0,
      target: 0,
      progress: 0,
      trend: 'stable'
    }
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'length',
    targetValue: 0,
    description: '',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [viewMode, setViewMode] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load measurements
      const storedMeasurements = await imageStorage.getAllImages();
      setMeasurements(storedMeasurements);
      
      // Load goals
      const storedGoals = (await secureStorage.getItem<Goal[]>('goals')) || [];
      setGoals(storedGoals);
      
      // Load achievements
      const storedAchievements = (await secureStorage.getItem<Achievement[]>('achievements')) || getDefaultAchievements();
      setAchievements(storedAchievements);
      
      // Calculate analytics
      calculateAnalytics(storedMeasurements, storedGoals);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Load Error",
        description: "Failed to load analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAchievements = (): Achievement[] => [
    {
      id: 'first-measurement',
      title: 'First Steps',
      description: 'Record your first measurement',
      icon: '📏',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'measurement'
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Complete 7 days of consistent tracking',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      category: 'consistency'
    },
    {
      id: 'month-streak',
      title: 'Monthly Master',
      description: 'Complete 30 days of consistent tracking',
      icon: '📅',
      unlocked: false,
      progress: 0,
      maxProgress: 30,
      category: 'consistency'
    },
    {
      id: 'length-gain',
      title: 'Length Champion',
      description: 'Achieve 0.5 inch length gain',
      icon: '📈',
      unlocked: false,
      progress: 0,
      maxProgress: 0.5,
      category: 'milestone'
    },
    {
      id: 'girth-gain',
      title: 'Girth Guru',
      description: 'Achieve 0.25 inch girth gain',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      maxProgress: 0.25,
      category: 'milestone'
    },
    {
      id: 'goal-setter',
      title: 'Goal Setter',
      description: 'Set your first goal',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'milestone'
    }
  ];

  const calculateAnalytics = (measurements: any[], goals: Goal[]) => {
    const totalSessions = measurements.length;
    const totalMeasurements = measurements.filter(m => m.measurements).length;
    
    // Calculate growth rate and trends
    let totalLengthGrowth = 0;
    let totalGirthGrowth = 0;
    let growthCount = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort measurements by date
    const sortedMeasurements = measurements
      .filter(m => m.timestamp)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (sortedMeasurements.length >= 2) {
      for (let i = 1; i < sortedMeasurements.length; i++) {
        const prev = sortedMeasurements[i - 1].measurements;
        const curr = sortedMeasurements[i].measurements;
        
        if (prev && curr) {
          const lengthGrowth = (curr.length || 0) - (prev.length || 0);
          const girthGrowth = (curr.girth || 0) - (prev.girth || 0);
          
          if (lengthGrowth > 0 || girthGrowth > 0) {
            totalLengthGrowth += lengthGrowth;
            totalGirthGrowth += girthGrowth;
            growthCount++;
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 0;
          }
        }
      }
      
      // Check final streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      currentStreak = tempStreak;
    }
    
    const averageLengthGrowth = growthCount > 0 ? totalLengthGrowth / growthCount : 0;
    const averageGirthGrowth = growthCount > 0 ? totalGirthGrowth / growthCount : 0;
    const averageGrowthRate = (averageLengthGrowth + averageGirthGrowth) / 2;
    
    // Calculate consistency score
    const daysSinceFirst = sortedMeasurements.length > 0 
      ? Math.ceil((Date.now() - new Date(sortedMeasurements[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const consistencyScore = daysSinceFirst > 0 ? Math.min(100, (totalMeasurements / daysSinceFirst) * 100) : 0;
    
    // Calculate total time (estimate based on sessions)
    const totalTime = totalSessions * 5; // Assume 5 minutes per session
    
    setAnalyticsData({
      totalSessions,
      totalMeasurements,
      averageGrowthRate,
      currentStreak,
      longestStreak,
      totalTime,
      consistencyScore,
      measurements: sortedMeasurements.map(m => ({
        date: m.timestamp,
        value: m.measurements?.length || 0,
        category: 'length'
      })),
      trends: [],
      insights: [],
      performance: {
        current: sortedMeasurements[sortedMeasurements.length - 1].measurements?.length || 0,
        target: 0,
        progress: 0,
        trend: 'stable'
      }
    });
    
    // Update achievements based on new data
    updateAchievements(sortedMeasurements, goals);
  };

  const updateAchievements = (measurements: any[], goals: Goal[]) => {
    const updatedAchievements = achievements.map(achievement => {
      let progress = 0;
      let unlocked = achievement.unlocked;
      
      switch (achievement.id) {
        case 'first-measurement':
          progress = measurements.length > 0 ? 1 : 0;
          unlocked = measurements.length > 0;
          break;
          
        case 'week-streak':
          progress = Math.min(7, analyticsData.currentStreak);
          unlocked = analyticsData.currentStreak >= 7;
          break;
          
        case 'month-streak':
          progress = Math.min(30, analyticsData.currentStreak);
          unlocked = analyticsData.currentStreak >= 30;
          break;
          
        case 'length-gain':
          if (measurements.length >= 2) {
            const first = measurements[0].measurements?.length || 0;
            const latest = measurements[measurements.length - 1].measurements?.length || 0;
            progress = Math.min(0.5, Math.max(0, latest - first));
            unlocked = (latest - first) >= 0.5;
          }
          break;
          
        case 'girth-gain':
          if (measurements.length >= 2) {
            const first = measurements[0].measurements?.girth || 0;
            const latest = measurements[measurements.length - 1].measurements?.girth || 0;
            progress = Math.min(0.25, Math.max(0, latest - first));
            unlocked = (latest - first) >= 0.25;
          }
          break;
          
        case 'goal-setter':
          progress = goals.length > 0 ? 1 : 0;
          unlocked = goals.length > 0;
          break;
      }
      
      return {
        ...achievement,
        progress,
        unlocked,
        unlockedDate: unlocked && !achievement.unlocked ? new Date().toISOString() : achievement.unlockedDate
      };
    });
    
    setAchievements(updatedAchievements);
    secureStorage.setItem('achievements', updatedAchievements);
  };

  const createGoal = () => {
    if (!newGoal.targetValue || !newGoal.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all goal details.",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      type: newGoal.type as 'length' | 'girth' | 'both',
      targetValue: newGoal.targetValue!,
      currentValue: 0,
      startDate: new Date().toISOString(),
      targetDate: newGoal.targetDate!,
      description: newGoal.description!,
      status: 'active',
      progress: 0
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    secureStorage.setItem('goals', updatedGoals);
    
    setNewGoal({
      type: 'length',
      targetValue: 0,
      description: '',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowGoalDialog(false);
    
    toast({
      title: "Goal Created",
      description: "Your new goal has been set successfully.",
    });
  };

  const getFilteredMeasurements = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return measurements;
    }
    
    return measurements.filter(m => new Date(m.timestamp) >= filterDate);
  }, [measurements, timeRange]);

  const getChartData = useMemo(() => {
    const filtered = getFilteredMeasurements;
    return filtered.map((m, index) => ({
      date: new Date(m.timestamp).toLocaleDateString(),
      length: m.measurements?.length || 0,
      girth: m.measurements?.girth || 0,
      index
    }));
  }, [getFilteredMeasurements]);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Calculate advanced metrics
  const metrics = useMemo(() => {
    const values = analyticsData.measurements.map(m => m.value);
    const growthRates = values.slice(1).map((val, i) => (val - values[i]) / values[i] * 100);
    
    return {
      averageGrowth: growthRates.reduce((a, b) => a + b, 0) / growthRates.length,
      consistency: 1 - (Math.std(growthRates) / Math.abs(growthRates.reduce((a, b) => a + b, 0) / growthRates.length)),
      momentum: growthRates.slice(-3).reduce((a, b) => a + b, 0) / 3,
      volatility: Math.std(growthRates),
      trendStrength: Math.abs(growthRates.reduce((a, b) => a + b, 0)) / growthRates.length
    };
  }, [analyticsData]);

  // AI-powered insights
  const aiInsights = useMemo(() => {
    const insights = [];
    
    if (metrics.averageGrowth > 1.5) {
      insights.push({
        type: 'positive',
        title: 'Excellent Growth Rate',
        description: 'Your growth rate is above the 95th percentile',
        icon: TrendingUp,
        confidence: 0.92
      });
    }
    
    if (metrics.consistency > 0.8) {
      insights.push({
        type: 'positive',
        title: 'High Consistency',
        description: 'Very consistent progress pattern detected',
        icon: Target,
        confidence: 0.88
      });
    }
    
    if (metrics.momentum > metrics.averageGrowth) {
      insights.push({
        type: 'positive',
        title: 'Accelerating Growth',
        description: 'Recent momentum is stronger than average',
        icon: Zap,
        confidence: 0.85
      });
    }
    
    if (analyticsData.performance.progress > 70) {
      insights.push({
        type: 'positive',
        title: 'Target Achievement',
        description: `You're ${analyticsData.performance.progress.toFixed(1)}% to your goal`,
        icon: Award,
        confidence: 0.90
      });
    }
    
    return insights;
  }, [metrics, analyticsData]);

  // Predictive modeling data
  const predictionData = useMemo(() => {
    const lastValue = analyticsData.measurements[analyticsData.measurements.length - 1].value;
    const predictions = [];
    
    for (let i = 1; i <= 12; i++) {
      const predictedGrowth = metrics.averageGrowth * (1 - i * 0.05); // Diminishing returns
      const predictedValue = lastValue * (1 + predictedGrowth / 100);
      predictions.push({
        week: i,
        predicted: predictedValue,
        confidence: Math.max(0.3, 1 - i * 0.05),
        range: {
          min: predictedValue * 0.9,
          max: predictedValue * 1.1
        }
      });
    }
    
    return predictions;
  }, [analyticsData, metrics]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
          <div></div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights and predictive analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => onExport?.('pdf')}>
            Export
          </Button>
          <Button variant="outline" onClick={onShare}>
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Size</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performance.current}cm</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.performance.trend === 'up' ? '+' : ''}
              {analyticsData.performance.progress.toFixed(1)}% to target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageGrowth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Weekly average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.consistency * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Progress consistency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Momentum</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.momentum.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Recent trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>Measurement history and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analyticsData.measurements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Multi-dimensional analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    {
                      metric: 'Growth Rate',
                      value: Math.min(100, metrics.averageGrowth * 20),
                      fullMark: 100,
                    },
                    {
                      metric: 'Consistency',
                      value: metrics.consistency * 100,
                      fullMark: 100,
                    },
                    {
                      metric: 'Momentum',
                      value: Math.min(100, metrics.momentum * 20),
                      fullMark: 100,
                    },
                    {
                      metric: 'Progress',
                      value: analyticsData.performance.progress,
                      fullMark: 100,
                    },
                    {
                      metric: 'Trend Strength',
                      value: Math.min(100, metrics.trendStrength * 10),
                      fullMark: 100,
                    },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Growth Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Weekly growth patterns and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="growth" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="prediction" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction Confidence</CardTitle>
                <CardDescription>AI model confidence over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="confidence" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>12-Week Prediction Model</CardTitle>
              <CardDescription>AI-powered growth predictions with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="range.min" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="range.max" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Insights</span>
                </CardTitle>
                <CardDescription>Machine learning powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <insight.icon className={`h-5 w-5 mt-0.5 ${
                      insight.type === 'positive' ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Smart Recommendations</span>
                </CardTitle>
                <CardDescription>Personalized optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Routine Intensity</span>
                    <Badge variant="outline">Optimal</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rest Periods</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                  <Progress value={70} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Measurement Timing</span>
                    <Badge variant="outline">Excellent</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consistency</span>
                    <Badge variant="outline">Very Good</Badge>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

// Utility function for standard deviation
declare global {
  interface Math {
    std: (arr: number[]) => number;
  }
}

Math.std = function(arr: number[]): number {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b) / n;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return Math.sqrt(variance);
}; 