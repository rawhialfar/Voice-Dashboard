// components/UpdateAgentModal.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UpdateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentUpdated: () => void;
  isDarkMode: boolean;
  colors: {
    bg: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    danger: string;
  };
  agent: {
    agentId: string;
    agentGeneralInfo: {
      agent_name: string;
      voice_id: string;
      language: string;
      max_call_duration_ms?: number;
      interruption_sensitivity?: number;
      allow_user_dtmf?: boolean;
      webhook_url?: string;
    };
  } | null;
}

const UpdateAgentModal: React.FC<UpdateAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentUpdated,
  isDarkMode,
  colors,
  agent,
}) => {
  const [updates, setUpdates] = useState({
    agent_name: '',
    voice_id: '11labs-Cimo',
    language: 'en-US',
    max_call_duration_ms: 3600000,
    interruption_sensitivity: 0.9,
    allow_user_dtmf: true,
    webhook_url: '',
    general_prompt: '',
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize form with agent data
  useEffect(() => {
    if (agent) {
      setUpdates({
        agent_name: agent.agentGeneralInfo.agent_name || '',
        voice_id: agent.agentGeneralInfo.voice_id || '11labs-Cimo',
        language: agent.agentGeneralInfo.language || 'en-US',
        max_call_duration_ms: agent.agentGeneralInfo.max_call_duration_ms || 3600000,
        interruption_sensitivity: agent.agentGeneralInfo.interruption_sensitivity || 0.9,
        allow_user_dtmf: agent.agentGeneralInfo.allow_user_dtmf !== false,
        webhook_url: agent.agentGeneralInfo.webhook_url || '',
        general_prompt: '',
      });
      setError(null);
      setSuccess(null);
      setShowAdvanced(false);
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare updates for the API
      const updateData: any = {};
      
      // Only include changed fields
      if (updates.agent_name !== agent.agentGeneralInfo.agent_name) {
        updateData.agent_name = updates.agent_name;
      }
      if (updates.voice_id !== agent.agentGeneralInfo.voice_id) {
        updateData.voice_id = updates.voice_id;
      }
      if (updates.language !== agent.agentGeneralInfo.language) {
        updateData.language = updates.language;
      }
      if (updates.max_call_duration_ms !== (agent.agentGeneralInfo.max_call_duration_ms || 3600000)) {
        updateData.max_call_duration_ms = updates.max_call_duration_ms;
      }
      if (updates.interruption_sensitivity !== (agent.agentGeneralInfo.interruption_sensitivity || 0.9)) {
        updateData.interruption_sensitivity = updates.interruption_sensitivity;
      }
      if (updates.allow_user_dtmf !== (agent.agentGeneralInfo.allow_user_dtmf !== false)) {
        updateData.allow_user_dtmf = updates.allow_user_dtmf;
      }
      if (updates.webhook_url !== (agent.agentGeneralInfo.webhook_url || '')) {
        updateData.webhook_url = updates.webhook_url;
      }
      
      // Call your update API
      const response = await fetch(`/api/retell/agent/${agent.agentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent');
      }

      const result = await response.json();
      
      setSuccess('Agent updated successfully!');
      
      // Refresh and close after delay
      setTimeout(() => {
        onAgentUpdated();
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to update agent. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setUpdates({
      agent_name: '',
      voice_id: '11labs-Cimo',
      language: 'en-US',
      max_call_duration_ms: 3600000,
      interruption_sensitivity: 0.9,
      allow_user_dtmf: true,
      webhook_url: '',
      general_prompt: '',
    });
    setError(null);
    setSuccess(null);
    setShowAdvanced(false);
    onClose();
  };

  if (!isOpen || !agent) return null;

  const voiceOptions = [
    { value: '11labs-Cimo', label: 'Cimo (Male, Professional)' },
    { value: '11labs-Jenny', label: 'Jenny (Female, Friendly)' },
    { value: '11labs-Adam', label: 'Adam (Male, Authoritative)' },
    { value: '11labs-Bella', label: 'Bella (Female, Calm)' },
    { value: '11labs-Domi', label: 'Domi (Female, Energetic)' },
    { value: '11labs-Arnold', label: 'Arnold (Male, Deep)' },
    { value: '11labs-Antoni', label: 'Antoni (Male, Clear)' },
    { value: '11labs-Josh', label: 'Josh (Male, Casual)' },
    { value: '11labs-Rachel', label: 'Rachel (Female, Professional)' },
    { value: '11labs-Sam', label: 'Sam (Male, Friendly)' },
  ];

  const languageOptions = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'ko-KR', label: 'Korean' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'pt-PT', label: 'Portuguese' },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl" style={{ color: colors.text }}>
              Update Agent: <br /> {agent.agentGeneralInfo.agent_name}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-[100%] transition-colors"
              style={{ color: colors.text }}
              disabled={isUpdating}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Agent Name *
              </label>
              <input
                type="text"
                value={updates.agent_name}
                onChange={(e) => setUpdates({ ...updates, agent_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                placeholder="Enter agent name"
                required
                disabled={isUpdating}
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Voice
              </label>
              <select
                value={updates.voice_id}
                onChange={(e) => setUpdates({ ...updates, voice_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                disabled={isUpdating}
              >
                {voiceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Language
              </label>
              <select
                value={updates.language}
                onChange={(e) => setUpdates({ ...updates, language: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                disabled={isUpdating}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Webhook URL
                <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                  (Optional - for call events)
                </span>
              </label>
              <input
                type="url"
                value={updates.webhook_url}
                onChange={(e) => setUpdates({ ...updates, webhook_url: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                placeholder="https://your-webhook.com/events"
                disabled={isUpdating}
              />
            </div>

            {/* Advanced Settings Toggle */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="mr-2"
                  disabled={isUpdating}
                />
                <span style={{ color: colors.text }}>Show Advanced Settings</span>
              </label>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 p-4 rounded-lg border animate-slideDown" style={{ borderColor: colors.border }}>
                <h3 className="font-medium" style={{ color: colors.text }}>Advanced Settings</h3>
                
                {/* Interruption Sensitivity */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Interruption Sensitivity: {updates.interruption_sensitivity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={updates.interruption_sensitivity}
                    onChange={(e) => setUpdates({ ...updates, interruption_sensitivity: parseFloat(e.target.value) })}
                    className="w-full"
                    disabled={isUpdating}
                  />
                  <div className="flex justify-between text-xs" style={{ color: colors.textSecondary }}>
                    <span>Less Sensitive (0.1)</span>
                    <span>Default (0.9)</span>
                    <span>More Sensitive (1.0)</span>
                  </div>
                </div>

                {/* Max Call Duration */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Max Call Duration: {Math.round(updates.max_call_duration_ms / 60000)} minutes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={updates.max_call_duration_ms / 60000}
                    onChange={(e) => setUpdates({ ...updates, max_call_duration_ms: parseInt(e.target.value) * 60000 })}
                    className="w-full"
                    disabled={isUpdating}
                  />
                  <div className="flex justify-between text-xs" style={{ color: colors.textSecondary }}>
                    <span>1 min</span>
                    <span>30 mins</span>
                    <span>60 mins</span>
                  </div>
                </div>

                {/* Allow DTMF */}
                <div className="flex items-center justify-between">
                  <div>
                    <span style={{ color: colors.text }}>Allow User DTMF Input</span>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Allows users to press numbers during the call
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updates.allow_user_dtmf}
                      onChange={(e) => setUpdates({ ...updates, allow_user_dtmf: e.target.checked })}
                      className="sr-only peer"
                      disabled={isUpdating}
                    />
                    <div 
                      className={`w-11 h-6 rounded-full peer transition-colors ${
                        updates.allow_user_dtmf 
                          ? 'bg-blue-600' 
                          : 'bg-gray-400 dark:bg-gray-600'
                      } ${isUpdating ? 'opacity-50' : ''}`}
                    >
                      <div 
                        className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform ${
                          updates.allow_user_dtmf ? 'transform translate-x-5' : ''
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-fadeIn">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 animate-fadeIn">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 rounded-lg border font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: colors.border, color: colors.text }}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || !updates.agent_name.trim()}
                className="flex-1 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                style={{ 
                  backgroundColor: colors.accent,
                  color: 'white'
                }}
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAgentModal;