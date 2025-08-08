import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Target, Calendar, Download, Upload, BarChart3, LineChart as LineChartIcon, PieChart, Activity, Award, Clock, Ruler, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { secureStorage } from '@/utils/secureStorage';
import { imageStorage } from '@/utils/imageStorage';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

interface ProgressDashboardProps {
  onBack: () => void;
}

interface MeasurementData {
  id: string;
  date: string;
  length: number;
  girth: number;
  unit: string;
}

interface Goal {
  id: string;
  type: 'length' | 'girth' | 'both';
  target: number;
  current: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
}

interface TrendAnalysis {
  period: string;
  lengthChange: number;
  girthChange: number;
  consistency: number;
  prediction: {
    length: number;
    girth: number;
    confidence: number;
  };
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onBack }) => {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'length' | 'girth' | 'both'>('both');
  const [isLoading, setIsLoading] = useState(true);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load measurements from both sources
      const indexedDBImages = await imageStorage.getAllImages();
      const localStorageMeasurements = (await secureStorage.getItem<any[]>('measurements')) || [];
      
      const allMeasurements = [...indexedDBImages, ...localStorageMeasurements]
        .filter(m => m.length && m.girth)
        .map(m => ({
          id: m.id,
          date: m.date,
          length: parseFloat(m.length),
          girth: parseFloat(m.girth),
          unit: m.unit || 'cm'
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setMeasurements(allMeasurements);
      
      // Load goals
      const savedGoals = (await secureStorage.getItem<Goal[]>('goals')) || [];
      setGoals(savedGoals);
      
      // Calculate trend analysis
      if (allMeasurements.length > 1) {
        calculateTrendAnalysis(allMeasurements);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Load Error",
        description: "Failed to load progress data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrendAnalysis = (data: MeasurementData[]) => {
    if (data.length < 2) return;

    const recent = data.slice(-Math.min(10, data.length));
    const older = data.slice(0, -Math.min(10, data.length));
    
    if (older.length === 0) return;

    const recentAvgLength = recent.reduce((sum, m) => sum + m.length, 0) / recent.length;
    const recentAvgGirth = recent.reduce((sum, m) => sum + m.girth, 0) / recent.length;
    const olderAvgLength = older.reduce((sum, m) => sum + m.length, 0) / older.length;
    const olderAvgGirth = older.reduce((sum, m) => sum + m.girth, 0) / older.length;

    const lengthChange = ((recentAvgLength - olderAvgLength) / olderAvgLength) * 100;
    const girthChange = ((recentAvgGirth - olderAvgGirth) / olderAvgGirth) * 100;

    // Calculate consistency (standard deviation)
    const lengthValues = data.map(m => m.length);
    const girthValues = data.map(m => m.girth);
    const lengthStdDev = Math.sqrt(lengthValues.reduce((sum, val) => sum + Math.pow(val - recentAvgLength, 2), 0) / lengthValues.length);
    const girthStdDev = Math.sqrt(girthValues.reduce((sum, val) => sum + Math.pow(val - recentAvgGirth, 2), 0) / girthValues.length);
    const consistency = Math.max(0, 100 - ((lengthStdDev + girthStdDev) / 2));

    // Simple linear prediction
    const daysSinceFirst = (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()) / (1000 * 60 * 60 * 24);
    const lengthRate = lengthChange / daysSinceFirst;
    const girthRate = girthChange / daysSinceFirst;
    
    const predictionDays = 30;
    const predictedLength = recentAvgLength + (lengthRate * predictionDays / 100);
    const predictedGirth = recentAvgGirth + (girthRate * predictionDays / 100);
    
    const confidence = Math.max(0.3, Math.min(0.95, consistency / 100));

    setTrendAnalysis({
      period: `${data.length} measurements over ${Math.round(daysSinceFirst)} days`,
      lengthChange,
      girthChange,
      consistency,
      prediction: {
        length: predictedLength,
        girth: predictedGirth,
        confidence
      }
    });
  };

  const filteredMeasurements = useMemo(() => {
    if (timeRange === 'all') return measurements;
    
    const now = new Date();
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange];
    
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return measurements.filter(m => new Date(m.date) >= cutoff);
  }, [measurements, timeRange]);

  const currentStats = useMemo(() => {
    if (filteredMeasurements.length === 0) return null;
    
    const latest = filteredMeasurements[filteredMeasurements.length - 1];
    const earliest = filteredMeasurements[0];
    
    return {
      currentLength: latest.length,
      currentGirth: latest.girth,
      totalLengthChange: latest.length - earliest.length,
      totalGirthChange: latest.girth - earliest.girth,
      lengthChangePercent: ((latest.length - earliest.length) / earliest.length) * 100,
      girthChangePercent: ((latest.girth - earliest.girth) / earliest.girth) * 100,
      measurementsCount: filteredMeasurements.length,
      daysTracked: Math.ceil((new Date(latest.date).getTime() - new Date(earliest.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [filteredMeasurements]);

  const chartData = useMemo(() => {
    return filteredMeasurements.map((m) => ({
      date: new Date(m.date).toLocaleDateString(),
      length: m.length,
      girth: m.girth,
    }));
  }, [filteredMeasurements]);

  const consistencyData = useMemo(() => {
    if (filteredMeasurements.length < 2) return [] as Array<{ date: string; delta: number }>
    const deltas: Array<{ date: string; delta: number }> = []
    for (let i = 1; i < filteredMeasurements.length; i++) {
      const prev = filteredMeasurements[i - 1]
      const curr = filteredMeasurements[i]
      const delta = Math.abs(curr.length - prev.length) + Math.abs(curr.girth - prev.girth)
      deltas.push({ date: new Date(curr.date).toLocaleDateString(), delta: Number(delta.toFixed(3)) })
    }
    return deltas
  }, [filteredMeasurements])

  const exportData = () => {
    try {
      const data = {
        measurements: filteredMeasurements,
        goals,
        trendAnalysis,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Progress data has been exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportCSV = () => {
    try {
      const headers = ['Date', 'Length (cm)', 'Girth (cm)'];
      const csvContent = [
        headers.join(','),
        ...filteredMeasurements.map(m => [
          new Date(m.date).toLocaleDateString(),
          m.length.toFixed(2),
          m.girth.toFixed(2)
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `measurements-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "CSV Export Successful",
        description: "Measurements have been exported as CSV.",
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "CSV Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      type: 'length',
      target: 0,
      current: currentStats?.currentLength || 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };
    
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    secureStorage.setItem('goals', updatedGoals);
    
    toast({
      title: "Goal Added",
      description: "New goal has been created.",
    });
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    setGoals(updatedGoals);
    await secureStorage.setItem('goals', updatedGoals);
  };

  const deleteGoal = async (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    await secureStorage.setItem('goals', updatedGoals);
    
    toast({
      title: "Goal Deleted",
      description: "Goal has been removed.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Progress Dashboard</h1>
          <div className="w-20"></div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Progress Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Time Range</label>
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
        <div>
          <label className="text-sm font-medium">Metric</label>
           <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="length">Length</SelectItem>
              <SelectItem value="girth">Girth</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Length</CardTitle>
                <Ruler className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats?.currentLength.toFixed(1)} cm</div>
                <p className="text-xs text-muted-foreground">
                  {currentStats?.lengthChangePercent > 0 ? '+' : ''}{currentStats?.lengthChangePercent.toFixed(1)}% from start
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Girth</CardTitle>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats?.currentGirth.toFixed(1)} cm</div>
                <p className="text-xs text-muted-foreground">
                  {currentStats?.girthChangePercent > 0 ? '+' : ''}{currentStats?.girthChangePercent.toFixed(1)}% from start
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Measurements</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats?.measurementsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Over {currentStats?.daysTracked} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  {goals.filter(g => g.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="length" stroke="#3b82f6" name="Length (cm)" dot={false} />
                    <Line type="monotone" dataKey="girth" stroke="#f59e0b" name="Girth (cm)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Analysis */}
            {trendAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Length Change</p>
                      <p className={`text-lg font-semibold ${trendAnalysis.lengthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trendAnalysis.lengthChange > 0 ? '+' : ''}{trendAnalysis.lengthChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Girth Change</p>
                      <p className={`text-lg font-semibold ${trendAnalysis.girthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trendAnalysis.girthChange > 0 ? '+' : ''}{trendAnalysis.girthChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Consistency</p>
                    <Progress value={trendAnalysis.consistency} className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">{trendAnalysis.consistency.toFixed(1)}%</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">30-Day Prediction</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Predicted Length</p>
                        <p className="text-lg font-semibold">{trendAnalysis.prediction.length.toFixed(1)} cm</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Predicted Girth</p>
                        <p className="text-lg font-semibold">{trendAnalysis.prediction.girth.toFixed(1)} cm</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Confidence: {(trendAnalysis.prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consistency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Consistency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consistencyData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="delta" fill="#10b981" name="Abs Delta (cm)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Goals</h3>
              <Button onClick={addGoal} size="sm">
                <Target className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                const isOverdue = new Date(goal.deadline) < new Date() && goal.status === 'active';
                
                return (
                  <Card key={goal.id} className={isOverdue ? 'border-red-200 bg-red-50' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm capitalize">{goal.type} Goal</CardTitle>
                        <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Target: {goal.target.toFixed(1)} cm</p>
                        <p className="text-sm text-gray-600">Current: {goal.current.toFixed(1)} cm</p>
                      </div>
                      
                      <Progress value={Math.min(100, progress)} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{progress.toFixed(1)}%</span>
                        <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateGoal(goal.id, { current: goal.current + 0.1 })}
                        >
                          +0.1
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {goals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No goals set yet. Create your first goal to start tracking progress!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Advanced Analytics Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Growth rate analysis will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Correlation analysis will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressDashboard;
