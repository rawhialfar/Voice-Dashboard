import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createRetellAgent, VOICE_IDS, LANGUAGES } from '../../api/retell';
import { listKnowledgebases } from '../../api/knowledgebase';

interface AgentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void; 
  isDarkMode: boolean;
  colors: {
    bg: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
}

const AgentCreationModal: React.FC<AgentCreationModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
  isDarkMode,
  colors,
}) => {
  const [newAgent, setNewAgent] = useState({
    name: '',
    type: 'inbound' as 'inbound' | 'outbound',
    voiceId: '11labs-Cimo',
    language: 'en-US',
    interruptionSensitivity: 0.9,
    maxCallDurationMs: 3600000,
    allowUserDtmf: true,
  });
  
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoadingKb, setIsLoadingKb] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchKnowledgeBases();
    }
  }, [isOpen]);

  const fetchKnowledgeBases = async () => {
    setIsLoadingKb(true);
    try {
      const data = await listKnowledgebases();
      setKnowledgeBases(data);
    } catch (err) {
      console.error('Failed to fetch knowledge bases:', err);
    } finally {
      setIsLoadingKb(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAgent(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createRetellAgent({
        agentName: newAgent.name,
        agentType: newAgent.type,
        voiceId: newAgent.voiceId,
        language: newAgent.language,
        knowledgeBaseNames: selectedKnowledgeBases,
        customSettings: {
          interruptionSensitivity: newAgent.interruptionSensitivity,
          maxCallDurationMs: newAgent.maxCallDurationMs,
          allowUserDtmf: newAgent.allowUserDtmf,
        },
      });

      setSuccess(`Agent "${result.agentName}" created successfully!`);
      
      setNewAgent({
        name: '',
        type: 'inbound',
        voiceId: '11labs-Cimo',
        language: 'en-US',
        interruptionSensitivity: 0.9,
        maxCallDurationMs: 3600000,
        allowUserDtmf: true,
      });
      setSelectedKnowledgeBases([]);
      setShowAdvancedSettings(false);
      
      onAgentCreated();
      
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create agent. Please try again.');
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const handleClose = () => {
    setNewAgent({
      name: '',
      type: 'inbound',
      voiceId: '11labs-Cimo',
      language: 'en-US',
      interruptionSensitivity: 0.9,
      maxCallDurationMs: 3600000,
      allowUserDtmf: true,
    });
    setSelectedKnowledgeBases([]);
    setShowAdvancedSettings(false);
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
      <div className="relative w-full max-w-lg">
        <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Create New Agent</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-opacity-20"
              style={{ color: colors.text }}
              disabled={isCreatingAgent}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateAgent} className="space-y-4">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Agent Name *
              </label>
              <input
                type="text"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                placeholder="e.g., Sales Agent, Customer Support"
                required
                disabled={isCreatingAgent}
              />
            </div>

            {/* Agent Type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Agent Type *
              </label>
              <div className="flex space-x-2">
                {['inbound', 'outbound'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center cursor-pointer p-2 rounded-lg border flex-1 transition-colors ${
                      newAgent.type === type 
                        ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{ borderColor: newAgent.type === type ? '#3b82f6' : colors.border }}
                  >
                    <input
                      type="radio"
                      name="agentType"
                      value={type}
                      checked={newAgent.type === type}
                      onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value as 'inbound' | 'outbound' })}
                      className="mr-2"
                      required
                      disabled={isCreatingAgent}
                    />
                    <span className="capitalize" style={{ color: colors.text }}>
                      {type === 'inbound' ? (
                        <>
                          📞 Inbound
                          <br />
                          <span className="text-sm" style={{ color: colors.textSecondary }}>(Receives calls)</span>
                        </>
                      ) : (
                        <>
                          📤 Outbound
                          <br />
                          <span className="text-sm" style={{ color: colors.textSecondary }}>(Makes calls)</span>
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Voice
              </label>
              <select
                value={newAgent.voiceId}
                onChange={(e) => setNewAgent({ ...newAgent, voiceId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                disabled={isCreatingAgent}
              >
                <option value="11labs-Cimo">Cimo (Male, Professional)</option>
                <option value="11labs-Jenny">Jenny (Female, Friendly)</option>
                <option value="11labs-Adam">Adam (Male, Authoritative)</option>
                <option value="11labs-Bella">Bella (Female, Calm)</option>
                <option value="11labs-Domi">Domi (Female, Energetic)</option>
                <option value="11labs-Arnold">Arnold (Male, Deep)</option>
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Language
              </label>
              <select
                value={newAgent.language}
                onChange={(e) => setNewAgent({ ...newAgent, language: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderColor: colors.border,
                  color: colors.text 
                }}
                disabled={isCreatingAgent}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>

            {/* Knowledge Bases (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Knowledge Bases <span className="text-sm" style={{ color: colors.textSecondary }}>(Optional)</span>
              </label>
              <div 
                className={`space-y-2 max-h-40 overflow-y-auto p-2 rounded-lg border ${
                  isLoadingKb ? 'opacity-50' : ''
                }`} 
                style={{ borderColor: colors.border }}
              >
                {isLoadingKb ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span style={{ color: colors.textSecondary }}>Loading knowledge bases...</span>
                  </div>
                ) : knowledgeBases.length > 0 ? (
                  knowledgeBases.map((kb) => (
                    <label
                      key={kb.knowledge_base_id}
                      className="flex items-center cursor-pointer p-1 hover:bg-opacity-10 rounded transition-colors"
                      style={{ color: colors.text }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedKnowledgeBases.includes(kb.knowledge_base_name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKnowledgeBases([...selectedKnowledgeBases, kb.knowledge_base_name]);
                          } else {
                            setSelectedKnowledgeBases(selectedKnowledgeBases.filter(name => name !== kb.knowledge_base_name));
                          }
                        }}
                        className="mr-2"
                        disabled={isCreatingAgent}
                      />
                      <span className="truncate">{kb.knowledge_base_name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-center py-2 opacity-70" style={{ color: colors.textSecondary }}>
                    No knowledge bases found. Create one first.
                  </p>
                )}
              </div>
              {selectedKnowledgeBases.length > 0 && (
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Selected: {selectedKnowledgeBases.join(', ')}
                </p>
              )}
            </div>

            {/* Advanced Settings Toggle */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdvancedSettings}
                  onChange={(e) => setShowAdvancedSettings(e.target.checked)}
                  className="mr-2"
                  disabled={isCreatingAgent}
                />
                <span style={{ color: colors.text }}>Show Advanced Settings</span>
              </label>
            </div>

            {/* Advanced Settings */}
            {showAdvancedSettings && (
              <div className="space-y-4 p-4 rounded-lg border animate-slideDown" style={{ borderColor: colors.border }}>
                <h3 className="font-medium" style={{ color: colors.text }}>Advanced Settings</h3>
                
                {/* Interruption Sensitivity */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Interruption Sensitivity: {newAgent.interruptionSensitivity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newAgent.interruptionSensitivity}
                    onChange={(e) => setNewAgent({ ...newAgent, interruptionSensitivity: parseFloat(e.target.value) })}
                    className="w-full"
                    disabled={isCreatingAgent}
                  />
                  <div className="flex justify-between text-xs" style={{ color: colors.textSecondary }}>
                    <span>Less Sensitive</span>
                    <span>More Sensitive</span>
                  </div>
                </div>

                {/* Max Call Duration */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Max Call Duration: {newAgent.maxCallDurationMs / 60000} minutes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={newAgent.maxCallDurationMs / 60000}
                    onChange={(e) => setNewAgent({ ...newAgent, maxCallDurationMs: parseInt(e.target.value) * 60000 })}
                    className="w-full"
                    disabled={isCreatingAgent}
                  />
                  <div className="flex justify-between text-xs" style={{ color: colors.textSecondary }}>
                    <span>1 min</span>
                    <span>60 mins</span>
                  </div>
                </div>

                {/* Allow DTMF */}
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text }}>Allow User DTMF Input</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAgent.allowUserDtmf}
                      onChange={(e) => setNewAgent({ ...newAgent, allowUserDtmf: e.target.checked })}
                      className="sr-only peer"
                      disabled={isCreatingAgent}
                    />
                    <div 
                      className={`w-11 h-6 rounded-full peer transition-colors ${
                        newAgent.allowUserDtmf 
                          ? 'bg-blue-600' 
                          : 'bg-gray-400 dark:bg-gray-600'
                      } ${isCreatingAgent ? 'opacity-50' : ''}`}
                    >
                      <div 
                        className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform ${
                          newAgent.allowUserDtmf ? 'transform translate-x-5' : ''
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
                disabled={isCreatingAgent}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingAgent || !newAgent.name.trim()}
                className="flex-1 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                {isCreatingAgent ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentCreationModal;