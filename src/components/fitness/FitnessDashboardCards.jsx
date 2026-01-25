'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

const FitnessDashboardCards = ({ dashboardAttributes }) => {
  // Helper function to check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to get today's value from an attribute
  const getTodayValue = (attribute) => {
    if (!attribute?.values) return null;
    return attribute.values.find(v => isToday(v.timestamp || v.recorded_at || v.created_at || v.date));
  };

  // Find the three specific attributes
  const heartBeatAttr = dashboardAttributes?.find(attr => attr.name === 'heart_beat');
  const bloodPressureAttr = dashboardAttributes?.find(attr => attr.name === 'blood_pressure');
  const sleepAttr = dashboardAttributes?.find(attr => attr.name === 'sleep_management');

  // Get today's heart rate value
  const todayHeartRate = getTodayValue(heartBeatAttr);
  const heartRate = todayHeartRate?.numeric_value || parseInt(todayHeartRate?.value) || null;

  // Get today's blood pressure value
  let bloodPressureValue = null;
  const todayBloodPressure = getTodayValue(bloodPressureAttr);
  if (todayBloodPressure?.value) {
    const bpValue = todayBloodPressure.value;
    try {
      // Try parsing as JSON first (new format)
      const bpData = JSON.parse(bpValue);
      if (bpData.systolic && bpData.diastolic) {
        bloodPressureValue = `${bpData.systolic}/${bpData.diastolic}`;
      }
    } catch (e) {
      // If not JSON, try comma-separated format
      if (typeof bpValue === 'string' && bpValue.includes(',')) {
        const parts = bpValue.split(',').map(part => part.trim());
        if (parts.length === 2) {
          bloodPressureValue = `${parts[0]}/${parts[1]}`;
        }
      }
    }
  }

  // Get today's sleep data
  const todaySleep = getTodayValue(sleepAttr);
  const sleepHours = todaySleep?.numeric_value || parseFloat(todaySleep?.value) || null;
  const sleepTime = sleepHours && sleepHours > 0
    ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`
    : null;

  const cards = [
    {
      title: "Heart Beat",
      value: heartRate !== null ? `${heartRate}` : "Not measured today",
      unit: heartRate !== null ? "bpm" : "",
      icon: "/images/icons/heart.svg",
      hasData: heartRate !== null
    },
    {
      title: "Blood Pressure",
      value: bloodPressureValue || "Not measured today",
      unit: bloodPressureValue ? "mmHg" : "",
      icon: "/images/icons/bp.svg",
      hasData: !!bloodPressureValue
    },
    {
      title: "Sleep Management",
      value: sleepTime || "Not measured today",
      unit: "",
      icon: "/images/icons/sleep.svg",
      hasData: !!sleepTime
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={`flex flex-col justify-between bg-white border-[0.5px] h-[153px] border-[#0000001A] rounded-[14.01px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 w-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 ${
            card.hasData 
              ? 'bg-white dark:bg-gray-800' 
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <div className="flex h-full space-x-3">
            <div className="min-w-0 flex-1 flex justify-between flex-col">
              <h3 className={`text-sm font-medium text-[#4D4D4D] mb-1 truncate ${
                card.hasData 
                  ? 'text-[#4D4D4D] dark:text-gray-400' 
                  : 'text-[#4D4D4D] dark:text-gray-500'
              }`}>
                {card.title}
              </h3>
              <p className={`${
                card.hasData
                  ? 'md:text-2xl text-lg text-[#4D4D4D] dark:text-white'
                  : 'text-sm text-gray-400 dark:text-gray-500'
              }`}>
                <span className={card.hasData ? "font-bold" : "font-normal italic"}>{card.value}</span>
                {card.unit && <span className="font-normal ml-1">{card.unit}</span>}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src={card.icon}
                alt={card.title}
                width={24}
                height={24}
                className="w-6 h-6"
                onError={(e) => {
                  // Fallback to PNG if SVG doesn't exist
                  const pngIcon = card.icon.replace('.svg', '.png');
                  e.target.src = pngIcon;
                }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FitnessDashboardCards;

