import React from 'react';
import Image from 'next/image';
import HealthMetricCard from './HealthMetricCard';

const HealthMetricsWidget = ({ data }) => {
  // Extract health metrics from the data
  const getLatestValue = (attributeName) => {
    const attribute = data?.dashboard_attributes?.find(attr => attr.name === attributeName);
    return attribute?.values?.[0];
  };

  // Get blood pressure data
  const bloodPressureData = getLatestValue('blood_pressure');
  let bloodPressureValue = "120/80";
  if (bloodPressureData?.value) {
    const bpValue = bloodPressureData.value;
    // Check if value is comma-separated (new format)
    if (typeof bpValue === 'string' && bpValue.includes(',')) {
      bloodPressureValue = bpValue.replace(',', '/');
    } else {
      // Try to parse as JSON (old format)
      try {
        const bpData = JSON.parse(bpValue);
        bloodPressureValue = `${bpData.systolic}/${bpData.diastolic}`;
      } catch (e) {
        // If not JSON and not comma-separated, try to parse as comma-separated anyway
        if (bpValue.includes(',')) {
          bloodPressureValue = bpValue.replace(',', '/');
        } else {
          bloodPressureValue = "120/80";
        }
      }
    }
  }

  // Get sleep data
  const sleepData = getLatestValue('sleep_management');
  const sleepHours = sleepData?.numeric_value || 7.75;
  const sleepTime = `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`;

  // Get heart rate (mock data since not in JSON)
  const heartRate = "75";

  // Icon components using images from public folder
  const HeartIcon = () => (
    <Image
      src="/images/icons/heart.png"
      alt="Heart Rate"
      width={24}
      height={24}
      className="w-6 h-6"
    />
  );

  const BPIcon = () => (
    <Image
      src="/images/icons/bp.png"
      alt="Blood Pressure"
      width={24}
      height={24}
      className="w-6 h-6"
    />
  );

  const SleepIcon = () => (
    <Image
      src="/images/icons/sleep.png"
      alt="Sleep Time"
      width={24}
      height={24}
      className="w-6 h-6"
    />
  );

  return (
    <div className="health-metrics-grid">
      <HealthMetricCard
        title="Heart Rate"
        value={heartRate}
        unit="bpm"
        iconType="heart"
        iconSvg={<HeartIcon />}
      />
      <HealthMetricCard
        title="Blood Pressure"
        value={bloodPressureValue}
        unit="mmHg"
        iconType="bp"
        iconSvg={<BPIcon />}
      />
      <HealthMetricCard
        title="Sleep Time"
        value={sleepTime}
        iconType="sleep"
        iconSvg={<SleepIcon />}
      />
    </div>
  );
};

export default HealthMetricsWidget;
