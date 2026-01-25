import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

const WorkoutLoggingCards = ({ data }) => {
  // Extract data from the new API structure
  const dashboardAttributes = data?.dashboard_attributes || [];
  
  // Find workout logging attribute
  const workoutLoggingAttr = dashboardAttributes.find(attr => attr.name === 'workout_logging');
  
  // Get latest workout data for each exercise type
  const getLatestValue = (attributeName) => {
    if (!workoutLoggingAttr?.attributes) return 0;
    const attribute = workoutLoggingAttr.attributes.find(attr => attr.name === attributeName);
    return parseInt(attribute?.values?.[0]?.value) || 0;
  };

  const cardio = getLatestValue('cardio');
  const strengthTraining = getLatestValue('strength_training');
  const lowerBody = getLatestValue('lower_body');

  const workoutData = [
    {
      title: "Cardio",
      value: `${cardio} min`,
      icon: (
        <Image
          src="/images/icons/Heatmap-icon.png"
          alt="Cardio"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "red",
      unit: "minutes"
    },
    {
      title: "Strength Training",
      value: `${strengthTraining} sets`,
      icon: (
        <Image
          src="/images/icons/Heatmap-icon.png"
          alt="Strength Training"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "blue",
      unit: "sets"
    },
    {
      title: "Lower Body",
      value: `${lowerBody}/10`,
      icon: (
        <Image
          src="/images/icons/Heatmap-icon.png"
          alt="Lower Body"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "green",
      unit: "scale"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {workoutData.map((workout, index) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {workout.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {workout.title}
              </h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {workout.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {workout.unit}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutLoggingCards;
