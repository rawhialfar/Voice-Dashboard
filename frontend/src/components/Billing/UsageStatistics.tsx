import React from 'react';
import { RefreshCw } from 'lucide-react';

interface UsageStatisticsProps {
    colors: any;
    usageLoading: boolean;
    usageData: {
        callMinutes: number;
        callLimit: number;
        usagePercent: number;
    };
}

const UsageStatistics: React.FC<UsageStatisticsProps> = ({
    colors,
    usageLoading,
    usageData
}) => {
    return (
        <div 
            className="p-6 rounded-lg border flex flex-col justify-between usage-statistics-card"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
            <h2 className="text-2xl font-semibold mb-6">Usage Statistics</h2>
            
            {usageLoading ? (
                <div className="flex items-center justify-center py-4">
                    <RefreshCw size={20} className="animate-spin" style={{ color: colors.textSecondary }} />
                    <span className="ml-2" style={{ color: colors.textSecondary }}>Loading usage...</span>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">Call Minutes</span>
                        <span style={{ color: colors.textSecondary }}>
                            {usageData.callMinutes.toLocaleString()} / {usageData.callLimit.toLocaleString()} min
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${usageData.usagePercent}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                        {usageData.usagePercent.toFixed(1)}% of plan limit used
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsageStatistics;