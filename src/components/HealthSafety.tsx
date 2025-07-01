import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Heart, Shield, Calendar, Activity, TrendingDown, CheckCircle, Plus, Trash2, Edit, Bell, FileText, Thermometer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { secureStorage } from '@/utils/secureStorage';

interface HealthEvent {
  id: string;
  type: 'injury' | 'discomfort' | 'warning' | 'rest' | 'consultation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: string;
  resolved: boolean;
  resolvedDate?: string;
  recommendations: string[];
  requiresMedicalAttention: boolean;
}

interface RestDay {
  id: string;
  date: string;
  reason: 'scheduled' | 'injury' | 'fatigue' | 'prevention' | 'other';
  description: string;
  duration: number; // days
  completed: boolean;
}

interface HealthMetrics {
  fatigueLevel: number; // 1-10
  painLevel: number; // 1-10
  stressLevel: number; // 1-10
  sleepQuality: number; // 1-10
  lastUpdated: string;
}

interface SafetyGuidelines {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'technique' | 'equipment' | 'recovery';
  importance: 'low' | 'medium' | 'high' | 'critical';
  followed: boolean;
}

interface HealthSafetyProps {
  onBack: () => void;
}

const HealthSafety: React.FC<HealthSafetyProps> = ({ onBack }) => {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [restDays, setRestDays] = useState<RestDay[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    fatigueLevel: 3,
    painLevel: 1,
    stressLevel: 4,
    sleepQuality: 7,
    lastUpdated: new Date().toISOString()
  });
  const [safetyGuidelines, setSafetyGuidelines] = useState<SafetyGuidelines[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'discomfort' as const,
    severity: 'low' as const,
    title: '',
    description: '',
    requiresMedicalAttention: false
  });

  useEffect(() => {
    loadHealthData();
    initializeSafetyGuidelines();
  }, []);

  const loadHealthData = () => {
    const savedEvents = secureStorage.getItem('health_events') || [];
    const savedRestDays = secureStorage.getItem('rest_days') || [];
    const savedMetrics = secureStorage.getItem('health_metrics') || healthMetrics;
    
    setHealthEvents(savedEvents);
    setRestDays(savedRestDays);
    setHealthMetrics(savedMetrics);
  };

  const initializeSafetyGuidelines = () => {
    const guidelines: SafetyGuidelines[] = [
      {
        id: '1',
        title: 'Start Slowly',
        description: 'Begin with shorter sessions and gradually increase duration and intensity',
        category: 'general',
        importance: 'high',
        followed: false
      },
      {
        id: '2',
        title: 'Listen to Your Body',
        description: 'Stop immediately if you experience pain, numbness, or unusual sensations',
        category: 'general',
        importance: 'critical',
        followed: false
      },
      {
        id: '3',
        title: 'Proper Warm-up',
        description: 'Always warm up before sessions to prepare your body',
        category: 'technique',
        importance: 'high',
        followed: false
      },
      {
        id: '4',
        title: 'Rest Days',
        description: 'Take regular rest days to allow recovery and prevent overtraining',
        category: 'recovery',
        importance: 'high',
        followed: false
      },
      {
        id: '5',
        title: 'Equipment Safety',
        description: 'Use properly sized equipment and check for damage regularly',
        category: 'equipment',
        importance: 'critical',
        followed: false
      },
      {
        id: '6',
        title: 'Hydration',
        description: 'Stay well-hydrated before, during, and after sessions',
        category: 'general',
        importance: 'medium',
        followed: false
      },
      {
        id: '7',
        title: 'Medical Consultation',
        description: 'Consult a healthcare professional before starting if you have health conditions',
        category: 'general',
        importance: 'critical',
        followed: false
      }
    ];
    
    const savedGuidelines = secureStorage.getItem('safety_guidelines') || guidelines;
    setSafetyGuidelines(savedGuidelines);
  };

  const addHealthEvent = () => {
    if (!newEvent.title.trim() || !newEvent.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and description.",
        variant: "destructive"
      });
      return;
    }

    const event: HealthEvent = {
      id: Date.now().toString(),
      type: newEvent.type,
      severity: newEvent.severity,
      title: newEvent.title,
      description: newEvent.description,
      date: new Date().toISOString(),
      resolved: false,
      requiresMedicalAttention: newEvent.requiresMedicalAttention,
      recommendations: getRecommendations(newEvent.type, newEvent.severity)
    };

    const updatedEvents = [event, ...healthEvents];
    setHealthEvents(updatedEvents);
    secureStorage.setItem('health_events', updatedEvents);

    // Reset form
    setNewEvent({
      type: 'discomfort',
      severity: 'low',
      title: '',
      description: '',
      requiresMedicalAttention: false
    });
    setShowAddEvent(false);

    toast({
      title: "Health Event Recorded",
      description: "Your health event has been recorded. Follow the recommendations provided.",
    });

    // Check if medical attention is required
    if (newEvent.requiresMedicalAttention) {
      toast({
        title: "Medical Attention Required",
        description: "Please consult a healthcare professional as soon as possible.",
        variant: "destructive"
      });
    }
  };

  const getRecommendations = (type: string, severity: string): string[] => {
    const recommendations: { [key: string]: { [key: string]: string[] } } = {
      injury: {
        low: ['Rest the affected area', 'Apply ice if appropriate', 'Monitor for changes'],
        medium: ['Rest for 48-72 hours', 'Apply ice and compression', 'Consider consulting a healthcare provider'],
        high: ['Stop all activities immediately', 'Seek medical attention', 'Follow medical advice strictly'],
        critical: ['Seek immediate medical attention', 'Do not continue any activities', 'Follow emergency protocols']
      },
      discomfort: {
        low: ['Take a break from activities', 'Monitor symptoms', 'Reduce intensity next session'],
        medium: ['Rest for 24-48 hours', 'Apply gentle stretching', 'Consider consulting a healthcare provider'],
        high: ['Stop activities immediately', 'Seek medical attention', 'Do not resume until cleared'],
        critical: ['Seek immediate medical attention', 'Stop all activities', 'Follow emergency protocols']
      },
      warning: {
        low: ['Monitor closely', 'Reduce intensity', 'Consider taking a rest day'],
        medium: ['Take a rest day', 'Monitor symptoms', 'Consider consulting a healthcare provider'],
        high: ['Stop activities', 'Seek medical attention', 'Follow medical advice'],
        critical: ['Seek immediate medical attention', 'Stop all activities', 'Follow emergency protocols']
      },
      rest: {
        low: ['Take a light rest day', 'Gentle stretching only', 'Focus on recovery'],
        medium: ['Complete rest day', 'No activities', 'Focus on hydration and nutrition'],
        high: ['Extended rest period', 'No activities', 'Consider consulting a healthcare provider'],
        critical: ['Complete rest', 'Seek medical attention', 'Follow medical advice']
      }
    };

    return recommendations[type]?.[severity] || ['Monitor symptoms', 'Consider consulting a healthcare provider'];
  };

  const resolveHealthEvent = (eventId: string) => {
    const updatedEvents = healthEvents.map(event =>
      event.id === eventId 
        ? { ...event, resolved: true, resolvedDate: new Date().toISOString() }
        : event
    );
    setHealthEvents(updatedEvents);
    secureStorage.setItem('health_events', updatedEvents);
    
    toast({
      title: "Event Resolved",
      description: "Health event has been marked as resolved.",
    });
  };

  const addRestDay = () => {
    const restDay: RestDay = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      reason: 'scheduled',
      description: 'Scheduled rest day for recovery',
      duration: 1,
      completed: false
    };

    const updatedRestDays = [restDay, ...restDays];
    setRestDays(updatedRestDays);
    secureStorage.setItem('rest_days', updatedRestDays);
    
    toast({
      title: "Rest Day Added",
      description: "Rest day has been scheduled.",
    });
  };

  const updateHealthMetrics = (metric: keyof HealthMetrics, value: number) => {
    const updatedMetrics = { ...healthMetrics, [metric]: value, lastUpdated: new Date().toISOString() };
    setHealthMetrics(updatedMetrics);
    secureStorage.setItem('health_metrics', updatedMetrics);
    
    // Check for concerning levels
    if (value >= 8) {
      toast({
        title: "High Level Detected",
        description: `Your ${metric.replace('Level', '').toLowerCase()} level is high. Consider taking a rest day.`,
        variant: "destructive"
      });
    }
  };

  const toggleSafetyGuideline = (guidelineId: string) => {
    const updatedGuidelines = safetyGuidelines.map(guideline =>
      guideline.id === guidelineId ? { ...guideline, followed: !guideline.followed } : guideline
    );
    setSafetyGuidelines(updatedGuidelines);
    secureStorage.setItem('safety_guidelines', updatedGuidelines);
  };

  const getHealthStatus = () => {
    const activeEvents = healthEvents.filter(e => !e.resolved);
    const criticalEvents = activeEvents.filter(e => e.severity === 'critical');
    const highEvents = activeEvents.filter(e => e.severity === 'high');
    
    if (criticalEvents.length > 0) return 'critical';
    if (highEvents.length > 0) return 'warning';
    if (activeEvents.length > 0) return 'caution';
    return 'good';
  };

  const getHealthScore = () => {
    const baseScore = 100;
    const activeEvents = healthEvents.filter(e => !e.resolved);
    const eventPenalty = activeEvents.reduce((penalty, event) => {
      const severityPenalty = { low: 5, medium: 15, high: 30, critical: 50 }[event.severity];
      return penalty + severityPenalty;
    }, 0);
    
    const metricsPenalty = (10 - healthMetrics.fatigueLevel) * 2 + 
                          (10 - healthMetrics.sleepQuality) * 2 +
                          healthMetrics.painLevel * 3 +
                          healthMetrics.stressLevel * 2;
    
    return Math.max(0, baseScore - eventPenalty - metricsPenalty);
  };

  const healthStatus = getHealthStatus();
  const healthScore = getHealthScore();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Health & Safety Monitor</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddEvent(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button onClick={addRestDay} variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Add Rest Day
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Health Events</TabsTrigger>
          <TabsTrigger value="rest">Rest Days</TabsTrigger>
          <TabsTrigger value="guidelines">Safety Guidelines</TabsTrigger>
          <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Health Status */}
            <Card className={`border-2 ${
              healthStatus === 'critical' ? 'border-red-500 bg-red-50' :
              healthStatus === 'warning' ? 'border-orange-500 bg-orange-50' :
              healthStatus === 'caution' ? 'border-yellow-500 bg-yellow-50' :
              'border-green-500 bg-green-50'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                {healthStatus === 'critical' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                 healthStatus === 'warning' ? <AlertTriangle className="h-4 w-4 text-orange-600" /> :
                 healthStatus === 'caution' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                 <CheckCircle className="h-4 w-4 text-green-600" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{healthStatus}</div>
                <p className="text-xs text-muted-foreground">
                  {healthStatus === 'critical' ? 'Immediate attention required' :
                   healthStatus === 'warning' ? 'Monitor closely' :
                   healthStatus === 'caution' ? 'Proceed with caution' :
                   'All systems normal'}
                </p>
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthScore}/100</div>
                <Progress value={healthScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'}
                </p>
              </CardContent>
            </Card>

            {/* Active Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthEvents.filter(e => !e.resolved).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthEvents.filter(e => !e.resolved && e.requiresMedicalAttention).length} require medical attention
                </p>
              </CardContent>
            </Card>

            {/* Rest Days */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rest Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {restDays.filter(r => !r.completed).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {restDays.filter(r => r.completed).length} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setShowAddEvent(true)} variant="outline" className="h-20">
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">Report Health Event</span>
                  </div>
                </Button>
                <Button onClick={addRestDay} variant="outline" className="h-20">
                  <div className="text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">Schedule Rest Day</span>
                  </div>
                </Button>
                <Button onClick={() => setActiveTab('metrics')} variant="outline" className="h-20">
                  <div className="text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">Update Health Metrics</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Health Events</h3>
              <Button onClick={() => setShowAddEvent(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            <div className="space-y-4">
              {healthEvents.map((event) => (
                <Card key={event.id} className={event.resolved ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{event.type}</Badge>
                          <Badge variant={
                            event.severity === 'critical' ? 'destructive' :
                            event.severity === 'high' ? 'default' :
                            event.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {event.severity}
                          </Badge>
                          {event.requiresMedicalAttention && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Medical Attention Required
                            </Badge>
                          )}
                          {event.resolved && (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {event.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {!event.resolved && (
                      <Button 
                        onClick={() => resolveHealthEvent(event.id)}
                        className="mt-4"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {healthEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No health events recorded. Keep monitoring your health!</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rest">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rest Days</h3>
              <Button onClick={addRestDay} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rest Day
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restDays.map((restDay) => (
                <Card key={restDay.id} className={restDay.completed ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm capitalize">{restDay.reason} Rest</CardTitle>
                      <Badge variant={restDay.completed ? 'default' : 'secondary'}>
                        {restDay.completed ? 'Completed' : 'Scheduled'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{restDay.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Duration: {restDay.duration} day(s)</span>
                      <span>{new Date(restDay.date).toLocaleDateString()}</span>
                    </div>
                    
                    {!restDay.completed && (
                      <Button 
                        onClick={() => {
                          const updatedRestDays = restDays.map(rd =>
                            rd.id === restDay.id ? { ...rd, completed: true } : rd
                          );
                          setRestDays(updatedRestDays);
                          secureStorage.setItem('rest_days', updatedRestDays);
                        }}
                        className="mt-3 w-full"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {restDays.length === 0 && (
                <div className="text-center py-8 text-gray-500 col-span-full">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No rest days scheduled. Consider adding rest days for recovery!</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guidelines">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Safety Guidelines</h3>

            <div className="space-y-4">
              {safetyGuidelines.map((guideline) => (
                <Card key={guideline.id} className={guideline.followed ? 'border-green-200 bg-green-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{guideline.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{guideline.category}</Badge>
                          <Badge variant={
                            guideline.importance === 'critical' ? 'destructive' :
                            guideline.importance === 'high' ? 'default' :
                            guideline.importance === 'medium' ? 'secondary' : 'outline'
                          }>
                            {guideline.importance}
                          </Badge>
                          {guideline.followed && (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Following
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={guideline.followed ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSafetyGuideline(guideline.id)}
                      >
                        {guideline.followed ? 'Following' : 'Mark as Following'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{guideline.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Health Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fatigue Level (1-10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Low Energy</span>
                      <span>High Energy</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={healthMetrics.fatigueLevel}
                      onChange={(e) => updateHealthMetrics('fatigueLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-center font-medium">{healthMetrics.fatigueLevel}/10</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pain Level (1-10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>No Pain</span>
                      <span>Severe Pain</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={healthMetrics.painLevel}
                      onChange={(e) => updateHealthMetrics('painLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-center font-medium">{healthMetrics.painLevel}/10</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stress Level (1-10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Relaxed</span>
                      <span>Very Stressed</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={healthMetrics.stressLevel}
                      onChange={(e) => updateHealthMetrics('stressLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-center font-medium">{healthMetrics.stressLevel}/10</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sleep Quality (1-10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Poor Sleep</span>
                      <span>Excellent Sleep</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={healthMetrics.sleepQuality}
                      onChange={(e) => updateHealthMetrics('sleepQuality', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-center font-medium">{healthMetrics.sleepQuality}/10</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {new Date(healthMetrics.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Event Dialog */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Health Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))} title="Event Type">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injury">Injury</SelectItem>
                    <SelectItem value="discomfort">Discomfort</SelectItem>
                    <SelectItem value="warning">Warning Sign</SelectItem>
                    <SelectItem value="rest">Rest Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select value={newEvent.severity} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, severity: value }))} title="Severity">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the event..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of what happened..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="medical-attention"
                  checked={newEvent.requiresMedicalAttention}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, requiresMedicalAttention: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="medical-attention" className="text-sm">Requires medical attention</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={addHealthEvent} className="flex-1">
                  Add Event
                </Button>
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunityFeatures; 