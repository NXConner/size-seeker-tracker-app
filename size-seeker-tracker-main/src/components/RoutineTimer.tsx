import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, Plus, Edit, Save, X, Volume2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface RoutineStep {
  id: string;
  name: string;
  duration: number;
  description: string;
}

interface Routine {
  id: string;
  name: string;
  steps: RoutineStep[];
  totalDuration: number;
}

interface RoutineTimerProps {
  onBack: () => void;
}

const defaultRoutines: Routine[] = [
  {
    id: '1',
    name: 'Beginner Routine',
    totalDuration: 30,
    steps: [
      { id: '1-1', name: 'Warm Up', duration: 5, description: 'Hot towel or warm shower' },
      { id: '1-2', name: 'In Pump (Low Pressure)', duration: 10, description: '3-5 Hg pressure' },
      { id: '1-3', name: 'Massage & Stretch', duration: 5, description: 'Restore blood flow' },
      { id: '1-4', name: 'Repeat Set', duration: 10, description: 'Second set with low pressure' }
    ]
  },
  {
    id: '2',
    name: 'Intermediate Routine',
    totalDuration: 45,
    steps: [
      { id: '2-1', name: 'Warm Up', duration: 10, description: 'Extended warm-up with stretching' },
      { id: '2-2', name: 'In Pump (Medium Pressure)', duration: 15, description: '5-7 Hg pressure' },
      { id: '2-3', name: 'Massage & Jelq', duration: 5, description: 'Active recovery' },
      { id: '2-4', name: 'In Pump (High Pressure)', duration: 10, description: '7-10 Hg pressure' },
      { id: '2-5', name: 'Cool Down', duration: 5, description: 'Gentle massage' }
    ]
  },
  {
    id: '3',
    name: 'Advanced Routine',
    totalDuration: 60,
    steps: [
      { id: '3-1', name: 'Warm Up', duration: 10, description: 'Thorough warm-up' },
      { id: '3-2', name: 'Light Pump', duration: 15, description: '3-5 Hg for length' },
      { id: '3-3', name: 'Stretching', duration: 10, description: 'Manual stretches' },
      { id: '3-4', name: 'Medium Pump', duration: 15, description: '5-8 Hg for girth' },
      { id: '3-5', name: 'Jelqing', duration: 5, description: 'Girth-focused jelqing' },
      { id: '3-6', name: 'Cool Down', duration: 5, description: 'Final massage' }
    ]
  }
];

export default function RoutineTimer({ onBack }: RoutineTimerProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customSound, setCustomSound] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isAddRoutineDialogOpen, setIsAddRoutineDialogOpen] = useState(false);
  const [newRoutine, setNewRoutine] = useState<Partial<Routine>>({});
  const [newStep, setNewStep] = useState<Partial<RoutineStep>>({});
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load routines from localStorage
    const savedRoutines = localStorage.getItem('pumpingRoutines');
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines));
    } else {
      setRoutines(defaultRoutines);
      localStorage.setItem('pumpingRoutines', JSON.stringify(defaultRoutines));
    }

    // Load custom sound
    const savedSound = localStorage.getItem('customSound');
    if (savedSound) {
      setCustomSound(savedSound);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pumpingRoutines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    if (selectedRoutine && selectedRoutine.steps.length > 0) {
      setTimeLeft(selectedRoutine.steps[0].duration * 60);
    }
  }, [selectedRoutine]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Step completed
            playAlarm();
            if (currentStepIndex < (selectedRoutine?.steps.length || 0) - 1) {
              // Move to next step
              const nextIndex = currentStepIndex + 1;
              setCurrentStepIndex(nextIndex);
              return selectedRoutine!.steps[nextIndex].duration * 60;
            } else {
              // Routine completed
              setIsRunning(false);
              setIsPaused(false);
              toast({
                title: "Routine Complete!",
                description: "Great job completing your routine!",
              });
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft, currentStepIndex, selectedRoutine]);

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    } else {
      // Fallback to browser notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(console.error);
    }
  };

  const startRoutine = () => {
    if (!selectedRoutine) return;
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setTimeLeft(selectedRoutine.steps[0].duration * 60);
  };

  const pauseRoutine = () => {
    setIsPaused(true);
  };

  const resumeRoutine = () => {
    setIsPaused(false);
  };

  const stopRoutine = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    if (selectedRoutine) {
      setTimeLeft(selectedRoutine.steps[0].duration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomSound(result);
        localStorage.setItem('customSound', result);
        toast({
          title: "Custom Sound Uploaded",
          description: "Your custom sound has been saved.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addRoutine = () => {
    if (!newRoutine.name || !newRoutine.steps || newRoutine.steps.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and at least one step for the routine.",
        variant: "destructive",
      });
      return;
    }

    const routine: Routine = {
      id: Date.now().toString(),
      name: newRoutine.name,
      steps: newRoutine.steps as RoutineStep[],
      totalDuration: (newRoutine.steps as RoutineStep[]).reduce((sum, step) => sum + step.duration, 0)
    };

    setRoutines([...routines, routine]);
    setNewRoutine({});
    setIsAddRoutineDialogOpen(false);
    toast({
      title: "Routine Added",
      description: "Your new routine has been created.",
    });
  };

  const addStep = () => {
    if (!newStep.name || !newStep.duration) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and duration for the step.",
        variant: "destructive",
      });
      return;
    }

    const step: RoutineStep = {
      id: Date.now().toString(),
      name: newStep.name,
      duration: newStep.duration,
      description: newStep.description || ''
    };

    if (editingRoutine) {
      const updatedRoutine = {
        ...editingRoutine,
        steps: [...editingRoutine.steps, step],
        totalDuration: editingRoutine.totalDuration + step.duration
      };
      setEditingRoutine(updatedRoutine);
    }

    setNewStep({});
    setIsAddStepDialogOpen(false);
  };

  const saveRoutine = () => {
    if (editingRoutine) {
      setRoutines(routines.map(r => r.id === editingRoutine.id ? editingRoutine : r));
      setSelectedRoutine(editingRoutine);
      setIsEditing(false);
      setEditingRoutine(null);
      toast({
        title: "Routine Saved",
        description: "Your routine has been updated.",
      });
    }
  };

  const deleteRoutine = (routineId: string) => {
    setRoutines(routines.filter(r => r.id !== routineId));
    if (selectedRoutine?.id === routineId) {
      setSelectedRoutine(null);
    }
    toast({
      title: "Routine Deleted",
      description: "The routine has been removed.",
    });
  };

  const currentStep = selectedRoutine?.steps[currentStepIndex];
  const progress = selectedRoutine ? (currentStepIndex / selectedRoutine.steps.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Routine Timer</h2>
        <Button onClick={() => setIsAddRoutineDialogOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Routine</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routine Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Routines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoutine?.id === routine.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRoutine(routine)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{routine.name}</h3>
                        <p className="text-sm text-gray-600">
                          {routine.steps.length} steps • {routine.totalDuration} min
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRoutine(routine);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoutine(routine.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timer Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedRoutine ? selectedRoutine.name : 'Select a Routine'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoutine ? (
                <div className="space-y-6">
                  {/* Timer Display */}
                  <div className="text-center">
                    <div className="text-6xl font-mono font-bold text-blue-600 mb-4">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-gray-700">
                      {currentStep?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Step {currentStepIndex + 1} of {selectedRoutine.steps.length}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    {!isRunning ? (
                      <Button onClick={startRoutine} size="lg" className="flex items-center space-x-2">
                        <Play className="h-5 w-5" />
                        <span>Start</span>
                      </Button>
                    ) : (
                      <>
                        {isPaused ? (
                          <Button onClick={resumeRoutine} size="lg" className="flex items-center space-x-2">
                            <Play className="h-5 w-5" />
                            <span>Resume</span>
                          </Button>
                        ) : (
                          <Button onClick={pauseRoutine} size="lg" variant="outline" className="flex items-center space-x-2">
                            <Pause className="h-5 w-5" />
                            <span>Pause</span>
                          </Button>
                        )}
                        <Button onClick={stopRoutine} size="lg" variant="outline" className="flex items-center space-x-2">
                          <Square className="h-5 w-5" />
                          <span>Stop</span>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Steps List */}
                  <div>
                    <h3 className="font-medium mb-3">Routine Steps</h3>
                    <div className="space-y-2">
                      {selectedRoutine.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`p-3 border rounded-lg ${
                            index === currentStepIndex && isRunning
                              ? 'border-blue-500 bg-blue-50'
                              : index < currentStepIndex
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{step.name}</div>
                              <div className="text-sm text-gray-600">{step.description}</div>
                            </div>
                            <div className="text-sm font-mono">
                              {step.duration}:00
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Select a routine to start</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Sound Upload */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Custom Sound</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="flex-1"
            />
            {customSound && (
              <Button
                variant="outline"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.play().catch(console.error);
                  }
                }}
              >
                Test Sound
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={customSound || undefined} />

      {/* Add Routine Dialog */}
      <Dialog open={isAddRoutineDialogOpen} onOpenChange={setIsAddRoutineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Routine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Routine Name</Label>
              <Input
                value={newRoutine.name || ''}
                onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                placeholder="Enter routine name"
              />
            </div>
            <div>
              <Label>Steps</Label>
              <div className="space-y-2">
                {(newRoutine.steps || []).map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={step.name}
                      onChange={(e) => {
                        const updatedSteps = [...(newRoutine.steps || [])];
                        updatedSteps[index] = { ...step, name: e.target.value };
                        setNewRoutine({ ...newRoutine, steps: updatedSteps });
                      }}
                      placeholder="Step name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={step.duration}
                      onChange={(e) => {
                        const updatedSteps = [...(newRoutine.steps || [])];
                        updatedSteps[index] = { ...step, duration: parseInt(e.target.value) || 0 };
                        setNewRoutine({ ...newRoutine, steps: updatedSteps });
                      }}
                      placeholder="Min"
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedSteps = (newRoutine.steps || []).filter((_, i) => i !== index);
                        setNewRoutine({ ...newRoutine, steps: updatedSteps });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const step: RoutineStep = {
                      id: Date.now().toString(),
                      name: '',
                      duration: 5,
                      description: ''
                    };
                    setNewRoutine({
                      ...newRoutine,
                      steps: [...(newRoutine.steps || []), step]
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddRoutineDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addRoutine}>
              Add Routine
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Routine Dialog */}
      {isEditing && editingRoutine && (
        <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Routine Name</Label>
                <Input
                  value={editingRoutine.name}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Steps</Label>
                  <Button
                    size="sm"
                    onClick={() => setIsAddStepDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingRoutine.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-2">
                      <Input
                        value={step.name}
                        onChange={(e) => {
                          const updatedSteps = [...editingRoutine.steps];
                          updatedSteps[index] = { ...step, name: e.target.value };
                          setEditingRoutine({ ...editingRoutine, steps: updatedSteps });
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={step.duration}
                        onChange={(e) => {
                          const updatedSteps = [...editingRoutine.steps];
                          updatedSteps[index] = { ...step, duration: parseInt(e.target.value) || 0 };
                          setEditingRoutine({ ...editingRoutine, steps: updatedSteps });
                        }}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updatedSteps = editingRoutine.steps.filter((_, i) => i !== index);
                          setEditingRoutine({ ...editingRoutine, steps: updatedSteps });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={saveRoutine}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Step Dialog */}
      <Dialog open={isAddStepDialogOpen} onOpenChange={setIsAddStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Step Name</Label>
              <Input
                value={newStep.name || ''}
                onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                placeholder="Enter step name"
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={newStep.duration || ''}
                onChange={(e) => setNewStep({ ...newStep, duration: parseInt(e.target.value) || 0 })}
                placeholder="Enter duration"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={newStep.description || ''}
                onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddStepDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addStep}>
              Add Step
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 