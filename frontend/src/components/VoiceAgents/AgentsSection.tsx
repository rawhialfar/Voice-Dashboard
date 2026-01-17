import React from 'react';

interface Agent {
  agentId: string;
  agentName: string;
}

interface AgentsSectionProps {
  agents: Agent[];
  selectedAgent: string | null;
  colors: any;
  onSelectAgent: (agentId: string) => void;
  onCreateAgent: () => void;
  showCreateAgent: boolean;
}

const AgentsSection: React.FC<AgentsSectionProps> = ({
  agents,
  selectedAgent,
  colors,
  onSelectAgent,
  onCreateAgent,
  showCreateAgent
}) => {
  return (
    <div 
      className="p-6 rounded-lg border voice-agents-card"
      style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
      data-onboarding="agents-management"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Agents</h2>
        <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.border, color: colors.textSecondary }}>
          {agents.length} agents
        </span>
      </div>
      
      <div className="space-y-3">
        {agents.length === 0 ? (
          <div className="text-center py-4" style={{ color: colors.textSecondary }}>
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p>No agents created yet</p>
          </div>
        ) : (
          agents.map(agent => (
            <div
              key={agent.agentId}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedAgent === agent.agentId ? 'ring-2' : ''}`}
              style={{
                backgroundColor: selectedAgent === agent.agentId ? colors.accent + '20' : colors.border + '20',
                borderColor: selectedAgent === agent.agentId ? colors.accent : colors.border,
                borderWidth: '1px',
                color: colors.text
              }}
              onClick={() => onSelectAgent(agent.agentId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.accent }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{agent.agentName}</div>
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

      {!showCreateAgent && (
        <button
          onClick={onCreateAgent}
          className="w-full mt-4 px-4 py-2 rounded-lg border border-dashed transition-colors hover:border-solid"
          style={{ 
            borderColor: colors.border,
            color: colors.textSecondary,
            backgroundColor: colors.cardBg
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Agent
          </div>
        </button>
      )}
    </div>
  );
};

export default AgentsSection;