import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Calendar, Clock, Target, BarChart3, PieChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

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

interface MeasurementData {
  id: string;
  date: string;
  length?: number;
  girth?: number;
  notes?: string;
}

interface DataAnalyticsProps {
  onBack: () => void;
}

export default function DataAnalytics({ onBack }: DataAnalyticsProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    // Load session data from localStorage
    const savedSessions = localStorage.getItem('pumpingSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    // Load measurement data from localStorage
    const savedMeasurements = localStorage.getItem('measurements');
    if (savedMeasurements) {
      setMeasurements(JSON.parse(savedMeasurements));
    }
  }, []);

  const getFilteredData = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      sessions: sessions.filter(session => new Date(session.date) >= filterDate),
      measurements: measurements.filter(measurement => new Date(measurement.date) >= filterDate)
    };
  };

  const { sessions: filteredSessions, measurements: filteredMeasurements } = getFilteredData();

  const calculateStats = () => {
    if (filteredSessions.length === 0) return null;

    const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalSets = filteredSessions.reduce((sum, session) => sum + session.sets, 0);
    const avgDuration = totalDuration / filteredSessions.length;
    const avgSets = totalSets / filteredSessions.length;

    const focusBreakdown = filteredSessions.reduce((acc, session) => {
      acc[session.focus] = (acc[session.focus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pressureBreakdown = filteredSessions.reduce((acc, session) => {
      acc[session.pressure] = (acc[session.pressure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions: filteredSessions.length,
      totalDuration,
      totalSets,
      avgDuration,
      avgSets,
      focusBreakdown,
      pressureBreakdown
    };
  };

  const stats = calculateStats();

  const getProgressData = () => {
    if (filteredMeasurements.length < 2) return [];

    return filteredMeasurements
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((measurement, index) => ({
        date: new Date(measurement.date).toLocaleDateString(),
        length: measurement.length || 0,
        girth: measurement.girth || 0,
        index
      }));
  };

  const getFocusChartData = () => {
    if (!stats) return [];
    
    return Object.entries(stats.focusBreakdown).map(([focus, count]) => ({
      name: focus.charAt(0).toUpperCase() + focus.slice(1),
      value: count,
      color: focus === 'length' ? '#3b82f6' : focus === 'girth' ? '#ef4444' : '#10b981'
    }));
  };

  const getPressureChartData = () => {
    if (!stats) return [];
    
    return Object.entries(stats.pressureBreakdown).map(([pressure, count]) => ({
      name: pressure,
      value: count,
      color: pressure.includes('Low') ? '#10b981' : pressure.includes('Medium') ? '#f59e0b' : '#ef4444'
    }));
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getConsistencyScore = () => {
    if (filteredSessions.length === 0) return 0;
    
    const daysWithSessions = new Set(filteredSessions.map(s => s.date.split('T')[0])).size;
    const totalDays = Math.ceil((new Date().getTime() - new Date(filteredSessions[0].date).getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(100, (daysWithSessions / totalDays) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Data Analytics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(stats?.totalDuration || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats ? formatDuration(stats.avgDuration) : '0m'} avg per session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSets || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.avgSets.toFixed(1) || '0'} avg per session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consistency</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getConsistencyScore().toFixed(0)}%</div>
                <Progress value={getConsistencyScore()} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Focus Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={getFocusChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getFocusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pressure Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={getPressureChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPressureChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMeasurements.length > 1 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getProgressData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="length" stroke="#3b82f6" name="Length" />
                    <Line type="monotone" dataKey="girth" stroke="#ef4444" name="Girth" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Not enough measurement data to show progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSessions.length > 0 ? (
                  filteredSessions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{session.routineName}</h4>
                            <Badge variant="outline">{session.focus}</Badge>
                            <Badge variant="outline">{session.pressure}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDuration(session.duration)} • {session.sets} sets
                          </p>
                          {session.notes && (
                            <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No sessions recorded in this time period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Average Session Duration</span>
                      <span className="font-medium">{formatDuration(stats.avgDuration)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Sets per Session</span>
                      <span className="font-medium">{stats.avgSets.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Most Used Focus</span>
                      <span className="font-medium">
                        {Object.entries(stats.focusBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Most Used Pressure</span>
                      <span className="font-medium">
                        {Object.entries(stats.pressureBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No data available for insights</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats ? (
                  <>
                    {getConsistencyScore() < 70 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Improve Consistency:</strong> Try to maintain a more regular routine schedule.
                        </p>
                      </div>
                    )}
                    {stats.avgDuration < 30 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Increase Duration:</strong> Consider longer sessions for better results.
                        </p>
                      </div>
                    )}
                    {stats.avgSets < 2 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>More Sets:</strong> Try increasing the number of sets per session.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">Start recording sessions to get personalized recommendations</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 