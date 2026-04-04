import React from 'react';
import BarTimeChart from '../../charts/BarTimeChart';
import LineTimeChart from '../../charts/LineTimeChart';
import PieChartHandler from '../../charts/PieChartHandler';

export const ChartType = {
  LINE: "LINE",
  BAR: "BAR",
  PIE: "PIE",
} as const;
export type ChartType = typeof ChartType[keyof typeof ChartType];

interface ChartProps {
  type: ChartType;
  data: any[];
  callData?: any[]; 
  title: string;
  dataKey: string;
  xAxisKey?: string;
  yAxisLabel?: string;
  tooltipLabel?: string;
  showOverlay?: boolean;
  overlayText?: string;
  height?: number | string;
  isDarkMode?: boolean;
  callDirection?: 'inbound' | 'outbound' | 'all';
}

const ChartComponent: React.FC<ChartProps> = ({
  type,
  data,
  title,
  dataKey,
  xAxisKey = 'date',
  yAxisLabel = '',
  tooltipLabel,
  showOverlay = false,
  overlayText = 'PRICES TO BE DETERMINED',
  height = 350,
  isDarkMode = false,
  callDirection = 'all'
}) => {
  const chartColors = isDarkMode ? {
    text: "#ffffff",
    background: "#2A3648",
    grid: "#4A5568"
  } : {
    text: "#000000",
    background: "#ffffff",
    grid: "#e5e5e5"
  };
  return (
    <div style={{ backgroundColor: chartColors.background, color: chartColors.text }} className="p-4 rounded-lg shadow">
      <h3 className="text-lg w-fit font-semibold">{title}</h3>
      
      <div className="h-[400px]">
        {type === ChartType.LINE && (
          <LineTimeChart
            data={data}
            xKey={xAxisKey}
            yKey={dataKey}
            xLabel="Date"
            yLabel={yAxisLabel}
            showOverlay={showOverlay}
            overlayText={overlayText}
            lineLabel={tooltipLabel}
            callDirection={callDirection}
            height={400}
            isDarkMode={isDarkMode}
          />
        )}
        
        {type === ChartType.BAR && (
          <BarTimeChart
            data={data}
            xKey={xAxisKey}
            yKey={dataKey}
            xLabel="Date"
            yLabel={yAxisLabel}
            barLabel={tooltipLabel}
            height={height}
            showOverlay={showOverlay}
            overlayText={overlayText}
            isDarkMode={isDarkMode}
            callDirection={callDirection}
          />
          
        )}
        
        {type === ChartType.PIE && (
          <PieChartHandler
            data={data}
            height={height}
            outerRadius={80}
            showLegend={true}
            showOverlay={showOverlay}
            overlayText={overlayText}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default ChartComponent;