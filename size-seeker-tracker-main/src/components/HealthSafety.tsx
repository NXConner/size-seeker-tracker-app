import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Heart, Shield, Calendar, Activity, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

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

interface RestDay {
  id: string;
  date: string;
  reason: 'scheduled' | 'injury' | 'discomfort' | 'prevention';
  notes?: string;
}

interface HealthSafetyProps {
  onBack: () => void;
}

export default function HealthSafety({ onBack }: HealthSafetyProps) {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [restDays, setRestDays] = useState<RestDay[]>([]);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isAddRestDayDialogOpen, setIsAddRestDayDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<HealthEvent>>({});
  const [newRestDay, setNewRestDay] = useState<Partial<RestDay>>({});

  useEffect(() => {
    const savedEvents = localStorage.getItem('healthEvents');
    if (savedEvents) {
      setHealthEvents(JSON.parse(savedEvents));
    }

    const savedRestDays = localStorage.getItem('restDays');
    if (savedRestDays) {
      setRestDays(JSON.parse(savedRestDays));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('healthEvents', JSON.stringify(healthEvents));
  }, [healthEvents]);

  useEffect(() => {
    localStorage.setItem('restDays', JSON.stringify(restDays));
  }, [restDays]);

  const addHealthEvent = () => {
    if (!newEvent.type || !newEvent.severity || !newEvent.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const event: HealthEvent = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: newEvent.type!,
      severity: newEvent.severity!,
      description: newEvent.description!,
      symptoms: newEvent.symptoms || [],
      actionTaken: newEvent.actionTaken || '',
      resolved: false,
    };

    setHealthEvents([...healthEvents, event]);
    setNewEvent({});
    setIsAddEventDialogOpen(false);
    toast({
      title: "Health Event Recorded",
      description: "Your health event has been recorded.",
    });
  };

  const addRestDay = () => {
    if (!newRestDay.reason) {
      toast({
        title: "Missing Information",
        description: "Please select a reason for the rest day.",
        variant: "destructive",
      });
      return;
    }

    const restDay: RestDay = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      reason: newRestDay.reason!,
      notes: newRestDay.notes || '',
    };

    setRestDays([...restDays, restDay]);
    setNewRestDay({});
    setIsAddRestDayDialogOpen(false);
    toast({
      title: "Rest Day Added",
      description: "Rest day has been recorded.",
    });
  };

  const resolveHealthEvent = (eventId: string) => {
    setHealthEvents(healthEvents.map(event => 
      event.id === eventId 
        ? { ...event, resolved: true, resolvedDate: new Date().toISOString() }
        : event
    ));
    toast({
      title: "Event Resolved",
      description: "Health event marked as resolved.",
    });
  };

  const getHealthScore = () => {
    const recentEvents = healthEvents.filter(event => {
      const eventDate = new Date(event.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return eventDate >= thirtyDaysAgo && !event.resolved;
    });

    const highSeverityEvents = recentEvents.filter(event => event.severity === 'high').length;
    const mediumSeverityEvents = recentEvents.filter(event => event.severity === 'medium').length;
    const lowSeverityEvents = recentEvents.filter(event => event.severity === 'low').length;

    let score = 100;
    score -= highSeverityEvents * 30;
    score -= mediumSeverityEvents * 15;
    score -= lowSeverityEvents * 5;

    return Math.max(0, score);
  };

  const getRestDayStreak = () => {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      const hasRestDay = restDays.some(restDay => 
        restDay.date.startsWith(dateString)
      );

      if (hasRestDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getSafetyRecommendations = () => {
    const healthScore = getHealthScore();
    const recommendations = [];

    if (healthScore < 50) {
      recommendations.push({
        type: 'warning',
        title: 'High Risk',
        message: 'Consider taking a break and consulting a healthcare provider.',
        icon: AlertTriangle
      });
    } else if (healthScore < 75) {
      recommendations.push({
        type: 'caution',
        title: 'Moderate Risk',
        message: 'Reduce intensity and frequency of sessions.',
        icon: Shield
      });
    }

    const unresolvedEvents = healthEvents.filter(event => !event.resolved);
    if (unresolvedEvents.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Unresolved Events',
        message: `You have ${unresolvedEvents.length} unresolved health events.`,
        icon: Activity
      });
    }

    const restStreak = getRestDayStreak();
    if (restStreak === 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'Rest Day Needed',
        message: 'Consider taking a rest day to prevent overtraining.',
        icon: Calendar
      });
    }

    return recommendations;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injury': return AlertTriangle;
      case 'discomfort': return Activity;
      case 'rest_day': return Calendar;
      case 'warning_sign': return Shield;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Health & Safety</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddEventDialogOpen(true)} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button onClick={() => setIsAddRestDayDialogOpen(true)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Add Rest Day
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span className="font-medium">Health Score</span>
            </div>
            <div className="text-2xl font-bold">{getHealthScore()}%</div>
            <Progress value={getHealthScore()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Rest Day Streak</span>
            </div>
            <div className="text-2xl font-bold">{getRestDayStreak()}</div>
            <p className="text-sm text-gray-600">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Active Events</span>
            </div>
            <div className="text-2xl font-bold">
              {healthEvents.filter(event => !event.resolved).length}
            </div>
            <p className="text-sm text-gray-600">unresolved</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Health Events</TabsTrigger>
          <TabsTrigger value="rest-days">Rest Days</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Safety Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSafetyRecommendations().map((rec, index) => {
                    const Icon = rec.icon;
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${rec.type === 'warning' ? 'bg-red-50 border-red-200' : rec.type === 'caution' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{rec.title}</span>
                        </div>
                        <p className="text-sm mt-1">{rec.message}</p>
                      </div>
                    );
                  })}
                  {getSafetyRecommendations().length === 0 && (
                    <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">All Good!</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">Your health and safety metrics look good.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Health Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthEvents
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((event) => {
                      const Icon = getTypeIcon(event.type);
                      return (
                        <div key={event.id} className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{event.type.replace('_', ' ')}</span>
                              <Badge variant="outline">{event.severity}</Badge>
                            </div>
                            <span className="text-sm">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{event.description}</p>
                          {!event.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveHealthEvent(event.id)}
                              className="mt-2"
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  {healthEvents.length === 0 && (
                    <p className="text-gray-600 text-center py-4">No health events recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Health Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthEvents
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((event) => {
                    const Icon = getTypeIcon(event.type);
                    return (
                      <div key={event.id} className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{event.type.replace('_', ' ')}</span>
                            <Badge variant="outline">{event.severity}</Badge>
                            {event.resolved && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mb-2">{event.description}</p>
                        {event.symptoms.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Symptoms: </span>
                            <span className="text-sm">{event.symptoms.join(', ')}</span>
                          </div>
                        )}
                        {event.actionTaken && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Action Taken: </span>
                            <span className="text-sm">{event.actionTaken}</span>
                          </div>
                        )}
                        {!event.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveHealthEvent(event.id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    );
                  })}
                {healthEvents.length === 0 && (
                  <p className="text-gray-600 text-center py-8">No health events recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rest-days">
          <Card>
            <CardHeader>
              <CardTitle>Rest Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {restDays
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((restDay) => (
                    <div key={restDay.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{restDay.reason.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm">
                          {new Date(restDay.date).toLocaleDateString()}
                        </span>
                      </div>
                      {restDay.notes && (
                        <p className="text-sm text-gray-600">{restDay.notes}</p>
                      )}
                    </div>
                  ))}
                {restDays.length === 0 && (
                  <p className="text-gray-600 text-center py-8">No rest days recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Safety Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Stop Immediately If:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• You experience sharp or persistent pain</li>
                    <li>• You notice numbness or tingling</li>
                    <li>• You see unusual bruising or discoloration</li>
                    <li>• You have difficulty with normal function</li>
                    <li>• You notice signs of infection</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Warning Signs:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Mild discomfort that doesn't resolve quickly</li>
                    <li>• Changes in sensation</li>
                    <li>• Unusual fatigue or weakness</li>
                    <li>• Changes in skin texture or color</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Best Practices:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Always warm up properly before sessions</li>
                    <li>• Start with low pressure and gradually increase</li>
                    <li>• Take adequate rest days between sessions</li>
                    <li>• Stay hydrated and maintain good circulation</li>
                    <li>• Listen to your body's signals</li>
                    <li>• Keep detailed records of any issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Health Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Health Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Type</Label>
              <Select onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="injury">Injury</SelectItem>
                  <SelectItem value="discomfort">Discomfort</SelectItem>
                  <SelectItem value="warning_sign">Warning Sign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity</Label>
              <Select onValueChange={(value) => setNewEvent({ ...newEvent, severity: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what happened..."
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Action Taken</Label>
              <Textarea
                placeholder="What did you do about it?"
                value={newEvent.actionTaken || ''}
                onChange={(e) => setNewEvent({ ...newEvent, actionTaken: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addHealthEvent}>
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rest Day Dialog */}
      <Dialog open={isAddRestDayDialogOpen} onOpenChange={setIsAddRestDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Rest Day</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Select onValueChange={(value) => setNewRestDay({ ...newRestDay, reason: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled Rest</SelectItem>
                  <SelectItem value="injury">Injury Recovery</SelectItem>
                  <SelectItem value="discomfort">Discomfort</SelectItem>
                  <SelectItem value="prevention">Prevention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes..."
                value={newRestDay.notes || ''}
                onChange={(e) => setNewRestDay({ ...newRestDay, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddRestDayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addRestDay}>
              Add Rest Day
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 