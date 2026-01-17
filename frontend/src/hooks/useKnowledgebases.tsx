// hooks/useKnowledgebases.ts
import { useState, useEffect } from 'react';
import { listKnowledgebases } from '../api/knowledgebase';

interface KnowledgeBase {
  id: string;
  name: string;
  type: 'agent' | 'org'; // To distinguish between agent and org knowledge bases
  description?: string;
  sourceCount?: number;
}

export const useKnowledgebases = (orgId: string, agentId?: string) => {
  const [knowledgebases, setKnowledgebases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledgebases = async () => {
      if (!orgId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch org knowledge bases from the new table
        const orgKnowledgebases = await listKnowledgebases(orgId);
        
        // Transform to consistent format
        const formattedOrgKBs: KnowledgeBase[] = orgKnowledgebases.map(kbName => ({
          id: `org-${kbName}`, // Prefix to distinguish from agent KBs
          name: kbName,
          type: 'org',
          description: 'Organization knowledge base',
        }));

        // Fetch agent knowledge bases (if agentId is provided)
        let agentKnowledgebases: KnowledgeBase[] = [];
        if (agentId) {
          // Call your existing agent KB API endpoint
          const response = await fetch(`/api/agents/${agentId}/knowledgebases`);
          if (response.ok) {
            const agentKBs = await response.json();
            agentKnowledgebases = agentKBs.map((kb: any) => ({
              id: kb.id,
              name: kb.name,
              type: 'agent',
              description: kb.description || 'Agent-specific knowledge base',
              sourceCount: kb.sourceCount,
            }));
          }
        }

        // Combine both lists
        setKnowledgebases([...formattedOrgKBs, ...agentKnowledgebases]);
      } catch (err) {
        console.error('Error fetching knowledgebases:', err);
        setError('Failed to load knowledge bases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgebases();
  }, [orgId, agentId]);

  return { knowledgebases, isLoading, error };
};