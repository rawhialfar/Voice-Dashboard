import fs from "fs";
import { clientRetell } from "./retell";
import { supabase } from "../auth/authClient";

// Types
interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  knowledge_base_texts?: Array<{ text: string; title: string }>;
  knowledge_base_sources?: Array<any>;
  type?: 'org' | 'agent';
  orgId?: string;
  agentId?: string;
}

// Operations with knowledgebases

// Add knowledgebase to organization
export const addKnowledgebaseToOrg = async (knowledgebaseName: string, orgId: string) => {
  try {
    let { data, error } = await supabase
    .from('_OrganizationKnowledgebases')
    .select('*')
    .eq('orgId', orgId);

    if (!data) throw new Error("Organization not found");
    
    // If no record exists, create one
    if (data.length === 0) {
      const { error: insertError } = await supabase
        .from('_OrganizationKnowledgebases')
        .insert([{
          orgId: orgId,
          knowledgebaseId: { knowledgebases: [knowledgebaseName] }
        }]);
      
      if (insertError) throw insertError;
      return;
    }
    
    // Update existing record
    const knowledgebases = data[0].knowledgebaseId?.knowledgebases || [];
    // Only add if not already in the list
    if (!knowledgebases.includes(knowledgebaseName)) {
      knowledgebases.push(knowledgebaseName);
    }

    let { error: updateError } = await supabase
    .from('_OrganizationKnowledgebases')
    .update({ knowledgebaseId: { knowledgebases } })
    .eq('orgId', orgId);

    if (updateError) { throw updateError; }

  } catch (error) {
    console.error("Error adding knowledgebase to org:", error);
    throw new Error("Unable to add knowledgebase to organization");
  }
};

// Remove knowledgebase from organization
export const removeKnowledgebaseFromOrg = async (knowledgebaseName: string, orgId: string) => {
  try {
    let { data, error } = await supabase
    .from('_OrganizationKnowledgebases')
    .select('*')
    .eq('orgId', orgId);

    if (!data || data.length === 0) throw new Error("Organization not found");
    
    const knowledgebases = data[0].knowledgebaseId?.knowledgebases || [];
    const index = knowledgebases.indexOf(knowledgebaseName);
    if (index > -1) {
      knowledgebases.splice(index, 1);
    }

    let { error: updateError } = await supabase
    .from('_OrganizationKnowledgebases')
    .update({ knowledgebaseId: { knowledgebases } })
    .eq('orgId', orgId);

    if (updateError) { throw updateError; }
  } catch (error) {
    console.error("Error removing knowledgebase from org:", error);
    throw new Error("Unable to remove knowledgebase from organization");
  }
};

// Create a knowledgebase (for org knowledge bases)
export const addKnowledgebase = async (knowledgebaseName: string, orgId: string) => {
  try {
    // Create in Retell
    await clientRetell.knowledgeBase.create({
      knowledge_base_name: knowledgebaseName,
      knowledge_base_texts: [{ text: ".", title: "." }],
    });
    
    // Add to org table
    await addKnowledgebaseToOrg(knowledgebaseName, orgId);

  } catch (error) {
    console.error("Error creating knowledgebase:", error);
    throw new Error("Unable to create knowledgebase");
  }
};

// Create agent-specific knowledgebase (if you need this)
export const addAgentKnowledgebase = async (knowledgebaseName: string, agentId: string) => {
  try {
    // Create in Retell
    await clientRetell.knowledgeBase.create({
      knowledge_base_name: knowledgebaseName,
      knowledge_base_texts: [{ text: ".", title: "." }],
    });
    
    // You might want to store agent-specific KBs in a different table
    // For now, we'll just return the created KB
    const allKBs = await clientRetell.knowledgeBase.list();
    const createdKB = allKBs.find(kb => kb.knowledge_base_name === knowledgebaseName);
    
    if (!createdKB) {
      throw new Error("Failed to create knowledgebase");
    }
    
    return createdKB;
  } catch (error) {
    console.error("Error creating agent knowledgebase:", error);
    throw new Error("Unable to create agent knowledgebase");
  }
};

// Get knowledgebase by name from Retell
export const getKnowledgeBaseFromName = async (knowledgebaseName: string) => {
  try {
    const knowledgebases = await clientRetell.knowledgeBase.list();
    const foundKnowledgebase = knowledgebases.find(
      (knowledgebase) => knowledgebase.knowledge_base_name === knowledgebaseName
    );
    
    return foundKnowledgebase;
  } catch (error) {
    console.error("Error getting knowledgebase from name:", error);
    throw new Error("Unable to get Knowledgebase");
  }
};

// Get knowledgebase by ID from Retell
export const getKnowledgeBaseFromId = async (knowledgebaseId: string) => {
  try {
    if (typeof clientRetell.knowledgeBase.retrieve === "function") {
      const knowledgebase = await clientRetell.knowledgeBase.retrieve(knowledgebaseId);
      return knowledgebase;
    } else {
      const knowledgebases = await clientRetell.knowledgeBase.list();
      const foundKnowledgebase = knowledgebases.find(
        (knowledgebase) => knowledgebase.knowledge_base_id === knowledgebaseId
      );
      if (!foundKnowledgebase) {
        throw new Error(`Knowledge base with ID ${knowledgebaseId} not found`);
      }
      return foundKnowledgebase;
    }
  } catch (error) {
    console.error(`Error in getKnowledgeBaseFromId for ID ${knowledgebaseId}:`, error);
    throw new Error(
      `Unable to get Knowledgebase: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// List all knowledgebases (combining org and agent KBs)
export const listKnowledgebases = async (orgId: string, agentId?: string): Promise<KnowledgeBase[]> => {
  try {
    // Get org knowledgebases from the org table
    let orgKBs: KnowledgeBase[] = [];
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('_OrganizationKnowledgebases')
        .select('*')
        .eq('orgId', orgId);

      if (!orgError && orgData && orgData.length > 0) {
        const orgKnowledgebaseNames = orgData[0].knowledgebaseId?.knowledgebases || [];
        
        // Get details for each org knowledgebase from Retell
        const allRetellKBs = await clientRetell.knowledgeBase.list();
        
        orgKBs = orgKnowledgebaseNames.map(kbName => {
          const kbDetails = allRetellKBs.find(kb => kb.knowledge_base_name === kbName);
          return {
            knowledge_base_id: kbDetails?.knowledge_base_id || '',
            knowledge_base_name: kbName,
            knowledge_base_sources: kbDetails?.knowledge_base_sources,
            type: 'org',
            orgId: orgId
          } as KnowledgeBase;
        }).filter(kb => kb.knowledge_base_id); // Filter out any that weren't found in Retell
      }
    } catch (orgErr) {
      console.error("Error fetching org knowledgebases:", orgErr);
    }

    // Get agent knowledgebases (if agentId is provided)
    let agentKBs: KnowledgeBase[] = [];
    if (agentId) {
      try {
        // You might have a table for agent-specific KBs
        // For now, we'll fetch all KBs from Retell and filter by naming convention
        const allRetellKBs = await clientRetell.knowledgeBase.list();
        
        // Example: Agent KBs might have agentId in the name or be stored elsewhere
        agentKBs = allRetellKBs
          .filter(kb => {
            // This is a simple filter - you might have a better way to identify agent KBs
            return kb.knowledge_base_name.includes(`agent-${agentId}`) ||
                   kb.knowledge_base_name.startsWith(`${agentId}_`);
          })
          .map(kb => ({
            knowledge_base_id: kb.knowledge_base_id,
            knowledge_base_name: kb.knowledge_base_name,
            knowledge_base_sources: kb.knowledge_base_sources,
            type: 'agent',
            agentId: agentId
          } as KnowledgeBase));
      } catch (agentErr) {
        console.error("Error fetching agent knowledgebases:", agentErr);
      }
    }

    // Combine both lists
    return [...orgKBs, ...agentKBs];
  } catch (error) {
    console.error("Error listing knowledgebases:", error);
    throw new Error("Unable to list knowledgebases");
  }
};

// List only organization knowledgebases
export const listOrgKnowledgebases = async (orgId: string): Promise<KnowledgeBase[]> => {
  try {
    const { data: orgData, error: orgError } = await supabase
      .from('_OrganizationKnowledgebases')
      .select('*')
      .eq('orgId', orgId);

    if (orgError) throw orgError;
    
    if (!orgData || orgData.length === 0) {
      return [];
    }

    const orgKnowledgebaseNames = orgData[0].knowledgebaseId?.knowledgebases || [];
    const allRetellKBs = await clientRetell.knowledgeBase.list();
    
    return orgKnowledgebaseNames.map(kbName => {
      const kbDetails = allRetellKBs.find(kb => kb.knowledge_base_name === kbName);
      return {
        knowledge_base_id: kbDetails?.knowledge_base_id || '',
        knowledge_base_name: kbName,
        knowledge_base_sources: kbDetails?.knowledge_base_sources,
        type: 'org',
        orgId: orgId
      } as KnowledgeBase;
    }).filter(kb => kb.knowledge_base_id);
  } catch (error) {
    console.error("Error listing org knowledgebases:", error);
    throw new Error("Unable to list organization knowledgebases");
  }
};

// List all knowledgebases from Retell (for backward compatibility)
export const listAllKnowledgebases = async (): Promise<KnowledgeBase[]> => {
  try {
    const allRetellKBs = await clientRetell.knowledgeBase.list();
    return allRetellKBs.map(kb => ({
      knowledge_base_id: kb.knowledge_base_id,
      knowledge_base_name: kb.knowledge_base_name,
      knowledge_base_sources: kb.knowledge_base_sources,
      type: undefined // No type info when listing all
    } as KnowledgeBase));
  } catch (error) {
    console.error("Error listing all knowledgebases:", error);
    throw new Error("Unable to list knowledgebases");
  }
};

// Delete knowledgebase
export const deleteKnowledgebase = async (knowledgebaseName: string, orgId: string, type?: 'org' | 'agent') => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) throw new Error("Unable to find knowledgebase");
    
    // Delete from Retell
    await clientRetell.knowledgeBase.delete(knowledgebase.knowledge_base_id);
    
    // If it's an org knowledgebase, remove from org table
    if (type === 'org') {
      await removeKnowledgebaseFromOrg(knowledgebaseName, orgId);
    }
    
    // If it's an agent knowledgebase, you might want to remove from agent table here
    // TODO: Implement agent KB removal if needed
  } catch (error) {
    console.error("Error deleting knowledgebase:", error);
    throw new Error("Unable to delete knowledgebase");
  }
};

// Delete org knowledgebase specifically
export const deleteOrgKnowledgebase = async (knowledgebaseName: string, orgId: string) => {
  return deleteKnowledgebase(knowledgebaseName, orgId, 'org');
};

// Delete agent knowledgebase specifically
export const deleteAgentKnowledgebase = async (knowledgebaseName: string, agentId: string) => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) throw new Error("Unable to find knowledgebase");
    
    // Delete from Retell
    await clientRetell.knowledgeBase.delete(knowledgebase.knowledge_base_id);
    
    // TODO: Remove from agent-specific table if you have one
    return true;
  } catch (error) {
    console.error("Error deleting agent knowledgebase:", error);
    throw new Error("Unable to delete agent knowledgebase");
  }
};

// Add text source to knowledgebase
export const addKnowledgebaseSourceText = async (
  knowledgebaseName: string,
  title: string,
  text: string
) => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) throw new Error("Unable to find knowledgebase");
    const textAndTitle = [{ text, title }];
    await clientRetell.knowledgeBase.addSources(
      knowledgebase.knowledge_base_id,
      { knowledge_base_texts: textAndTitle }
    );
  } catch (error) {
    console.error("Error adding text source:", error);
    throw new Error("Unable to add knowledgebase source");
  }
};

// Add file source to knowledgebase
export const addKnowledgebaseSourceFile = async (
  knowledgebaseName: string, 
  filePath: string,
) => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) {
      throw new Error("Unable to find knowledgebase");
    }

    const stream = fs.createReadStream(filePath);
    
    await clientRetell.knowledgeBase.addSources(
      knowledgebase.knowledge_base_id,
      {
        knowledge_base_files: [stream]
      }
    );
    
    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error(`Error adding file to knowledgebase ${knowledgebaseName}:`, error);
    throw new Error("Unable to add knowledgebase source");
  }
};

// Add URL source to knowledgebase
export const addKnowledgebaseSourceUrl = async (
  knowledgebaseName: string,
  url: string
) => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) throw new Error("Unable to find knowledgebase");

    const knowledgebaseUrls = [url];
    await clientRetell.knowledgeBase.addSources(
      knowledgebase.knowledge_base_id,
      { knowledge_base_urls: knowledgebaseUrls }
    );
  } catch (error) {
    console.error("Error adding URL source:", error);
    throw new Error("Unable to add knowledgebase source");
  }
};

// Delete source from knowledgebase
export const deleteKnowledgebaseSource = async (
  knowledgebaseName: string,
  type: string,
  sourceName: string
) => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) throw new Error("Unable to find knowledgebase");

    const knowledgebaseSources = knowledgebase.knowledge_base_sources;
    if (!knowledgebaseSources)
      throw new Error("No sources found for knowledgebase");

    let sourceToDelete = null;
    
    if (type === "document") {
      sourceToDelete = knowledgebaseSources.find(
        (source) => (source as any).filename === sourceName
      );
    } else if (type === "text") {
      sourceToDelete = knowledgebaseSources.find(
        (source) => (source as any).title === sourceName
      );
    } else if (type === "url") {
      sourceToDelete = knowledgebaseSources.find(
        (source) => (source as any).url === sourceName
      );
    }
    
    if (!sourceToDelete) throw new Error("Unable to find source to delete");
    
    await clientRetell.knowledgeBase.deleteSource(
      knowledgebase.knowledge_base_id,
      sourceToDelete.source_id
    );
  } catch (error) {
    console.error("Error deleting knowledgebase source:", error);
    throw new Error("Unable to delete knowledgebase source");
  }
};

// List knowledgebase sources
export const listKnowledgebaseSources = async (knowledgebaseName: string) => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) throw new Error("Unable to find knowledgebase");

    const knowledgebaseSources = knowledgebase.knowledge_base_sources;
    if (!knowledgebaseSources)
      throw new Error("No sources found for knowledgebase");

    return knowledgebaseSources;
  } catch (error) {
    console.error("Error listing knowledgebase sources:", error);
    throw new Error("Unable to list knowledgebase sources");
  }
};

// Check if knowledgebase belongs to organization
export const isKnowledgebaseInOrg = async (knowledgebaseName: string, orgId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('_OrganizationKnowledgebases')
      .select('*')
      .eq('orgId', orgId);

    if (error || !data || data.length === 0) {
      return false;
    }

    const knowledgebases = data[0].knowledgebaseId?.knowledgebases || [];
    return knowledgebases.includes(knowledgebaseName);
  } catch (error) {
    console.error("Error checking if knowledgebase is in org:", error);
    return false;
  }
};

// Get knowledgebase with type info
export const getKnowledgebaseWithType = async (knowledgebaseName: string, orgId?: string): Promise<KnowledgeBase | null> => {
  try {
    const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
    if (!knowledgebase) return null;

    const result: KnowledgeBase = {
      knowledge_base_id: knowledgebase.knowledge_base_id,
      knowledge_base_name: knowledgebase.knowledge_base_name,
      knowledge_base_sources: knowledgebase.knowledge_base_sources,
      type: undefined
    };

    // Check if it's an org knowledgebase
    if (orgId) {
      const isOrgKB = await isKnowledgebaseInOrg(knowledgebaseName, orgId);
      if (isOrgKB) {
        result.type = 'org';
        result.orgId = orgId;
      }
    }

    // TODO: Check if it's an agent knowledgebase
    // This would require checking your agent KB table

    return result;
  } catch (error) {
    console.error("Error getting knowledgebase with type:", error);
    return null;
  }
};