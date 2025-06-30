import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedTipsSectionProps {
  onBack: () => void;
}

const EnhancedTipsSection: React.FC<EnhancedTipsSectionProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Enhanced Tips & Guides</h2>
        <div></div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pumping Routines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Beginner Routine</h3>
              <p className="text-sm text-gray-600 mb-2">Safe introduction to pumping with low pressure and short sessions</p>
              <ul className="text-sm space-y-1">
                <li>• Warm Up: 5-10 minutes</li>
                <li>• In Pump (Low Pressure): 10 minutes</li>
                <li>• Massage & Stretch: 5 minutes</li>
                <li>• Repeat: 2-3 sets</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Intermediate Routine</h3>
              <p className="text-sm text-gray-600 mb-2">Balanced routine for length and girth development</p>
              <ul className="text-sm space-y-1">
                <li>• Warm Up: 10 minutes</li>
                <li>• In Pump (Medium Pressure): 15 minutes</li>
                <li>• Massage & Jelq: 5 minutes</li>
                <li>• In Pump (High Pressure): 10 minutes</li>
                <li>• Cool Down: 5 minutes</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Advanced Routine</h3>
              <p className="text-sm text-gray-600 mb-2">High-intensity routine focused on girth development</p>
              <ul className="text-sm space-y-1">
                <li>• Warm Up: 5 minutes</li>
                <li>• Medium Pump (Girth): 10 minutes</li>
                <li>• Jelqing: 5 minutes</li>
                <li>• High Pump (Girth): 5 minutes</li>
                <li>• Recovery: 5 minutes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
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
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommended Pressure Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <span className="font-semibold">Low Pressure</span>
              <span className="text-blue-700 font-mono">3-5 inHg (100-170 mmHg)</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <span className="font-semibold">Medium Pressure</span>
              <span className="text-yellow-700 font-mono">5-7 inHg (170-240 mmHg)</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <span className="font-semibold">High Pressure</span>
              <span className="text-red-700 font-mono">7-10 inHg (240-340 mmHg)</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">*Always start low and increase gradually. Never exceed 10 inHg (340 mmHg).</div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Grower vs Shower FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a Grower?</h4>
              <p className="text-sm text-gray-600 mb-2">A grower is someone whose penis increases significantly in size from flaccid to erect state.</p>
              <ul className="text-sm list-disc list-inside">
                <li>Benefit: More dramatic increase in size during erection.</li>
                <li>Con: May appear smaller when flaccid.</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a Shower?</h4>
              <p className="text-sm text-gray-600 mb-2">A shower is someone whose penis does not increase much in size from flaccid to erect state.</p>
              <ul className="text-sm list-disc list-inside">
                <li>Benefit: Appears larger when flaccid.</li>
                <li>Con: Less dramatic change during erection.</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold mb-2">Is one better than the other?</h4>
              <p className="text-sm text-gray-600">Both are normal and healthy. Neither is better; it's just a natural variation. Training and routines can benefit both types.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTipsSection; 