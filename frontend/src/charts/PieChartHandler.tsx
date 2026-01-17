import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { colorFor } from "../utils/Color";

type Datum = { name: string; value: number; percentage?: string };

type Props = {
  data: Datum[];
  height?: number | string;
  outerRadius?: number;
  showLegend?: boolean;
  showOverlay?: boolean;
  overlayText?: string;
  isDarkMode?: boolean;
};

const colorPalettes = {
  light: [
    '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', 
    '#F59E0B', '#EC4899', '#06B6D4', '#84CC16'
  ],
  dark: [
    '#60A5FA', '#34D399', '#F87171', '#A78BFA',
    '#FBBF24', '#F472B6', '#22D3EE', '#A3E635'
  ],
  professional: [
    '#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA',
    '#93C5FD', '#BFDBFE', '#1E40AF', '#1E3A8A'
  ],
  pastel: [
    '#93C5FD', '#6EE7B7', '#FCA5A5', '#D8B4FE',
    '#FDE68A', '#FBCFE8', '#A7F3D0', '#BFDBFE'
  ],
  accessible: [
    '#4C78A8', '#54A24B', '#E45756', '#79706E',
    '#F58518', '#72B7B2', '#B279A2', '#FF9DA6'
  ]
};

export default function PieChartHandler({
  data, 
  height = 350, 
  outerRadius = 80, 
  showLegend = true,
  showOverlay = false,
  isDarkMode = false
}: Props) {
  
  const colors = isDarkMode ? colorPalettes.dark : colorPalettes.light;
  
  return (
    <div style={{ height, position: 'relative' }}>
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-10">
          <div className="text-3xl font-bold text-gray-400 transform -rotate-12">
            {overlayText}
          </div>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={showOverlay ? [] : data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => 
              `${name}${percentage ? `: ${percentage}` : ""}`
            }
          >
            {!showOverlay && data.map((d, i) => (
              <Cell 
                key={i} 
                fill={colors[i % colors.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any, name: any, props: any) => [
              `${value}${props.payload?.percentage ? ` (${props.payload.percentage})` : ""}`,
              name
            ]} 
          />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}