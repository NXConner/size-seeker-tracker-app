"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const dialog_1 = require("@/components/ui/dialog");
const progress_1 = require("@/components/ui/progress");
const badge_1 = require("@/components/ui/badge");
const use_toast_1 = require("@/hooks/use-toast");
const defaultRoutines = [
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
function RoutineTimer({ onBack }) {
    const [routines, setRoutines] = (0, react_1.useState)([]);
    const [selectedRoutine, setSelectedRoutine] = (0, react_1.useState)(null);
    const [currentSet, setCurrentSet] = (0, react_1.useState)(1);
    const [currentStepIndex, setCurrentStepIndex] = (0, react_1.useState)(0);
    const [timeLeft, setTimeLeft] = (0, react_1.useState)(0);
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = (0, react_1.useState)(false);
    const [editingRoutine, setEditingRoutine] = (0, react_1.useState)(null);
    const [soundEnabled, setSoundEnabled] = (0, react_1.useState)(true);
    const [customSoundFile, setCustomSoundFile] = (0, react_1.useState)(null);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const timerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const savedRoutines = localStorage.getItem('pumpingRoutines');
        if (savedRoutines) {
            setRoutines(JSON.parse(savedRoutines));
        }
        else {
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
    (0, react_1.useEffect)(() => {
        if (routines.length > 0) {
            localStorage.setItem('pumpingRoutines', JSON.stringify(routines));
        }
    }, [routines]);
    (0, react_1.useEffect)(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);
    const playChime = () => {
        if (!soundEnabled)
            return;
        try {
            if (customSoundFile) {
                const audio = new Audio(customSoundFile);
                audio.play();
            }
            else {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        }
        catch (error) {
            console.error('Error playing chime:', error);
        }
    };
    const startTimer = () => {
        if (!selectedRoutine)
            return;
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
    const handleStepComplete = () => {
        if (!selectedRoutine)
            return 0;
        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex < selectedRoutine.steps.length) {
            setCurrentStepIndex(nextStepIndex);
            (0, use_toast_1.toast)({
                title: "Step Complete!",
                description: `Moving to: ${selectedRoutine.steps[nextStepIndex].label}`,
            });
            return selectedRoutine.steps[nextStepIndex].duration;
        }
        else if (currentSet < selectedRoutine.sets) {
            setCurrentSet(currentSet + 1);
            setCurrentStepIndex(0);
            (0, use_toast_1.toast)({
                title: `Set ${currentSet} Complete!`,
                description: `Starting set ${currentSet + 1}. Rest for ${selectedRoutine.restBetweenSets}s`,
            });
            return selectedRoutine.restBetweenSets;
        }
        else {
            setIsRunning(false);
            setIsPaused(false);
            if (timerRef.current)
                clearInterval(timerRef.current);
            (0, use_toast_1.toast)({
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
        if (timerRef.current)
            clearInterval(timerRef.current);
        setIsRunning(false);
        setIsPaused(false);
        setCurrentSet(1);
        setCurrentStepIndex(0);
        if (selectedRoutine) {
            setTimeLeft(selectedRoutine.steps[0].duration);
        }
    };
    const addTime = (seconds) => setTimeLeft((t) => t + seconds);
    const subtractTime = (seconds) => setTimeLeft((t) => Math.max(0, t - seconds));
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const getCurrentStep = () => {
        if (!selectedRoutine)
            return null;
        return selectedRoutine.steps[currentStepIndex];
    };
    const getProgressPercentage = () => {
        if (!selectedRoutine)
            return 0;
        const currentStep = selectedRoutine.steps[currentStepIndex];
        const totalTime = currentStep.duration;
        const remaining = timeLeft;
        return ((totalTime - remaining) / totalTime) * 100;
    };
    const getRoutineProgress = () => {
        if (!selectedRoutine)
            return 0;
        const totalSteps = selectedRoutine.steps.length * selectedRoutine.sets;
        const completedSteps = (currentSet - 1) * selectedRoutine.steps.length + currentStepIndex;
        return (completedSteps / totalSteps) * 100;
    };
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                setCustomSoundFile(result);
                localStorage.setItem('customChimeSound', result);
                (0, use_toast_1.toast)({
                    title: "Custom Sound Uploaded",
                    description: "Your custom chime sound has been saved.",
                });
            };
            reader.readAsDataURL(file);
        }
    };
    const createNewRoutine = () => {
        const newRoutine = {
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
    const saveRoutine = (routine) => {
        const updatedRoutines = routines.map(r => r.id === routine.id ? routine : r);
        setRoutines(updatedRoutines);
        setIsEditDialogOpen(false);
        setEditingRoutine(null);
        (0, use_toast_1.toast)({
            title: "Routine Saved",
            description: "Your routine has been updated successfully.",
        });
    };
    const deleteRoutine = (routineId) => {
        const updatedRoutines = routines.filter(r => r.id !== routineId);
        setRoutines(updatedRoutines);
        if (selectedRoutine?.id === routineId) {
            setSelectedRoutine(null);
        }
        (0, use_toast_1.toast)({
            title: "Routine Deleted",
            description: "The routine has been removed.",
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Routine Timer" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => setShowSettings(!showSettings), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-4 w-4" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "lg:col-span-1", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Routines" }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", onClick: createNewRoutine, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }) })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "space-y-2", children: routines.map((routine) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium", children: routine.name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1 mt-1", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-xs", children: routine.focus }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-xs", children: routine.difficulty })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "outline", onClick: () => {
                                                                setEditingRoutine(routine);
                                                                setIsEditDialogOpen(true);
                                                            }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-3 w-3" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "outline", onClick: () => deleteRoutine(routine.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3 w-3" }) })] })] }, routine.id))) })] }), showSettings && ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: "mt-4", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Settings" }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Sound" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: () => setSoundEnabled(!soundEnabled), children: soundEnabled ? (0, jsx_runtime_1.jsx)(lucide_react_1.Volume2, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.VolumeX, { className: "h-4 w-4" }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Custom Sound" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "file", accept: "audio/*", onChange: handleFileUpload, className: "mt-1" })] })] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "lg:col-span-2", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Timer" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "space-y-6", children: selectedRoutine ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl font-bold mb-2", children: formatTime(timeLeft) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-lg text-gray-600 mb-4", children: [getCurrentStep()?.label, " - Set ", currentSet, "/", selectedRoutine.sets] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: getProgressPercentage(), className: "mb-4" }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: getRoutineProgress(), className: "mb-6" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center gap-2 mb-4", children: [!isRunning ? ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: startTimer, disabled: isPaused, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Play, { className: "h-4 w-4 mr-2" }), "Start"] })) : ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: pauseTimer, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pause, { className: "h-4 w-4 mr-2" }), "Pause"] })), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: resetTimer, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }), "Reset"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => addTime(60), children: "+1 min" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => subtractTime(60), children: "-1 min" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t pt-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: "Current Step Details" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 p-3 rounded-lg", children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Description:" }), " ", getCurrentStep()?.description] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Pressure:" }), " ", getCurrentStep()?.pressure] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Duration:" }), " ", formatTime(getCurrentStep()?.duration || 0)] })] })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "Select a routine to start" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: routines.slice(0, 3).map((routine) => ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "w-full", onClick: () => setSelectedRoutine(routine), children: routine.name }, routine.id))) })] })) })] }) })] }), (0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "max-w-2xl", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Edit Routine" }) }), editingRoutine && ((0, jsx_runtime_1.jsx)(RoutineEditor, { routine: editingRoutine, onSave: saveRoutine, onCancel: () => {
                                setIsEditDialogOpen(false);
                                setEditingRoutine(null);
                            } }))] }) })] }));
}
exports.default = RoutineTimer;
function RoutineEditor({ routine, onSave, onCancel }) {
    const [editedRoutine, setEditedRoutine] = (0, react_1.useState)(routine);
    const updateStep = (index, field, value) => {
        const updatedSteps = [...editedRoutine.steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setEditedRoutine({ ...editedRoutine, steps: updatedSteps });
    };
    const addStep = () => {
        const newStep = {
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
    const removeStep = (index) => {
        const updatedSteps = editedRoutine.steps.filter((_, i) => i !== index);
        setEditedRoutine({ ...editedRoutine, steps: updatedSteps });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Routine Name" }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: editedRoutine.name, onChange: (e) => setEditedRoutine({ ...editedRoutine, name: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Focus" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: editedRoutine.focus, onValueChange: (value) => setEditedRoutine({ ...editedRoutine, focus: value }), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "length", children: "Length" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "girth", children: "Girth" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "both", children: "Both" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Sets" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "number", value: editedRoutine.sets, onChange: (e) => setEditedRoutine({ ...editedRoutine, sets: parseInt(e.target.value) }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Rest Between Sets (seconds)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "number", value: editedRoutine.restBetweenSets, onChange: (e) => setEditedRoutine({ ...editedRoutine, restBetweenSets: parseInt(e.target.value) }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Steps" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 mt-2", children: [editedRoutine.steps.map((step, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "border p-3 rounded-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Step name", value: step.label, onChange: (e) => updateStep(index, 'label', e.target.value) }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "number", placeholder: "Duration (seconds)", value: step.duration, onChange: (e) => updateStep(index, 'duration', parseInt(e.target.value)) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Description", value: step.description || '', onChange: (e) => updateStep(index, 'description', e.target.value) }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Pressure", value: step.pressure || '', onChange: (e) => updateStep(index, 'pressure', e.target.value) })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: () => removeStep(index), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3 w-3" }) })] }, step.id))), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: addStep, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "Add Step"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onCancel, children: "Cancel" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => onSave(editedRoutine), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }), "Save"] })] })] }));
}
