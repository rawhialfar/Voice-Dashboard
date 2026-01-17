import React from 'react';

interface PhoneNumber {
  phone_number: string;
  phone_number_pretty: string;
  nickname?: string;
  inbound_agent_id?: string;
  outbound_agent_id?: string;
  phone_number_type?: string;
  area_code?: string;
  inbound_allowed_countries?: string[];
  outbound_allowed_countries?: string[];
  inbound_webhook_url?: string;
  last_modification_timestamp?: string;
}

interface Agent {
  agentId: string;
  agentName: string;
}

interface PhoneNumbersSectionProps {
  // List mode props
  phoneNumbers?: PhoneNumber[];
  selectedPhoneNumber?: PhoneNumber | null;
  onSelectPhoneNumber?: (phoneNumber: PhoneNumber) => void;
  
  // Detail mode props
  selectedPhoneNumber?: PhoneNumber | null;
  agents?: Agent[];
  onUpdatePhoneNumber?: () => void;
  onDeletePhoneNumber?: (phoneNumber: string) => void;
  
  // Shared props
  colors: any;
}

const PhoneNumbersSection: React.FC<PhoneNumbersSectionProps> = ({
  // List props
  phoneNumbers,
  selectedPhoneNumber,
  onSelectPhoneNumber,
  
  // Detail props
  selectedPhoneNumber: detailSelectedPhoneNumber,
  agents,
  onUpdatePhoneNumber,
  onDeletePhoneNumber,
  
  // Shared
  colors
}) => {
  // If we have phoneNumbers array, render the list view
  if (phoneNumbers) {
    return (
      <div 
        className="p-6 rounded-lg border phone-numbers-card mt-6"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        data-onboarding="phone-numbers-management"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Phone Numbers</h2>
          <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.border, color: colors.textSecondary }}>
            {phoneNumbers.length} numbers
          </span>
        </div>
        
        <div className="space-y-3">
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-4" style={{ color: colors.textSecondary }}>
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p>No phone numbers yet</p>
              <p className="text-sm mt-1">Add a phone number to assign to your agents</p>
            </div>
          ) : (
            phoneNumbers.map((pn) => (
              <div
                key={pn.phone_number}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedPhoneNumber?.phone_number === pn.phone_number ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedPhoneNumber?.phone_number === pn.phone_number ? colors.accent + '20' : colors.border + '20',
                  borderColor: selectedPhoneNumber?.phone_number === pn.phone_number ? colors.accent : colors.border,
                  borderWidth: '1px',
                  color: colors.text
                }}
                onClick={() => onSelectPhoneNumber?.(pn)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 p-2 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.accent + '20' }}>
                      <svg className="w-4 h-4" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{pn.nickname || pn.phone_number_pretty}</div>
                      <div className="text-xs flex items-center gap-2 flex-wrap" style={{ color: colors.textSecondary }}>
                        {pn.inbound_agent_id && (
                          <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                            Inbound
                          </span>
                        )}
                        {pn.outbound_agent_id && (
                          <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>
                            Outbound
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <svg className="flex-shrink-0 w-5 h-5 md:w-4 md:h-4" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Otherwise render the detail view
  const phoneNumber = detailSelectedPhoneNumber!;
  
  return (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border phone-number-details-card"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              {phoneNumber.nickname || phoneNumber.phone_number_pretty}
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {phoneNumber.phone_number_pretty}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onUpdatePhoneNumber}
              className="px-4 py-2 rounded-lg  border font-medium hover:opacity-90 transition-opacity"
              style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBg }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </div>
            </button>
            <button
              onClick={() => onDeletePhoneNumber?.(phoneNumber.phone_number)}
              className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.danger, color: 'white' }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </div>
            </button>
          </div>
        </div>

        {/* Phone Number Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
            <p className="text-xs" style={{ color: colors.textSecondary }}>E.164 Format</p>
            <p className="font-mono text-sm font-medium" style={{ color: colors.text }}>
              {phoneNumber.phone_number}
            </p>
          </div>
          <div className="p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Provider</p>
            <p className="text-sm font-medium" style={{ color: colors.text }}>
              {phoneNumber.phone_number_type}
            </p>
          </div>
        </div>

        {/* Agent Assignments */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Agent Assignments</h3>
            <div className="space-y-3">
              {phoneNumber.inbound_agent_id ? (
                <div className="p-3 rounded-lg border flex items-center justify-between" style={{ borderColor: colors.success, backgroundColor: colors.success + '10' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.success + '20' }}>
                      <svg className="w-5 h-5" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Inbound Agent</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        Assigned to: {agents?.find(a => a.agentId === phoneNumber.inbound_agent_id)?.agentName || 'Unknown Agent'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                    Active
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.border + '20' }}>
                      <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Inbound Agent</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        No inbound agent assigned
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {phoneNumber.outbound_agent_id ? (
                <div className="p-3 rounded-lg border flex items-center justify-between" style={{ borderColor: colors.accent, backgroundColor: colors.accent + '10' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.accent + '20' }}>
                      <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Outbound Agent</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        Assigned to: {agents?.find(a => a.agentId === phoneNumber.outbound_agent_id)?.agentName || 'Unknown Agent'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>
                    Active
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.border + '20' }}>
                      <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Outbound Agent</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        No outbound agent assigned
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="font-semibold mb-2">Additional Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Area Code</p>
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  {phoneNumber.area_code ? `(${phoneNumber.area_code})` : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Last Modified</p>
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  {phoneNumber.last_modification_timestamp 
                    ? new Date(phoneNumber.last_modification_timestamp).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumbersSection;