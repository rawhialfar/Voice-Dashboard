import { useState } from 'react';

interface MetricComparisonProps {
  label: string;
  currentValue: number;
  previousValue: number;
  prefix?: string;
  precision?: number;
  timeframe: string;
  isDarkMode?: boolean;
}

const MetricComparison: React.FC<MetricComparisonProps> = ({
  label,
  currentValue,
  previousValue,
  prefix = '',
  precision = 2,
  timeframe,
  isDarkMode = false
}) => {
  const percentChange = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;
  
  // Theme-aware colors
  const colors = {
    text: isDarkMode ? "#ffffff" : "#000000",
    textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
    cardBg: isDarkMode ? "#2A3648" : "#ffffff",
    cardBorder: isDarkMode ? "#4A5568" : "#e5e5e5",
    positiveText: isDarkMode ? "#68D391" : "#166534",
    positiveBg: isDarkMode ? "rgba(104, 211, 145, 0.2)" : "#d4fae0ff",
    negativeText: isDarkMode ? "#F87171" : "#dc2626",
    negativeBg: isDarkMode ? "rgba(248, 113, 113, 0.2)" : "#fde5e5ff",
    tooltipBg: isDarkMode ? "#374254" : "#ffffff",
    tooltipBorder: isDarkMode ? "#4A5568" : "#e5e5e5",
    tooltipText: isDarkMode ? "#ffffff" : "#000000"
  };

  const isPositive = percentChange >= 0;
  const [isHovered, setIsHovered] = useState(false);

  const getTimeframeLabel = (timeframe: string) => {
    switch(timeframe) {
      case '24h': return '24 Hours';
      case '7d': return 'Week';
      case '30d': return 'Month';
      case '1y': return 'Year';
      default: return 'All Time';
    }
  };

  // Determine formatting based on label
  const formatValue = (value: number) => {
    if (label === 'Total Calls') {
      return Math.round(value).toString(); 
    }
    // if (label === 'Total Cost' || label === 'Avg Cost/Call') {
    //   return 'TBD';
    // }
    return value?.toFixed(precision);
  };
  
  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg, 
        color: colors.text,
        border: `1px solid ${colors.cardBorder}`
      }} 
      className="p-4 rounded-lg shadow transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <span 
          className="text-2xl font-medium"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </span>
        
        {previousValue > 0  && (
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              className="text-xs font-medium flex items-center px-2 py-0.5 rounded-full transition-colors duration-200"
              style={{
                color: isPositive ? colors.positiveText : colors.negativeText,
                backgroundColor: isPositive ? colors.positiveBg : colors.negativeBg
              }}
            >
              {isPositive ? (
                <svg className="h-6 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 10l5-5 5 5H5z" />
                </svg>
              ) : (
                <svg className="h-6 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 10l5 5 5-5H5z" />
                </svg>
              )}
              {Math.abs(percentChange).toFixed(1)}%
            </div>
            
            {isHovered && (
              <div 
                className="absolute z-10 right-0 mt-2 w-64 rounded-md shadow-lg border p-3"
                style={{
                  backgroundColor: colors.tooltipBg,
                  borderColor: colors.tooltipBorder,
                  color: colors.tooltipText
                }}
              >
                <p className="text-sm">
                  This {percentChange >= 0 ? 'increase' : 'decrease'} compares the current {getTimeframeLabel(timeframe)} 
                  ({formatValue(currentValue)}{prefix}) to the previous {getTimeframeLabel(timeframe)} 
                  ({formatValue(previousValue)}{prefix}).
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p 
        className="mt-2 text-3xl font-semibold"
        style={{ color: colors.text }}
      >
        {prefix}{formatValue(currentValue)}
      </p>
      
    </div>
  );
};

export default MetricComparison;