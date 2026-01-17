import { useState, useEffect, useMemo } from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { getRetellStatistics, getRetellCallsForAgent, type IRetellCallResponse, type IRetellStatisticsResponse, getRetellCallDetails } from "../api/retell";
import MetricComparison from "../components/PageComponents/MetricComparison";
import ChartComponent, { ChartType } from "../components/PageComponents/ChartComponent";
import { getCached, readLocal, setCached, writeLocal } from "../utils/Cache";
import { useTheme } from "../contexts/ThemeContext";
import { useOnboarding } from "../components/Onboarding/OnboardingManager";

const TIMEFRAME_MAP = {
  "all": "All",
  "24h": "Day",
  "7d": "Week", 
  "30d": "Month",
  "1y": "Year",
} as const;

const TIME_DURATIONS = {
  "24h":      24 * 60 * 60 * 1000,
  "7d":   7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "1y": 365 * 24 * 60 * 60 * 1000,
} as const;

const CACHE_KEYS = {
  FILTER: 'retell_analytics_filter',
  CALL_DIRECTION: 'retell_analytics_call_direction'
} as const;

type TimeFilter = keyof typeof TIMEFRAME_MAP;
type CallDirection = 'all' | 'inbound' | 'outbound';

const Analytics = () => {
  const savedFilter = readLocal(CACHE_KEYS.FILTER);
  const savedCallDirection = readLocal(CACHE_KEYS.CALL_DIRECTION);
  
  const [filter, setFilter] = useState<TimeFilter>((savedFilter && savedFilter in TIMEFRAME_MAP ? (savedFilter as TimeFilter) : "7d"));
  const [callDirection, setCallDirection] = useState<CallDirection>((savedCallDirection as CallDirection) || 'all');
  const [stats, setStats] = useState<IRetellStatisticsResponse | null>(null);
  const [callsObj, setCallsObj] = useState<any[]>([]);
  const [calls, setCalls] = useState<{ callId: string; direction: string }[]>([]);
  const [callDetails, setCallDetails] = useState<IRetellCallResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const { shouldShowOnboarding, startOnboarding, setPageReady } = useOnboarding();

  const colors = {
    bg: isDarkMode ? "#1E2939" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#000000",
    textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
    border: isDarkMode ? "#4A5568" : "#e5e5e5",
    cardBg: isDarkMode ? "#2A3648" : "#ffffff",
    hoverBg: isDarkMode ? "#374254" : "#f8f9fa",
    inputBg: isDarkMode ? "#374254" : "#ffffff",
  };

  useEffect(() => {
    setPageReady('analytics', true);
  }, [setPageReady]);

  useEffect(() => {
    if ( shouldShowOnboarding('analytics')) {
      startOnboarding('analytics');
    }
  }, [stats, callDetails, shouldShowOnboarding, startOnboarding]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const cacheKey = `retell_analytics_${filter}_${callDirection}`;
      const cached = getCached<{ stats: IRetellStatisticsResponse; callDetails: IRetellCallResponse[] }>(cacheKey);
      
      if (cached) {
        setStats(cached.stats);
        setCallDetails(cached.callDetails);
        return;
      }

      const statsType = callDirection.toString();

      const [statsData, callsData] = await Promise.all([
        getRetellStatistics(TIMEFRAME_MAP[filter], statsType),
        getRetellCallsForAgent()
      ]);
      
      const callsList = callsData && callsData.calls ? callsData.calls : [];
      
      setCallsObj(callsList);

      const callList: { callId: string; direction: string }[] = callsList
        .map((entry: any) => {
          const id = entry?.call_id ?? entry?.callId;
          return id ? { callId: id, direction: (entry?.direction ?? 'unknown') } : null;
        })
        .filter(Boolean) as { callId: string; direction: string }[];

      setCalls(callList);

      if (callList.length > 0) {
        const details = await Promise.allSettled(
          callList.map(async (call: { callId: string; direction: string }) => {
            try {
              const data = await getRetellCallDetails(call.callId);
              return { callId: call.callId, direction: call.direction, ...data };
            } catch (err) {
              console.error(`Failed to fetch details for call ID: ${call.callId}`, err);
              return null;
            }
          })
        );

        const validDetails = details.filter((d) => d.status === 'fulfilled' && d.value !== null)
          .map(result => (result as PromiseFulfilledResult<IRetellCallResponse>).value);

        setCallDetails(validDetails);
        setCached(cacheKey, { stats: statsData, callDetails: validDetails });
      } else {
        setCallDetails([]);
        setCached(cacheKey, { stats: statsData, callDetails: [] });
      }

      setStats(statsData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    writeLocal(CACHE_KEYS.FILTER, filter);  
    writeLocal(CACHE_KEYS.CALL_DIRECTION, callDirection);
  }, [filter, callDirection]);

  const filteredCallDetails = useMemo(() => {
    let filtered = callDetails;
    
    if (filter !== 'all') {
      const cutoff = new Date(Date.now() - TIME_DURATIONS[filter]);
      filtered = filtered.filter(call => new Date(call.timestamp) >= cutoff);
    }
    
    return filtered;
  }, [callDetails, filter]);

  const statsChartData = useMemo(() => {
    if (!stats?.dailyStats) return [];
    
    return Object.entries(stats.dailyStats)
      .map(([date, dailyData]) => ({
        date,
        callCount: dailyData.totalCalls,
        totalMinutes: dailyData.totalDurationMs / 60000,
        totalCost: dailyData.totalCost / 100,
        totalCalls: dailyData.totalCalls,
        totalDurationMs: dailyData.totalDurationMs,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [stats]);

  const metrics = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        label: "Total Calls",
        currentValue: stats.totalNumberOfCalls,
        previousValue: stats.previousTotalNumberOfCalls || 0,
        precision: 0,
        showComparison: false
      },
      {
        label: "Total Minutes",
        currentValue: stats.totalCallDuration / 60000,
        previousValue: (stats.previousTotalCallDuration || 0) / 60000,
        precision: 1,
        showComparison: false
      },
      {
        label: "Total Cost",
        currentValue: stats.totalCostOverAllCalls / 100,
        previousValue: (stats.previousTotalCostOverAllCalls || 0) / 100,
        prefix: "$",
        precision: 2,
        showComparison: false
      },
      {
        label: "Avg Cost/Call",
        currentValue: stats.totalNumberOfCalls > 0 
          ? (stats.totalCostOverAllCalls / 100) / stats.totalNumberOfCalls 
          : 0,
        previousValue: (stats.previousTotalNumberOfCalls || 0) > 0 
          ? ((stats.previousTotalCostOverAllCalls || 0) / 100) / (stats.previousTotalNumberOfCalls || 1)
          : 0,
        prefix: "$",
        precision: 2,
        showComparison: false
      }
    ];
  }, [stats]);
  
  const disconnectionData = useMemo(() => {
    const reasons = filteredCallDetails.reduce((acc, call) => {
      const reason = call.disconnectionReason || 'Unknown';
      const direction = call.direction?.toLowerCase() || 'unknown';
      
      if (!acc[reason]) {
        acc[reason] = { total: 0, inbound: 0, outbound: 0 };
      }
      
      acc[reason].total++;
      if (direction === 'inbound') {
        acc[reason].inbound++;
      } else if (direction === 'outbound') {
        acc[reason].outbound++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; inbound: number; outbound: number }>);

    return Object.entries(reasons).map(([name, data]) => ({
      name: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: data.total,
      inbound: data.inbound,
      outbound: data.outbound,
      percentage: filteredCallDetails.length > 0 ? `${(data.total / filteredCallDetails.length * 100).toFixed(1)}%` : '0%'
    }));
  }, [filteredCallDetails]);

  if (loading) return (
    <div className="w-full p-6" style={{ backgroundColor: colors.bg }}>
      <div style={{ color: colors.textSecondary }}>Loading user information...</div>
    </div>
  );
  
  if (error) return (
    <div className="w-full p-6 text-red-500" style={{ backgroundColor: colors.bg }}>
      {error}
    </div>
  );
  
  if (!stats) return null;

  return (
    <div 
      className="p-8 w-full space-y-6 overflow-auto h-[calc(100vh)] overflow-y-auto"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <h1 className="font-bold analytics-title">Analytics</h1>
      
      <div className="flex items-center gap-3 flex-wrap">
        <Listbox value={filter} onChange={setFilter}>
          {({ open }) => (
            <div className="relative w-52 font-montserrat time-filter">
              <ListboxButton 
                className="w-full px-3 py-2 border rounded-lg text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <span>{TIMEFRAME_MAP[filter]}</span>
                <ChevronUpDownIcon 
                  className={`w-5 h-5 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
                  style={{ color: colors.textSecondary }}
                />
              </ListboxButton>
              <ListboxOptions 
                className="absolute mt-1 w-full border rounded-lg shadow-lg z-10"
                style={{ 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border
                }}
              >
                {Object.entries(TIMEFRAME_MAP).map(([value, label]) => (
                  <ListboxOption
                    key={value}
                    value={value}
                    className={({ active }) => 
                      `cursor-pointer select-none px-4 py-2 ${
                        active ? 'bg-gray-600 text-blue-700' : ''
                      }`
                    }
                    style={{ color: colors.text }}
                  >
                    {label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          )}
        </Listbox>

        <Listbox value={callDirection} onChange={setCallDirection}>
          {({ open }) => (
            <div className="relative w-52 font-montserrat call-direction">
              <ListboxButton 
                className="w-full px-3 py-2 border rounded-lg text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <span>
                  {callDirection === 'all' ? 'All Calls' : 
                   callDirection === 'inbound' ? 'Inbound Only' : 'Outbound Only'}
                </span>
                <ChevronUpDownIcon 
                  className={`w-5 h-5 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
                  style={{ color: colors.textSecondary }}
                />
              </ListboxButton>
              <ListboxOptions 
                className="absolute mt-1 w-full border rounded-lg shadow-lg z-10"
                style={{ 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border
                }}
              >
                <ListboxOption
                  value="all"
                  className={({ active }) => 
                    `cursor-pointer select-none px-4 py-2 ${
                      active ? 'bg-blue-100 text-blue-700' : ''
                    }`
                  }
                  style={{ color: colors.text }}
                >
                  All Calls
                </ListboxOption>
                <ListboxOption
                  value="inbound"
                  className={({ active }) => 
                    `cursor-pointer select-none px-4 py-2 ${
                      active ? 'bg-blue-100 text-blue-700' : ''
                    }`
                  }
                  style={{ color: colors.text }}
                >
                  Inbound Only
                </ListboxOption>
                <ListboxOption
                  value="outbound"
                  className={({ active }) => 
                    `cursor-pointer select-none px-4 py-2 ${
                      active ? 'bg-blue-100 text-blue-700' : ''
                    }`
                  }
                  style={{ color: colors.text }}
                >
                  Outbound Only
                </ListboxOption>
              </ListboxOptions>
            </div>
          )}
        </Listbox>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 metrics-grid">
        {metrics.map(metric => (
          <MetricComparison
            key={metric.label}
            {...metric}
            timeframe={filter}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 charts-grid">
        <ChartComponent
          type={ChartType.LINE}
          data={statsChartData}
          title="Total Call Minutes"
          dataKey="totalMinutes"
          yAxisLabel="Minutes"
          tooltipLabel="Total Minutes"
          isDarkMode={isDarkMode}
          callDirection={callDirection}
        />

        <ChartComponent
          type={ChartType.BAR}
          data={statsChartData}
          title="Number of Calls"
          dataKey="callCount"
          yAxisLabel="Calls"
          tooltipLabel="Calls"
          isDarkMode={isDarkMode}
          callDirection={callDirection}
        />

        <ChartComponent
          type={ChartType.LINE}
          data={statsChartData}
          title="Total Cost ($USD)"
          dataKey="totalCost"
          yAxisLabel="Cost ($)"
          tooltipLabel="Total Cost"
          showOverlay={false}
          overlayText="PRICES TO BE DETERMINED" 
          isDarkMode={isDarkMode}
          callDirection={callDirection}
        />

        <ChartComponent
          type={ChartType.PIE}
          data={disconnectionData}
          title="Call Disconnection Reasons"
          dataKey="value"
          tooltipLabel="Reason"
          isDarkMode={isDarkMode}
          className="disconnection-chart"
        />
      </div>
    </div>
  );
};

export default Analytics;