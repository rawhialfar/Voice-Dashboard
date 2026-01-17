// components/phone-numbers/UpdatePhoneNumberModal.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import { updatePhoneNumber } from '../../api/retell';

interface UpdatePhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDelete: (phoneNumber: string) => Promise<void>;
  isDarkMode: boolean;
  colors: {
    bg: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    danger: string;
    success: string;
  };
  agents: Array<{ agentId: string; name: string }>;
  phoneNumber: {
    phone_number: string;
    phone_number_pretty: string;
    nickname?: string;
    inbound_agent_id?: string;
    outbound_agent_id?: string;
    inbound_webhook_url?: string;
    inbound_allowed_countries?: string[];
    outbound_allowed_countries?: string[];
  } | null;
}

const UpdatePhoneNumberModal: React.FC<UpdatePhoneNumberModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  onDelete,
  isDarkMode,
  colors,
  agents,
  phoneNumber,
}) => {
  const [formData, setFormData] = useState({
    nickname: '',
    inbound_agent_id: '',
    outbound_agent_id: '',
    inbound_webhook_url: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (phoneNumber) {
      setFormData({
        nickname: phoneNumber.nickname || '',
        inbound_agent_id: phoneNumber.inbound_agent_id || '',
        outbound_agent_id: phoneNumber.outbound_agent_id || '',
        inbound_webhook_url: phoneNumber.inbound_webhook_url || '',
      });
      setError(null);
      setSuccess(null);
    }
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePhoneNumber(phoneNumber.phone_number, {
        nickname: formData.nickname || undefined,
        inbound_agent_id: formData.inbound_agent_id || null,
        outbound_agent_id: formData.outbound_agent_id || null,
        inbound_webhook_url: formData.inbound_webhook_url || undefined,
      });

      setSuccess('Phone number updated successfully!');
      
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update phone number');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!phoneNumber) return;
    if (!confirm(`Are you sure you want to delete ${phoneNumber.phone_number_pretty}? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(phoneNumber.phone_number);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete phone number');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nickname: '',
      inbound_agent_id: '',
      outbound_agent_id: '',
      inbound_webhook_url: '',
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen || !phoneNumber) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-semibold" style={{ color: colors.text }}>
                Update Phone Number
              </h2>
              <p className="text-md mt-2" style={{ color: colors.textSecondary }}>
                <PhoneIcon className="w-5 h-5 inline mr-2" />
                {phoneNumber.phone_number_pretty}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-[100%] transition-colors"
              style={{ color: colors.text }}
              disabled={isUpdating || isDeleting}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Phone Number Info */}
          <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border + '10' }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Phone Number</p>
                <p className="font-medium" style={{ color: colors.text }}>{phoneNumber.phone_number_pretty}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: colors.textSecondary }}>E.164 Format</p>
                <p className="font-mono text-sm" style={{ color: colors.text }}>{phoneNumber.phone_number}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Nickname
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
                placeholder="Give this number a friendly name"
                disabled={isUpdating || isDeleting}
              />
            </div>

            {/* Agent Assignments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Inbound Agent
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
                  disabled={isUpdating || isDeleting}
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
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  Agent to handle incoming calls
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Outbound Agent
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
                  disabled={isUpdating || isDeleting}
                >
                  <option value="">No outbound agent</option>
                  {agents
                    .filter(agent => agent?.agentName.toLowerCase().includes('outbound') || true)
                    .map((agent) => (
                      <option key={agent.agentId} value={agent.agentId}>
                        {agent.agentName}
                      </option>
                    ))}
                </select>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  Agent to handle outgoing calls
                </p>
              </div>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                Inbound Webhook URL
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
                disabled={isUpdating || isDeleting}
              />
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                For custom call event handling and dynamic agent routing
              </p>
            </div>

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
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="flex-1 py-2 rounded-lg border font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: colors.danger,
                  color: colors.danger
                }}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Number
                  </span>
                )}
              </button>
              
              <div className="flex space-x-3 flex-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 rounded-lg border font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ borderColor: colors.border, color: colors.text }}
                  disabled={isUpdating || isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isDeleting}
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
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePhoneNumberModal;