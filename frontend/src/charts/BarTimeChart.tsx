import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatShort, parseYMD } from "../utils/Time";
import { COLOR_PRIMARY, COLOR_GRID } from "../utils/Color";
import { useState } from "react";

type Props<T extends Record<string, any>> = {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  xLabel?: string;
  yLabel?: string;
  barLabel?: string;
  height?: number | string;
  showOverlay?: boolean;
  overlayText?: string;
  isDarkMode?: boolean;
  callDirection?: 'inbound' | 'outbound' | 'all';
};

export default function BarTimeChart<T extends Record<string, any>>({
  data,
  xKey, 
  yKey, 
  xLabel = "",
  yLabel = "", 
  barLabel, 
  height = 350,
  showOverlay = false,
  overlayText = "PRICES TO BE DETERMINED",
  isDarkMode = false,
  callDirection = 'all'
}: Props<T>) {
  
  const AXIS_TEXT_COLOR = isDarkMode ? "#A0AEC0" : "#666666";
  const LEGEND_TEXT_COLOR = isDarkMode ? "#ffffff" : "#000000";
  const TOOLTIP_BG_COLOR = isDarkMode ? "#374254" : "#ffffff";
  const TOOLTIP_BORDER_COLOR = isDarkMode ? "#4A5568" : "#e5e5e5";
  const TOOLTIP_TEXT_COLOR = isDarkMode ? "#ffffff" : "#000000";
  const COLOR_GRID_DARK = isDarkMode ? "#7b7f87ff" : "#e5e5e5";

  const inboundColor = "#10B981"; 
  const outboundColor = "#3babf6ff"; 
  const allColor = COLOR_PRIMARY; 

  const getBarColor = () => {
    switch (callDirection) {
      case 'inbound': return inboundColor;
      case 'outbound': return outboundColor;
      default: return allColor;
    }
  };

  const getBarLabel = () => {
    switch (callDirection) {
      case 'inbound': return 'Inbound Calls';
      case 'outbound': return 'Outbound Calls';
      default: return 'All Calls';
    }
  };

  return (
    <div style={{ height: typeof height === 'number' ? height + 50 : height, position: 'relative' }}>

      {/* {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-10">
          <div className="text-3xl font-bold text-gray-400 transform -rotate-12">
            {overlayText}
          </div>
        </div>
      )} */}
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={showOverlay ? [] : data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={COLOR_GRID_DARK} 
            strokeWidth={2} 
          />
          <XAxis
            dataKey={xKey as string}
            tickFormatter={(v: string) => formatShort(parseYMD(v))}
            label={{ value: xLabel, position: "bottom", angle: 0, stroke: AXIS_TEXT_COLOR }}
            stroke={AXIS_TEXT_COLOR} 
            tick={{ fill: AXIS_TEXT_COLOR }} 
          />
          <YAxis 
            width="auto" 
            label={{ value: yLabel, position: "insideLeft", angle: -90, stroke: AXIS_TEXT_COLOR }}
            stroke={AXIS_TEXT_COLOR} 
            tick={{ fill: AXIS_TEXT_COLOR }} 
          />
          <Tooltip 
            formatter={(val: any) => [`${val}`, yLabel]}
            contentStyle={{
              backgroundColor: TOOLTIP_BG_COLOR,
              borderColor: TOOLTIP_BORDER_COLOR,
              color: TOOLTIP_TEXT_COLOR
            }}
            itemStyle={{ color: TOOLTIP_TEXT_COLOR }}
          />
          {!showOverlay && (
            <Bar 
              dataKey={yKey as string} 
              fill={getBarColor()} 
              radius={[4, 4, 0, 0]} 
              name={getBarLabel()} 
            />
          )}
          {(barLabel || showOverlay) && (
            <Legend 
              align="right" 
              wrapperStyle={{
                color: LEGEND_TEXT_COLOR,
                fontSize: '16px'
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}