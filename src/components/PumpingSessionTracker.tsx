import React, { useState, useEffect } from 'react';
import { Clock, Gauge, Target, Save, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { secureStorage } from '@/utils/secureStorage';
import { PumpingSession } from '@/utils/imageAnalysis';

interface PumpingSessionTrackerProps {
  onBack: () => void;
}

const PumpingSessionTracker: React.FC<PumpingSessionTrackerProps> = ({ onBack }) => {
  const [sessions, setSessions] = useState<PumpingSession[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<PumpingSession | null>(null);
  
  const [formData, setFormData] = useState({
    duration: '',
    pressure: '',
    sets: '3',
    focus: 'both' as 'length' | 'girth' | 'both',
    notes: ''
  });

  useEffect(() => {
    (async () => {
      const savedSessions = (await secureStorage.getItem<PumpingSession[]>('pumpingSessions')) || [];
      setSessions(savedSessions);
    })();
  }, []);

  const saveSession = () => {
    if (!formData.duration || !formData.pressure) {
      toast({
        title: "Missing Information",
        description: "Please fill in duration and pressure.",
        variant: "destructive"
      });
      return;
    }

    const session: PumpingSession = {
      id: editingSession?.id || Date.now().toString(),
      date: editingSession?.date || new Date().toISOString(),
      duration: parseInt(formData.duration),
      pressure: parseFloat(formData.pressure),
      sets: parseInt(formData.sets),
      focus: formData.focus,
      notes: formData.notes || undefined
    };

    let updatedSessions;
    if (editingSession) {
      updatedSessions = sessions.map(s => s.id === editingSession.id ? session : s);
    } else {
      updatedSessions = [...sessions, session];
    }

    secureStorage.setItem('pumpingSessions', updatedSessions);
    setSessions(updatedSessions);
    
    toast({
      title: "Session Saved",
      description: "Pumping session has been recorded successfully."
    });

    resetForm();
  };

  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    secureStorage.setItem('pumpingSessions', updatedSessions);
    setSessions(updatedSessions);
    
    toast({
      title: "Session Deleted",
      description: "Pumping session has been removed."
    });
  };

  const editSession = (session: PumpingSession) => {
    setEditingSession(session);
    setFormData({
      duration: session.duration.toString(),
      pressure: session.pressure.toString(),
      sets: session.sets.toString(),
      focus: session.focus,
      notes: session.notes || ''
    });
    setIsAddingSession(true);
  };

  const resetForm = () => {
    setFormData({
      duration: '',
      pressure: '',
      sets: '3',
      focus: 'both',
      notes: ''
    });
    setIsAddingSession(false);
    setEditingSession(null);
  };

  const getFocusIcon = (focus: string) => {
    switch (focus) {
      case 'length': return '📏';
      case 'girth': return '🔴';
      default: return '🎯';
    }
  };

  const getFocusColor = (focus: string) => {
    switch (focus) {
      case 'length': return 'text-blue-600 dark:text-blue-400';
      case 'girth': return 'text-red-600 dark:text-red-400';
      default: return 'text-purple-600 dark:text-purple-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <span>← Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pumping Sessions</h2>
        <Button onClick={() => setIsAddingSession(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Session</span>
        </Button>
      </div>

      {isAddingSession && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">
            {editingSession ? 'Edit Session' : 'Add New Session'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="15"
              />
            </div>

            <div>
              <Label htmlFor="pressure">Pressure (Hg)</Label>
              <Input
                id="pressure"
                type="number"
                step="0.5"
                value={formData.pressure}
                onChange={(e) => setFormData({ ...formData, pressure: e.target.value })}
                placeholder="5.0"
              />
            </div>

            <div>
              <Label htmlFor="sets">Number of Sets</Label>
              <Input
                id="sets"
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                placeholder="3"
              />
            </div>

            <div>
              <Label htmlFor="focus">Focus Area</Label>
              <Select value={formData.focus} onValueChange={(value) => setFormData({ ...formData, focus: value })} title="Focus Area">
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
          </div>

          <div className="mt-4">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any observations, discomfort, or notes about this session..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 mt-4">
            <Button onClick={saveSession} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{editingSession ? 'Update Session' : 'Save Session'}</span>
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Sessions Recorded</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Start tracking your pumping sessions to monitor progress.</p>
            <Button onClick={() => setIsAddingSession(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add First Session</span>
            </Button>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${getFocusColor(session.focus)} bg-opacity-10`}>
                    <span className="text-2xl">{getFocusIcon(session.focus)}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold dark:text-white">
                        {session.focus.charAt(0).toUpperCase() + session.focus.slice(1)} Focus Session
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="dark:text-gray-300">{session.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Gauge className="h-4 w-4 text-gray-500" />
                        <span className="dark:text-gray-300">{session.pressure} Hg</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="dark:text-gray-300">{session.sets} sets</span>
                      </div>
                    </div>
                    
                    {session.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{session.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editSession(session)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSession(session.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PumpingSessionTracker; 