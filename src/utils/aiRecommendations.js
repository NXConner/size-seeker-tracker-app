"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAIRecommendations = exports.AIRecommendationEngine = void 0;
class AIRecommendationEngine {
    constructor(measurements, sessions) {
        this.measurements = measurements;
        this.sessions = sessions;
    }
    generateRecommendations() {
        const patterns = this.analyzeUserPatterns();
        const recommendations = [];
        // Consistency recommendations
        if (patterns.consistency < 0.7) {
            recommendations.push(this.generateConsistencyRecommendation(patterns));
        }
        // Plateau recommendations
        if (patterns.plateauDetected) {
            recommendations.push(this.generatePlateauRecommendation(patterns));
        }
        // Rest day recommendations
        if (patterns.restDayFrequency < 0.2) {
            recommendations.push(this.generateRestRecommendation(patterns));
        }
        // Technique recommendations
        if (patterns.growthRate < 0.1) {
            recommendations.push(this.generateTechniqueRecommendation(patterns));
        }
        // Safety recommendations
        if (patterns.pressureLevel > 7) {
            recommendations.push(this.generateSafetyRecommendation(patterns));
        }
        // Goal recommendations
        recommendations.push(this.generateGoalRecommendation(patterns));
        return recommendations.sort((a, b) => b.confidence - a.confidence);
    }
    analyzeUserPatterns() {
        const totalDays = this.calculateTotalDays();
        const measurementDays = this.measurements.length;
        const consistency = measurementDays / totalDays;
        const growthRate = this.calculateGrowthRate();
        const plateauDetected = this.detectPlateau();
        const restDayFrequency = this.calculateRestDayFrequency();
        const sessionDuration = this.calculateAverageSessionDuration();
        const pressureLevel = this.calculateAveragePressure();
        const focusArea = this.determineFocusArea();
        return {
            consistency,
            growthRate,
            plateauDetected,
            restDayFrequency,
            sessionDuration,
            pressureLevel,
            focusArea
        };
    }
    calculateTotalDays() {
        if (this.measurements.length === 0)
            return 30;
        const firstDate = new Date(this.measurements[0].timestamp);
        const lastDate = new Date(this.measurements[this.measurements.length - 1].timestamp);
        return Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    calculateGrowthRate() {
        if (this.measurements.length < 2)
            return 0;
        const recentMeasurements = this.measurements.slice(-3);
        let totalGrowth = 0;
        for (let i = 1; i < recentMeasurements.length; i++) {
            const prev = recentMeasurements[i - 1];
            const curr = recentMeasurements[i];
            if (prev.measurements && curr.measurements) {
                const lengthGrowth = (curr.measurements.length || 0) - (prev.measurements.length || 0);
                const girthGrowth = (curr.measurements.girth || 0) - (prev.measurements.girth || 0);
                totalGrowth += (lengthGrowth + girthGrowth) / 2;
            }
        }
        return totalGrowth / (recentMeasurements.length - 1);
    }
    detectPlateau() {
        if (this.measurements.length < 4)
            return false;
        const recentMeasurements = this.measurements.slice(-4);
        const variations = [];
        for (let i = 1; i < recentMeasurements.length; i++) {
            const prev = recentMeasurements[i - 1];
            const curr = recentMeasurements[i];
            if (prev.measurements && curr.measurements) {
                const lengthVariation = Math.abs((curr.measurements.length || 0) - (prev.measurements.length || 0));
                const girthVariation = Math.abs((curr.measurements.girth || 0) - (prev.measurements.girth || 0));
                variations.push((lengthVariation + girthVariation) / 2);
            }
        }
        const averageVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
        return averageVariation < 0.05; // Less than 0.05 inch variation
    }
    calculateRestDayFrequency() {
        if (this.sessions.length === 0)
            return 0;
        const totalDays = this.calculateTotalDays();
        const restDays = totalDays - this.sessions.length;
        return restDays / totalDays;
    }
    calculateAverageSessionDuration() {
        if (this.sessions.length === 0)
            return 0;
        const totalDuration = this.sessions.reduce((sum, session) => sum + session.duration, 0);
        return totalDuration / this.sessions.length;
    }
    calculateAveragePressure() {
        if (this.sessions.length === 0)
            return 5;
        const totalPressure = this.sessions.reduce((sum, session) => sum + (session.pressure || 5), 0);
        return totalPressure / this.sessions.length;
    }
    determineFocusArea() {
        if (this.sessions.length === 0)
            return 'both';
        const focusCounts = { length: 0, girth: 0, both: 0 };
        this.sessions.forEach(session => {
            focusCounts[session.focus || 'both']++;
        });
        const maxFocus = Object.entries(focusCounts).reduce((a, b) => a[1] > b[1] ? a : b);
        return maxFocus[0];
    }
    generateConsistencyRecommendation(patterns) {
        return {
            id: 'consistency-improvement',
            type: 'routine',
            title: 'Improve Consistency',
            description: `Your current consistency is ${(patterns.consistency * 100).toFixed(1)}%. Regular tracking is key to progress.`,
            confidence: 0.9,
            reasoning: 'Consistency below 70% significantly impacts progress tracking and goal achievement.',
            expectedOutcome: 'Better progress visibility and more accurate trend analysis.',
            priority: 'high',
            actionRequired: true,
            actionLabel: 'Set Reminders',
            actionUrl: '/settings/notifications'
        };
    }
    generatePlateauRecommendation(patterns) {
        return {
            id: 'plateau-breakthrough',
            type: 'technique',
            title: 'Plateau Detected',
            description: 'Your measurements have been stable. Consider adjusting your routine.',
            confidence: 0.85,
            reasoning: 'Plateaus are common and often require technique or intensity adjustments.',
            expectedOutcome: 'Potential breakthrough in progress after routine modification.',
            priority: 'medium',
            actionRequired: true,
            actionLabel: 'View Techniques',
            actionUrl: '/tips/advanced-techniques'
        };
    }
    generateRestRecommendation(patterns) {
        return {
            id: 'rest-day-schedule',
            type: 'rest',
            title: 'Schedule Rest Days',
            description: `You're taking rest days ${(patterns.restDayFrequency * 100).toFixed(1)}% of the time. Consider more rest.`,
            confidence: 0.8,
            reasoning: 'Adequate rest is crucial for tissue recovery and preventing overtraining.',
            expectedOutcome: 'Better recovery and reduced risk of injury or plateau.',
            priority: 'medium',
            actionRequired: false
        };
    }
    generateTechniqueRecommendation(patterns) {
        return {
            id: 'technique-optimization',
            type: 'technique',
            title: 'Optimize Technique',
            description: 'Your growth rate suggests technique improvements could help.',
            confidence: 0.75,
            reasoning: 'Low growth rate often indicates technique or intensity issues.',
            expectedOutcome: 'Improved efficiency and potentially faster progress.',
            priority: 'medium',
            actionRequired: true,
            actionLabel: 'Learn Techniques',
            actionUrl: '/tips/techniques'
        };
    }
    generateSafetyRecommendation(patterns) {
        return {
            id: 'pressure-reduction',
            type: 'safety',
            title: 'Reduce Pressure',
            description: `Your average pressure is ${patterns.pressureLevel.toFixed(1)}. Consider reducing for safety.`,
            confidence: 0.9,
            reasoning: 'High pressure increases injury risk without necessarily improving results.',
            expectedOutcome: 'Reduced injury risk while maintaining progress.',
            priority: 'high',
            actionRequired: true,
            actionLabel: 'Safety Guidelines',
            actionUrl: '/safety/guidelines'
        };
    }
    generateGoalRecommendation(patterns) {
        const focusArea = patterns.focusArea;
        const currentProgress = this.calculateCurrentProgress();
        return {
            id: 'goal-adjustment',
            type: 'goal',
            title: 'Review Goals',
            description: `Based on your ${focusArea} focus and ${(currentProgress * 100).toFixed(1)}% progress, consider goal adjustments.`,
            confidence: 0.7,
            reasoning: 'Regular goal review ensures realistic and motivating targets.',
            expectedOutcome: 'More achievable and motivating goal setting.',
            priority: 'low',
            actionRequired: true,
            actionLabel: 'Update Goals',
            actionUrl: '/goals'
        };
    }
    calculateCurrentProgress() {
        // Simplified progress calculation
        return Math.min(1, this.measurements.length / 30); // Assume 30 measurements = 100% progress
    }
}
exports.AIRecommendationEngine = AIRecommendationEngine;
// Hook for easy integration
const useAIRecommendations = (measurements, sessions) => {
    const engine = new AIRecommendationEngine(measurements, sessions);
    return engine.generateRecommendations();
};
exports.useAIRecommendations = useAIRecommendations;
