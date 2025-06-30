import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { imageStorage } from '@/utils/imageStorage';

interface ChartData {
  date: string;
  length?: number;
  girth?: number;
  volume?: number;
  progress?: number;
}

const AdvancedCharts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('length');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      const images = await imageStorage.getAllImages();
      
      // Process data for charts
      const processedData = images
        .filter(img => img.length || img.girth)
        .map(img => ({
          date: new Date(img.date).toLocaleDateString(),
          length: img.length,
          girth: img.girth,
          volume: img.length && img.girth ? (img.length * img.girth * img.girth) / (4 * Math.PI) : undefined,
          progress: img.length ? ((img.length - 10) / 5) * 100 : undefined // Example progress calculation
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setChartData(processedData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (data: ChartData[]) => {
    if (data.length < 2) return <Minus className="h-4 w-4 text-gray-500" />;
    
    const first = data[0][selectedMetric as keyof ChartData] as number;
    const last = data[data.length - 1][selectedMetric as keyof ChartData] as number;
    
    if (last > first) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (last < first) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendText = (data: ChartData[]) => {
    if (data.length < 2) return 'No trend data';
    
    const first = data[0][selectedMetric as keyof ChartData] as number;
    const last = data[data.length - 1][selectedMetric as keyof ChartData] as number;
    const change = ((last - first) / first) * 100;
    
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const exportChartData = () => {
    const csvContent = [
      ['Date', 'Length', 'Girth', 'Volume', 'Progress'],
      ...chartData.map(d => [
        d.date,
        d.length?.toFixed(2) || '',
        d.girth?.toFixed(2) || '',
        d.volume?.toFixed(2) || '',
        d.progress?.toFixed(1) || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `size-seeker-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderLineChart = () => (
    <div className="h-64 flex items-end justify-between space-x-2 p-4">
      {chartData.map((point, index) => {
        const value = point[selectedMetric as keyof ChartData] as number;
        const maxValue = Math.max(...chartData.map(d => d[selectedMetric as keyof ChartData] as number || 0));
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs text-gray-500 mt-1">{point.date}</span>
          </div>
        );
      })}
    </div>
  );

  const renderProgressChart = () => (
    <div className="space-y-4">
      {chartData.map((point, index) => {
        const progress = point.progress || 0;
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{point.date}</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderVolumeChart = () => (
    <div className="grid grid-cols-2 gap-4">
      {chartData.map((point, index) => {
        const volume = point.volume || 0;
        const maxVolume = Math.max(...chartData.map(d => d.volume || 0));
        const size = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;
        
        return (
          <div key={index} className="text-center">
            <div 
              className="mx-auto bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold"
              style={{ 
                width: `${Math.max(size, 20)}px`, 
                height: `${Math.max(size, 20)}px` 
              }}
            >
              {volume.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{point.date}</p>
          </div>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Charts...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Comprehensive measurement tracking and analysis</CardDescription>
            </div>
            <Button onClick={exportChartData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="length">Length</SelectItem>
                <SelectItem value="girth">Girth</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getTrendIcon(chartData)}
            <span>Trend Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {getTrendText(chartData)}
              </p>
              <p className="text-sm text-gray-500">Overall Change</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {chartData.length}
              </p>
              <p className="text-sm text-gray-500">Data Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {chartData.length > 0 ? 
                  (chartData[chartData.length - 1][selectedMetric as keyof ChartData] as number || 0).toFixed(1) : 
                  '0'
                }
              </p>
              <p className="text-sm text-gray-500">Current {selectedMetric}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>
        
        <TabsContent value="line" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLineChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {renderProgressChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Volume Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {renderVolumeChart()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedCharts; 