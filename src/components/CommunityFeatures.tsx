import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CommunityFeaturesProps {
  onBack: () => void;
}

export default function CommunityFeatures({ onBack }: CommunityFeaturesProps) {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Community Features</h2>
        <div></div>
      </div>
      
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Community Features Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with the community, share progress, and get support from fellow users.
          </p>
        </div>
      </Card>
    </div>
  );
} 