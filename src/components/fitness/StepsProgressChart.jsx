import React from "react";
import { Card } from "@/components/ui/Card";

const StepsProgressChart = ({ data }) => {
  // Extract data from the new API structure
  const dashboardAttributes = data?.dashboard_attributes || [];

  // Find specific attributes
  const stepsProgressAttr = dashboardAttributes.find(
    (attr) => attr.name === "steps_progress"
  );
  const stepsCountAttr = dashboardAttributes.find(
    (attr) => attr.name === "steps_count"
  );

  // Get latest steps progress
  const latestProgress = stepsProgressAttr?.values?.[0];
  const progressSteps = parseInt(latestProgress?.value) || 0;

  // Helper: sum all values for a given date (YYYY-MM-DD)
  const sumValuesForDay = (values, date) => {
    if (!values || values.length === 0) return 0;
    const targetKey = new Date(date).toISOString().split("T")[0];
    return values.reduce((sum, v) => {
      const vKey = new Date(v.timestamp).toISOString().split("T")[0];
      if (vKey === targetKey) {
        const n = parseInt(v.value);
        return sum + (Number.isNaN(n) ? 0 : n);
      }
      return sum;
    }, 0);
  };

  // Helper: build a map of dayKey -> summed steps for that day
  const getDailySumsMap = (values) => {
    const map = new Map();
    (values || []).forEach((v) => {
      const key = new Date(v.timestamp).toISOString().split("T")[0];
      const n = parseInt(v.value);
      const add = Number.isNaN(n) ? 0 : n;
      map.set(key, (map.get(key) || 0) + add);
    });
    return map;
  };

  const stepsValues = stepsCountAttr?.values || [];
  const dailySumsMap = getDailySumsMap(stepsValues);

  console.log("Steps", stepsCountAttr);
  // Today: sum all entries for today
  const currentSteps = sumValuesForDay(stepsValues, new Date());

  // Get dynamic goal from API or use default
  // target_value is an object with { id, value, user_id, dashboard_id, value_description }
  const goalSteps =
    parseInt(
      stepsCountAttr?.target_value?.value || stepsCountAttr?.targetValue?.value
    ) || 6000;

  // Calculate progress percentage based on actual steps vs goal
  const progressPercentage = Math.min(
    Math.round((currentSteps / goalSteps) * 100),
    100
  );

  // Calculate progress for different periods based on summed daily totals
  const todaySteps = currentSteps;

  // Weekly: average per day over last 7 days using daily sums
  const now = new Date();
  const last7DayKeys = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - idx);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  });
  const weeklySum = last7DayKeys.reduce(
    (acc, key) => acc + (dailySumsMap.get(key) || 0),
    0
  );
  const weeklySteps = Math.round(weeklySum / 7);

  // Monthly: average per day over current month using daily sums
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const monthKeys = Array.from({ length: daysInMonth }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(monthStart.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  });
  const monthlySum = monthKeys.reduce(
    (acc, key) => acc + (dailySumsMap.get(key) || 0),
    0
  );
  const monthlySteps = Math.round(monthlySum / daysInMonth);

  // Calculate percentages for each ring
  const monthlyProgress = Math.min(
    Math.round((monthlySteps / goalSteps) * 100),
    100
  );
  const weeklyProgress = Math.min(
    Math.round((weeklySteps / goalSteps) * 100),
    100
  );
  const todayProgress = Math.min(
    Math.round((todaySteps / goalSteps) * 100),
    100
  );

  // Ring configurations (from outer to inner)
  const rings = [
    {
      radius: 48,
      strokeWidth: 10,
      color: "#8b5cf6", // Purple
      progress: monthlyProgress,
      isBackground: false,
    },
    {
      radius: 36,
      strokeWidth: 8,
      color: "#3b82f6", // Blue
      progress: weeklyProgress,
      isBackground: false,
    },
    {
      radius: 24,
      strokeWidth: 6,
      color: "#60a5fa", // Light blue
      progress: todayProgress,
      isBackground: false,
    },
  ];

  // Calculate circumference and stroke-dasharray for each ring
  const getRingProps = (ring) => {
    const circumference = 2 * Math.PI * ring.radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = ring.isBackground
      ? 0
      : circumference - (ring.progress / 100) * circumference;

    return {
      circumference,
      strokeDasharray,
      strokeDashoffset,
    };
  };

  const periods = [
    {
      label: "Monthly",
      current: monthlySteps,
      goal: goalSteps,
      color: "purple",
      icon: "👣",
    },
    {
      label: "Weekly",
      current: weeklySteps,
      goal: goalSteps,
      color: "blue",
      icon: "👣",
    },
    {
      label: "Today",
      current: todaySteps,
      goal: goalSteps,
      color: "light-blue",
      icon: "👣",
    },
  ];

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200 flex-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Steps Progress
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Track your daily, weekly, and monthly step goals
        </p>
      </div>

      {/* Multiple Concentric Circles */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {rings.map((ring, index) => {
              const ringProps = getRingProps(ring);
              return (
                <circle
                  key={index}
                  cx="60"
                  cy="60"
                  r={ring.radius}
                  stroke={ring.color}
                  strokeWidth={ring.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={ringProps.strokeDasharray}
                  strokeDashoffset={ringProps.strokeDashoffset}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>

          {/* Centered text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {progressPercentage}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Today
            </span>
          </div>
        </div>
      </div>

      {/* Bottom legend with three columns */}
      <div className="grid grid-cols-3 gap-2">
        {periods.map((period, index) => (
          <div
            key={index}
            className="text-center py-2 px-1 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div className="mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {period.label}
              </span>
            </div>
            <div className="flex items-center justify-center mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  period.color === "purple"
                    ? "bg-purple-500"
                    : period.color === "blue"
                    ? "bg-blue-500"
                    : "bg-blue-400"
                }`}
              ></div>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {period.current.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              / {period.goal.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StepsProgressChart;
