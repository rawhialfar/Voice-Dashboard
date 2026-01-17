import React from 'react';
import DataField from "../PageComponents/DataField";

interface CallDetailsProps {
  selectedConversation: any | null;
  colors: any;
  formatDuration: (durationInSeconds: number) => string;
  formatPhoneNumber: (phoneNumber: string) => string;
}

const CallDetails: React.FC<CallDetailsProps> = ({
  selectedConversation,
  colors,
  formatDuration,
  formatPhoneNumber
}) => {
  const statusDescriptions = {
    registered: "Call ID issued, starting to make a call using this ID",
    ongoing: "Call connected and ongoing",
    ended: "Call has ended",
    error: "Call encountered an error",
  };

  return (
    <div 
      className="w-80 border m-4 flex flex-col rounded-lg call-details-sidebar" 
      style={{ 
        backgroundColor: colors.sidebarBg, 
        borderColor: colors.border,
        height: 'calc(79vh)', 
        marginTop: 0
      }}
      data-onboarding="call-details"
    >
      <div className="p-4 border-b" style={{ borderColor: colors.border }}>
        <h3 className="text-md font-semibold" style={{ color: colors.text }}>Call Data</h3>
      </div>
      {selectedConversation ? (
        <div className="p-4 space-y-3 overflow-y-auto call-details-content">
          <DataField 
            label="Duration" 
            value={formatDuration(selectedConversation.durationSeconds)}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <DataField 
            label="Sentiment" 
            value={selectedConversation.sentiment}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <DataField 
            label="Cost" 
            value="$TBD"
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <DataField 
            label="From" 
            value={formatPhoneNumber(selectedConversation.fromNumber)}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <DataField 
            label="To" 
            value={formatPhoneNumber(selectedConversation.toNumber)}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <DataField 
            label="Status" 
            value={statusDescriptions[selectedConversation.status] || "Unknown"}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <DataField 
            label="Disconnection Reason" 
            value={selectedConversation.disconnectionReason === "agent_hangup" ? "Agent Hangup" : "User Hangup"}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
        </div>
      ) : (
        <div className="p-4 text-gray-500" style={{ color: colors.textSecondary }}>No call selected</div>
      )}
    </div>
  );
};

export default CallDetails;