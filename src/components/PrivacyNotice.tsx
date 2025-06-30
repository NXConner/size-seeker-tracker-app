import React from 'react';
import { Shield, Lock, Eye, Database, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PrivacyNoticeProps {
  onBack: () => void;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Privacy Notice</h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <Card className="p-6 border-green-200 bg-green-50">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Privacy & Security Guaranteed</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <Database className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">Local Storage Only</p>
              <p className="text-green-700">All data stays on your device</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">No Internet Required</p>
              <p className="text-green-700">Works completely offline</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Eye className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">Zero Data Sharing</p>
              <p className="text-green-700">No external servers accessed</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-xs text-green-800 font-medium">
            🔒 Your privacy is our top priority. This app operates entirely offline and never transmits your personal data.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyNotice;
