import React, { useState, useEffect } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import { 
  getRetellAgents, 
  getRetellAgentDetails, 
  deleteRetellAgent,
  addKnowledgebaseToRetellAgent,
  deleteKnowledgebaseFromRetellAgent,
  type RetellAgent, 
  getPhoneNumbers,
  deletePhoneNumber,
  type PhoneNumber
} from "../api/retell";
import { 
  listKnowledgebases,
  createKnowledgebase,
  addTextSource,
  addFileSource,
  addUrlSource,
  listSources,
  deleteSource,
  deleteKnowledgebase,
  type Knowledgebase 
} from "../api/knowledgebase";
import { RefreshCw } from 'lucide-react';
import AgentCreationModal from '../components/Modals/AgentCreationModal';
import UpdateAgentModal from '../components/Modals/UpdateAgentModal';
import CreatePhoneNumberModal from '../components/Modals/CreatePhoneNumberModal';
import UpdatePhoneNumberModal from '../components/Modals/UpdatePhoneNumberModal';
import { useOnboarding } from '../components/Onboarding/OnboardingManager';
import AgentsSection from '../components/VoiceAgents/AgentsSection';
import KnowledgeBasesSection from '../components/VoiceAgents/KnowledgeBasesSection';
import PhoneNumbersSection from '../components/VoiceAgents/PhoneNumbersSection';

const VoiceAgents: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [agents, setAgents] = useState<RetellAgent[]>([]);
  const [knowledgebases, setKnowledgebases] = useState<Knowledgebase[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [selectedKnowledgebase, setSelectedKnowledgebase] = useState<string | null>(null);
  const [knowledgebaseSources, setKnowledgebaseSources] = useState<any[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [knowledgebaseLoading, setKnowledgebaseLoading] = useState(false);
  const [addingKnowledgebase, setAddingKnowledgebase] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showUpdateAgent, setShowUpdateAgent] = useState(false);
  const [showCreateKnowledgebase, setShowCreateKnowledgebase] = useState(false);
  const [showAddTextSource, setShowAddTextSource] = useState(false);
  const [showAddFileSource, setShowAddFileSource] = useState(false);
  const [showAddUrlSource, setShowAddUrlSource] = useState(false);
  const [showCreatePhoneNumber, setShowCreatePhoneNumber] = useState(false);
  const [showUpdatePhoneNumber, setShowUpdatePhoneNumber] = useState(false);
  
  // Form states
  const [agentToUpdate, setAgentToUpdate] = useState<any>(null);
  const [newKnowledgebaseName, setNewKnowledgebaseName] = useState('');
  const [newTextTitle, setNewTextTitle] = useState('');
  const [newTextContent, setNewTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [selectedKnowledgebaseForAgent, setSelectedKnowledgebaseForAgent] = useState<string>('');

  const { shouldShowOnboarding, startOnboarding, setPageReady } = useOnboarding();

  const colors = {
    bg: isDarkMode ? "#1E2939" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#000000",
    textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
    cardBg: isDarkMode ? "#2A3648" : "#f8f9fa",
    border: isDarkMode ? "#4A5568" : "#e5e5e5",
    button: isDarkMode ? "#0060faff" : "#3B82F6",
    danger: isDarkMode ? "#ef4444" : "#dc2626",
    success: isDarkMode ? "#10b981" : "#059669",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPageReady('voice-agents', true);
    if (shouldShowOnboarding('voice-agents')) {
      startOnboarding('voice-agents');
    }
  }, [setPageReady, shouldShowOnboarding, startOnboarding]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentsData, knowledgebasesData, phoneNumbersData] = await Promise.all([
        getRetellAgents(),
        listKnowledgebases(),
        getPhoneNumbers()
      ]);
      setAgents(agentsData);
      setKnowledgebases(knowledgebasesData);
      setPhoneNumbers(phoneNumbersData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSelectAgent = async (agentId: string) => {
    try {
      setSelectedAgent(agentId);
      const details = await getRetellAgentDetails(agentId);
      setAgentDetails(details);
      setSelectedPhoneNumber(null);
      setSelectedKnowledgebase(null);
      setKnowledgebaseSources([]);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load agent details:', err);
      setError(err.message || 'Failed to load agent details');
    }
  };

  const handleSelectKnowledgebase = async (knowledgebaseName: string) => {
    try {
      setSelectedKnowledgebase(knowledgebaseName);
      setKnowledgebaseLoading(true);
      const sources = await listSources(knowledgebaseName);
      setKnowledgebaseSources(sources.knowledgebaseSources);
      setSelectedAgent(null);
      setSelectedPhoneNumber(null);
      setAgentDetails(null);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load knowledgebase sources:', err);
      setError(err.message || 'Failed to load knowledgebase sources');
    } finally {
      setKnowledgebaseLoading(false);
    }
  };

  const handleSelectPhoneNumber = async (phoneNumber: PhoneNumber) => {
    try {
      setSelectedPhoneNumber(phoneNumber);
      setSelectedAgent(null);
      setSelectedKnowledgebase(null);
      setAgentDetails(null);
      setKnowledgebaseSources([]);
      setError(null);
    } catch (err: any) {
      console.error('Failed to select phone number:', err);
      setError(err.message || 'Failed to load phone number details');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) return;
    
    try {
      await deleteRetellAgent(agentId);
      setAgents(agents.filter(agent => agent.agentId !== agentId));
      if (selectedAgent === agentId) {
        setSelectedAgent(null);
        setAgentDetails(null);
      }
      setSuccess('Agent deleted successfully');
      setError(null);
    } catch (err: any) {
      console.error('Failed to delete agent:', err);
      setError(err.message || 'Failed to delete agent');
    }
  };

  const handleCreateKnowledgebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnowledgebaseName.trim()) {
      setError('Knowledgebase name is required');
      return;
    }
    
    try {
      await createKnowledgebase(newKnowledgebaseName);
      setNewKnowledgebaseName('');
      setShowCreateKnowledgebase(false);
      await fetchData();
      setSuccess('Knowledge base created successfully');
      setError(null);
    } catch (err: any) {
      console.error('Failed to create knowledgebase:', err);
      setError(err.message || 'Failed to create knowledgebase');
    }
  };

  const handleAddTextSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKnowledgebase || !newTextTitle.trim() || !newTextContent.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      await addTextSource(selectedKnowledgebase, newTextTitle, newTextContent);
      setNewTextTitle('');
      setNewTextContent('');
      setShowAddTextSource(false);
      await handleSelectKnowledgebase(selectedKnowledgebase);
      setSuccess('Text source added successfully');
      setError(null);
    } catch (err: any) {
      console.error('Failed to add text source:', err);
      setError(err.message || 'Failed to add text source');
    }
  };

  const handleAddFileSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKnowledgebase || !selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      await addFileSource(selectedKnowledgebase, selectedFile);
      setSelectedFile(null);
      setShowAddFileSource(false);
      await handleSelectKnowledgebase(selectedKnowledgebase);
      setSuccess('File uploaded successfully');
      setError(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to add file source:', err);
      setError(err.message || 'Failed to add file source');
    }
  };

  const handleAddUrlSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKnowledgebase || !newUrl.trim()) {
      setError('URL is required');
      return;
    }
    
    try {
      await addUrlSource(selectedKnowledgebase, newUrl);
      setNewUrl('');
      setShowAddUrlSource(false);
      await handleSelectKnowledgebase(selectedKnowledgebase);
      setSuccess('URL source added successfully');
      setError(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to add URL source:', err);
      setError(err.message || 'Failed to add URL source');
    }
  };

  const handleDeleteSource = async (type: string, sourceName: string) => {
    if (!selectedKnowledgebase) return;
    if (!confirm('Are you sure you want to delete this source?')) return;
    
    try {
      await deleteSource(selectedKnowledgebase, type, sourceName);
      await handleSelectKnowledgebase(selectedKnowledgebase);
      setSuccess('Source deleted successfully');
      setError(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete source:', err);
      setError(err.message || 'Failed to delete source');
    }
  };

  const handleDeleteKnowledgebase = async (knowledgebaseName: string) => {
    if (!confirm('Are you sure you want to delete this knowledgebase? This action cannot be undone.')) return;
    
    try {
      await deleteKnowledgebase(knowledgebaseName);
      await fetchData();
      setSuccess('Knowledge base deleted successfully');
      setError(null);
    } catch (err: any) {
      console.error('Failed to delete knowledgebase:', err);
      setError(err.message || 'Failed to delete knowledgebase');
    }
  };

  const handleAddKnowledgebaseToAgent = async () => {
    if (!selectedAgent || !selectedKnowledgebaseForAgent) {
      setError('Please select an agent and a knowledgebase');
      return;
    }
    
    try {
      setAddingKnowledgebase(true);
      await addKnowledgebaseToRetellAgent(selectedAgent, selectedKnowledgebaseForAgent);
      await handleSelectAgent(selectedAgent);
      setSelectedKnowledgebaseForAgent('');
      setSuccess('Knowledge base added to agent successfully');
      setError(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to add knowledgebase to agent:', err);
      setError(err.message || 'Failed to add knowledgebase to agent');
    } finally {
      setAddingKnowledgebase(false);
    }
  };

  const handleRemoveKnowledgebaseFromAgent = async (knowledgebaseName: string) => {
    if (!selectedAgent || !knowledgebaseName) return;
    if (!confirm('Are you sure you want to remove this knowledge base from the agent?')) return;
    
    try {
      await deleteKnowledgebaseFromRetellAgent(selectedAgent, knowledgebaseName);
      await handleSelectAgent(selectedAgent);
      setSuccess('Knowledge base removed from agent');
      setError(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to remove knowledgebase from agent:', err);
      setError(err.message || 'Failed to remove knowledgebase from agent');
    }
  };

  const handleDeletePhoneNumber = async (phoneNumber: string) => {
    if (!confirm('Are you sure you want to delete this phone number? This action cannot be undone.')) {
      return;
    }

    try {
      await deletePhoneNumber(phoneNumber);
      setPhoneNumbers(phoneNumbers.filter(pn => pn.phone_number !== phoneNumber));
      
      if (selectedPhoneNumber?.phone_number === phoneNumber) {
        setSelectedPhoneNumber(null);
      }
      
      setSuccess('Phone number deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete phone number');
    }
  };

  const getFilteredPhoneNumbers = () => {
    if (!phoneNumbers.length || !agents.length) return [];
    
    const userAgentIds = agents.map(agent => agent.agentId);
    
    return phoneNumbers.filter(phoneNumber => {
      return (
        phoneNumber.inbound_agent_id && userAgentIds.includes(phoneNumber.inbound_agent_id) ||
        phoneNumber.outbound_agent_id && userAgentIds.includes(phoneNumber.outbound_agent_id)
      );
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="text-lg" style={{ color: colors.text }}>Loading voice agents...</div>
      </div>
    );
  }

  return (
    <div 
      className="p-8 w-full h-[calc(100vh)] overflow-y-auto"
      style={{ backgroundColor: colors.bg, color: colors.text }}
      data-onboarding="voiceagents"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold voice-agents-container">Voice Agents</h1>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors refresh-voice-agents"
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.cardBg,
            color: colors.text 
          }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${colors.success}20`, borderColor: colors.success }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ color: colors.text }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto p-1 rounded hover:bg-opacity-20"
              style={{ color: colors.text }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${colors.danger}20`, borderColor: colors.danger }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" style={{ color: colors.danger }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ color: colors.text }}>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 rounded hover:bg-opacity-20"
              style={{ color: colors.text }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Lists */}
        <div className="lg:col-span-1 space-y-6">
          <AgentsSection
            agents={agents}
            selectedAgent={selectedAgent}
            colors={colors}
            onSelectAgent={handleSelectAgent}
            onCreateAgent={() => setShowCreateAgent(true)}
            showCreateAgent={showCreateAgent}
          />

          <KnowledgeBasesSection
            knowledgebases={knowledgebases}
            selectedKnowledgebase={selectedKnowledgebase}
            colors={colors}
            onSelectKnowledgebase={handleSelectKnowledgebase}
            onCreateKnowledgebase={() => setShowCreateKnowledgebase(true)}
          />

          <PhoneNumbersSection
            phoneNumbers={getFilteredPhoneNumbers()}
            selectedPhoneNumber={selectedPhoneNumber}
            colors={colors}
            onSelectPhoneNumber={handleSelectPhoneNumber}
          />
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          {/* Render appropriate details section */}
          {selectedAgent && agentDetails ? (
            <div className="space-y-6">
              <div 
                className="p-6 rounded-lg border agent-details-card"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-semibold mb-1">{agentDetails.agentGeneralInfo.agent_name}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAgentToUpdate({
                          agentId: selectedAgent,
                          agentGeneralInfo: agentDetails.agentGeneralInfo,
                        });
                        setShowUpdateAgent(true);
                      }}
                      data-onboarding="configure-agent-button"
                      className="px-4 py-2 rounded-lg border font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBg }}
                      disabled={!selectedAgent || !agentDetails}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configure
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(selectedAgent)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border font-medium text-sm sm:text-base"
                      style={{ borderColor: colors.danger, color: colors.danger }}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="whitespace-nowrap">Delete</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Agent Info Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.border + '20', color: colors.text }}>
                    ID: {agentDetails.agentGeneralInfo.agent_id.substring(0, 8)}...
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.border + '20', color: colors.text }}>
                    Voice: {agentDetails.agentGeneralInfo.voice_id.substring(0, 8)}...
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.border + '20', color: colors.text }}>
                    LLM: {agentDetails.agentGeneralInfo.response_engine.llm_id.substring(0, 8)}...
                  </div>
                </div>

                {/* Add Knowledge Base Section */}
                <div className="add-knowledgebase-section mb-8">
                  <h3 className="font-semibold mb-3">Add Knowledge Base</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedKnowledgebaseForAgent}
                      onChange={(e) => setSelectedKnowledgebaseForAgent(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border"
                      style={{ 
                        backgroundColor: colors.cardBg, 
                        borderColor: colors.border,
                        color: colors.text
                      }}
                      disabled={addingKnowledgebase}
                    >
                      <option value="">Select a knowledge base</option>
                      {knowledgebases.map(kb => (
                        <option key={kb.knowledge_base_id} value={kb.knowledge_base_name}>
                          {kb.knowledge_base_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddKnowledgebaseToAgent}
                      disabled={!selectedKnowledgebaseForAgent || addingKnowledgebase}
                      className={`px-4 py-2 rounded-lg font-medium ${!selectedKnowledgebaseForAgent || addingKnowledgebase ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: colors.accent, color: 'white' }}
                    >
                      {addingKnowledgebase ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Connected Knowledge Bases */}
                <div className="connected-kb-section">
                  <h3 className="font-semibold mb-3">
                    Connected Knowledge Bases ({agentDetails.knowledgebases?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {agentDetails.knowledgebases?.length > 0 ? (
                      agentDetails.knowledgebases.map((kb: any) => (
                        <div
                          key={kb.knowledge_base_id}
                          className="p-3 rounded-lg border flex items-center justify-between"
                          style={{ backgroundColor: colors.border + '10', borderColor: colors.border }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.success + '20' }}>
                              <svg className="w-5 h-5" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">{kb.knowledge_base_name}</div>
                              <div className="text-sm" style={{ color: colors.textSecondary }}>
                                {kb.knowledge_base_sources?.length || 0} sources
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveKnowledgebaseFromAgent(kb.knowledge_base_name)}
                            className="p-2 rounded hover:bg-opacity-20"
                            style={{ color: colors.danger }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6" style={{ color: colors.textSecondary }}>
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No knowledge bases connected to this agent</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedKnowledgebase ? (
            <KnowledgeBasesSection
              selectedKnowledgebase={selectedKnowledgebase}
              knowledgebaseSources={knowledgebaseSources}
              knowledgebaseLoading={knowledgebaseLoading}
              colors={colors}
              onAddTextSource={() => setShowAddTextSource(true)}
              onAddFileSource={() => setShowAddFileSource(true)}
              onAddUrlSource={() => setShowAddUrlSource(true)}
              onDeleteKnowledgebase={handleDeleteKnowledgebase}
              onDeleteSource={handleDeleteSource}
            />
          ) : selectedPhoneNumber ? (
            <PhoneNumbersSection
              selectedPhoneNumber={selectedPhoneNumber}
              agents={agents}
              colors={colors}
              onUpdatePhoneNumber={() => setShowUpdatePhoneNumber(true)}
              onDeletePhoneNumber={handleDeletePhoneNumber}
            />
          ) : (
            <div 
              className="p-6 rounded-lg border flex items-center justify-center"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border, minHeight: '400px' }}
              data-onboarding="voice-agents-overview"
            >
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No Selection</h3>
                <p className="text-sm max-w-sm" style={{ color: colors.textSecondary }}>
                  Select an agent to view details and manage its configuration, 
                  select a knowledge base to add and manage sources, 
                  or select a phone number to manage agent assignments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateKnowledgebase && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
          <div className="relative w-full max-w-lg">
            <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Create Knowledge Base</h2>
                <button
                  onClick={() => setShowCreateKnowledgebase(false)}
                  className="p-2 rounded hover:bg-opacity-20"
                  style={{ color: colors.text }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateKnowledgebase}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newKnowledgebaseName}
                    onChange={(e) => setNewKnowledgebaseName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      backgroundColor: colors.cardBg, 
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    placeholder="Product Information"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: colors.accent, color: 'white' }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateKnowledgebase(false)}
                    className="flex-1 py-2 rounded-lg border font-medium"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddTextSource && selectedKnowledgebase && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Add Text to {selectedKnowledgebase}</h2>
                <button
                  onClick={() => setShowAddTextSource(false)}
                  className="p-2 rounded hover:bg-opacity-20"
                  style={{ color: colors.text }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddTextSource}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTextTitle}
                      onChange={(e) => setNewTextTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ 
                        backgroundColor: colors.cardBg, 
                        borderColor: colors.border,
                        color: colors.text
                      }}
                      placeholder="Product Features"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Content *
                    </label>
                    <textarea
                      value={newTextContent}
                      onChange={(e) => setNewTextContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ 
                        backgroundColor: colors.cardBg, 
                        borderColor: colors.border,
                        color: colors.text
                      }}
                      placeholder="Enter the text content..."
                      rows={10}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: colors.accent, color: 'white' }}
                  >
                    Add Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTextSource(false)}
                    className="flex-1 py-2 rounded-lg border font-medium"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddFileSource && selectedKnowledgebase && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
          <div className="relative w-full max-w-lg">
            <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Upload File to {selectedKnowledgebase}</h2>
                <button
                  onClick={() => setShowAddFileSource(false)}
                  className="p-2 rounded hover:bg-opacity-20"
                  style={{ color: colors.text }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddFileSource}>
                <div className="mb-6">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-solid transition-colors"
                    style={{ borderColor: selectedFile ? colors.accent : colors.border }}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    {selectedFile ? (
                      <div>
                        <svg className="w-12 h-12 mx-auto mb-2" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <div className="font-medium">{selectedFile.name}</div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <div className="font-medium">Click to select a file</div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          PDF, DOC, TXT (max 50MB)
                        </div>
                      </div>
                    )}
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className={`flex-1 py-2 rounded-lg font-medium ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: colors.accent, color: 'white' }}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFileSource(false)}
                    className="flex-1 py-2 rounded-lg border font-medium"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddUrlSource && selectedKnowledgebase && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-lg`}>
          <div className="relative w-full max-w-lg">
            <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bg }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Add URL to {selectedKnowledgebase}</h2>
                <button
                  onClick={() => setShowAddUrlSource(false)}
                  className="p-2 rounded hover:bg-opacity-20"
                  style={{ color: colors.text }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddUrlSource}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    URL *
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      backgroundColor: colors.cardBg, 
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    placeholder="https://example.com/documentation"
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    Enter a public URL that Retell can fetch and ingest
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: colors.accent, color: 'white' }}
                  >
                    Add URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUrlSource(false)}
                    className="flex-1 py-2 rounded-lg border font-medium"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* External Modals */}
      {showCreateAgent && (
        <AgentCreationModal
          isOpen={showCreateAgent}
          onClose={() => setShowCreateAgent(false)}
          onAgentCreated={() => {
            fetchData();
            setSuccess('Agent created successfully!');
          }}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      )}

      {showUpdateAgent && agentToUpdate && (
        <UpdateAgentModal
          isOpen={showUpdateAgent}
          onClose={() => {
            setShowUpdateAgent(false);
            setAgentToUpdate(null);
          }}
          onAgentUpdated={() => {
            if (selectedAgent) {
              handleSelectAgent(selectedAgent);
            }
            setSuccess('Agent updated successfully!');
          }}
          isDarkMode={isDarkMode}
          colors={colors}
          agent={agentToUpdate}
        />
      )}

      {showCreatePhoneNumber && (
        <CreatePhoneNumberModal
          isOpen={showCreatePhoneNumber}
          onClose={() => setShowCreatePhoneNumber(false)}
          onCreated={() => {
            fetchData();
            setSuccess('Phone number created successfully!');
          }}
          isDarkMode={isDarkMode}
          colors={colors}
          agents={agents}
        />
      )}

      {showUpdatePhoneNumber && selectedPhoneNumber && (
        <UpdatePhoneNumberModal
          isOpen={showUpdatePhoneNumber}
          onClose={() => setShowUpdatePhoneNumber(false)}
          onUpdated={() => {
            fetchData();
            setSuccess('Phone number updated successfully!');
          }}
          onDelete={handleDeletePhoneNumber}
          isDarkMode={isDarkMode}
          colors={colors}
          agents={agents}
          phoneNumber={selectedPhoneNumber}
        />
      )}
    </div>
  );
};

export default VoiceAgents;