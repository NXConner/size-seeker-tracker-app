import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Trash2, Volume2, VolumeX, Settings, Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface RoutineStep {
  id: string;
  label: string;
  duration: number;
  description?: string;
  pressure?: string;
}

interface Routine {
  id: string;
  name: string;
  steps: RoutineStep[];
  sets: number;
  restBetweenSets: number;
  focus: 'length' | 'girth' | 'both';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const defaultRoutines: Routine[] = [
  {
    id: 'beginner',
    name: 'Beginner Routine',
    focus: 'both',
    difficulty: 'beginner',
    steps: [
      { id: '1', label: 'Warm Up', duration: 300, description: 'Hot towel or warm shower', pressure: 'None' },
      { id: '2', label: 'In Pump (Low Pressure)', duration: 600, description: '3-5 Hg pressure', pressure: '3-5 Hg' },
      { id: '3', label: 'Massage & Stretch', duration: 300, description: 'Restore blood flow', pressure: 'None' },
    ],
    sets: 3,
    restBetweenSets: 60
  },
  {
    id: 'intermediate',
    name: 'Intermediate Routine',
    focus: 'both',
    difficulty: 'intermediate',
    steps: [
      { id: '1', label: 'Warm Up', duration: 600, description: 'Extended warm-up', pressure: 'None' },
      { id: '2', label: 'In Pump (Medium Pressure)', duration: 900, description: '5-7 Hg pressure', pressure: '5-7 Hg' },
      { id: '3', label: 'Massage & Jelq', duration: 300, description: 'Active recovery', pressure: 'None' },
      { id: '4', label: 'In Pump (High Pressure)', duration: 600, description: '7-10 Hg pressure', pressure: '7-10 Hg' },
      { id: '5', label: 'Cool Down Massage', duration: 300, description: 'Final massage', pressure: 'None' },
    ],
    sets: 2,
    restBetweenSets: 120
  },
  {
    id: 'length-focus',
    name: 'Length Focus',
    focus: 'length',
    difficulty: 'intermediate',
    steps: [
      { id: '1', label: 'Warm Up', duration: 600, description: 'Thorough warm-up', pressure: 'None' },
      { id: '2', label: 'Light Pump (Length)', duration: 1200, description: '3-5 Hg, focus on length', pressure: '3-5 Hg' },
      { id: '3', label: 'Stretching', duration: 600, description: 'Manual stretches', pressure: 'None' },
    ],
    sets: 3,
    restBetweenSets: 180
  },
  {
    id: 'girth-focus',
    name: 'Girth Focus',
    focus: 'girth',
    difficulty: 'advanced',
    steps: [
      { id: '1', label: 'Warm Up', duration: 300, description: 'Quick warm-up', pressure: 'None' },
      { id: '2', label: 'Medium Pump (Girth)', duration: 600, description: '5-8 Hg, focus on girth', pressure: '5-8 Hg' },
      { id: '3', label: 'Jelqing', duration: 300, description: 'Girth-focused jelqs', pressure: 'None' },
      { id: '4', label: 'High Pump (Girth)', duration: 300, description: '8-10 Hg, short bursts', pressure: '8-10 Hg' },
      { id: '5', label: 'Recovery Massage', duration: 300, description: 'Restore circulation', pressure: 'None' },
    ],
    sets: 2,
    restBetweenSets: 120
  }
];

interface RoutineTimerProps {
  onBack: () => void;
}

export default function RoutineTimer({ onBack }: RoutineTimerProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customSoundFile, setCustomSoundFile] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
    
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedRoutines = localStorage.getItem('pumpingRoutines');
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines));
    } else {
      setRoutines(defaultRoutines);
      localStorage.setItem('pumpingRoutines', JSON.stringify(defaultRoutines));
    }

    const savedSound = localStorage.getItem('customChimeSound');
    if (savedSound) {
      setCustomSoundFile(savedSound);
    }

    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    if (savedSoundEnabled !== null) {
      setSoundEnabled(JSON.parse(savedSoundEnabled));
    }
  }, []);

  useEffect(() => {
    if (routines.length > 0) {
      localStorage.setItem('pumpingRoutines', JSON.stringify(routines));
    }
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const playChime = () => {
    if (!soundEnabled) return;
      
    try {
      if (customSoundFile) {
        const audio = new Audio(customSoundFile);
        audio.play();
      } else {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
          
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
          
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
          
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.error('Error playing chime:', error);
    }
  };

  const startTimer = () => {
    if (!selectedRoutine) return;
      
    if (!isRunning) {
      setCurrentSet(1);
      setCurrentStepIndex(0);
      setTimeLeft(selectedRoutine.steps[0].duration);
    }
      
    setIsRunning(true);
    setIsPaused(false);
      
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          playChime();
          return handleStepComplete();
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleStepComplete = (): number => {
    if (!selectedRoutine) return 0;
      
    const nextStepIndex = currentStepIndex + 1;
      
    if (nextStepIndex < selectedRoutine.steps.length) {
      setCurrentStepIndex(nextStepIndex);
      toast({
        title: "Step Complete!",
        description: `Moving to: ${selectedRoutine.steps[nextStepIndex].label}`,
      });
      return selectedRoutine.steps[nextStepIndex].duration;
    } else if (currentSet < selectedRoutine.sets) {
      setCurrentSet(currentSet + 1);
      setCurrentStepIndex(0);
      toast({
        title: `Set ${currentSet} Complete!`,
        description: `Starting set ${currentSet + 1}. Rest for ${selectedRoutine.restBetweenSets}s`,
      });
      return selectedRoutine.restBetweenSets;
    } else {
      setIsRunning(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({
        title: "Routine Complete! 🎉",
        description: "Great job! Remember to cool down properly.",
      });
      return 0;
    }
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSet(1);
    setCurrentStepIndex(0);
    if (selectedRoutine) {
      setTimeLeft(selectedRoutine.steps[0].duration);
    }
  };

  const addTime = (seconds: number) => setTimeLeft((t) => t + seconds);
  const subtractTime = (seconds: number) => setTimeLeft((t) => Math.max(0, t - seconds));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStep = () => {
    if (!selectedRoutine) return null;
    return selectedRoutine.steps[currentStepIndex];
  };

  const getProgressPercentage = () => {
    if (!selectedRoutine) return 0;
    const currentStep = selectedRoutine.steps[currentStepIndex];
    const totalTime = currentStep.duration;
    const remaining = timeLeft;
    return ((totalTime - remaining) / totalTime) * 100;
  };

  const getRoutineProgress = () => {
    if (!selectedRoutine) return 0;
    const totalSteps = selectedRoutine.steps.length * selectedRoutine.sets;
    const completedSteps = (currentSet - 1) * selectedRoutine.steps.length + currentStepIndex;
    return (completedSteps / totalSteps) * 100;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomSoundFile(result);
        localStorage.setItem('customChimeSound', result);
        toast({
          title: "Custom Sound Uploaded",
          description: "Your custom chime sound has been saved.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const createNewRoutine = () => {
    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: 'New Routine',
      focus: 'both',
      difficulty: 'beginner',
      steps: [
        { id: '1', label: 'Warm Up', duration: 300, description: 'Warm up', pressure: 'None' },
        { id: '2', label: 'In Pump', duration: 600, description: 'Pumping session', pressure: '5-7 Hg' },
        { id: '3', label: 'Rest', duration: 300, description: 'Rest period', pressure: 'None' },
      ],
      sets: 3,
      restBetweenSets: 60
    };
    setRoutines([...routines, newRoutine]);
    setEditingRoutine(newRoutine);
    setIsEditDialogOpen(true);
  };

  const saveRoutine = (routine: Routine) => {
    const updatedRoutines = routines.map(r => r.id === routine.id ? routine : r);
    setRoutines(updatedRoutines);
    setIsEditDialogOpen(false);
    setEditingRoutine(null);
    toast({
      title: "Routine Saved",
      description: "Your routine has been updated successfully.",
    });
  };

  const deleteRoutine = (routineId: string) => {
    const updatedRoutines = routines.filter(r => r.id !== routineId);
    setRoutines(updatedRoutines);
    if (selectedRoutine?.id === routineId) {
      setSelectedRoutine(null);
    }
    toast({
      title: "Routine Deleted",
      description: "The routine has been removed.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Routine Timer</h2>
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Routines</span>
                <Button size="sm" onClick={createNewRoutine}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {routines.map((routine) => (
                <div key={routine.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{routine.name}</h4>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {routine.focus}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {routine.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRoutine(routine);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRoutine(routine.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {showSettings && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sound</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div>
                  <Label>Custom Sound</Label>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Timer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedRoutine ? (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-lg text-gray-600 mb-4">
                      {getCurrentStep()?.label} - Set {currentSet}/{selectedRoutine.sets}
                    </div>
                    
                    <Progress value={getProgressPercentage()} className="mb-4" />
                    <Progress value={getRoutineProgress()} className="mb-6" />
                    
                    <div className="flex justify-center gap-2 mb-4">
                      {!isRunning ? (
                        <Button onClick={startTimer} disabled={isPaused}>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      ) : (
                        <Button onClick={pauseTimer}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" onClick={resetTimer}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => addTime(60)}>
                        +1 min
                      </Button>
                      <Button variant="outline" onClick={() => subtractTime(60)}>
                        -1 min
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Current Step Details</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p><strong>Description:</strong> {getCurrentStep()?.description}</p>
                      <p><strong>Pressure:</strong> {getCurrentStep()?.pressure}</p>
                      <p><strong>Duration:</strong> {formatTime(getCurrentStep()?.duration || 0)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Select a routine to start</p>
                  <div className="space-y-2">
                    {routines.slice(0, 3).map((routine) => (
                      <Button
                        key={routine.id}
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedRoutine(routine)}
                      >
                        {routine.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Routine</DialogTitle>
          </DialogHeader>
          {editingRoutine && (
            <RoutineEditor
              routine={editingRoutine}
              onSave={saveRoutine}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingRoutine(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RoutineEditorProps {
  routine: Routine;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

function RoutineEditor({ routine, onSave, onCancel }: RoutineEditorProps) {
  const [editedRoutine, setEditedRoutine] = useState<Routine>(routine);

  const updateStep = (index: number, field: keyof RoutineStep, value: any) => {
    const updatedSteps = [...editedRoutine.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setEditedRoutine({ ...editedRoutine, steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: RoutineStep = {
      id: Date.now().toString(),
      label: 'New Step',
      duration: 300,
      description: '',
      pressure: 'None'
    };
    setEditedRoutine({
      ...editedRoutine,
      steps: [...editedRoutine.steps, newStep]
    });
  };

  const removeStep = (index: number) => {
    const updatedSteps = editedRoutine.steps.filter((_, i) => i !== index);
    setEditedRoutine({ ...editedRoutine, steps: updatedSteps });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Routine Name</Label>
          <Input
            value={editedRoutine.name}
            onChange={(e) => setEditedRoutine({ ...editedRoutine, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Focus</Label>
          <Select
            value={editedRoutine.focus}
            onValueChange={(value) => setEditedRoutine({ ...editedRoutine, focus: value as 'length' | 'girth' | 'both' })}
          >
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sets</Label>
          <Input
            type="number"
            value={editedRoutine.sets}
            onChange={(e) => setEditedRoutine({ ...editedRoutine, sets: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Rest Between Sets (seconds)</Label>
          <Input
            type="number"
            value={editedRoutine.restBetweenSets}
            onChange={(e) => setEditedRoutine({ ...editedRoutine, restBetweenSets: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label>Steps</Label>
        <div className="space-y-2 mt-2">
          {editedRoutine.steps.map((step, index) => (
            <div key={step.id} className="border p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Step name"
                  value={step.label}
                  onChange={(e) => updateStep(index, 'label', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Duration (seconds)"
                  value={step.duration}
                  onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Description"
                  value={step.description || ''}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                />
                <Input
                  placeholder="Pressure"
                  value={step.pressure || ''}
                  onChange={(e) => updateStep(index, 'pressure', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeStep(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedRoutine)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
} 