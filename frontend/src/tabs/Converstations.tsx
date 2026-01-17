import React, { useState, useEffect, useMemo } from "react";
import { getRetellCallsForAgent, getRetellCallDetails } from "../api/retell";
import { useTheme } from "../contexts/ThemeContext";
import { useOnboarding } from "../components/Onboarding/OnboardingManager";
import CallsList from '../components/Conversations/CallsList';
import ConversationView from '../components/Conversations/ConversationView';
import CallDetails from '../components/Conversations/CallDetails';
import Header from '../components/Conversations/Header';

const CACHE_DURATION = 5 * 60 * 1000;

const Conversations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [calls, setCalls] = useState<any[]>([]);
  const [callDetails, setCallDetails] = useState<any[]>([]);
  const [callDirection, setCallDirection] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  
  const cached = localStorage.getItem("CallsCache");
  const cachedDetails = localStorage.getItem("CallDetailsCache");
  const savedFilter = localStorage.getItem("CallFilter");
  
  const { isDarkMode } = useTheme();
  const { shouldShowOnboarding, startOnboarding, setPageReady } = useOnboarding();

  const colors = {
    bg: isDarkMode ? "#1E2939" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#000000",
    textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
    border: isDarkMode ? "#4A5568" : "#e5e5e5",
    cardBg: isDarkMode ? "#2A3648" : "#ffffff",
    callCardBg: isDarkMode ? "#2f3c51ff" : "#ffffff",
    sidebarBg: isDarkMode ? "#2A3648" : "#f8f9fa",
    hoverBg: isDarkMode ? "#374254" : "#e9ecef",
    activeBg: isDarkMode ? "#3A4658" : "#e3f2fd",
    inputBg: isDarkMode ? "#374254" : "#ffffff",
    inputBgHover: isDarkMode ? "#4A5568" : "#f1f3f5",
  };

  useEffect(() => {
    setPageReady('conversations', true);
    if (shouldShowOnboarding('conversations')) {
      startOnboarding('conversations');
    }
  }, [setPageReady, shouldShowOnboarding, startOnboarding]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const data = await getRetellCallsForAgent();
      const callsData = data && data.calls ? data.calls : [];

      const callList: { callId: string; direction: string }[] = callsData
        .map((entry: any) => {
          const id = entry?.call_id ?? entry?.callId;
          return id ? { callId: id, direction: (entry?.direction ?? 'unknown') } : null;
        })
        .filter(Boolean) as { callId: string; direction: string }[];

      if (callList.length > 0) {
        setCallDirection(callList[0].direction || '');
      }

      setCalls(callList);

      localStorage.setItem("CallsCache", JSON.stringify({
        timestamp: Date.now(),
        calls: callList,
      }));

    } catch (err) {
      console.error("Error fetching call list:", err);
      setError("Failed to fetch call list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        setCalls(parsed.calls);
        return;
      }
    }
    fetchCalls();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setSelectedConversation(null);
      await fetchCalls();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!calls || calls.length === 0) return;

    const fetchCallDetails = async () => {
      try {
        if (cachedDetails) {
          const parsed = JSON.parse(cachedDetails);
          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            setCallDetails(parsed.details);
            return;
          }
        }

        const details = await Promise.all(
          calls.map(async (c: { callId: string }) => {
            try {
              const data = await getRetellCallDetails(c.callId);
              return { callId: c.callId, direction: (c as any).direction ?? 'unknown', ...data };
            } catch (err) {
              console.error(`Failed to fetch details for call ID: ${c.callId}`, err);
              return null;
            }
          })
        );

        const validDetails = details.filter((d) => d !== null);
        setCallDetails(validDetails);
        localStorage.setItem("CallDetailsCache", JSON.stringify({
          timestamp: Date.now(),
          details: validDetails,
        }));
        setSelectedConversation(validDetails[0] || null);
      } catch (err) {
        console.error("Error fetching call details:", err);
        setError("Failed to fetch call details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [calls]);

  useEffect(() => {
    if (savedFilter) {
      setFilter(savedFilter);
    } else {
      setFilter("7d");
    }
  }, []);

  const filteredCalls = useMemo(() => {
    if (loading || !callDetails) return [];

    return callDetails.filter((call) => {
      const callTime = new Date(call.timestamp);
      const now = new Date();

      let matchesFilter = true;
      if (filter === "24h") {
        matchesFilter = now.getTime() - callTime.getTime() <= 24 * 60 * 60 * 1000;
      } else if (filter === "7d") {
        matchesFilter = now.getTime() - callTime.getTime() <= 7 * 24 * 60 * 60 * 1000;
      } else if (filter === "30d") {
        matchesFilter = now.getTime() - callTime.getTime() <= 30 * 24 * 60 * 60 * 1000;
      } else if (filter === "1y") {
        matchesFilter = now.getTime() - callTime.getTime() <= 365 * 24 * 60 * 60 * 1000;
      }

      let matchesSentiment = true;
      if (sentimentFilter !== 'all') {
        if (!call.sentiment || call.sentiment.toLowerCase() === 'unknown') {
          matchesSentiment = false;
        } else {
          matchesSentiment = call.sentiment.toLowerCase() === sentimentFilter.toLowerCase();
        }
      }

      if (!searchQuery) return matchesFilter && matchesSentiment;

      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (call.fromNumber && call.fromNumber.toLowerCase().includes(query)) ||
        (call.toNumber && call.toNumber.toLowerCase().includes(query)) ||
        (call.call_type && call.call_type.toLowerCase().includes(query)) ||
        (call.transcript && call.transcript.toLowerCase().includes(query)) ||
        (call.notes && call.notes.toLowerCase().includes(query)) || 
        (call.direction && call.direction.toLowerCase().includes(query));
      
      return matchesSearch && matchesFilter && matchesSentiment;
    });
  }, [callDetails, filter, searchQuery, loading, sentimentFilter]);

  useEffect(() => {
    localStorage.setItem("CallFilter", filter);
  }, [filter]);

  useEffect(() => {
    const now = new Date();
    const filteredOut = callDetails.some((call) => {
      const callTime = new Date(call.timestamp);
      let matchesFilter = true;

      if (filter === "24h") {
        matchesFilter = now.getTime() - callTime.getTime() <= 24 * 60 * 60 * 1000;
      } else if (filter === "7d") {
        matchesFilter = now.getTime() - callTime.getTime() <= 7 * 24 * 60 * 60 * 1000;
      } else if (filter === "30d") {
        matchesFilter = now.getTime() - callTime.getTime() <= 30 * 24 * 60 * 60 * 1000;
      } else if (filter === "1y") {
        matchesFilter = now.getTime() - callTime.getTime() <= 365 * 24 * 60 * 60 * 1000;
      }

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (!searchQuery) || (
          (call.fromNumber && call.fromNumber.toLowerCase().includes(query)) ||
          (call.toNumber && call.toNumber.toLowerCase().includes(query)) ||
          (call.call_type && call.call_type.toLowerCase().includes(query)) ||
          (call.transcript && call.transcript.toLowerCase().includes(query)) ||
          (call.notes && call.notes.toLowerCase().includes(query))
        );

      return !(matchesSearch && matchesFilter);
    });

    setIsFiltered(filteredOut);
  }, [callDetails, filter, searchQuery]);
  
  useEffect(() => {
    const storedCallId = localStorage.getItem("selectedCallId");
    if (storedCallId && filteredCalls.length > 0 && !selectedConversation) {
      const foundCall = filteredCalls.find(call => call.callId === storedCallId);
      if (foundCall) {
        setSelectedConversation(foundCall);
      }
    }
  }, [filteredCalls]);

  const handleSelectCall = (call: any) => {
    setSelectedConversation(call);
    localStorage.setItem("selectedCallId", call.callId);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phoneNumber;
  };

  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    if (durationInSeconds < 60) {
      return `${seconds}s`;
    } else if (durationInSeconds < 3600) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const formatCallTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Unknown time";
    }
    
    let formatted = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    
    const day = date.getDate();
    let suffix;
    if (day > 3 && day < 21) suffix = 'th';
    else {
      switch (day % 10) {
        case 1: suffix = 'st'; break;
        case 2: suffix = 'nd'; break;
        case 3: suffix = 'rd'; break;
        default: suffix = 'th';
      }
    }
    
    return formatted.replace(/(\d+)(,)/, `$1${suffix}$2`);
  };

  return (
    <div 
      className="pl-4 pt-4 w-full flex flex-col h-[calc(100vh)] overflow-y-auto " 
      style={{ backgroundColor: colors.bg, color: colors.text }}
      data-onboarding="conversations-page"
    >
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        sentimentFilter={sentimentFilter}
        setSentimentFilter={setSentimentFilter}
        colors={colors}
      />

      <div className="flex flex-1 overflow-hidden mt-4">
        <CallsList
          calls={filteredCalls}
          loading={loading}
          error={error}
          selectedConversation={selectedConversation}
          isRefreshing={isRefreshing}
          isFiltered={isFiltered}
          colors={colors}
          formatPhoneNumber={formatPhoneNumber}
          formatCallTimestamp={formatCallTimestamp}
          isDarkMode={isDarkMode}
          onSelectCall={handleSelectCall}
          onRefresh={handleRefresh}
        />

        <ConversationView
          selectedConversation={selectedConversation}
          colors={colors}
        />

        <CallDetails
          selectedConversation={selectedConversation}
          colors={colors}
          formatDuration={formatDuration}
          formatPhoneNumber={formatPhoneNumber}
        />
      </div>
    </div>
  );
};

export default Conversations;