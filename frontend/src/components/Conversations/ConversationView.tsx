import React, { useState } from 'react';
import AudioWaveformPlayer from "../PageComponents/AudioWavformPlayer";

interface ConversationViewProps {
  selectedConversation: any | null;
  colors: any;
}

const parseTranscript = (transcript: string) => {
  if (!transcript) return [];
  const lines = transcript.split("\n").filter(Boolean);
  return lines.map((line) => {
    const isAgent = line.startsWith("Agent:");
    return {
      sender: isAgent ? "agent" : "user",
      text: line.replace("Agent:", "").replace("User:", "").trim(),
    };
  });
};

const ConversationView: React.FC<ConversationViewProps> = ({
  selectedConversation,
  colors
}) => {
  const [activeTab, setActiveTab] = useState('transcript');

  return (
    <div 
      className="flex-1 flex flex-col rounded-md conversation-view" 
      style={{ 
        backgroundColor: colors.cardBg,
        marginTop: 0,
        height: 'calc(79vh)', 
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.border} transparent`
      }}
      data-onboarding="conversation-view"
    >
      {selectedConversation ? (
        <>
          <div className="flex space-x-6 justify-center border-b p-2" style={{ borderColor: colors.border }}>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`relative pb-2 text-sm font-medium transcript-tab ${
                activeTab === 'transcript' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ color: activeTab === 'transcript' ? '#2563eb' : colors.textSecondary }}
            >
              Transcript
              <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                activeTab === 'transcript' ? 'w-full' : 'w-0'
              }`} style={{ bottom: '-8px' }}></span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`relative pb-2 text-sm font-medium summary-tab ${
                activeTab === 'summary' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ color: activeTab === 'summary' ? '#2563eb' : colors.textSecondary }}
            >
              Summary
              <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                activeTab === 'summary' ? 'w-full' : 'w-0'
              }`} style={{ bottom: '-8px' }}></span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'transcript' ? (
              <div className="flex flex-col space-y-4 transcript-content">
                {parseTranscript(selectedConversation.transcript).map((msg, i, arr) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} 
                              ${i === arr.length - 1 ? "mb-4" : ""}`}
                  >
                    <div
                      className={`max-w-md p-3 mr-[-0.6rem] ${
                        msg.sender === "user"
                          ? " text-white rounded-l-lg rounded-tr-lg"
                          : " text-gray-900 rounded-tl-lg rounded-r-lg"
                      }`}
                      style={{ 
                        backgroundColor: msg.sender === "user" ? "#2563eb" : colors.hoverBg,
                        color: msg.sender === "user" ? "#ffffff" : colors.text
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg summary-content" style={{ backgroundColor: colors.hoverBg }}>
                <h3 className="font-semibold mb-2" style={{ color: colors.text }}>Call Summary</h3>
                <div className="whitespace-pre-wrap" style={{ color: colors.text }}>
                  {selectedConversation.summary || "No summary available for this call."}
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto pt-4 border-t p-4 audio-player-section" style={{ borderColor: colors.border }}>
            <AudioWaveformPlayer selectedConversation={selectedConversation} />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500" style={{ color: colors.textSecondary }}>
          Select a call to view details
        </div>
      )}
    </div>
  );
};

export default ConversationView;