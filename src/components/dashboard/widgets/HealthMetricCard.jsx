import React from 'react';

const HealthMetricCard = ({ title, value, unit, iconType, iconSvg }) => {
  const getIconClass = () => {
    switch (iconType) {
      case 'heart':
        return 'health-metric-card__icon--heart';
      case 'bp':
        return 'health-metric-card__icon--bp';
      case 'sleep':
        return 'health-metric-card__icon--sleep';
      default:
        return 'health-metric-card__icon--heart';
    }
  };

  return (
    <div className="health-metric-card">
      {/* Icon */}
      <div className={`health-metric-card__icon ${getIconClass()}`}>
        {iconSvg}
      </div>
      
      {/* Title - Top Left */}
      <div className="health-metric-card__title">
        {title}
      </div>
      
      {/* Value - Bottom Left */}
      <div className="health-metric-card__value">
        {value} {unit && <span className="health-metric-card__value-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default HealthMetricCard;
