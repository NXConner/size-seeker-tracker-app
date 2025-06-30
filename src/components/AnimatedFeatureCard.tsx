import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface AnimatedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
  delay?: number;
}

const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
  color = "bg-blue-500",
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="p-6 cursor-pointer group relative overflow-hidden"
        onClick={onClick}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        
        <div className="flex items-center space-x-4 relative z-10">
          <motion.div 
            className={`p-3 rounded-lg ${color} text-white`}
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.9 }}
          >
            {icon}
          </motion.div>
          
          <div className="flex-1">
            <motion.h3 
              className="text-lg font-semibold mb-2"
              whileHover={{ color: '#10b981' }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {description}
            </p>
          </div>
          
          {/* Arrow indicator */}
          <motion.div
            className="text-gray-400 group-hover:text-green-500"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>
        
        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 bg-green-500/20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
};

export default AnimatedFeatureCard; 