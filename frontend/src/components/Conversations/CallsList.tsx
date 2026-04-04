import React from 'react';
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface CallsListProps {
  calls: any[];
  loading: boolean;
  error: string | null;
  selectedConversation: any | null;
  isRefreshing: boolean;
  isFiltered: boolean;
  colors: any;
  formatPhoneNumber: (phoneNumber: string) => string;
  formatCallTimestamp: (timestamp: string) => string;
  isDarkMode: boolean;
  onSelectCall: (call: any) => void;
  onRefresh: () => void;
}

const CallsList: React.FC<CallsListProps> = ({
  calls,
  loading,
  error,
  selectedConversation,
  isRefreshing,
  isFiltered,
  colors,
  formatPhoneNumber,
  formatCallTimestamp,
  isDarkMode,
  onSelectCall,
  onRefresh
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch(sentiment.toLowerCase()) {
      case 'positive': return isDarkMode ? '#68D391' : '#166534';
      case 'negative': return isDarkMode ? '#F87171' : '#DC2626';
      case 'neutral': return isDarkMode ? '#93C5FD' : '#2563EB';
      default: return isDarkMode ? '#A0AEC0' : '#6B7280';
    }
  };

  return (
    <div 
      className="w-80 border m-4 flex flex-col rounded-lg calls-list" 
      style={{ 
        backgroundColor: colors.sidebarBg, 
        borderColor: colors.border,
        marginTop: 0,
        height: 'calc(79vh)', 
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.border} transparent`
      }}
      data-onboarding="calls-list"
    >
      <div className="flex items-center justify-between p-[0.6rem] border-b" style={{ borderColor: colors.border }}>
        <h3 className="text-md font-semibold" style={{ color: colors.text }}>Calls History</h3>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-gray-200 rounded transition-colors refresh-button"
          style={{ backgroundColor: colors.hoverBg }}
          aria-label="Refresh calls"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${isRefreshing ? 'text-blue-600 animate-spin' : 'text-gray-500 hover:text-gray-700'}`}
            style={{ color: colors.textSecondary }}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ borderColor: colors.border, maxHeight: 'calc(100vh - 4rem)'}}>
        {loading ? (
          <div className="p-4 text-gray-500" style={{ color: colors.textSecondary }}>Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : calls.length > 0 ? (
          calls.map((call) => {
            const formattedDate = formatCallTimestamp(call.timestamp);
            const isSelected = selectedConversation?.callId === call.callId;
            const sentiment = call.sentiment || 'unknown';

            return (
              <div
                key={call.callId}
                className="relative p-2 cursor-pointer group call-item"
                onClick={() => onSelectCall(call)}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 bg-blue-500 transition-all duration-300 transform
                    ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                    group-hover:opacity-100 group-hover:translate-x-0`}
                />
                
                <div
                  className={`relative p-3 rounded-md transition-all duration-200 transform origin-left
                    ${isSelected ? 'border scale-[0.98]' : 'border'}
                    group-hover:scale-[0.98]`}
                  style={{ 
                    backgroundColor: isSelected ? colors.activeBg : colors.callCardBg,
                    borderColor: colors.border
                  }}
                >
                  <div className="flex flex-col">
                      <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2 text-md" style={{ color: colors.text }}>
                        {call.direction?.toLowerCase() === 'inbound' 
                          ? formatPhoneNumber(call.fromNumber) 
                          : formatPhoneNumber(call.toNumber)
                        }
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-medium sentiment-badge ml-auto"
                          style={{ 
                            backgroundColor: isDarkMode 
                              ? `${getSentimentColor(sentiment)}20` 
                              : `${getSentimentColor(sentiment)}18`, 
                            color: getSentimentColor(sentiment)
                          }}
                        >
                          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                        </div>
                      </div>
                      <div 
                        className="px-2 py-1 rounded-full mb-1 text-xs w-fit font-medium direction-badge"
                        style={{ 
                          backgroundColor: isDarkMode 
                            ? (call.direction?.toLowerCase() === 'outbound' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)')
                            : (call.direction?.toLowerCase() === 'outbound' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(139, 92, 246, 0.12)'), 
                          color: call.direction?.toLowerCase() === 'outbound' ? '#3b82f6' : '#8b5cf6'
                        }}
                      >
                        {call.direction ? call.direction.charAt(0).toUpperCase() + call.direction.slice(1) : 'Unknown'}
                      </div>
                        
                      <span className="text-xs mt-1 text-gray-500 whitespace-nowrap" style={{ color: colors.textSecondary }}>
                        {formattedDate}
                      </span>
                    </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500" style={{ color: colors.textSecondary }}>
            {isFiltered ? "No calls found matching your criteria" : "No calls to display"}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallsList;