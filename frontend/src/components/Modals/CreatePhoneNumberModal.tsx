// components/phone-numbers/CreatePhoneNumberModal.tsx
import React, { useState } from 'react';
import { XMarkIcon, PhoneIcon, GlobeAmericasIcon } from '@heroicons/react/24/outline';
import { createPhoneNumber } from '../../api/retell';

interface CreatePhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  isDarkMode: boolean;
  colors: {
    bg: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
  };
  agents: Array<{ agentId: string; name: string }>;
}

const CreatePhoneNumberModal: React.FC<CreatePhoneNumberModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  isDarkMode,
  colors,
  agents,
}) => {
  const [formData, setFormData] = useState({
    area_code: '',
    phone_number: '',
    phone_number_type: 'retell-twilio',
    nickname: '',
    inbound_agent_id: '',
    outbound_agent_id: '',
    inbound_webhook_url: '',
    inbound_allowed_countries: ['US'],
    outbound_allowed_countries: ['US'],
  });
  const [selectedCountry, setSelectedCountry] = useState('US');

  const DIAL_CODES: Record<string, string> = {
    US: '+1',
    CA: '+1',
    GB: '+44',
    AU: '+61',
    DE: '+49',
    FR: '+33',
    JP: '+81',
    IN: '+91',
    BR: '+55',
    MX: '+52',
  };
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);


  const countryCodes = [
    'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'IN', 'BR', 'MX'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.area_code) {
      setError('Area code is required');
      return;
    }
    
    setIsCreating(true);
    setError(null);

    try {
      // compute final phone number to send
      let finalPhoneNumber: string | undefined = undefined;
      const rawInput = (formData.phone_number || '').trim();
      const dial = DIAL_CODES[selectedCountry] || '+1';

      if (rawInput.startsWith('+')) {
        finalPhoneNumber = rawInput;
      } else if (rawInput.length > 0) {
        const digits = rawInput.replace(/\D/g, '');
        finalPhoneNumber = `${dial}${digits}`;
      } else if (formData.area_code) {
        finalPhoneNumber = `${dial}${formData.area_code}`;
      }

      await createPhoneNumber({
        phone_number: finalPhoneNumber,
        area_code: parseInt(formData.area_code),
        phone_number_type: formData.phone_number_type || undefined,
        nickname: formData.nickname || undefined,
        inbound_agent_id: formData.inbound_agent_id || undefined,
        outbound_agent_id: formData.outbound_agent_id || undefined,
        inbound_webhook_url: formData.inbound_webhook_url || undefined,
        inbound_allowed_countries: formData.inbound_allowed_countries.length > 0 
          ? formData.inbound_allowed_countries 
          : undefined,
        outbound_allowed_countries: formData.outbound_allowed_countries.length > 0 
          ? formData.outbound_allowed_countries 
          : undefined,
      });

      onCreated();
      onClose();
      
      // Reset form
      setFormData({
        phone_number: '',
        area_code: '',
        phone_number_type: 'retell-twilio',
        nickname: '',
        inbound_agent_id: '',
        outbound_agent_id: '',
        inbound_webhook_url: '',
        inbound_allowed_countries: ['US'],
        outbound_allowed_countries: ['US'],
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to create phone number');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      phone_number: '',
      area_code: '',
      phone_number_type: 'retell-twilio',
      nickname: '',
      inbound_agent_id: '',
      outbound_agent_id: '',
      inbound_webhook_url: '',
      inbound_allowed_countries: ['US'],
      outbound_allowed_countries: ['US'],
    });
    setError(null);
    setShowAdvanced(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
              <PhoneIcon className="w-5 h-5 inline mr-2" />
              Add New Phone Number
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-opacity-20"
              style={{ color: colors.text }}
              disabled={isCreating}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Area Code */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Area Code *
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                value={formData.area_code}
                onChange={(e) => setFormData({ ...formData, area_code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                placeholder="e.g. 289"
                required
                disabled={isCreating}
              />
            </div>

            <div className="flex items-center gap-3">
              <div style={{ minWidth: 140 }}>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderColor: colors.border, color: colors.text }}
                  disabled={isCreating}
                >
                  {countryCodes.map((c) => (
                    <option key={c} value={c}>{c} ({DIAL_CODES[c] || '+'})</option>
                  ))}
                </select>
              </div>

              <div style={{ minWidth: 180 }}>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Number Type
                </label>
                <select
                  value={formData.phone_number_type}
                  onChange={(e) => setFormData({ ...formData, phone_number_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderColor: colors.border, color: colors.text }}
                  disabled={isCreating}
                >
                  <option value="retell-twilio">retell-twilio</option>
                  <option value="retell-telnyx">retell-telnyx</option>
                  <option value="custom">custom</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Phone Number
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 rounded-l-lg border" style={{ backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderColor: colors.border, color: colors.text }}>
                    {DIAL_CODES[selectedCountry] || '+'}
                  </span>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-r-lg border-l-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ 
                      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                      borderColor: colors.border,
                      color: colors.text 
                    }}
                    placeholder="e.g. 4155551234 or 5551234"
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Nickname
                <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                  (Optional - for your reference)
                </span>
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                placeholder="e.g., Sales Line, Support Hotline"
                disabled={isCreating}
              />
            </div>

            {/* Agent Assignments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Inbound Agent
                  <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                    (Optional)
                  </span>
                </label>
                <select
                  value={formData.inbound_agent_id}
                  onChange={(e) => setFormData({ ...formData, inbound_agent_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                    borderColor: colors.border,
                    color: colors.text 
                  }}
                  disabled={isCreating}
                >
                  <option value="">No inbound agent</option>
                  {agents
                    .filter(agent => agent.agentName.toLowerCase().includes('inbound') || true)
                    .map((agent) => (
                      <option key={agent.agentId} value={agent.agentId}>
                        {agent.agentName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Outbound Agent
                  <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                    (Optional)
                  </span>
                </label>
                <select
                  value={formData.outbound_agent_id}
                  onChange={(e) => setFormData({ ...formData, outbound_agent_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                    borderColor: colors.border,
                    color: colors.text 
                  }}
                  disabled={isCreating}
                >
                  <option value="">No outbound agent</option>
                  {agents
                    .filter(agent => agent.agentName.toLowerCase().includes('outbound') || true)
                    .map((agent) => (
                      <option key={agent.agentId} value={agent.agentId}>
                        {agent.agentName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="mr-2"
                  disabled={isCreating}
                />
                <span style={{ color: colors.text }}>
                  <GlobeAmericasIcon className="w-4 h-4 inline mr-1" />
                  Show Advanced Settings
                </span>
              </label>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 p-4 rounded-lg border animate-slideDown" style={{ borderColor: colors.border }}>
                <h3 className="font-medium" style={{ color: colors.text }}>Advanced Settings</h3>
                
                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Inbound Webhook URL
                    <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                      (Optional - for call event handling)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.inbound_webhook_url}
                    onChange={(e) => setFormData({ ...formData, inbound_webhook_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ 
                      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                      borderColor: colors.border,
                      color: colors.text 
                    }}
                    placeholder="https://your-webhook.com/events"
                    disabled={isCreating}
                  />
                </div>

                {/* Country Restrictions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Inbound Allowed Countries
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 rounded border" style={{ borderColor: colors.border }}>
                      {countryCodes.map((country) => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.inbound_allowed_countries.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  inbound_allowed_countries: [...formData.inbound_allowed_countries, country]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  inbound_allowed_countries: formData.inbound_allowed_countries.filter(c => c !== country)
                                });
                              }
                            }}
                            className="mr-2"
                            disabled={isCreating}
                          />
                          <span style={{ color: colors.text }}>{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Outbound Allowed Countries
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 rounded border" style={{ borderColor: colors.border }}>
                      {countryCodes.map((country) => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.outbound_allowed_countries.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  outbound_allowed_countries: [...formData.outbound_allowed_countries, country]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  outbound_allowed_countries: formData.outbound_allowed_countries.filter(c => c !== country)
                                });
                              }
                            }}
                            className="mr-2"
                            disabled={isCreating}
                          />
                          <span style={{ color: colors.text }}>{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-fadeIn">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 rounded-lg border font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: colors.border, color: colors.text }}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !formData.area_code}
                className="flex-1 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                style={{ 
                  backgroundColor: colors.accent,
                  color: 'white'
                }}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Phone Number'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePhoneNumberModal;