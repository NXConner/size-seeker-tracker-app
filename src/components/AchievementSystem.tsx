import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp, Calendar, Zap, Heart, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'measurement' | 'consistency' | 'milestone' | 'community';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

const AchievementSystem: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-measurement',
      title: 'First Steps',
      description: 'Complete your first measurement',
      icon: <Target className="h-5 w-5" />,
      category: 'measurement',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedDate: new Date().toISOString(),
      rarity: 'common',
      points: 10
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Track measurements for 7 consecutive days',
      icon: <Calendar className="h-5 w-5" />,
      category: 'consistency',
      progress: 3,
      maxProgress: 7,
      unlocked: false,
      rarity: 'rare',
      points: 25
    },
    {
      id: 'progress-milestone',
      title: 'Progress Pioneer',
      description: 'Achieve 10% growth in measurements',
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'milestone',
      progress: 5,
      maxProgress: 10,
      unlocked: false,
      rarity: 'epic',
      points: 50
    },
    {
      id: 'community-contributor',
      title: 'Community Champion',
      description: 'Share 5 posts in the community',
      icon: <Heart className="h-5 w-5" />,
      category: 'community',
      progress: 2,
      maxProgress: 5,
      unlocked: false,
      rarity: 'legendary',
      points: 100
    }
  ]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [totalPoints, setTotalPoints] = useState(10);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return 'Common';
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlocked) {
        triggerConfetti();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        return {
          ...achievement,
          unlocked: true,
          unlockedDate: new Date().toISOString(),
          progress: achievement.maxProgress
        };
      }
      return achievement;
    }));
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
              <p className="text-sm text-gray-500">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{unlockedAchievements.length}</p>
              <p className="text-sm text-gray-500">Unlocked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{achievements.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Unlocked Achievements</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)} text-white`}
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        {achievement.icon}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge variant="secondary" className={getRarityColor(achievement.rarity)}>
                            {getRarityText(achievement.rarity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>+{achievement.points} points</span>
                          <span>Unlocked {achievement.unlockedDate ? new Date(achievement.unlockedDate).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Target className="h-5 w-5 text-gray-500" />
          <span>Available Achievements</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockedAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)} text-white opacity-50`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-600">{achievement.title}</h4>
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          {getRarityText(achievement.rarity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                      <div className="space-y-2">
                        <Progress value={getProgressPercentage(achievement)} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                          <span>+{achievement.points} points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Award className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white bg-black/50 px-4 py-2 rounded-lg">
                Achievement Unlocked!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;