import { Router } from "express";
import {
	getOneCall,
	getAllCalls,
	getOneAgent,
	deleteAgent,
	addKnowledgebaseToAgent,
	deleteKnowledgebaseFromAgent,
	createAgent, // Add this
	createOutboundAgent, // Add this
	createInboundAgent,
	updateAgentLlm,
	updateAgent,
	deletePhoneNumber,
	updatePhoneNumber,
	createPhoneNumber,
	listPhoneNumbers,
	getPhoneNumber, // Add this
} from "../services/retell";
import {
	getCallStats,
	getDailyCallStats,
	getCallStatsAll,
	getDailyCallStatsAll,
} from "../services/supabase";
import {
	getAllAgentsFromUserRetell,
	userAuthenticate,
} from "../auth/authService";
import { supabase } from "../auth/authClient";
import { getKnowledgeBaseFromName } from "../services/knowledgebase";

const router = Router();

/**
 * @swagger
 * tags:
 *    name: Retell
 *    description: Endpoints for Retells
 */

/**
 * @swagger
 * /api/retell/calls:
 *   get:
 *     summary: Get the List of calls for a specific agent
 *     tags: [Retell]
 *     responses:
 *       200:
 *         description: Successfully fetched calls for agent
 *       500:
 *         description: Failed to fetch Retell calls for agent
 */
router.get("/calls", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const orgId = req.orgId;

		const agents = await getAllAgentsFromUserRetell(userId);
		const validAgentIds = new Set(agents.data?.map((object) => object.agentId));
		const calls = await getAllCalls();
		const phoneCallOnly = calls
			.filter((object) => object.call_type === "phone_call")
			.filter((object) => validAgentIds.has(object.agent_id));
		const listOfCalls = phoneCallOnly.map((call) => ({
			call_id: call?.call_id,
			direction: call?.direction || "unknown",
		}));
		res.json({ calls: listOfCalls });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});
/**
 * @swagger
 * /api/retell/calls/{callId}:
 *   get:
 *     summary: Get Call by ID
 *     tags: [Retell]
 *     parameters:
 *      - in: path
 *        name: callId
 *        schema:
 *          type: string
 *        required: true
 *        description: The conversation ID
 *     responses:
 *       200:
 *         description: Successfully fetched conversation
 *       500:
 *         description: Failed to fetch conversation
 */
router.get("/calls/:callId", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const agents = await getAllAgentsFromUserRetell(userId);
		const validAgentIds = new Set(agents.data?.map((object) => object.agentId));
		const call = await getOneCall(req.params.callId);

		if (!validAgentIds.has(call?.agent_id)) {
			res.status(401).json({ error: "You do not have access to this call" });
		} else {
			const transcript = call?.transcript;
			const callType = call?.call_type;
			const summary = call?.call_analysis?.call_summary;
			const durationSeconds = call?.duration_ms || 0 / 1000;
			const sentiment = call?.call_analysis?.user_sentiment;
			const timestamp = call?.start_timestamp;
			const fromNumber = callType === "phone_call" ? call?.from_number : " ";
			const toNumber = callType === "phone_call" ? call?.to_number : " ";
			const status = call?.call_status;
			const disconnectionReason = call?.disconnection_reason;
			const recordingUrl = call?.recording_url;
			res.json({
				transcript: transcript,
				callType: callType,
				summary: summary,
				durationSeconds: durationSeconds,
				status: status,
				recordingUrl: recordingUrl,
				sentiment: sentiment,
				disconnectionReason: disconnectionReason,
				timestamp: timestamp,
				fromNumber: fromNumber,
				toNumber: toNumber,
			});
		}
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});
/**
 * @swagger
 * /api/retell/agents:
 *   get:
 *     summary: List all agents for the authenticated user
 *     tags: [Retell]
 *     responses:
 *       200:
 *         description: Successfully fetched agents list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       agentId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to fetch agents
 */

router.get("/agents", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const agents = await getAllAgentsFromUserRetell(userId);
		res.json(agents.data);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});
/**
 * @swagger
 * /api/retell/agent/{agentId}:
 *   get:
 *     summary: Get detailed info for a single agent (must belong to authenticated user)
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent id to retrieve
 *     responses:
 *       200:
 *         description: Successfully fetched agent information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agentId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 knowledge_base_ids:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized - user does not have access to this agent
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Failed to fetch agent
 */

router.get("/agent/:agentId", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const agents = await getAllAgentsFromUserRetell(userId);
		const validAgentIds = new Set(
			agents.data?.map((object) => object?.agentId)
		);
		const agentId = req.params.agentId;

		if (!validAgentIds.has(agentId)) {
			res.status(401).json({ error: "You do not have access to this agent" });
		}
		const agentInfo = await getOneAgent(agentId);
		res.json(agentInfo);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});
/**
 * @swagger
 * /api/retell/agent/{agentId}:
 *   delete:
 *     summary: Delete an agent (must belong to authenticated user)
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent id to delete
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *       401:
 *         description: Unauthorized - user does not have access to this agent
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Failed to delete agent
 */

router.delete(
	"/agent/:agentId",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const agents = await getAllAgentsFromUserRetell(userId);
			const validAgentIds = new Set(
				agents.data?.map((object) => object.agentId)
			);
			const agentId = req.params.agentId;

			if (!validAgentIds.has(agentId)) {
				res.status(401).json({ error: "You do not have access to this agent" });
			}
			await deleteAgent(agentId);
			res.json({ message: "Agent deleted successfully" });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
);
/**
 * @swagger
 * /api/retell/agent/{agentId}/addKnowledgebase:
 *   post:
 *     summary: Add an existing knowledgebase (by name) to an agent
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent id to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the knowledgebase to attach to the agent
 *             required:
 *               - knowledgebaseName
 *     responses:
 *       200:
 *         description: Knowledgebase added to agent successfully
 *       400:
 *         description: Bad request - missing or invalid knowledgebaseName
 *       401:
 *         description: Unauthorized - user does not have access to this agent
 *       404:
 *         description: Knowledgebase not found
 *       500:
 *         description: Failed to add knowledgebase to agent
 */

router.post(
	"/agent/:agentId/addKnowledgebase",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const agents = await getAllAgentsFromUserRetell(userId);
			const validAgentIds = new Set(
				agents.data?.map((object) => object.agentId)
			);
			const agentId = req.params.agentId;

			if (!validAgentIds.has(agentId)) {
				res.status(401).json({ error: "You do not have access to this agent" });
			}

			const knowledgebaseName = req.body.knowledgebaseName;
			const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
			if (!knowledgebase) {
				throw new Error(
					`Knowledgebase with name: ${knowledgebaseName} not found`
				);
			}
			await addKnowledgebaseToAgent(knowledgebaseName, agentId);
			return res
				.status(200)
				.json({ message: "Knowledgebase added to agent successfully" });
		} catch (error) {
			return res
				.status(500)
				.json({ error: "Failed to add knowledgebase to agent" });
		}
	}
);
/**
 * @swagger
 * /api/retell/agent/{agentId}/deleteKnowledgebase:
 *   delete:
 *     summary: Remove an existing knowledgebase (by name) from an agent
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent id to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the knowledgebase to remove from the agent
 *             required:
 *               - knowledgebaseName
 *     responses:
 *       200:
 *         description: Knowledgebase deleted from agent successfully
 *       400:
 *         description: Bad request - missing or invalid knowledgebaseName
 *       401:
 *         description: Unauthorized - user does not have access to this agent
 *       404:
 *         description: Knowledgebase not found
 *       500:
 *         description: Failed to delete knowledgebase from agent
 */

router.delete(
	"/agent/:agentId/deleteKnowledgebase",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const agents = await getAllAgentsFromUserRetell(userId);
			const validAgentIds = new Set(
				agents.data?.map((object) => object.agentId)
			);
			const agentId = req.params.agentId;

			if (!validAgentIds.has(agentId)) {
				res.status(401).json({ error: "You do not have access to this agent" });
			}

			const knowledgebaseName = req.body.knowledgebaseName;
			const knowledgebase = await getKnowledgeBaseFromName(knowledgebaseName);
			if (!knowledgebase) {
				throw new Error(
					`Knowledgebase with name: ${knowledgebaseName} not found`
				);
			}
			await deleteKnowledgebaseFromAgent(knowledgebaseName, agentId);
			return res
				.status(200)
				.json({ message: "Knowledgebase deleted from agent successfully" });
		} catch (error) {
			return res
				.status(500)
				.json({ error: "Failed to delete knowledgebase from agent" });
		}
	}
);

/**
 * @swagger
 * /api/retell/agent:
 *   post:
 *     summary: Create a new agent for the authenticated user
 *     tags: [Retell]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentName
 *               - agentType
 *             properties:
 *               agentName:
 *                 type: string
 *                 description: Name of the agent to create
 *               agentType:
 *                 type: string
 *                 enum: [inbound, outbound]
 *                 description: Type of agent (inbound or outbound)
 *               voiceId:
 *                 type: string
 *                 description: Voice ID for the agent (defaults to "11labs-Cimo")
 *               language:
 *                 type: string
 *                 description: Language code (defaults to "en-US")
 *               knowledgeBaseNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of knowledge base names to attach to the agent
 *               customSettings:
 *                 type: object
 *                 description: Custom settings for the agent
 *                 properties:
 *                   maxCallDurationMs:
 *                     type: number
 *                     default: 3600000
 *                   interruptionSensitivity:
 *                     type: number
 *                     default: 0.9
 *                   allowUserDtmf:
 *                     type: boolean
 *                     default: true
 *                   postCallAnalysisModel:
 *                     type: string
 *                     default: "gpt-4.1-mini"
 *                   dataStorageSetting:
 *                     type: string
 *                     default: "everything"
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 agent:
 *                   type: object
 *                 llm:
 *                   type: object
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to create agent
 */
router.post("/agent", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const {
			agentName,
			agentType,
			voiceId = "11labs-Cimo",
			language = "en-US",
			knowledgeBaseNames = [],
			customSettings = {},
		} = req.body;

		if (!agentName || !agentType) {
			return res.status(400).json({
				error: "agentName and agentType are required parameters",
			});
		}

		if (!["inbound", "outbound"].includes(agentType)) {
			return res.status(400).json({
				error: "agentType must be either 'inbound' or 'outbound'",
			});
		}

		let knowledgeBaseIds: string[] = [];
		if (knowledgeBaseNames.length > 0) {
			try {
				const knowledgeBasePromises = knowledgeBaseNames.map(
					async (name: string) => {
						const kb = await getKnowledgeBaseFromName(name);
						if (!kb) {
							throw new Error(`Knowledge base "${name}" not found`);
						}
						return kb.knowledge_base_id;
					}
				);

				knowledgeBaseIds = await Promise.all(knowledgeBasePromises);
			} catch (kbError) {
				return res.status(400).json({
					error: `Failed to find knowledge base: ${
						kbError instanceof Error ? kbError.message : "Unknown error"
					}`,
				});
			}
		}

		let result;
		if (agentType === "outbound") {
			result = await createOutboundAgent(agentName, userId, knowledgeBaseIds, {
				...customSettings,
				voice_id: voiceId,
				language,
			});
		} else {
			result = await createInboundAgent(agentName, userId, knowledgeBaseIds, {
				...customSettings,
				voice_id: voiceId,
				language,
			});
		}

		return res.status(201).json({
			message: `Agent "${agentName}" created successfully`,
			agentId: result.agent.agent_id,
			agentName: result.agent.agent_name,
			llmId: result.llm.llm_id,
			voiceId: result.agent.voice_id,
			language: result.agent.language,
			knowledgeBaseIds,
		});
	} catch (error: any) {
		console.error("Error creating agent:", error);
		return res.status(500).json({
			error: `Failed to create agent: ${error.message || "Unknown error"}`,
		});
	}
});

/**
 * @swagger
 * /api/retell/agent/quick:
 *   post:
 *     summary: Create a new agent with minimal configuration
 *     tags: [Retell]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentName
 *             properties:
 *               agentName:
 *                 type: string
 *                 description: Name of the agent to create
 *               voiceId:
 *                 type: string
 *                 default: "11labs-Cimo"
 *               language:
 *                 type: string
 *                 default: "en-US"
 *     responses:
 *       201:
 *         description: Agent created successfully
 *       400:
 *         description: Bad request - missing agentName
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to create agent
 */
router.post("/agent/quick", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const { agentName, voiceId = "11labs-Cimo", language = "en-US" } = req.body;

		if (!agentName) {
			return res.status(400).json({
				error: "agentName is a required parameter",
			});
		}

		const result = await createAgent(agentName, voiceId, language, [], userId);

		return res.status(201).json({
			message: `Agent "${agentName}" created successfully`,
			agentId: result.agent.agent_id,
			agentName: result.agent.agent_name,
			voiceId: result.agent.voice_id,
			language: result.agent.language,
		});
	} catch (error: any) {
		console.error("Error creating quick agent:", error);
		return res.status(500).json({
			error: `Failed to create agent: ${error.message || "Unknown error"}`,
		});
	}
});

/**
 * @swagger
 * /api/retell/agent/{agentId}:
 *   patch:
 *     summary: Update agent settings
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent id to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_name:
 *                 type: string
 *               voice_id:
 *                 type: string
 *               language:
 *                 type: string
 *               max_call_duration_ms:
 *                 type: number
 *               interruption_sensitivity:
 *                 type: number
 *               allow_user_dtmf:
 *                 type: boolean
 *               webhook_url:
 *                 type: string
 *               general_prompt:
 *                 type: string
 *             description: Fields to update on the agent
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *       401:
 *         description: Unauthorized - user does not have access to this agent
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Failed to update agent
 */
router.patch(
	"/agent/:agentId",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const agents = await getAllAgentsFromUserRetell(userId);
			const validAgentIds = new Set(
				agents.data?.map((object) => object?.agentId)
			);
			const agentId = req.params.agentId;

			if (!validAgentIds.has(agentId)) {
				return res
					.status(401)
					.json({ error: "You do not have access to this agent" });
			}

			const updates = req.body;

			const agentUpdates: any = {};
			const llmUpdates: any = {};

			const agentFields = [
				"agent_name",
				"voice_id",
				"language",
				"max_call_duration_ms",
				"interruption_sensitivity",
				"allow_user_dtmf",
				"user_dtmf_options",
				"webhook_url",
			];

			const llmFields = ["general_prompt", "knowledge_base_ids", "llm_name"];

			Object.keys(updates).forEach((key) => {
				if (agentFields.includes(key)) {
					agentUpdates[key] = updates[key];
				} else if (llmFields.includes(key)) {
					llmUpdates[key] = updates[key];
				}
			});

			// Update agent if there are agent updates
			let updatedAgent = null;
			if (Object.keys(agentUpdates).length > 0) {
				updatedAgent = await updateAgent(agentId, agentUpdates);
			}

			// Update LLM if there are LLM updates
			let updatedLlm = null;
			if (Object.keys(llmUpdates).length > 0) {
				updatedLlm = await updateAgentLlm(agentId, llmUpdates);
			}

			return res.status(200).json({
				message: "Agent updated successfully",
				agent: updatedAgent,
				llm: updatedLlm,
			});
		} catch (error: any) {
			console.error(`Error updating agent ${req.params.agentId}:`, error);
			return res.status(500).json({
				error: `Failed to update agent: ${error.message || "Unknown error"}`,
			});
		}
	}
);

/**
 * @swagger
 * /api/retell/statistics/Day:
 *   get:
 *     summary: Gets the statistics for all conversations
 *     tags: [Retell]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           description: The type of call (e.g., 'inbound', 'outbound', or 'all')
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully fetched Day statistics
 *       500:
 *         description: Failed to fetch Day statistics
 */

router.get("/statistics/Day", userAuthenticate, async (req: any, res: any) => {
	try {
		const beforeFirstTime = Date.now() - 1000 * 60 * 60 * 24;
		const beforeSecondTime = Date.now() - 2 * 1000 * 60 * 60 * 24;
		const userId = req.user;
		const type = req.query.type;
		const callStatsDaily = await getDailyCallStats(
			beforeFirstTime,
			userId,
			type
		);
		const callStatsOverall = await getCallStats(
			beforeFirstTime,
			beforeSecondTime,
			type,
			userId
		);
		res.json({
			dailyStats: callStatsDaily,
			totalCallDuration: callStatsOverall[0].totalcallduration * 1000,
			totalCostOverAllCalls: callStatsOverall[0].totalcostoverallcalls,
			totalNumberOfCalls: callStatsOverall[0].totalnumberofcalls,
			previousTotalNumberOfCalls:
				callStatsOverall[0].previoustotalnumberofcalls,
			previousTotalCallDuration:
				callStatsOverall[0].previoustotalcallduration * 1000,
			previousTotalCostOverAllCalls:
				callStatsOverall[0].previoustotalcostoverallcalls,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch conversation" });
	}
});

/**
 * @swagger
 * /api/retell/statistics/Week:
 *   get:
 *     summary: Gets the statistics for all conversations
 *     tags: [Retell]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           description: The type of call (e.g., 'inbound', 'outbound', or 'all')
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully fetched Week statistics
 *       500:
 *         description: Failed to fetch Week statistics
 */

router.get("/statistics/Week", userAuthenticate, async (req: any, res: any) => {
	try {
		const beforeFirstTime = Date.now() - 7 * 1000 * 60 * 60 * 24;
		const beforeSecondTime = Date.now() - 7 * 2 * 1000 * 60 * 60 * 24;
		const userId = req.user;
		const type = req.query.type;
		const callStatsDaily = await getDailyCallStats(
			beforeFirstTime,
			userId,
			type
		);
		const callStatsOverall = await getCallStats(
			beforeFirstTime,
			beforeSecondTime,
			type,
			userId
		);
		res.json({
			dailyStats: callStatsDaily,
			totalCallDuration: callStatsOverall[0].totalcallduration * 1000,
			totalCostOverAllCalls: callStatsOverall[0].totalcostoverallcalls,
			totalNumberOfCalls: callStatsOverall[0].totalnumberofcalls,
			previousTotalNumberOfCalls:
				callStatsOverall[0].previoustotalnumberofcalls,
			previousTotalCallDuration:
				callStatsOverall[0].previoustotalcallduration * 1000,
			previousTotalCostOverAllCalls:
				callStatsOverall[0].previoustotalcostoverallcalls,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch conversation" });
	}
});
/**
 * @swagger
 * /api/retell/statistics/Month:
 *   get:
 *     summary: Gets the statistics for all conversations
 *     tags: [Retell]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           description: The type of call (e.g., 'inbound', 'outbound', or 'all')
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully fetched Month statistics
 *       500:
 *         description: Failed to fetch Month statistics
 */

router.get("/statistics/Month",userAuthenticate, async (req: any, res: any) => {
	try {
		const beforeFirstTime = Date.now() - 30 * 1000 * 60 * 60 * 24;
		const beforeSecondTime = Date.now() - 30 * 2 * 1000 * 60 * 60 * 24;
		const orgId = req.orgId;
		const userId = req.user;
		const type = req.query.type;
		const callStatsDaily = await getDailyCallStats(beforeFirstTime,userId,type);
		const callStatsOverall = await getCallStats(beforeFirstTime,beforeSecondTime,type,userId);
		res.json({
			dailyStats: callStatsDaily,
			totalCallDuration: callStatsOverall[0].totalcallduration * 1000,
			totalCostOverAllCalls: callStatsOverall[0].totalcostoverallcalls,
			totalNumberOfCalls: callStatsOverall[0].totalnumberofcalls,
			previousTotalNumberOfCalls: callStatsOverall[0].previoustotalnumberofcalls,
			previousTotalCallDuration: callStatsOverall[0].previoustotalcallduration * 1000,
			previousTotalCostOverAllCalls: callStatsOverall[0].previoustotalcostoverallcalls,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch conversation" });
	}
}
);

/**
 * @swagger
 * /api/retell/statistics/Year:
 *   get:
 *     summary: Gets the statistics for all conversations
 *     tags: [Retell]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           description: The type of call (e.g., 'inbound', 'outbound', or 'all')
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully fetched Year statistics
 *       500:
 *         description: Failed to fetch Year statistics
 */

router.get("/statistics/Year", userAuthenticate, async (req: any, res: any) => {
	try {
		const beforeFirstTime = Date.now() - 365 * 1000 * 60 * 60 * 24;
		const beforeSecondTime = Date.now() - 365 * 2 * 1000 * 60 * 60 * 24;
		const userId = req.user;
		const type = req.query.type;
		const callStatsDaily = await getDailyCallStats(
			beforeFirstTime,
			userId,
			type
		);
		const callStatsOverall = await getCallStats(
			beforeFirstTime,
			beforeSecondTime,
			type,
			userId
		);
		res.json({
			dailyStats: callStatsDaily,
			totalCallDuration: callStatsOverall[0].totalcallduration * 1000,
			totalCostOverAllCalls: callStatsOverall[0].totalcostoverallcalls,
			totalNumberOfCalls: callStatsOverall[0].totalnumberofcalls,
			previousTotalNumberOfCalls:
				callStatsOverall[0].previoustotalnumberofcalls,
			previousTotalCallDuration:
				callStatsOverall[0].previoustotalcallduration * 1000,
			previousTotalCostOverAllCalls:
				callStatsOverall[0].previoustotalcostoverallcalls,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch conversation" });
	}
});

/**
 * @swagger
 * /api/retell/statistics/All:
 *   get:
 *     summary: Gets the statistics for all conversations
 *     tags: [Retell]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           description: The type of call (e.g., 'inbound', 'outbound', or 'all')
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully fetched Week statistics
 *       500:
 *         description: Failed to fetch Week statistics
 */

router.get("/statistics/All", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const type = req.query.type;
		const callStatsDaily = await getDailyCallStatsAll(userId, type);
		const callStatsOverall = await getCallStatsAll(type, userId);
		res.json({
			dailyStats: callStatsDaily,
			totalCallDuration: callStatsOverall[0].totalcallduration * 1000,
			totalCostOverAllCalls: callStatsOverall[0].totalcostoverallcalls,
			totalNumberOfCalls: callStatsOverall[0].totalnumberofcalls,
			previousTotalNumberOfCalls:
				callStatsOverall[0].previoustotalnumberofcalls,
			previousTotalCallDuration:
				callStatsOverall[0].previoustotalcallduration * 1000,
			previousTotalCostOverAllCalls:
				callStatsOverall[0].previoustotalcostoverallcalls,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch conversation" });
	}
});

// Add these routes to your retellRoute.ts

/**
 * @swagger
 * /api/retell/phone-numbers:
 *   get:
 *     summary: List all phone numbers
 *     tags: [Retell]
 *     responses:
 *       200:
 *         description: Successfully fetched phone numbers
 *       500:
 *         description: Failed to fetch phone numbers
 */
router.get("/phone-numbers", userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const phoneNumbers = await listPhoneNumbers(userId);
    res.json(phoneNumbers);
  } catch (error: any) {
    console.error("Error in /phone-numbers:", error);
    res.status(500).json({ error: error.message });
  }
});
/**
 * @swagger
 * /api/retell/phone-number:
 *   post:
 *     summary: Create a new phone number
 *     tags: [Retell]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *               phone_number_type:
 *                 type: string
 *               area_code:
 *                 type: number
 *               inbound_agent_id:
 *                 type: string
 *               outbound_agent_id:
 *                 type: string
 *               nickname:
 *                 type: string
 *               inbound_webhook_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Phone number created successfully
 *       500:
 *         description: Failed to create phone number
 */
router.post("/phone-number", userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const config = req.body;
    const phoneNumber = await createPhoneNumber(config, userId);
    res.status(201).json(phoneNumber);
  } catch (error: any) {
    console.error("Error creating phone number:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/retell/phone-number/{phoneNumber}:
 *   get:	
 *     summary: Get a specific phone number (user must own it)
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched phone number	
 *       401:
 *         description: You don't have permission to access this phone number
 *       500:
 *         description: Failed to fetch phone number	
 */
router.get("/phone-number/:phoneNumber", userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const phoneNumber = req.params.phoneNumber;
    const phoneNumberData = await getPhoneNumber(phoneNumber, userId);
    res.json(phoneNumberData);
  } catch (error: any) {
    console.error(`Error getting phone number ${req.params.phoneNumber}:`, error);
    
    // Check if it's a permission error
    if (error.message.includes("don't have permission")) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});


/**
 * @swagger
 * /api/retell/phone-number/{phoneNumber}:
 *   patch:
 *     summary: Update a phone number (user must own it)
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inbound_agent_id:
 *                 type: string
 *               outbound_agent_id:
 *                 type: string
 *               nickname:
 *                 type: string
 *               inbound_webhook_url:
 *                 type: string
 *               inbound_allowed_countries:
 *                 type: array
 *                 items:
 *                   type: string
 *               outbound_allowed_countries:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Phone number updated successfully
 *       401:
 *         description: User doesn't own this phone number
 *       404:
 *         description: Phone number not found
 *       500:
 *         description: Failed to update phone number
 */
router.patch("/phone-number/:phoneNumber", userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const phoneNumberParam = req.params.phoneNumber;
    const updates = req.body;
    const updatedPhoneNumber = await updatePhoneNumber(phoneNumberParam, updates, userId);
    res.json(updatedPhoneNumber);
  } catch (error: any) {
    console.error(`Error updating phone number ${req.params.phoneNumber}:`, error);
    
    // Check error type
    if (error.message.includes("don't have permission") || 
        error.message.includes("don't own")) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
/**
 * @swagger
 * /api/retell/phone-number/{phoneNumber}:
 *   delete:
 *     summary: Delete a phone number
 *     tags: [Retell]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phone number deleted successfully
 *       500:
 *         description: Failed to delete phone number
 */
router.delete("/phone-number/:phoneNumber", userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const phoneNumber = req.params.phoneNumber;
    await deletePhoneNumber(phoneNumber, userId);
    res.json({ message: "Phone number deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting phone number ${req.params.phoneNumber}:`, error);
    
    if (error.message.includes("don't have permission")) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get("/admin/phone-numbers", userAuthenticate, async (req: any, res: any) => {
  try {
    // Add admin check here if needed
    const allPhoneNumbers = await listPhoneNumbers(); // No userId = all numbers
    res.json(allPhoneNumbers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
