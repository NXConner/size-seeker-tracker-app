import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Activity, Calendar, BarChart3 } from 'lucide-react';

interface ChartData {
  date: string;
  length: number;
  girth: number;
  sessions: number;
  consistency: number;
  growth: number;
}

interface AdvancedChartsProps {
  data: ChartData[];
  unit: 'cm' | 'in';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ data, unit }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'radar'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [metric, setMetric] = useState<'length' | 'girth' | 'both'>('both');

  const filteredData = useMemo(() => {
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
    }
    
    return data.filter(item => new Date(item.date) >= filterDate);
  }, [data, timeRange]);

  const trendAnalysis = useMemo(() => {
    if (filteredData.length < 2) return null;

    const recent = filteredData.slice(-3);
    const older = filteredData.slice(-6, -3);
    
    if (older.length === 0) return null;

    const recentAvg = recent.reduce((sum, item) => sum + (item.length + item.girth) / 2, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + (item.length + item.girth) / 2, 0) / older.length;
    
    const trend = recentAvg - olderAvg;
    const percentage = (trend / olderAvg) * 100;

    return {
      trend,
      percentage,
      direction: trend > 0 ? 'up' : 'down',
      strength: Math.abs(percentage) > 10 ? 'strong' : Math.abs(percentage) > 5 ? 'moderate' : 'weak'
    };
  }, [filteredData]);

  const consistencyData = useMemo(() => {
    return filteredData.map(item => ({
      date: item.date,
      consistency: item.consistency * 100,
      sessions: item.sessions
    }));
  }, [filteredData]);

  const radarData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const latest = filteredData[filteredData.length - 1];
    const average = filteredData.reduce((sum, item) => sum + (item.length + item.girth) / 2, 0) / filteredData.length;
    
    return [
      {
        subject: 'Length',
        current: latest.length,
        average: average,
        fullMark: Math.max(...filteredData.map(d => d.length)) * 1.2
      },
      {
        subject: 'Girth',
        current: latest.girth,
        average: average,
        fullMark: Math.max(...filteredData.map(d => d.girth)) * 1.2
      },
      {
        subject: 'Consistency',
        current: latest.consistency * 100,
        average: (filteredData.reduce((sum, item) => sum + item.consistency, 0) / filteredData.length) * 100,
        fullMark: 100
      },
      {
        subject: 'Sessions',
        current: latest.sessions,
        average: filteredData.reduce((sum, item) => sum + item.sessions, 0) / filteredData.length,
        fullMark: Math.max(...filteredData.map(d => d.sessions)) * 1.2
      }
    ];
  }, [filteredData]);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              {(metric === 'both' || metric === 'length') && (
                <Line 
                  type="monotone" 
                  dataKey="length" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(metric === 'both' || metric === 'girth') && (
                <Line 
                  type="monotone" 
                  dataKey="girth" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              {(metric === 'both' || metric === 'length') && (
                <Area 
                  type="monotone" 
                  dataKey="length" 
                  stackId="1"
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                />
              )}
              {(metric === 'both' || metric === 'girth') && (
                <Area 
                  type="monotone" 
                  dataKey="girth" 
                  stackId="1"
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              {(metric === 'both' || metric === 'length') && (
                <Bar dataKey="length" fill="#0088FE" />
              )}
              {(metric === 'both' || metric === 'girth') && (
                <Bar dataKey="girth" fill="#00C49F" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar 
                name="Current" 
                dataKey="current" 
                stroke="#0088FE" 
                fill="#0088FE" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Average" 
                dataKey="average" 
                stroke="#00C49F" 
                fill="#00C49F" 
                fillOpacity={0.6} 
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Advanced Analytics</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)} title="Chart Type">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)} title="Time Range">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={metric} onValueChange={(value: any) => setMetric(value)} title="Metric">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="length">Length</SelectItem>
                  <SelectItem value="girth">Girth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trend Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {trendAnalysis.direction === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-lg font-semibold">
                    {trendAnalysis.direction === 'up' ? '+' : ''}{trendAnalysis.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Growth Rate</p>
              </div>
              <div className="text-center">
                <Badge 
                  variant={trendAnalysis.strength === 'strong' ? 'default' : 'secondary'}
                  className="text-lg px-3 py-1"
                >
                  {trendAnalysis.strength.toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Trend Strength</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {trendAnalysis.trend > 0 ? '+' : ''}{trendAnalysis.trend.toFixed(2)} {unit}
                </div>
                <p className="text-sm text-gray-600">Net Change</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consistency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Consistency & Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={consistencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'consistency' ? `${value.toFixed(1)}%` : value.toString(),
                  name === 'consistency' ? 'Consistency' : 'Sessions'
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="consistency" 
                stroke="#8884D8" 
                fill="#8884D8" 
                fillOpacity={0.6}
                name="Consistency %"
              />
              <Bar 
                yAxisId="right"
                dataKey="sessions" 
                fill="#82CA9D" 
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCharts; 