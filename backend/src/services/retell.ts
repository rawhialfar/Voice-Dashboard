import retell from "retell-sdk";
import { supabase } from "../auth/authClient";
import "dotenv/config";
import {
	getKnowledgeBaseFromId,
	getKnowledgeBaseFromName,
} from "./knowledgebase";

export const clientRetell = new retell({
	apiKey: process.env.RETELL_KEY as string,
});

export const getAllCalls = async () => {
	try {
		const calls = await clientRetell.call.list({});
		return calls;
	} catch (error) {
		throw new Error("Error fetching call data");
		throw error;
	}
};

export const getOneCall = async (callId: string) => {
	try {
		const response = await clientRetell.call.retrieve(callId);
		return response;
	} catch (error) {
		throw new Error(`Error Fetching Call from ID: ${callId}`);
		throw error;
	}
};

export const getAllAgents = async (userId: string) => {
	const { data, error } = await supabase
		.from("_UserAgentRetell")
		.select()
		.eq("userid", userId);

	// console.log(data);
	if (!data || data.length === 0) {
		throw new Error(" error: No Agents exist");
	}
	return data;
};
export const getResponseEngineFromAgentId = async (agentId: string) => {
	try {
		const agentGeneralInfo = await clientRetell.agent.retrieve(agentId);
		if (!agentGeneralInfo) {
			throw new Error(`Agent with ID: ${agentId} not found`);
		}
		if (agentGeneralInfo.response_engine.type !== "retell-llm") {
			throw new Error(`Agent with ID: ${agentId} is not of correct type`);
		}

		const LlmId = agentGeneralInfo.response_engine.llm_id;
		const responseEngine = await clientRetell.llm.retrieve(LlmId);
		if (!responseEngine) {
			throw new Error(`LLM with ID: ${LlmId} not found`);
		}
		return responseEngine;
	} catch (error) {
		throw new Error("Error fetching llm for agent");
	}
};

export const getAllKnowledgeBasesFromAgentId = async (agentId: string) => {
	try {
		const responseEngine = await getResponseEngineFromAgentId(agentId);
		if (!responseEngine) {
			throw new Error(`LLM for Agent ID: ${agentId} not found`);
		}

		const knowledgebaseIds = responseEngine.knowledge_base_ids;

		if (
			!knowledgebaseIds ||
			!Array.isArray(knowledgebaseIds) ||
			knowledgebaseIds.length === 0
		) {
			return []; 
		}

		const knowledgebases = await Promise.all(
			knowledgebaseIds.map(async (id) => {
				try {
					const kb = await getKnowledgeBaseFromId(id);
					return kb;
				} catch (kbError) {
					console.error(`Failed to fetch KB ${id}:`, kbError);
					return null; // Return null for failed fetches
				}
			})
		);

		// Filter out null values (failed fetches)
		return knowledgebases.filter((kb) => kb !== null);
	} catch (error) {
		console.error(
			`Error in getAllKnowledgeBasesFromAgentId for agent ${agentId}:`,
			error
		);
		throw new Error(
			`Error fetching knowledgebases for agent: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
};

export const getOneAgent = async (agentId: string) => {
	try {
		const agentGeneralInfo = await clientRetell.agent.retrieve(agentId);

		let knowledgebases;
		try {
			knowledgebases = await getAllKnowledgeBasesFromAgentId(agentId);
		} catch (kbError) {
			console.warn(
				`Could not fetch knowledge bases for agent ${agentId}:`,
				kbError
			);
		}

		return {
			agentGeneralInfo,
			knowledgebases,
		};
	} catch (error) {
		console.error(`Error fetching agent with ID: ${agentId}:`, error);
		throw new Error(
			`Error fetching agent with ID: ${agentId}: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
};

export const deleteAgent = async (agentId: string) => {
	try {
		const responseEngine = await getResponseEngineFromAgentId(agentId);
		if (!responseEngine) {
			throw new Error(`LLM for Agent ID: ${agentId} not found`);
		}

		await clientRetell.llm.delete(responseEngine.llm_id);
		await clientRetell.agent.delete(agentId);
		const { data, error } = await supabase
			.from("_UserAgentRetell")
			.delete()
			.eq("agentId", agentId);
	} catch (error) {
		throw new Error("Error in deleting agent");
	}
};

export const deleteKnowledgebaseFromAgent = async (
	knowledgebaseName: string,
	agentId: string
) => {
	try {
		const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
		if (!knowledgebase) {
			throw new Error(
				`Knowledgebase with name: ${knowledgebaseName} not found`
			);
		}

		const responseEngine = await getResponseEngineFromAgentId(agentId);
		if (!responseEngine) {
			throw new Error(`LLM for Agent ID: ${agentId} not found`);
		}
		if (
			!responseEngine.knowledge_base_ids ||
			!responseEngine.knowledge_base_ids.includes(
				knowledgebase.knowledge_base_id
			)
		) {
			throw new Error(
				`Knowledgebase with name: ${knowledgebaseName} not associated with agent ID: ${agentId}`
			);
		}
		const updatedKnowledgebaseIds = responseEngine.knowledge_base_ids.filter(
			(id) => id !== knowledgebase.knowledge_base_id
		);
		await clientRetell.llm.update(responseEngine.llm_id, {
			knowledge_base_ids: updatedKnowledgebaseIds,
		});
	} catch (error) {
		throw new Error("Error in deleting knowledgebase from agent");
	}
};

export const addKnowledgebaseToAgent = async (
	knowledgebaseName: string,
	agentId: string
) => {
	try {
		const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
		if (!knowledgebase) {
			throw new Error(
				`Knowledgebase with name: ${knowledgebaseName} not found`
			);
		}

		const responseEngine = await getResponseEngineFromAgentId(agentId);
		if (!responseEngine) {
			throw new Error(`LLM for Agent ID: ${agentId} not found`);
		}
		if (
			responseEngine.knowledge_base_ids &&
			responseEngine.knowledge_base_ids.includes(
				knowledgebase.knowledge_base_id
			)
		) {
			throw new Error(
				`Knowledgebase with name: ${knowledgebaseName} already associated with agent ID: ${agentId}`
			);
		}
		const updatedKnowledgebaseIds = responseEngine.knowledge_base_ids
			? [...responseEngine.knowledge_base_ids, knowledgebase.knowledge_base_id]
			: [knowledgebase.knowledge_base_id];
		await clientRetell.llm.update(responseEngine.llm_id, {
			knowledge_base_ids: updatedKnowledgebaseIds,
		});
	} catch (error) {
		throw new Error("Error in adding knowledgebase to agent");
	}
};

export const updateAgentPresets = async (agentId: string, presets: any) => {
	try {
		await clientRetell.agent.update(agentId, presets);
	} catch (error) {
		throw new Error("Error in updating agent presets");
	}
};

export const createAgent = async (
	agentName: string,
	voiceId: string = "11labs-Cimo",
	language: string = "en-US",
	knowledgeBaseIds?: string[],
	userId?: string,
	customSettings?: Partial<{
		maxCallDurationMs: number;
		interruptionSensitivity: number;
		allowUserDtmf: boolean;
		userDtmfOptions: any;
		postCallAnalysisModel: string;
		piiConfig: any;
		dataStorageSetting: string;
		optInSignedUrl: boolean;
	}>
) => {
	try {

		const llmData = {
			llm_name: `${agentName}_LLM`,
			general_prompt: `You are ${agentName}, a helpful assistant.`,
			general_tools: [],
			knowledge_base_ids: knowledgeBaseIds || [],
		};

		const createdLlm = await clientRetell.llm.create(llmData);

		const agentData = {
			agent_name: agentName,
			voice_id: voiceId,
			language: language,
			response_engine: {
				type: "retell-llm" as const,
				llm_id: createdLlm.llm_id,
			},
			max_call_duration_ms: customSettings?.maxCallDurationMs || 3600000,
			interruption_sensitivity: customSettings?.interruptionSensitivity || 0.9,
			allow_user_dtmf:
				customSettings?.allowUserDtmf !== undefined
					? customSettings.allowUserDtmf
					: true,
			user_dtmf_options: customSettings?.userDtmfOptions || {},
			post_call_analysis_model:
				customSettings?.postCallAnalysisModel || "gpt-4.1-mini",
			pii_config: customSettings?.piiConfig || {
				mode: "post_call",
				categories: [],
			},
			data_storage_setting: customSettings?.dataStorageSetting || "everything",
			opt_in_signed_url:
				customSettings?.optInSignedUrl !== undefined
					? customSettings.optInSignedUrl
					: false,
		};

		const createdAgent = await clientRetell.agent.create(agentData);

		try {
			const { data, error } = await supabase
				.from("_UserAgentRetell")
				.insert([
					{
						userId: userId,
						agentId: createdAgent.agent_id,
						agentName: agentName,
					},
				])
				.select();

			if (error) {
				console.warn(
					`Failed to store agent-user relationship: ${error.message}`
				);
			} else {
				console.log(`Stored agent-user relationship in database`);
			}
		} catch (dbError) {
			console.warn(`Database error when storing relationship: ${dbError}`);
		}

		return {
			agent: createdAgent,
			llm: createdLlm,
			message: `Agent "${agentName}" created successfully`,
		};
	} catch (error) {
		console.error(`Error creating agent "${agentName}":`, error);
		throw new Error(
			`Failed to create agent "${agentName}": ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
};

export const createOutboundAgent = async (
	agentName: string,
	userId: string,
	knowledgeBaseIds?: string[],
	customSettings?: any
) => {
	return createAgent(
		agentName,
		"11labs-Cimo",
		"en-US",
		knowledgeBaseIds,
		userId,
		{
			...customSettings,
			allow_user_dtmf: false,
			interruption_sensitivity: 0.7,
		}
	);
};

export const createInboundAgent = async (
	agentName: string,
	userId: string,
	knowledgeBaseIds?: string[],
	customSettings?: any
) => {
	return createAgent(
		agentName,
		"11labs-Cimo",
		"en-US",
		knowledgeBaseIds,
		userId,
		{
			...customSettings,
			// Inbound-specific defaults
			allow_user_dtmf: true, // Typically true for inbound
			interruption_sensitivity: 0.9, // Higher sensitivity for inbound
		}
	);
};

export interface UpdateAgentRequest {
	voice_id?: string;
	language?: string;
	max_call_duration_ms?: number;
	interruption_sensitivity?: number;
	allow_user_dtmf?: boolean;
	user_dtmf_options?: any;
	webhook_url?: string;
	agent_name?: string;
}

export const updateAgent = async (
	agentId: string,
	updates: UpdateAgentRequest
) => {
	try {
		// console.log(`Updating agent ${agentId} with:`, updates);

		const currentAgent = await clientRetell.agent.retrieve(agentId);
		if (!currentAgent) {
			throw new Error(`Agent with ID ${agentId} not found`);
		}

		const updatedAgent = await clientRetell.agent.update(agentId, updates);

		return updatedAgent;
	} catch (error) {
		console.error(`Error updating agent ${agentId}:`, error);
		throw new Error(
			`Failed to update agent: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
};

// Also update the LLM if needed (for knowledge bases)
export const updateAgentLlm = async (
	agentId: string,
	llmUpdates: {
		general_prompt?: string;
		knowledge_base_ids?: string[];
		llm_name?: string;
	}
) => {
	try {
		// Get the LLM ID from the agent
		const agent = await clientRetell.agent.retrieve(agentId);
		if (!agent) {
			throw new Error(`Agent with ID ${agentId} not found`);
		}

		if (agent.response_engine.type !== "retell-llm") {
			throw new Error(
				`Agent ${agentId} is not using retell-llm response engine`
			);
		}

		const llmId = agent.response_engine.llm_id;
		const updatedLlm = await clientRetell.llm.update(llmId, llmUpdates);

		return updatedLlm;
	} catch (error) {
		console.error(`Error updating LLM for agent ${agentId}:`, error);
		throw error;
	}
};

// Add to your backend retell.ts service file
export const createPhoneNumber = async (config: {
  area_code?: number;
  inbound_agent_id?: string;
  outbound_agent_id?: string;
  nickname?: string;
  inbound_webhook_url?: string;
  inbound_allowed_countries?: string[];
  outbound_allowed_countries?: string[];
}) => {
  try {
    const phoneNumber = await clientRetell.phoneNumber.create(config);
    return phoneNumber;
  } catch (error) {
    console.error('Error creating phone number:', error);
    throw new Error('Failed to create phone number');
  }
};

export const listPhoneNumbers = async () => {
  try {
    const phoneNumbers = await clientRetell.phoneNumber.list();
    return phoneNumbers;
  } catch (error) {
    console.error('Error listing phone numbers:', error);
    throw new Error('Failed to list phone numbers');
  }
};

export const getPhoneNumber = async (phoneNumber: string) => {
  try {
    const phoneNumberData = await clientRetell.phoneNumber.retrieve(phoneNumber);
    return phoneNumberData;
  } catch (error) {
    console.error('Error getting phone number:', error);
    throw new Error('Failed to get phone number');
  }
};

export const updatePhoneNumber = async (
  phoneNumber: string,
  updates: {
    inbound_agent_id?: string | null;
    outbound_agent_id?: string | null;
    nickname?: string;
    inbound_webhook_url?: string;
    inbound_allowed_countries?: string[];
    outbound_allowed_countries?: string[];
  }
) => {
  try {
    const updatedPhoneNumber = await clientRetell.phoneNumber.update(phoneNumber, updates);
    return updatedPhoneNumber;
  } catch (error) {
    console.error('Error updating phone number:', error);
    throw new Error('Failed to update phone number');
  }
};

export const deletePhoneNumber = async (phoneNumber: string) => {
  try {
    await clientRetell.phoneNumber.delete(phoneNumber);
  } catch (error) {
    console.error('Error deleting phone number:', error);
    throw new Error('Failed to delete phone number');
  }
};