import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

const HealthMetricsCards = ({ data }) => {
  // Extract data from the new API structure
  const dashboardAttributes = data?.dashboard_attributes || [];
  
  // Find specific attributes
  const bloodPressureAttr = dashboardAttributes.find(attr => attr.name === 'blood_pressure');
  const sleepAttr = dashboardAttributes.find(attr => attr.name === 'sleep_management');
  const stepsAttr = dashboardAttributes.find(attr => attr.name === 'steps_count');
  const heartBeatAttr = dashboardAttributes.find(attr => attr.name === 'heart_beat');
  
  // Get latest blood pressure reading
  let bloodPressureValue = "120/80";
  if (bloodPressureAttr?.values?.[0]?.value) {
    const bpValue = bloodPressureAttr.values[0].value;
    // Check if value is comma-separated (new format)
    if (typeof bpValue === 'string' && bpValue.includes(',')) {
      bloodPressureValue = `${bpValue.replace(',', '/')} mmHg`;
    } else {
      // Try to parse as JSON (old format)
      try {
        const bpData = JSON.parse(bpValue);
        bloodPressureValue = `${bpData.systolic}/${bpData.diastolic} mmHg`;
      } catch (e) {
        // If not JSON and not comma-separated, try to parse as comma-separated anyway
        if (bpValue.includes(',')) {
          bloodPressureValue = `${bpValue.replace(',', '/')} mmHg`;
        } else {
          bloodPressureValue = "120/80 mmHg";
        }
      }
    }
  }

  // Get latest sleep data
  const latestSleep = sleepAttr?.values?.[0];
  const sleepHours = parseFloat(latestSleep?.value) || 7.75;
  const sleepTime = `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`;

  // Get latest steps data
  const latestSteps = stepsAttr?.values?.[0];
  const stepsCount = parseInt(latestSteps?.value) || 0;
  const stepsFormatted = stepsCount.toLocaleString();

  // Get latest heart rate data
  const latestHeartRate = heartBeatAttr?.values?.[0];
  const heartRate = parseInt(latestHeartRate?.value) || 75;

  const metrics = [
    {
      title: "Steps Today",
      value: `${stepsFormatted} steps`,
      icon: (
        <Image
          src="/images/icons/Heatmap-icon.png"
          alt="Steps"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "green"
    },
    {
      title: "Blood Pressure",
      value: bloodPressureValue,
      icon: (
        <Image
          src="/images/icons/bp.png"
          alt="Blood Pressure"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "red"
    },
    {
      title: "Sleep Time",
      value: sleepTime,
      icon: (
        <Image
          src="/images/icons/sleep.png"
          alt="Sleep"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "indigo"
    },
    {
      title: "Heart Rate",
      value: `${heartRate} bpm`,
      icon: (
        <Image
          src="/images/icons/heart.png"
          alt="Heart Rate"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ),
      color: "pink"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {metric.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {metric.title}
              </h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default HealthMetricsCards;
