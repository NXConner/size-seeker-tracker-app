
import React from 'react';
import { ArrowLeft, BookOpen, AlertTriangle, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TipsSectionProps {
  onBack: () => void;
}

const TipsSection: React.FC<TipsSectionProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Tips & Guidance</h2>
        <div></div>
      </div>

      <Tabs defaultValue="measurement" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="measurement">Measurement</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="measurement">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Accurate Measurement Techniques</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Length Measurement:</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Measure along the top from base to tip</li>
                    <li>• Press ruler firmly against pubic bone</li>
                    <li>• Maintain consistent angle and position</li>
                    <li>• Measure in the same physiological state</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Girth Measurement:</h4>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Measure around the thickest point</li>
                    <li>• Use flexible measuring tape</li>
                    <li>• Don't compress tissue - just snug fit</li>
                    <li>• Take multiple measurements for accuracy</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Photography Tips:</h4>
                  <ul className="text-purple-700 space-y-1 text-sm">
                    <li>• Use consistent lighting and background</li>
                    <li>• Include reference object (coin, ruler)</li>
                    <li>• Maintain same camera distance and angle</li>
                    <li>• Take photos at the same time of day</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Effective Progress Tracking</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Frequency Guidelines:</h4>
                  <ul className="text-orange-700 space-y-1 text-sm">
                    <li>• Measure weekly for consistent tracking</li>
                    <li>• Same day of week and time for consistency</li>
                    <li>• Allow 24-48 hours rest before measuring</li>
                    <li>• Track over months, not days</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Data Management:</h4>
                  <ul className="text-indigo-700 space-y-1 text-sm">
                    <li>• Record environmental factors (temperature, time)</li>
                    <li>• Note any program changes or breaks</li>
                    <li>• Track correlation with other activities</li>
                    <li>• Backup your data regularly</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Realistic Expectations:</h4>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Progress is typically slow and gradual</li>
                    <li>• Natural fluctuations are normal</li>
                    <li>• Focus on long-term trends</li>
                    <li>• Individual results vary significantly</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Safety & Health Considerations</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-800 mb-2">Important Safety Notes:</h4>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>• Never ignore pain or discomfort</li>
                    <li>• Stop immediately if you experience injury</li>
                    <li>• Consult healthcare providers for concerns</li>
                    <li>• Avoid excessive pressure or force</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Best Practices:</h4>
                  <ul className="text-yellow-700 space-y-1 text-sm">
                    <li>• Start slowly and gradually increase intensity</li>
                    <li>• Maintain proper hygiene and cleanliness</li>
                    <li>• Allow adequate recovery time</li>
                    <li>• Listen to your body's signals</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">When to Seek Medical Advice:</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Persistent pain or discomfort</li>
                    <li>• Unusual changes in sensation</li>
                    <li>• Signs of injury or tissue damage</li>
                    <li>• Concerns about technique or safety</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Maximizing Progress</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Consistency Factors:</h4>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Maintain regular routine and schedule</li>
                    <li>• Follow progressive intensity increases</li>
                    <li>• Track all sessions and results</li>
                    <li>• Stay patient and committed long-term</li>
                  </ul>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-teal-800 mb-2">Supporting Factors:</h4>
                  <ul className="text-teal-700 space-y-1 text-sm">
                    <li>• Maintain good overall health</li>
                    <li>• Stay hydrated and well-rested</li>
                    <li>• Consider cardiovascular health</li>
                    <li>• Manage stress and lifestyle factors</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Motivation Tips:</h4>
                  <ul className="text-purple-700 space-y-1 text-sm">
                    <li>• Set realistic, achievable goals</li>
                    <li>• Celebrate small improvements</li>
                    <li>• Focus on the journey, not just results</li>
                    <li>• Keep detailed progress records</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TipsSection;
