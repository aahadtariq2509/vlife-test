/**
 * Dashboard utility functions for processing dynamic widget data
 */

/**
 * Calculate dayOfYear in format "DDD/YYYY" using local timezone
 * @param {Date|string} date - Date object or ISO string (defaults to now)
 * @returns {string} dayOfYear in format "DDD/YYYY" (e.g., "001/2025", "365/2025")
 */
export const calculateDayOfYear = (date = new Date()) => {
  const localDate = date instanceof Date ? date : new Date(date);

  // Get year in local timezone
  const year = localDate.getFullYear();

  // Get start of year in local timezone
  const startOfYear = new Date(year, 0, 1);

  // Calculate difference in milliseconds
  const diff = localDate - startOfYear;

  // Convert to days (add 1 because Jan 1 is day 1, not day 0)
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  // Format as "DDD/YYYY" with zero-padding
  const paddedDay = String(dayOfYear).padStart(3, '0');

  return `${paddedDay}/${year}`;
};

/**
 * Get current UTC date normalized to start of day
 * @returns {Date} UTC date at start of day
 */
export const getUTCToday = () => {
  const now = new Date();
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  return utcDate;
};

/**
 * Normalize supported period labels to the canonical values used internally.
 * Accepts variations like "Today" or "This Week" and maps them to
 * 'Daily', 'Weekly', 'Monthly', or 'Yearly'.
 * @param {string} period - Raw period string from widget config or UI
 * @returns {string} Normalized period keyword
 */
export const normalizePeriod = (period = '') => {
  const value = typeof period === 'string' ? period.trim().toLowerCase() : '';

  switch (value) {
    case 'today':
    case 'day':
    case 'daily':
      return 'Daily';
    case 'this week':
    case 'week':
    case 'weekly':
      return 'Weekly';
    case 'this month':
    case 'month':
    case 'monthly':
      return 'Monthly';
    case 'this year':
    case 'year':
    case 'yearly':
    case 'annual':
      return 'Yearly';
    default:
      return period || 'Daily';
  }
};

/**
 * Calculate aggregated value based on calculation type (sum or avg)
 * @param {Array} values - Array of numeric values
 * @param {string} calculation - 'sum' or 'avg'
 * @returns {number} Calculated value
 */
export const calculateValue = (values, calculation = 'sum') => {
  if (!values || values.length === 0) return 0;
  const numericValues = values.map(v => parseFloat(v) || 0);
  if (calculation === 'avg') {
    return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
  }
  return numericValues.reduce((sum, val) => sum + val, 0);
};

/**
 * Calculate value with period-based averaging for Monthly/Yearly views
 * For 'sum' calculation: calculates average per day based on elapsed days in period
 * For 'avg' calculation: uses standard average
 * @param {Array} values - Array of numeric values
 * @param {string} calculation - 'sum' or 'avg'
 * @param {string} period - 'Daily', 'Weekly', 'Monthly', 'Yearly'
 * @returns {number} Calculated value
 */
export const calculateValueWithPeriodAverage = (values, calculation = 'sum', period = 'Daily') => {
  if (!values || values.length === 0) return 0;

  const numericValues = values.map(v => parseFloat(v) || 0);
  const totalValue = numericValues.reduce((sum, val) => sum + val, 0);

  const normalizedPeriod = normalizePeriod(period);

  // For 'avg' calculation with Yearly period, calculate daily average (sum / days elapsed)
  // For other periods with 'avg', use standard average
  if (calculation === 'avg') {
    if (normalizedPeriod === 'Yearly') {
      // Yearly with avg: return average per day for year so far
      const utcToday = getUTCToday();
      const startOfYear = new Date(Date.UTC(utcToday.getUTCFullYear(), 0, 1));
      const daysElapsedInYear = Math.floor((utcToday - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
      return daysElapsedInYear > 0 ? totalValue / daysElapsedInYear : 0;
    }
    // For other periods, return standard average
    return totalValue / numericValues.length;
  }

  // For 'sum' calculation with Monthly/Yearly periods, return the sum
  if (normalizedPeriod === 'Daily') {
    // Daily: return total for today
    return totalValue;
  } else if (normalizedPeriod === 'Weekly') {
    // Weekly: return total for the week
    return totalValue;
  } else if (normalizedPeriod === 'Monthly') {
    // Monthly: return total for the month
    return totalValue;
  } else if (normalizedPeriod === 'Yearly') {
    // Yearly: return total for the year
    return totalValue;
  }

  // Default: return total
  return totalValue;
};

/**
 * Filter values by period based on local timezone (matches Android behavior)
 * @param {Array} values - Attribute values
 * @param {string} period - 'Daily', 'Weekly', 'Monthly', 'Yearly'
 * @returns {Array} Filtered values within the period
 */
export const filterValuesByUTCPeriod = (values, period) => {
  if (!values || values.length === 0) return [];

  const normalizedPeriod = normalizePeriod(period);

  // Use local browser time to match Android behavior
  const now = new Date();
  const filteredValues = [];

  // Get start and end of today in local timezone
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Get start and end of current week in local timezone (Sunday to Saturday)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get start and end of current month in local timezone
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Get start and end of current year in local timezone
  const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  values.forEach((value) => {
    // Parse UTC timestamp and it will be automatically converted to local time by JavaScript
    const valueDate = new Date(value.timestamp);

    let includeValue = false;

    if (normalizedPeriod === 'Daily') {
      // Daily: Current day in local timezone
      includeValue = valueDate >= startOfToday && valueDate <= endOfToday;
    } else if (normalizedPeriod === 'Weekly') {
      // Weekly: Current week (Sunday to Saturday) in local timezone
      includeValue = valueDate >= startOfWeek && valueDate <= endOfWeek;
    } else if (normalizedPeriod === 'Monthly') {
      // Monthly: Current month in local timezone
      includeValue = valueDate >= startOfMonth && valueDate <= endOfMonth;
    } else if (normalizedPeriod === 'Yearly') {
      // Yearly: Current calendar year in local timezone
      includeValue = valueDate >= startOfYear && valueDate <= endOfYear;
    }

    if (includeValue) {
      filteredValues.push(value);
    }
  });

  return filteredValues;
};

/**
 * Get time points for a period based on local timezone (matches Android behavior)
 * @param {string} period - 'Daily', 'Weekly', 'Monthly', 'Yearly'
 * @returns {Array} Time points with date and label
 */
export const getUTCTimePoints = (period) => {
  const normalizedPeriod = normalizePeriod(period);
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const timePoints = [];

  if (normalizedPeriod === 'Daily') {
    // Daily: 24 hours (show hourly for today in local timezone)
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(today);
      date.setHours(hour, 0, 0, 0);
      // Create a day key that represents the local date
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayKey = `${year}-${month}-${day}`;
      timePoints.push({
        date,
        label: `${hour.toString().padStart(2, '0')}:00`,
        dayKey
      });
    }
  } else if (normalizedPeriod === 'Weekly') {
    // Weekly: Current week Sunday through Saturday in local timezone
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      date.setHours(0, 0, 0, 0);
      // Create a day key that represents the local date
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayKey = `${year}-${month}-${day}`;
      const dayName = daysOfWeek[date.getDay()];
      timePoints.push({
        date,
        label: dayName,
        dayKey
      });
    }
  } else if (normalizedPeriod === 'Monthly') {
    // Monthly: Full current month (1st through last day) in local timezone
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day, 0, 0, 0, 0);
      // Create a day key that represents the local date
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dayKey = `${yearStr}-${monthStr}-${dayStr}`;
      timePoints.push({
        date,
        label: `${day}`,
        dayKey
      });
    }
  } else if (normalizedPeriod === 'Yearly') {
    // Yearly: January through December of current year in local timezone
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = now.getFullYear();
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1, 0, 0, 0, 0);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      timePoints.push({
        date,
        label: monthNames[date.getMonth()],
        monthKey
      });
    }
  }

  return timePoints;
};

/**
 * Get child attributes by IDs from all dashboard attributes
 * @param {Array} childAttributeIds - Array of child attribute IDs (as strings or numbers)
 * @param {Array} allAttributes - All dashboard attributes
 * @returns {Array} Matched child attributes
 */
export const getChildAttributesByIds = (childAttributeIds = [], allAttributes = []) => {
  if (!childAttributeIds || childAttributeIds.length === 0) return [];
  
  const childAttrs = [];
  const idSet = new Set(childAttributeIds.map(id => id.toString()));
  
  allAttributes.forEach(parentAttr => {
    if (parentAttr.attributes && Array.isArray(parentAttr.attributes)) {
      parentAttr.attributes.forEach(childAttr => {
        if (idSet.has(childAttr.id?.toString()) || idSet.has(childAttr.attribute_id?.toString())) {
          childAttrs.push(childAttr);
        }
      });
    }
  });
  
  return childAttrs;
};

/**
 * Process dashboard data to match widgets with their corresponding attributes
 * @param {Object} dashboardData - The complete dashboard API response
 * @returns {Object} Processed data with matched widgets and unmatched attributes
 */
export const processDashboardData = (dashboardData) => {
  const { widgets = [], dashboard_attributes = [] } = dashboardData.data || {};
  
  console.log('Dashboard Utils: Processing dashboard data', {
    widgetsCount: widgets.length,
    attributesCount: dashboard_attributes.length,
    hasDataProperty: !!dashboardData.data,
    dashboardDataKeys: dashboardData.data ? Object.keys(dashboardData.data) : []
  });
  
  // Create a map of attribute_id to dashboard_attributes for quick lookup
  const attributesMap = new Map();
  dashboard_attributes.forEach(attr => {
    attributesMap.set(attr.attribute_id, attr);
    // Also map nested attributes by their id for child_attribute_ids lookup
    if (attr.attributes && Array.isArray(attr.attributes)) {
      attr.attributes.forEach(childAttr => {
        attributesMap.set(childAttr.id?.toString(), childAttr);
        attributesMap.set(childAttr.attribute_id?.toString(), childAttr);
      });
    }
  });
  
  console.log('Dashboard Utils: Created attributes map with', attributesMap.size, 'entries');
  
  // Process widgets and match them with their attributes
  const processedWidgets = widgets.map((widget, index) => {
    const matchedAttribute = attributesMap.get(widget.attribute_id);
    
    console.log(`Dashboard Utils: Processing widget ${index}`, {
      widgetId: widget.id,
      widgetName: widget.name,
      widgetType: widget.widget_type?.code,
      attributeId: widget.attribute_id,
      hasMatchedAttribute: !!matchedAttribute,
      matchedAttributeName: matchedAttribute?.name,
      childAttributeIds: widget.child_attribute_ids,
      calculation: widget.calculation,
      config: widget.config
    });
    
    const chartData = prepareChartData(widget, matchedAttribute, dashboard_attributes);
    console.log(`Dashboard Utils: Chart data for widget ${index}:`, chartData);
    
    return {
      ...widget,
      matchedAttribute,
      hasData: !!matchedAttribute,
      // Prepare data for different chart types
      chartData
    };
  });
  
  // Check for duplicate widgets
  const widgetIds = processedWidgets.map(w => w.id);
  const duplicateIds = widgetIds.filter((id, index) => widgetIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    console.log('Dashboard Utils: Found duplicate widget IDs:', duplicateIds);
  }
  
  // Check for widgets with same attribute_id
  const attributeIds = processedWidgets.map(w => w.attribute_id);
  const duplicateAttributeIds = attributeIds.filter((id, index) => attributeIds.indexOf(id) !== index);
  if (duplicateAttributeIds.length > 0) {
    console.log('Dashboard Utils: Found widgets with duplicate attribute IDs:', duplicateAttributeIds);
  }
  
  // Find attributes that don't have matching widgets (for small cards)
  const matchedAttributeIds = new Set(widgets.map(w => w.attribute_id));
  
  // Debug: Log widget-attribute mapping
  console.log('Dashboard Utils: Widget-attribute mapping:', {
    widgets: widgets.map(w => ({ id: w.id, attribute_id: w.attribute_id, type: w.widget_type.code })),
    matchedAttributeIds: Array.from(matchedAttributeIds)
  });
  
  // Filter unmatched attributes: include all parent attributes that:
  // 1. Don't have a matching widget
  // 2. Don't have children (no nested attributes) - only show parent attributes
  // 3. Show even if they have no values (0 values)
  const unmatchedAttributes = dashboard_attributes.filter(attr => {
    const isUnmatched = !matchedAttributeIds.has(attr.attribute_id);
    const hasChildren = attr.attributes && attr.attributes.length > 0;
    
    // Detailed logging for sleep_management specifically
    if (attr.name === 'sleep_management' || attr.name === 'heart_beat' || attr.name === 'blood_pressure') {
      console.log(`Dashboard Utils: ${attr.name} attribute details:`, {
        attribute_id: attr.attribute_id,
        name: attr.name,
        isUnmatched,
        hasChildren,
        valuesCount: attr.values?.length || 0,
        childrenCount: attr.attributes?.length || 0,
        matchedAttributeIds: Array.from(matchedAttributeIds),
        hasAttributesKey: 'attributes' in attr,
        attributesValue: attr.attributes,
        willBeIncluded: isUnmatched && !hasChildren
      });
    }
    
    return isUnmatched && !hasChildren; // Show all parent attributes, even with 0 values
  });
  
  console.log('Dashboard Utils: Final processing results', {
    processedWidgetsCount: processedWidgets.length,
    unmatchedAttributesCount: unmatchedAttributes.length,
    widgetsWithData: processedWidgets.filter(w => w.hasData).length,
    unmatchedAttributes: unmatchedAttributes.map(a => a.name),
    allAttributes: dashboard_attributes.map(a => ({ name: a.name, valuesCount: a.values?.length || 0, childrenCount: a.attributes?.length || 0 }))
  });
  
  return {
    processedWidgets,
    unmatchedAttributes,
    allAttributes: dashboard_attributes
  };
};

/**
 * Prepare chart data based on widget type and matched attribute
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Matched dashboard attribute
 * @param {Array} allAttributes - All dashboard attributes for child lookup
 * @returns {Object} Prepared chart data
 */
export const prepareChartData = (widget, attribute, allAttributes = []) => {
  console.log('Dashboard Utils: prepareChartData called', {
    widgetType: widget.widget_type?.code,
    hasAttribute: !!attribute,
    attributeName: attribute?.name,
    attributeValuesCount: attribute?.values?.length || 0,
    attributeChildrenCount: attribute?.attributes?.length || 0,
    childAttributeIds: widget.child_attribute_ids,
    calculation: widget.calculation
  });
  
  if (!attribute) {
    console.log('Dashboard Utils: No attribute provided, returning empty chart data');
    return {
      type: widget.widget_type.code,
      isEmpty: true,
      title: 'No Data Available',
      message: 'No data available for this widget'
    };
  }
  
  const widgetType = widget.widget_type.code;
  
  let result;
  switch (widgetType) {
    case 'line_chart':
      result = prepareLineChartData(widget, attribute, allAttributes);
      break;
    case 'bar_chart':
      result = prepareBarChartData(widget, attribute, allAttributes);
      break;
    case 'pie_chart':
      result = preparePieChartData(widget, attribute, allAttributes);
      break;
    case 'progress_chart':
      result = prepareProgressChartData(widget, attribute, allAttributes);
      break;
    case 'single_progress':
      result = prepareSingleProgressData(widget, attribute, allAttributes);
      break;
    case 'heat_map':
      result = prepareHeatmapData(widget, attribute, allAttributes);
      break;
    case 'reverse_heat_map':
      result = prepareReverseHeatmapData(widget, attribute, allAttributes);
      break;
    default:
      console.log('Dashboard Utils: Unknown widget type:', widget.widget_type.code);
      result = null;
  }
  
  console.log('Dashboard Utils: prepareChartData result:', result);
  return result;
};

/**
 * Parse double_number value (supports comma or slash separators)
 * @param {string|number} value - The value to parse (e.g., "140,100" or "100/90")
 * @returns {Object|null} Object with systolic and diastolic, or null if invalid
 */
export const parseDoubleNumber = (value) => {
  if (value === null || value === undefined) return null;
  
  const valueStr = String(value).trim();
  
  // Try comma separator first (e.g., "140,100")
  if (valueStr.includes(',')) {
    const parts = valueStr.split(',').map(part => part.trim());
    if (parts.length === 2) {
      const systolic = parseFloat(parts[0]);
      const diastolic = parseFloat(parts[1]);
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        return { systolic, diastolic };
      }
    }
  }
  
  // Try slash separator (e.g., "100/90")
  if (valueStr.includes('/')) {
    const parts = valueStr.split('/').map(part => part.trim());
    if (parts.length === 2) {
      const systolic = parseFloat(parts[0]);
      const diastolic = parseFloat(parts[1]);
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        return { systolic, diastolic };
      }
    }
  }
  
  return null;
};

/**
 * Prepare data for line chart (multiple lines for children attributes)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children
 * @param {Array} allAttributes - All dashboard attributes for child lookup
 * @returns {Object} Line chart data
 */
export const prepareLineChartData = (widget, attribute, allAttributes = []) => {
  const defaultPeriod = widget.config && widget.config.length > 0 ? widget.config[0] : 'Daily';
  const normalizedDefaultPeriod = normalizePeriod(defaultPeriod);

  // Determine calculation method based on period
  const getCalculationForPeriod = (period) => {
    const normalizedPeriod = normalizePeriod(period);
    if (normalizedPeriod === 'Yearly' && widget.yearly_calculation) {
      return widget.yearly_calculation;
    }
    return widget.calculation || 'sum';
  };

  const calculation = getCalculationForPeriod(defaultPeriod);

  // Handle child_attribute_ids for pie/line charts
  let children = [];
  let widgetTitle = attribute.display_name;
  if (widget.child_attribute_ids && widget.child_attribute_ids.length > 0) {
    children = getChildAttributesByIds(widget.child_attribute_ids, allAttributes);
    // If only one child attribute is specified, use its display name as the widget title
    if (children.length === 1) {
      widgetTitle = children[0].display_name || children[0].name;
    }
  } else {
    children = attribute.attributes || [];
  }
  
  let timePoints, lines;
  
  if (children.length > 0) {
    // Case 1: Attribute has children (multiple lines)
    const firstChildWithValues = children.find(child => child.values && child.values.length > 0);
    
    if (!firstChildWithValues) {
      console.log('Dashboard Utils: No child attributes with values found for line chart, returning empty data');
      return {
        type: 'line',
        lines: [],
        timeRange: widget.config || [],
        title: widgetTitle,
        isEmpty: true,
        message: 'No data available for this time period'
      };
    }
    
    // Use default period for initial data preparation
    timePoints = getUTCTimePoints(normalizedDefaultPeriod);
    
    lines = children.map((child, index) => ({
      name: child.display_name || child.name,
      data: timePoints.map(timePoint => {
        // Filter values for this time point based on period
        let valuesForPoint = [];
        if (normalizedDefaultPeriod === 'Daily') {
          // For daily, match by hour within the day
          const valueDate = new Date(child.values?.[0]?.timestamp || new Date());
          const valueHour = valueDate.getUTCHours();
          if (timePoint.date.getUTCHours() === valueHour) {
            valuesForPoint = filterValuesByUTCPeriod(child.values || [], normalizedDefaultPeriod).filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getUTCHours() === timePoint.date.getUTCHours();
            });
          }
        } else {
          // For weekly/monthly/yearly, match by day/month key
          const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedDefaultPeriod);
          if (timePoint.dayKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vDayKey = vDate.toISOString().split('T')[0];
              return vDayKey === timePoint.dayKey;
            });
          } else if (timePoint.monthKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
              return vMonthKey === timePoint.monthKey;
            });
          }
        }
        
        // Calculate value based on calculation type (sum or avg)
        const calculatedValue = calculateValue(
          valuesForPoint.map(v => parseFloat(v.value) || 0),
          calculation
        );
        
        return {
          x: timePoint.label,
          y: calculatedValue,
          timestamp: timePoint.date
        };
      }),
      color: getColorForIndex(index, child.name || child.display_name || attribute.name),
      unit: child.unit
    }));
  } else if (attribute.values && attribute.values.length > 0) {
    // Case 2: Attribute has direct values
    // Check if this is a double_number type (e.g., blood_pressure)
    const isDoubleNumber = attribute.value_type === 'double_number';
    
    timePoints = getUTCTimePoints(normalizedDefaultPeriod);
    
    if (isDoubleNumber) {
      // For double_number type, create two lines (systolic and diastolic)
      const systolicData = timePoints.map(timePoint => {
        // Filter values for this time point
        let valuesForPoint = [];
        if (normalizedDefaultPeriod === 'Daily') {
          const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedDefaultPeriod);
          valuesForPoint = filteredValues.filter(v => {
            const vDate = new Date(v.timestamp);
            return vDate.getUTCHours() === timePoint.date.getUTCHours();
          });
        } else {
          const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedDefaultPeriod);
          if (timePoint.dayKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vDayKey = vDate.toISOString().split('T')[0];
              return vDayKey === timePoint.dayKey;
            });
          } else if (timePoint.monthKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
              return vMonthKey === timePoint.monthKey;
            });
          }
        }
        
        // Parse double_number values and extract systolic values
        const systolicValues = valuesForPoint
          .map(v => {
            const parsed = parseDoubleNumber(v.value);
            return parsed ? parsed.systolic : null;
          })
          .filter(v => v !== null);
        
        // Calculate value based on calculation type
        const calculatedValue = calculateValue(systolicValues, calculation);
        
        return {
          x: timePoint.label,
          y: calculatedValue,
          timestamp: timePoint.date
        };
      });
      
      const diastolicData = timePoints.map(timePoint => {
        // Filter values for this time point
        let valuesForPoint = [];
        if (normalizedDefaultPeriod === 'Daily') {
          const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedDefaultPeriod);
          valuesForPoint = filteredValues.filter(v => {
            const vDate = new Date(v.timestamp);
            return vDate.getUTCHours() === timePoint.date.getUTCHours();
          });
        } else {
          const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedDefaultPeriod);
          if (timePoint.dayKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vDayKey = vDate.toISOString().split('T')[0];
              return vDayKey === timePoint.dayKey;
            });
          } else if (timePoint.monthKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
              return vMonthKey === timePoint.monthKey;
            });
          }
        }
        
        // Parse double_number values and extract diastolic values
        const diastolicValues = valuesForPoint
          .map(v => {
            const parsed = parseDoubleNumber(v.value);
            return parsed ? parsed.diastolic : null;
          })
          .filter(v => v !== null);
        
        // Calculate value based on calculation type
        const calculatedValue = calculateValue(diastolicValues, calculation);
        
        return {
          x: timePoint.label,
          y: calculatedValue,
          timestamp: timePoint.date
        };
      });
      
      // Create two lines: systolic and diastolic
      lines = [
        {
          name: 'Systolic',
          data: systolicData,
          color: getColorForIndex(0),
          unit: attribute.unit
        },
        {
          name: 'Diastolic',
          data: diastolicData,
          color: getColorForIndex(1),
          unit: attribute.unit
        }
      ];
    } else {
      // Regular single line over time
      lines = [{
        name: attribute.display_name || attribute.name,
        data: timePoints.map(timePoint => {
          // Filter values for this time point
          let valuesForPoint = [];
          if (defaultPeriod === 'Daily') {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], defaultPeriod);
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getUTCHours() === timePoint.date.getUTCHours();
            });
          } else {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], defaultPeriod);
            if (timePoint.dayKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vDayKey = vDate.toISOString().split('T')[0];
                return vDayKey === timePoint.dayKey;
              });
            } else if (timePoint.monthKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                return vMonthKey === timePoint.monthKey;
              });
            }
          }
          
          // Calculate value based on calculation type
          const calculatedValue = calculateValue(
            valuesForPoint.map(v => parseFloat(v.value) || 0),
            calculation
          );
          
          return {
            x: timePoint.label,
            y: calculatedValue,
            timestamp: timePoint.date
          };
        }),
        color: getColorForIndex(0),
        unit: attribute.unit
      }];
    }
  } else {
    console.log('Dashboard Utils: No values found for line chart, returning empty data');
    return {
      type: 'line',
      lines: [],
      timeRange: widget.config || [],
      title: widgetTitle,
      isEmpty: true,
      message: 'No data available for this time period'
    };
  }
  
  return {
    type: 'line',
    lines,
    timeRange: widget.config || [],
    title: widgetTitle,
    calculation
  };
};

/**
 * Prepare data for bar chart (multiple bars for children attributes)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children
 * @param {Array} allAttributes - All dashboard attributes for child lookup
 * @returns {Object} Bar chart data
 */
export const prepareBarChartData = (widget, attribute, allAttributes = []) => {
  const defaultPeriod = widget.config && widget.config.length > 0 ? widget.config[0] : 'Daily';
  const normalizedDefaultPeriod = normalizePeriod(defaultPeriod);

  // Determine calculation method based on period
  const calculation = normalizedDefaultPeriod === 'Yearly' && widget.yearly_calculation
    ? widget.yearly_calculation
    : (widget.calculation || 'sum');

  console.log('Dashboard Utils: prepareBarChartData called', {
    attributeName: attribute.name,
    attributeValuesCount: attribute.values?.length || 0,
    childrenCount: attribute.attributes?.length || 0,
    childAttributeIds: widget.child_attribute_ids,
    calculation,
    defaultPeriod
  });

  // Get children - filter by child_attribute_ids if specified
  let children = attribute.attributes || [];

  // If child_attribute_ids is specified, filter children to only include those
  if (widget.child_attribute_ids && widget.child_attribute_ids.length > 0) {
    const childIdStrings = widget.child_attribute_ids.map(id => id.toString());
    children = children.filter(child =>
      childIdStrings.includes(child.id?.toString()) ||
      childIdStrings.includes(child.attribute_id?.toString())
    );
    console.log('Filtered children by child_attribute_ids:', children.map(c => ({ id: c.id, name: c.display_name })));
  }
  
  let timePoints, categories, series;
  
  if (children.length > 0) {
    // Case 1: Attribute has children (multiple series for comparison)
    const firstChildWithValues = children.find(child => child.values && child.values.length > 0);
    
    if (!firstChildWithValues) {
      console.log('Dashboard Utils: No child attributes with values found for bar chart, returning empty data');
      return {
        type: 'bar',
        categories: [],
        series: [],
        timeRange: widget.config || [],
        title: attribute.display_name,
        isEmpty: true,
        message: 'No data available for this time period'
      };
    }
    
    timePoints = getUTCTimePoints(normalizedDefaultPeriod);
    categories = timePoints.map(timePoint => timePoint.label);
    
    series = children.map((child, index) => {
      const dataPoints = timePoints.map(timePoint => {
        // Filter values for this time point
        let valuesForPoint = [];
        if (normalizedDefaultPeriod === 'Daily') {
          const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedDefaultPeriod);
          valuesForPoint = filteredValues.filter(v => {
            const vDate = new Date(v.timestamp);
            return vDate.getUTCHours() === timePoint.date.getUTCHours();
          });
        } else {
          const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedDefaultPeriod);
          if (timePoint.dayKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vDayKey = vDate.toISOString().split('T')[0];
              return vDayKey === timePoint.dayKey;
            });
          } else if (timePoint.monthKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
              return vMonthKey === timePoint.monthKey;
            });
          }
        }
        
        // Calculate value based on calculation type
        return calculateValue(
          valuesForPoint.map(v => parseFloat(v.value) || 0),
          calculation
        );
      });
      
      console.log(`Dashboard Utils: Bar chart series ${index} (${child.name}):`, {
        name: child.display_name || child.name,
        dataPoints,
        valuesCount: child.values?.length || 0
      });
      
      return {
        name: child.display_name || child.name,
        data: dataPoints,
        color: getColorForIndex(index, child.name || child.display_name || attribute.name),
        unit: child.unit
      };
    });
  } else if (attribute.values && attribute.values.length > 0) {
    // Case 2: Attribute has direct values (single series over time)
    timePoints = getUTCTimePoints(normalizedDefaultPeriod);
    categories = timePoints.map(timePoint => timePoint.label);
    
    const dataPoints = timePoints.map(timePoint => {
      // Filter values for this time point
      let valuesForPoint = [];
      if (normalizedDefaultPeriod === 'Daily') {
        const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedDefaultPeriod);
        valuesForPoint = filteredValues.filter(v => {
          const vDate = new Date(v.timestamp);
          return vDate.getUTCHours() === timePoint.date.getUTCHours();
        });
      } else {
        const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedDefaultPeriod);
        if (timePoint.dayKey) {
          valuesForPoint = filteredValues.filter(v => {
            const vDate = new Date(v.timestamp);
            const vDayKey = vDate.toISOString().split('T')[0];
            return vDayKey === timePoint.dayKey;
          });
        } else if (timePoint.monthKey) {
          valuesForPoint = filteredValues.filter(v => {
            const vDate = new Date(v.timestamp);
            const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
            return vMonthKey === timePoint.monthKey;
          });
        }
      }
      
      // Calculate value based on calculation type
      return calculateValue(
        valuesForPoint.map(v => parseFloat(v.value) || 0),
        calculation
      );
    });
    
    series = [{
      name: attribute.display_name || attribute.name,
      data: dataPoints,
      color: getColorForIndex(0),
      unit: attribute.unit
    }];
    
    console.log('Dashboard Utils: Bar chart single series:', {
      name: attribute.display_name,
      dataPoints,
      valuesCount: attribute.values.length
    });
  } else {
    console.log('Dashboard Utils: No values found for bar chart, returning empty data');
    return {
      type: 'bar',
      categories: [],
      series: [],
      timeRange: widget.config || [],
      title: attribute.display_name,
      isEmpty: true,
      message: 'No data available for this time period'
    };
  }
  
  const result = {
    type: 'bar',
    categories,
    series,
    timeRange: widget.config || [],
    title: attribute.display_name,
    calculation
  };
  
  console.log('Dashboard Utils: prepareBarChartData result:', result);
  return result;
};

/**
 * Prepare data for pie chart (breakdown of children attributes or time-based segments)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children or direct values
 * @param {Array} allAttributes - All dashboard attributes for child lookup
 * @returns {Object} Pie chart data
 */
export const preparePieChartData = (widget, attribute, allAttributes = []) => {
  const defaultPeriod = widget.config && widget.config.length > 0 ? widget.config[0] : 'Daily';
  const normalizedDefaultPeriod = normalizePeriod(defaultPeriod);

  // Determine calculation method based on period
  const calculation = normalizedDefaultPeriod === 'Yearly' && widget.yearly_calculation
    ? widget.yearly_calculation
    : (widget.calculation || 'sum');

  console.log('Dashboard Utils: preparePieChartData called', {
    attributeName: attribute.name,
    childrenCount: attribute.attributes?.length || 0,
    directValuesCount: attribute.values?.length || 0,
    childAttributeIds: widget.child_attribute_ids,
    calculation,
    defaultPeriod
  });

  // Handle child_attribute_ids for pie charts
  let children = [];
  let widgetTitle = attribute.display_name;
  if (widget.child_attribute_ids && widget.child_attribute_ids.length > 0) {
    children = getChildAttributesByIds(widget.child_attribute_ids, allAttributes);
    // If only one child attribute is specified, use its display name as the widget title
    if (children.length === 1) {
      widgetTitle = children[0].display_name || children[0].name;
    }
  } else {
    children = attribute.attributes || [];
  }
  
  let segments = [];
  
  if (children.length > 0) {
    // Case 1: Attribute has children (breakdown by category)
    // Filter by period and calculate values based on calculation type
    const filteredValues = filterValuesByUTCPeriod(
      children.flatMap(child => child.values || []),
      normalizedDefaultPeriod
    );
    
    segments = children.map((child, index) => {
      // Filter child values by UTC period
      const childFilteredValues = filterValuesByUTCPeriod(child.values || [], normalizedDefaultPeriod);
      
      // Calculate value based on calculation type
      const calculatedValue = calculateValue(
        childFilteredValues.map(v => parseFloat(v.value) || 0),
        calculation
      );
      
      const segment = {
        name: child.display_name || child.name,
        value: calculatedValue,
        color: getColorForIndex(index, child.name || child.display_name || attribute.name),
        unit: child.unit
      };
      console.log(`Dashboard Utils: Pie chart segment ${index}:`, segment);
      return segment;
    });
  } else if (attribute.values && attribute.values.length > 0) {
    // Case 2: Attribute has direct values (breakdown by time periods)
    // Filter by period
    const filteredValues = filterValuesByUTCPeriod(attribute.values, normalizedDefaultPeriod);
    
    // Group by time period based on defaultPeriod
    if (normalizedDefaultPeriod === 'Daily') {
      // For daily, group by hour
      const valuesByHour = new Map();
      filteredValues.forEach((value) => {
        const valueDate = new Date(value.timestamp);
        const hour = valueDate.getUTCHours();
        const hourKey = `${hour}`;
        if (!valuesByHour.has(hourKey)) {
          valuesByHour.set(hourKey, {
            name: `${hour.toString().padStart(2, '0')}:00`,
            values: [],
            unit: attribute.unit
          });
        }
        valuesByHour.get(hourKey).values.push(parseFloat(value.value) || 0);
      });
      
      segments = Array.from(valuesByHour.entries()).map(([hourKey, data], index) => ({
        name: data.name,
        value: calculateValue(data.values, calculation),
        color: getColorForIndex(index, attribute.name || attribute.display_name),
        unit: data.unit
      }));
    } else {
      // For weekly/monthly/yearly, group by day
      const valuesByDay = new Map();
      filteredValues.forEach((value) => {
        const valueDate = new Date(value.timestamp);
        const dayKey = valueDate.toISOString().split('T')[0];
        const dayName = valueDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = valueDate.getUTCDate();
        const monthName = valueDate.toLocaleDateString('en-US', { month: 'short' });
        const label = `${dayName} ${dayNumber} ${monthName}`;
        
        if (!valuesByDay.has(dayKey)) {
          valuesByDay.set(dayKey, {
            name: label,
            values: [],
            unit: attribute.unit,
            timestamp: value.timestamp,
            dayKey: dayKey
          });
        }
        valuesByDay.get(dayKey).values.push(parseFloat(value.value) || 0);
      });
      
      segments = Array.from(valuesByDay.values())
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map((data, index) => ({
          name: data.name,
          value: calculateValue(data.values, calculation),
          color: getColorForIndex(index, attribute.name || attribute.display_name),
          unit: data.unit
        }));
    }
    
    console.log('Dashboard Utils: Pie chart time-based segments:', segments);
  } else {
    console.log('Dashboard Utils: No children or values found for pie chart, returning empty data');
    return {
      type: 'pie',
      segments: [],
      total: 0,
      title: widgetTitle,
      timeRange: widget.config || [],
      isEmpty: true,
      message: 'No data available for this time period'
    };
  }

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  console.log('Dashboard Utils: Pie chart total:', total);

  if (total === 0) {
    console.log('Dashboard Utils: Total is 0, returning empty pie chart data');
    return {
      type: 'pie',
      segments: [],
      total: 0,
      title: widgetTitle,
      timeRange: widget.config || [],
      isEmpty: true,
      message: 'No data available for this time period'
    };
  }

  // Calculate percentages
  const segmentsWithPercentages = segments.map(segment => ({
    ...segment,
    percentage: total > 0 ? Math.round((segment.value / total) * 100) : 0
  }));

  const result = {
    type: 'pie',
    segments: segmentsWithPercentages,
    total,
    title: widgetTitle,
    timeRange: widget.config || [],
    calculation
  };
  
  console.log('Dashboard Utils: preparePieChartData result:', result);
  return result;
};

/**
 * Prepare data for progress chart (circular progress with multiple rings)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children
 * @param {Array} allAttributes - All dashboard attributes for child lookup
 * @returns {Object} Progress chart data
 */
export const prepareProgressChartData = (widget, attribute, allAttributes = []) => {
  console.log('Dashboard Utils: prepareProgressChartData called', {
    attributeName: attribute.name,
    childrenCount: attribute.attributes?.length || 0,
    directValuesCount: attribute.values?.length || 0,
    calculation: widget.calculation,
    yearly_calculation: widget.yearly_calculation
  });

  const children = attribute.attributes || [];
  let rings = [];

  // For steps_count, use Weekly instead of Yearly
  const isStepsCount = attribute.name === 'steps_count';
  const periods = isStepsCount ? ['Daily', 'Monthly', 'Weekly'] : ['Daily', 'Monthly', 'Yearly'];

  if (children.length > 0) {
    // Case 1: Attribute has children (multiple progress rings)
    const progressColors = ['#60a5fa', '#3b82f6', '#8b5cf6']; // Light Blue, Blue, Purple

    rings = periods.map((period, index) => {
      const child = children[index] || children[0]; // Use first child if not enough children

      // Determine calculation method based on period
      const calculation = period === 'Yearly' && widget.yearly_calculation
        ? widget.yearly_calculation
        : (widget.calculation || 'sum');

      // Filter values by period and calculate based on calculation type
      const filteredValues = filterValuesByUTCPeriod(child.values || [], period);
      const calculatedValue = calculateValue(
        filteredValues.map(v => parseFloat(v.value) || 0),
        calculation
      );

      const goal = getGoalForAttribute(child, period);

      const ring = {
        label: period,
        current: calculatedValue,
        goal,
        progress: goal > 0 ? Math.min(Math.round((calculatedValue / goal) * 100), 100) : 0,
        color: progressColors[index] || getColorForIndex(index),
        unit: child?.unit || ''
      };

      console.log(`Dashboard Utils: Progress chart ring ${index} (${period}):`, ring);
      return ring;
    });
  } else if (attribute.values && attribute.values.length > 0) {
    // Case 2: Attribute has direct values (single progress ring with different time periods)
    const progressColors = ['#60a5fa', '#3b82f6', '#8b5cf6']; // Light Blue, Blue, Purple
    const dailyGoal = getGoalForAttribute(attribute, 'Daily');
    const now = new Date(); // Use local browser time
    const daysElapsedInMonth = now.getDate(); // Day of the month (1-based)

    // Calculate day of year (1-based)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysElapsedInYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

    rings = periods.map((period, index) => {
      let currentValue, goal;

      // Filter values by period
      const filteredValues = filterValuesByUTCPeriod(attribute.values || [], period);

      if (period === 'Daily') {
        // Daily: Show today's actual sum
        const calculatedValue = calculateValue(
          filteredValues.map(v => parseFloat(v.value) || 0),
          'sum'
        );
        currentValue = calculatedValue;
        goal = dailyGoal;
      } else if (period === 'Weekly') {
        // Weekly: Show sum for week, then divide by 7 to get daily average
        const calculatedValue = calculateValue(
          filteredValues.map(v => parseFloat(v.value) || 0),
          'sum'
        );
        // Count how many days have passed in the current week
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const daysElapsedInWeek = dayOfWeek + 1; // 1 to 7
        currentValue = daysElapsedInWeek > 0 ? calculatedValue / daysElapsedInWeek : 0;
        goal = dailyGoal;
      } else if (period === 'Monthly') {
        // Monthly: Show sum for month, then divide by days elapsed to get daily average
        const calculatedValue = calculateValue(
          filteredValues.map(v => parseFloat(v.value) || 0),
          'sum'
        );
        currentValue = daysElapsedInMonth > 0 ? calculatedValue / daysElapsedInMonth : 0;
        goal = dailyGoal;
      } else if (period === 'Yearly') {
        // Yearly: Show sum for year, then divide by days elapsed to get daily average
        const calculatedValue = calculateValue(
          filteredValues.map(v => parseFloat(v.value) || 0),
          'sum'
        );
        currentValue = daysElapsedInYear > 0 ? calculatedValue / daysElapsedInYear : 0;
        goal = dailyGoal;
      }

      const ring = {
        label: period,
        current: Math.round(currentValue),
        goal,
        progress: goal > 0 ? Math.min(Math.round((currentValue / goal) * 100), 100) : 0,
        color: progressColors[index] || getColorForIndex(index),
        unit: attribute.unit || ''
      };

      console.log(`Dashboard Utils: Progress chart ring ${index} (${period}):`, ring);
      return ring;
    });
  } else {
    console.log('Dashboard Utils: No children or values found for progress chart, returning empty data');
    return {
      type: 'progress',
      rings: [],
      title: attribute.display_name,
      isEmpty: true,
      message: 'No data available for this time period'
    };
  }

  const result = {
    type: 'progress',
    rings,
    title: attribute.display_name,
    calculation: widget.calculation || 'sum',
    yearly_calculation: widget.yearly_calculation
  };

  console.log('Dashboard Utils: prepareProgressChartData result:', result);
  return result;
};

/**
 * Prepare data for single progress chart (one circular progress ring)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children
 * @param {Array} allAttributes - All dashboard attributes for child lookup
 * @returns {Object} Single progress chart data
 */
export const prepareSingleProgressData = (widget, attribute, allAttributes = []) => {
  console.log('Dashboard Utils: prepareSingleProgressData called', {
    attributeName: attribute.name,
    childrenCount: attribute.attributes?.length || 0,
    childAttributeIds: widget.child_attribute_ids,
    calculation: widget.calculation,
    yearly_calculation: widget.yearly_calculation
  });

  // Get the single child attribute from child_attribute_ids
  const childAttributeIds = widget.child_attribute_ids || [];

  if (childAttributeIds.length === 0) {
    console.log('Dashboard Utils: No child_attribute_ids specified for single_progress');
    return {
      type: 'single_progress',
      current: 0,
      target: 0,
      percentage: 0,
      label: 'No Data',
      unit: 'USD',
      isEmpty: true,
      message: 'No child attribute specified'
    };
  }

  // Get the child attribute (should be only one)
  const childId = childAttributeIds[0].toString();
  let childAttribute = null;

  // Search in parent's attributes
  if (attribute.attributes && attribute.attributes.length > 0) {
    childAttribute = attribute.attributes.find(
      child => child.id?.toString() === childId
    );
  }

  if (!childAttribute) {
    console.log('Dashboard Utils: Child attribute not found:', childId);
    return {
      type: 'single_progress',
      current: 0,
      target: 0,
      percentage: 0,
      label: 'Attribute Not Found',
      unit: 'USD',
      isEmpty: true,
      message: 'Child attribute not found'
    };
  }

  // Determine calculation method - use yearly if specified
  const calculation = widget.yearly_calculation || widget.calculation || 'sum';

  // Calculate current value - sum ALL values (no time filtering, matches Android behavior)
  const allValues = childAttribute.values || [];
  const currentValue = calculateValue(
    allValues.map(v => parseFloat(v.value) || 0),
    calculation
  );

  // Get target value from the child attribute
  const targetValue = parseFloat(childAttribute.target_value?.value) || 0;

  // Calculate percentage
  const percentage = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  const result = {
    type: 'single_progress',
    current: Math.round(currentValue),
    target: targetValue,
    percentage: percentage,
    label: childAttribute.display_name || childAttribute.name || 'Progress',
    unit: childAttribute.unit || 'USD',
    isEmpty: false
  };

  console.log('Dashboard Utils: prepareSingleProgressData result:', result);
  return result;
};

/**
 * Filter values by period (Daily, Weekly, Monthly)
 * @param {Array} values - Attribute values
 * @param {string} period - 'Daily', 'Weekly', or 'Monthly'
 * @returns {Array} Filtered values
 */
export const filterValuesByPeriod = (values, period) => {
  if (!values || values.length === 0) return [];
  
  const now = new Date();
  const filteredValues = [];
  
  values.forEach((value) => {
    const valueDate = new Date(value.timestamp);
    
    if (period === 'Daily') {
      // Daily: Show last 7 days
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (valueDate >= sevenDaysAgo) {
        filteredValues.push(value);
      }
    } else if (period === 'Weekly') {
      // Weekly: Show last 7 weeks or current week's days
      const sevenWeeksAgo = new Date(now);
      sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49); // 7 weeks = 49 days
      if (valueDate >= sevenWeeksAgo) {
        filteredValues.push(value);
      }
    } else if (period === 'Monthly') {
      // Monthly: Show last 30 days or current month
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (valueDate >= thirtyDaysAgo) {
        filteredValues.push(value);
      }
    } else {
      // Default: return all values
      filteredValues.push(value);
    }
  });
  
  // Sort by timestamp (most recent first)
  return filteredValues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Get time points for chart data based on period
 * @paramњимаArray} values - Attribute values (should already be filtered by period)
 * @param {string} period - 'Daily', 'Weekly', or 'Monthly'
 * @returns {Array} Time points
 */
export const getTimePointsByPeriod = (values, period) => {
  const now = new Date();
  const timePoints = [];
  
  // Group existing values by day
  const valuesByDay = new Map();
  if (values && values.length > 0) {
    values.forEach((value) => {
      const date = new Date(value.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!valuesByDay.has(dayKey)) {
        valuesByDay.set(dayKey, {
          value: parseInt(value.value) || 0,
          timestamp: value.timestamp
        });
      } else {
        // Sum multiple values for the same day
        const existing = valuesByDay.get(dayKey);
        existing.value += parseInt(value.value) || 0;
      }
    });
  }
  
  if (period === 'Weekly') {
    // Generate all 7 days of current week (Mon-Sun)
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to get Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      const dayName = daysOfWeek[i];
      const existingValue = valuesByDay.get(dayKey);
      
      timePoints.push({
        date: day,
        label: dayName,
        value: existingValue ? existingValue.value : 0,
        timestamp: existingValue ? existingValue.timestamp : day.toISOString()
      });
    }
  } else if (period === 'Monthly') {
    // Generate all days of current month (1-31)
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Number of days in current month
    
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const day = new Date(year, month, dayNumber);
      const dayKey = day.toISOString().split('T')[0];
      const existingValue = valuesByDay.get(dayKey);
      
      timePoints.push({
        date: day,
        label: `${dayNumber}`,
        value: existingValue ? existingValue.value : 0,
        timestamp: existingValue ? existingValue.timestamp : day.toISOString()
      });
    }
  } else {
    // Daily: Show last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayKey = day.toISOString().split('T')[0];
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = day.getDate();
      const monthName = day.toLocaleDateString('en-US', { month: 'short' });
      const existingValue = valuesByDay.get(dayKey);
      
      timePoints.push({
        date: day,
        label: `${dayName} ${dayNumber} ${monthName}`,
        value: existingValue ? existingValue.value : 0,
        timestamp: existingValue ? existingValue.timestamp : day.toISOString()
      });
    }
  }
  
  return timePoints;
};

/**
 * Get time points for chart data based on config
 * @param {Array} values - Attribute values
 * @param {Array} config - Widget config (time periods)
 * @returns {Array} Time points
 */
export const getTimePoints = (values, config) => {
  if (!values || values.length === 0) return [];
  
  // Group values by unique day to avoid duplicate labels
  const valuesByDay = new Map();
  
  values.slice(0, 7).forEach((value) => {
    const date = new Date(value.timestamp);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    // Use a more descriptive label that includes date to avoid duplicates
    const label = `${dayName} ${dayNumber} ${monthName}`;
    
    if (valuesByDay.has(dayKey)) {
      // If the day already exists, keep the first value's timestamp
      // but use the aggregated label format
      const existing = valuesByDay.get(dayKey);
      // Keep the first timestamp but ensure label is updated
      existing.label = label;
    } else {
      valuesByDay.set(dayKey, {
      date,
        label: label,
        value: value.value,
        timestamp: value.timestamp
      });
    }
  });
  
  // Convert map to array and sort by timestamp (oldest first)
  const timePoints = Array.from(valuesByDay.values())
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return timePoints;
};

/**
 * Get color for chart element based on index
 * @param {number} index - Element index
 * @returns {string} Color hex code
 */
export const getColorForIndex = (index, attributeName = '') => {
  // Special color palette for calorie intake (blue to purple gradient)
  const calorieIntakeColors = [
    '#60a5fa', // Light Blue
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#a78bfa', // Light Purple
  ];

  // Check if this is calorie intake related
  if (attributeName && (
    attributeName.toLowerCase().includes('calorie') ||
    attributeName.toLowerCase().includes('breakfast') ||
    attributeName.toLowerCase().includes('brunch') ||
    attributeName.toLowerCase().includes('lunch') ||
    attributeName.toLowerCase().includes('snack') ||
    attributeName.toLowerCase().includes('dinner')
  )) {
    return calorieIntakeColors[index % calorieIntakeColors.length];
  }

  // Default color palette for other attributes
  const colors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#10b981', // Emerald
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16'  // Lime
  ];
  return colors[index % colors.length];
};

/**
 * Get days in the current month, handling leap years for February
 * @returns {number} Number of days in current month
 */
export const getDaysInCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  
  // Get the last day of the current month
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get goal value for attribute based on period
 * @param {Object} attribute - Attribute object
 * @param {string} period - Time period
 * @returns {number} Goal value
 */
export const getGoalForAttribute = (attribute, period) => {
  // Check if attribute has a dynamic target value from API
  // target_value is an object: { id, value, user_id, dashboard_id, value_description }
  const dynamicTarget = parseInt(attribute?.target_value?.value || attribute?.targetValue?.value);
  if (dynamicTarget && !isNaN(dynamicTarget)) {
    return dynamicTarget;
  }

  // Default goals based on attribute type (fallback)
  const defaultGoals = {
    'steps_count': 6000,
    'steps_progress': 100, // percentage
    'cardio': 30, // minutes
    'strength_training': 20, // sets
    'lower_body': 10, // scale
    'breakfast': 500, // calories
    'lunch': 600, // calories
    'dinner': 700, // calories
    'brunch': 400, // calories
    'snack': 200, // calories
    'sleep_management': 8, // hours
    'heart_beat': 75, // bpm
    'blood_pressure': 120 // mmHg
  };

  return defaultGoals[attribute?.name] || 100;
};

/**
 * Format value for display
 * @param {number} value - Numeric value
 * @param {string} unit - Unit of measurement
 * @returns {string} Formatted value
 */
export const formatValue = (value, unit, valueType = null) => {
  if (!value && value !== 0) return '0';
  
  // Handle double_number type: parse comma-separated values and display with slash
  if (valueType === 'double_number' && typeof value === 'string' && value.includes(',')) {
    const parts = value.split(',').map(part => part.trim());
    if (parts.length === 2) {
      return `${parts[0]}/${parts[1]} ${unit}`;
    }
  }
  
  const numValue = parseInt(value);
  
  if (unit === 'kcal' || unit === 'calories') {
    return `${numValue.toLocaleString()} ${unit}`;
  } else if (unit === 'steps') {
    return `${numValue.toLocaleString()} steps`;
  } else if (unit === 'minutes') {
    return `${numValue} min`;
  } else if (unit === 'hours') {
    return `${numValue}h`;
  } else if (unit === 'bpm') {
    return `${numValue} bpm`;
  } else if (unit === 'mmHg') {
    // Check if it's already comma-separated (backwards compatibility)
    if (typeof value === 'string' && value.includes(',')) {
      const parts = value.split(',').map(part => part.trim());
      if (parts.length === 2) {
        return `${parts[0]}/${parts[1]} ${unit}`;
      }
    }
    return `${numValue} ${unit}`;
  } else if (unit === 'sets') {
    return `${numValue} sets`;
  } else if (unit === 'scale') {
    return `${numValue}/10`;
  }
  
  return `${numValue.toLocaleString()} ${unit}`;
};

/**
 * Generate quarters for multiple years (past, current, and future)
 * @param {number} yearsBefore - Number of years before current year (default: 2)
 * @param {number} yearsAfter - Number of years after current year (default: 1)
 * @returns {Array} Array of quarter objects with name, months, year, and current flag
 */
export const generateQuarters = (yearsBefore = 2, yearsAfter = 1) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const currentQuarter = Math.floor(currentMonth / 3); // 0-3 (Q1-Q4)

  const quarters = [];
  const startYear = currentYear - yearsBefore;
  const endYear = currentYear + yearsAfter;

  for (let year = startYear; year <= endYear; year++) {
    const yearQuarters = [
      { name: `Q1 ${year}`, months: ['Jan', 'Feb', 'Mar'], startMonth: 0, endMonth: 2, year, quarter: 0 },
      { name: `Q2 ${year}`, months: ['Apr', 'May', 'Jun'], startMonth: 3, endMonth: 5, year, quarter: 1 },
      { name: `Q3 ${year}`, months: ['Jul', 'Aug', 'Sep'], startMonth: 6, endMonth: 8, year, quarter: 2 },
      { name: `Q4 ${year}`, months: ['Oct', 'Nov', 'Dec'], startMonth: 9, endMonth: 11, year, quarter: 3 }
    ];

    // Mark current quarter
    yearQuarters.forEach(q => {
      q.isCurrent = (q.year === currentYear && q.quarter === currentQuarter);
    });

    quarters.push(...yearQuarters);
  }

  return quarters;
};

/**
 * Get the index of the current quarter in the quarters array
 * @param {Array} quarters - Array of quarter objects
 * @returns {number} Index of current quarter
 */
export const getCurrentQuarterIndex = (quarters) => {
  const currentQuarterIndex = quarters.findIndex(q => q.isCurrent);
  return currentQuarterIndex >= 0 ? currentQuarterIndex : 0;
};

/**
 * Process expense/income data for quarterly heatmap visualization
 * @param {Array} dashboardAttributes - Dashboard attributes from API
 * @param {string} attributeName - Name of the attribute to process ('manage_expenses', 'add_income', or 'calorie_intake')
 * @param {string} yearlyCalculation - Calculation type: 'sum' or 'avg'
 * @param {Array} childAttributeIds - Optional array of child attribute IDs to filter by
 * @returns {Object} Quarterly heatmap chart data with budget comparison
 */
export const processQuarterlyHeatmapData = (dashboardAttributes = [], attributeName = 'manage_expenses', yearlyCalculation = 'avg', childAttributeIds = null) => {
  console.log('=== QUARTERLY HEATMAP DEBUG: processQuarterlyHeatmapData called ===');
  console.log('Attribute Name:', attributeName);
  console.log('Yearly Calculation:', yearlyCalculation);
  console.log('Child Attribute IDs:', childAttributeIds);

  // Find the target attribute (manage_expenses, add_income, or calorie_intake)
  const targetAttribute = dashboardAttributes.find(attr => attr.name === attributeName);

  if (!targetAttribute || !targetAttribute.attributes || targetAttribute.attributes.length === 0) {
    console.log('Dashboard Utils: No data found for quarterly heatmap');
    return null;
  }

  // Get categories (children of target attribute)
  let categories = targetAttribute.attributes;

  // Filter by child attribute IDs if specified
  if (childAttributeIds && childAttributeIds.length > 0) {
    const childIdStrings = childAttributeIds.map(id => id.toString());
    categories = categories.filter(child =>
      childIdStrings.includes(child.id?.toString())
    );
    console.log('Filtered categories by child_attribute_ids:', childIdStrings);
  }

  console.log('Categories found:', categories.length);
  console.log('Categories:', categories.map(c => ({ id: c.id, name: c.display_name, valuesCount: c.values?.length || 0 })));

  // Generate quarters for multiple years (2 years before, 1 year after)
  const quarters = generateQuarters(2, 1);

  // Process each category to create series data
  const series = categories.map(category => {
    const values = category.values || [];

    // Get budget/target value for this category
    const budget = parseFloat(category.target_value?.value) || 0;

    // Get unit from category
    const unit = category.unit || 'kcal';

    // Create data array for each quarter (3 months per quarter)
    const quarterlyData = quarters.map(quarter => {
      // Initialize month buckets [month1, month2, month3]
      const monthBuckets = [0, 0, 0];

      // Aggregate values into month buckets for this quarter
      values.forEach(valueEntry => {
        if (!valueEntry.timestamp || !valueEntry.value) return;

        const valueDate = new Date(valueEntry.timestamp);
        // Use UTC methods to match Android behavior (timestamps are in UTC)
        const valueYear = valueDate.getUTCFullYear();
        const valueMonth = valueDate.getUTCMonth(); // 0-11

        // Only process values from the quarter's year and within quarter range
        if (valueYear === quarter.year && valueMonth >= quarter.startMonth && valueMonth <= quarter.endMonth) {
          const amount = parseFloat(valueEntry.value) || 0;
          const monthIndexInQuarter = valueMonth - quarter.startMonth; // 0, 1, or 2
          monthBuckets[monthIndexInQuarter] += amount;
        }
      });

      // Apply yearly_calculation logic
      // If 'sum': return total sum for the month
      // If 'avg': return average per day for the month
      if (yearlyCalculation === 'sum') {
        // Return the sum as-is (total for the month)
        return monthBuckets;
      } else {
        // Apply avg calculation: divide by days in month
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        const currentDay = now.getUTCDate();

        const avgBuckets = monthBuckets.map((sum, monthIndex) => {
          const actualMonth = quarter.startMonth + monthIndex;
          const monthYear = quarter.year;

          // Calculate number of days to divide by
          let daysInMonth;
          if (monthYear === currentYear && actualMonth === currentMonth) {
            // Current month: use current day
            daysInMonth = currentDay;
          } else if (monthYear > currentYear || (monthYear === currentYear && actualMonth > currentMonth)) {
            // Future month: no data yet, return 0
            return 0;
          } else {
            // Past month: use total days in that month
            daysInMonth = new Date(Date.UTC(monthYear, actualMonth + 1, 0)).getUTCDate();
          }

          // Calculate average: sum / days
          return daysInMonth > 0 ? Math.round(sum / daysInMonth) : 0;
        });

        return avgBuckets;
      }
    });

    return {
      name: category.display_name || category.name || 'Category',
      quarterlyData, // Array of all quarters across multiple years, each with 3 month values
      budget: budget,
      unit: unit
    };
  });

  // Don't filter out series with no data - always include all categories
  console.log('Series count:', series.length);
  console.log('Series data:', series.map(s => ({
    name: s.name,
    quarterlyData: s.quarterlyData,
    budget: s.budget
  })));

  return {
    quarters,
    series: series.map(s => ({
      name: s.name,
      quarterlyData: s.quarterlyData,
      budget: s.budget,
      unit: s.unit
    }))
  };
};

/**
 * Process expense data for heatmap visualization (DEPRECATED - use processQuarterlyHeatmapData)
 * @param {Array} dashboardAttributes - Dashboard attributes from API
 * @param {string} period - Time period (Daily, Weekly, Monthly)
 * @returns {Object} Heatmap chart data with budget comparison
 */
export const processExpenseHeatmapData = (dashboardAttributes = [], period = 'Weekly') => {
  console.log('=== HEATMAP DEBUG: processExpenseHeatmapData called ===');
  console.log('Period:', period);

  // Find the manage_expenses attribute
  const manageExpenses = dashboardAttributes.find(attr => attr.name === 'manage_expenses');

  if (!manageExpenses || !manageExpenses.attributes || manageExpenses.attributes.length === 0) {
    console.log('Dashboard Utils: No expense data found for heatmap');
    return null;
  }

  // Get expense categories (children of manage_expenses)
  const expenseCategories = manageExpenses.attributes;
  console.log('Expense categories found:', expenseCategories.length);
  console.log('Categories:', expenseCategories.map(c => ({ id: c.id, name: c.display_name, valuesCount: c.values?.length || 0 })));

  // Determine time buckets based on period
  const now = new Date();
  console.log('Current date (now):', now.toISOString());
  let categories = [];
  let startDate, endDate;

  if (period === 'Daily') {
    // Show last 7 days
    categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 1); // Add 1 day to handle timezone issues
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'Weekly') {
    // Show last 7 days (same as daily for now)
    categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 1); // Add 1 day to handle timezone issues
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'Monthly') {
    // Show last 12 months
    categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1); // Add 1 month to handle timezone issues
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);
  }

  console.log('Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

  // Process each expense category
  const series = expenseCategories.map(category => {
    const values = category.values || [];

    // Get budget (target value) for this category
    const budget = parseFloat(category.target_value?.value) || 0;

    // Initialize buckets with zeros
    const buckets = new Array(categories.length).fill(0);

    // Aggregate values into time buckets
    values.forEach(valueEntry => {
      if (!valueEntry.timestamp || !valueEntry.value) return;

      const valueDate = new Date(valueEntry.timestamp);
      console.log(`Processing value for ${category.display_name}: date=${valueDate.toISOString()}, amount=${valueEntry.value}`);

      if (valueDate < startDate || valueDate > endDate) {
        console.log(`  -> Skipped (outside date range)`);
        return;
      }

      const amount = parseFloat(valueEntry.value) || 0;
      console.log(`  -> Included! Amount: ${amount}`);

      if (period === 'Daily' || period === 'Weekly') {
        // Group by day of week
        const dayOfWeek = valueDate.getDay(); // 0 = Sunday, 1 = Monday, ...
        const mappedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
        if (mappedIndex >= 0 && mappedIndex < buckets.length) {
          buckets[mappedIndex] += amount;
        }
      } else if (period === 'Monthly') {
        // Group by month
        const month = valueDate.getMonth(); // 0 = Jan, 11 = Dec
        if (month >= 0 && month < buckets.length) {
          buckets[month] += amount;
        }
      }
    });

    return {
      name: category.display_name || category.name || 'Expense',
      data: buckets,
      budget: budget // Include budget for comparison
    };
  });

  const finalSeries = series.filter(s => s.data.some(v => v > 0));
  console.log('Final series count:', finalSeries.length);
  console.log('Series data:', finalSeries.map(s => ({ name: s.name, data: s.data, budget: s.budget })));

  return {
    categories,
    series: finalSeries
  };
};

/**
 * Prepare data for regular heatmap (quarterly view for expenses or calorie intake)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children (expense or calorie categories)
 * @param {Array} allAttributes - All dashboard attributes
 * @returns {Object} Heatmap chart data
 */
export const prepareHeatmapData = (widget, attribute, allAttributes = []) => {
  console.log('Dashboard Utils: prepareHeatmapData called', {
    attributeName: attribute?.name,
    childrenCount: attribute?.attributes?.length || 0,
    childAttributeIds: widget.child_attribute_ids,
    yearlyCalculation: widget.yearly_calculation
  });

  // Determine which attribute to use based on the attribute name
  // For fitness dashboard, use calorie_intake, for personal dashboard, use manage_expenses
  const attributeName = attribute?.name || 'manage_expenses';

  // Use processQuarterlyHeatmapData to get quarterly data
  // Pass yearly_calculation parameter to determine if we should use sum or avg
  // Pass child_attribute_ids to filter at the source
  const heatmapData = processQuarterlyHeatmapData(
    allAttributes,
    attributeName,
    widget.yearly_calculation,
    widget.child_attribute_ids
  );

  if (!heatmapData) {
    console.log('Dashboard Utils: No heatmap data available');
    return {
      type: 'heat_map',
      quarters: [],
      series: [],
      isEmpty: true,
      message: 'No data available for heatmap'
    };
  }

  // Transform series to include all quarterly data for navigation
  const transformedSeries = heatmapData.series.map(s => ({
    name: s.name,
    quarterlyData: s.quarterlyData, // Keep all quarterly data for navigation
    budget: s.budget,
    unit: s.unit
  }));

  return {
    type: 'heat_map',
    quarters: heatmapData.quarters,
    series: transformedSeries,
    title: attribute?.display_name || 'Heatmap'
  };
};

/**
 * Prepare data for reverse heatmap (quarterly view for income)
 * @param {Object} widget - Widget configuration
 * @param {Object} attribute - Parent attribute with children (income categories)
 * @param {Array} allAttributes - All dashboard attributes
 * @returns {Object} Reverse heatmap chart data
 */
export const prepareReverseHeatmapData = (widget, attribute, allAttributes = []) => {
  console.log('Dashboard Utils: prepareReverseHeatmapData called', {
    attributeName: attribute?.name,
    childrenCount: attribute?.attributes?.length || 0,
    childAttributeIds: widget.child_attribute_ids,
    yearlyCalculation: widget.yearly_calculation
  });

  // Use processQuarterlyHeatmapData to get quarterly data for income
  // Pass yearly_calculation parameter and child_attribute_ids to filter at the source
  const heatmapData = processQuarterlyHeatmapData(
    allAttributes,
    'add_income',
    widget.yearly_calculation,
    widget.child_attribute_ids
  );

  if (!heatmapData) {
    console.log('Dashboard Utils: No heatmap data available for reverse heatmap');
    return {
      type: 'reverse_heat_map',
      quarters: [],
      series: [],
      isEmpty: true,
      message: 'No data available for reverse heatmap'
    };
  }

  // Transform series to include all quarterly data for navigation
  const transformedSeries = heatmapData.series.map(s => ({
    name: s.name,
    quarterlyData: s.quarterlyData, // Keep all quarterly data for navigation
    budget: s.budget,
    unit: s.unit
  }));

  return {
    type: 'reverse_heat_map',
    quarters: heatmapData.quarters,
    series: transformedSeries,
    title: attribute?.display_name || 'Reverse Heatmap'
  };
};
