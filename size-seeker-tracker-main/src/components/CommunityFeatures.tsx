import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Users, Star, Target, TrendingUp, Award, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
}

interface UserProfile {
  username: string;
  level: number;
  experience: number;
  totalSessions: number;
  totalTime: number;
  streak: number;
  achievements: Achievement[];
  joinDate: string;
}

interface CommunityFeaturesProps {
  onBack: () => void;
}

export default function CommunityFeatures({ onBack }: CommunityFeaturesProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'User',
    level: 1,
    experience: 0,
    totalSessions: 0,
    totalTime: 0,
    streak: 0,
    achievements: [],
    joinDate: new Date().toISOString(),
  });

  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      initializeUserProfile();
    }

    // Load leaderboard data
    const savedLeaderboard = localStorage.getItem('leaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    } else {
      generateMockLeaderboard();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const initializeUserProfile = () => {
    const achievements: Achievement[] = [
      {
        id: 'first-session',
        name: 'First Steps',
        description: 'Complete your first pumping session',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Complete sessions for 7 consecutive days',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 7,
      },
      {
        id: 'month-streak',
        name: 'Monthly Master',
        description: 'Complete sessions for 30 consecutive days',
        icon: '⭐',
        unlocked: false,
        progress: 0,
        maxProgress: 30,
      },
      {
        id: 'hundred-sessions',
        name: 'Century Club',
        description: 'Complete 100 total sessions',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      {
        id: 'time-master',
        name: 'Time Master',
        description: 'Accumulate 100 hours of total session time',
        icon: '⏰',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      {
        id: 'consistency',
        name: 'Consistency King',
        description: 'Maintain 80% consistency for 3 months',
        icon: '👑',
        unlocked: false,
        progress: 0,
        maxProgress: 90,
      },
    ];

    setUserProfile(prev => ({
      ...prev,
      achievements,
    }));
  };

  const generateMockLeaderboard = () => {
    const mockUsers: UserProfile[] = [
      {
        username: 'PumpMaster2024',
        level: 15,
        experience: 2500,
        totalSessions: 156,
        totalTime: 234,
        streak: 45,
        achievements: [],
        joinDate: '2024-01-15',
      },
      {
        username: 'SizeSeeker',
        level: 12,
        experience: 1800,
        totalSessions: 98,
        totalTime: 147,
        streak: 32,
        achievements: [],
        joinDate: '2024-02-01',
      },
      {
        username: 'GainsGuru',
        level: 10,
        experience: 1500,
        totalSessions: 87,
        totalTime: 130,
        streak: 28,
        achievements: [],
        joinDate: '2024-02-10',
      },
      {
        username: 'RoutineRunner',
        level: 8,
        experience: 1200,
        totalSessions: 65,
        totalTime: 98,
        streak: 21,
        achievements: [],
        joinDate: '2024-02-20',
      },
      {
        username: 'ProgressPursuer',
        level: 6,
        experience: 900,
        totalSessions: 45,
        totalTime: 67,
        streak: 15,
        achievements: [],
        joinDate: '2024-03-01',
      },
    ];

    setLeaderboard(mockUsers);
    localStorage.setItem('leaderboard', JSON.stringify(mockUsers));
  };

  const calculateLevel = (experience: number) => {
    return Math.floor(experience / 100) + 1;
  };

  const calculateExperienceToNext = (experience: number) => {
    const currentLevel = calculateLevel(experience);
    const nextLevelExp = currentLevel * 100;
    return nextLevelExp - experience;
  };

  const getExperienceProgress = () => {
    const currentLevel = calculateLevel(userProfile.experience);
    const levelStartExp = (currentLevel - 1) * 100;
    const levelEndExp = currentLevel * 100;
    const progressInLevel = userProfile.experience - levelStartExp;
    const levelTotal = levelEndExp - levelStartExp;
    return (progressInLevel / levelTotal) * 100;
  };

  const updateAchievements = () => {
    const updatedAchievements = userProfile.achievements.map(achievement => {
      let progress = 0;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case 'first-session':
          progress = userProfile.totalSessions > 0 ? 1 : 0;
          break;
        case 'week-streak':
          progress = Math.min(userProfile.streak, 7);
          break;
        case 'month-streak':
          progress = Math.min(userProfile.streak, 30);
          break;
        case 'hundred-sessions':
          progress = Math.min(userProfile.totalSessions, 100);
          break;
        case 'time-master':
          progress = Math.min(userProfile.totalTime, 100);
          break;
        case 'consistency':
          // Simplified consistency calculation
          progress = Math.min(userProfile.streak, 90);
          break;
      }

      if (progress >= (achievement.maxProgress || 1) && !unlocked) {
        unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
      }

      return { ...achievement, progress, unlocked };
    });

    setUserProfile(prev => ({
      ...prev,
      achievements: updatedAchievements,
    }));
  };

  useEffect(() => {
    updateAchievements();
  }, [userProfile.totalSessions, userProfile.streak, userProfile.totalTime]);

  const getUnlockedAchievements = () => {
    return userProfile.achievements.filter(achievement => achievement.unlocked);
  };

  const getLockedAchievements = () => {
    return userProfile.achievements.filter(achievement => !achievement.unlocked);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Community Features</h2>
        <div></div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{userProfile.username}</h3>
                    <p className="text-gray-600">Level {userProfile.level}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Experience</span>
                        <span className="text-sm text-gray-600">{userProfile.experience} / {userProfile.level * 100}</span>
                      </div>
                      <Progress value={getExperienceProgress()} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {calculateExperienceToNext(userProfile.experience)} XP to next level
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{userProfile.totalSessions}</div>
                        <div className="text-sm text-gray-600">Total Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{userProfile.totalTime}h</div>
                        <div className="text-sm text-gray-600">Total Time</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">{userProfile.streak}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{getUnlockedAchievements().length}</div>
                      <div className="text-sm text-gray-600">Achievements Unlocked</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 border rounded-lg ${
                        achievement.unlocked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.maxProgress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress || 0} / {achievement.maxProgress}</span>
                              </div>
                              <Progress value={((achievement.progress || 0) / achievement.maxProgress) * 100} className="h-1" />
                            </div>
                          )}
                          {achievement.unlocked && achievement.unlockedDate && (
                            <p className="text-xs text-green-600 mt-1">
                              Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <Award className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={user.username} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.username}</h4>
                        <p className="text-sm text-gray-600">Level {user.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{user.totalSessions}</div>
                        <div className="text-xs text-gray-500">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{user.streak}</div>
                        <div className="text-xs text-gray-500">Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{user.totalTime}h</div>
                        <div className="text-xs text-gray-500">Time</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 