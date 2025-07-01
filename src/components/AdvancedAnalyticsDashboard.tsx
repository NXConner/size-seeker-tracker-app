import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Target, Trophy, Calendar, BarChart3, LineChart, PieChart, Award, Star, Zap, Goal, TrendingDown, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface AdvancedAnalyticsDashboardProps {
  onBack: () => void;
}

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
    consistencyScore: 0
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
      const storedGoals = secureStorage.getItem('goals') || [];
      setGoals(storedGoals);
      
      // Load achievements
      const storedAchievements = secureStorage.getItem('achievements') || getDefaultAchievements();
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
      consistencyScore
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics Dashboard</h2>
        <div></div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.totalSessions > 0 ? 'Active tracking' : 'No sessions yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.currentStreak} days</div>
                <p className="text-xs text-muted-foreground">
                  Longest: {analyticsData.longestStreak} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analyticsData.averageGrowthRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Average monthly growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consistency</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.consistencyScore.toFixed(0)}%</div>
                <Progress value={analyticsData.consistencyScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements.slice(0, 5).map((measurement, index) => (
                    <div key={measurement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Measurement #{measurements.length - index}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(measurement.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {measurement.measurements?.length?.toFixed(2) || 'N/A'} × {measurement.measurements?.girth?.toFixed(2) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">Length × Girth</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No measurements recorded yet</p>
                  <p className="text-sm">Start tracking to see your progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Progress Charts</CardTitle>
                <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {getChartData.length > 0 ? (
                <div className="space-y-6">
                  {/* Length Progress */}
                  <div>
                    <h4 className="font-semibold mb-3">Length Progress</h4>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-center space-x-2 p-4">
                      {getChartData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-blue-500 rounded-t w-8"
                            style={{ height: `${Math.max(data.length * 20, 4)}px` }}
                          ></div>
                          <span className="text-xs mt-1">{data.length.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Girth Progress */}
                  <div>
                    <h4 className="font-semibold mb-3">Girth Progress</h4>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-center space-x-2 p-4">
                      {getChartData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-green-500 rounded-t w-8"
                            style={{ height: `${Math.max(data.girth * 20, 4)}px` }}
                          ></div>
                          <span className="text-xs mt-1">{data.girth.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No data available for selected time range</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Goals & Targets</h3>
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Goal className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Type</Label>
                    <Select value={newGoal.type} onValueChange={(value) => setNewGoal({...newGoal, type: value as any})}>
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
                  <div>
                    <Label>Target Value (inches)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value)})}
                      placeholder="Enter target value"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      placeholder="Describe your goal"
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    />
                  </div>
                  <Button onClick={createGoal} className="w-full">
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.description}</CardTitle>
                    <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.currentValue.toFixed(2)} / {goal.targetValue.toFixed(2)} inches</span>
                      </div>
                      <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Type: {goal.type}</p>
                      <p>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {goals.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Goal className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500">No goals set yet</p>
                <p className="text-sm text-gray-400">Create your first goal to start tracking progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <Award className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                    {achievement.unlocked && achievement.unlockedDate && (
                      <p className="text-xs text-green-600">
                        Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{unlockedAchievements.length}</div>
                  <div className="text-sm text-gray-600">Unlocked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">{lockedAchievements.length}</div>
                  <div className="text-sm text-gray-600">Locked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Completion</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {achievements.filter(a => a.category === 'milestone' && a.unlocked).length}
                  </div>
                  <div className="text-sm text-gray-600">Milestones</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Length Trend</h4>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        +{(analyticsData.averageGrowthRate * 100).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-600">monthly average</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Consistency Score</h4>
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="text-lg font-bold text-blue-600">
                        {analyticsData.consistencyScore.toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-600">tracking consistency</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Predictions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">3 months</div>
                      <div className="text-sm text-gray-600">
                        Estimated {(analyticsData.averageGrowthRate * 3 * 100).toFixed(1)}% growth
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">6 months</div>
                      <div className="text-sm text-gray-600">
                        Estimated {(analyticsData.averageGrowthRate * 6 * 100).toFixed(1)}% growth
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">1 year</div>
                      <div className="text-sm text-gray-600">
                        Estimated {(analyticsData.averageGrowthRate * 12 * 100).toFixed(1)}% growth
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 