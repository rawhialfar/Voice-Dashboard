import React from 'react';

interface DataFieldProps {
  label: string;
  value: string | React.ReactNode;
  labelColor?: string;
  valueColor?: string;
}

const DataField: React.FC<DataFieldProps> = ({ 
  label, 
  value, 
  labelColor, 
  valueColor 
}) => (
  <div>
    <div className="text-sm text-gray-600" style={{ color: labelColor }}>
      {label}
    </div>
    <div className="font-medium text-gray-900" style={{ color: valueColor }}>
      {value}
    </div>
  </div>
);

export default DataField;