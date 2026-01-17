import { Router } from "express";
import {getCalls11labs, getCall11labs } from "../services/elevenLabs";
import { getAllAgentFromUser11lab, userAuthenticate } from "../auth/authService";


const router = Router();

// /**
//  * @swagger
//  * tags:
//  *    name: ElevenLabs
//  *    description: Endpoints for ElevenLabs
//  */

// /**
// * @swagger
// * /api/elevenlabs/calls:
// *   get:
// *     summary: Get the List of calls for a specific agent
// *     tags: [ElevenLabs]

// *     responses:
// *       200:
// *         description: Successfully fetched calls for agent
// *       500:
// *         description: Failed to fetch Retell calls for agent
// */
// router.get('/calls', userAuthenticate, async (req,res) => {
//   try {
//     const userId = req.user;
//     const calls = await getCalls11labs(userId);
//     const conversations = calls?.conversations;
//     const agents = await getAllAgentFromUser11lab(userId);
//     const validAgentIds = new Set(agents.data?.map(agent => agent.agentId));
//     const filteredCalls = conversations?.filter(object => validAgentIds.has(object.agentId));
//     const listOfCalls = filteredCalls?.map(call => call.conversationId);

//     res.json({calls: listOfCalls});
//   } catch (error){
//     res.status(500).json({error: 'Failed to fetch calls for agent'})
//   }
// })


// /**
//  * @swagger
//  * /api/elevenlabs/calls/{callId}:
//  *   get:
//  *     summary: Fetch a conversation by ID
//  *     tags: [ElevenLabs]
//  *     parameters:
//  *       - in: path
//  *         name: callId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The conversation ID
//  *     responses:
//  *       200:
//  *         description: Successfully fetched conversation
//  *       500:
//  *         description: Failed to fetch conversation
//  */
// router.get('/calls/:callId',userAuthenticate, async (req, res) => {
//   try {

//     //getting list of valid agents 
//     const value = req.user;
//     const Agents = await getAllAgentFromUser11lab(value);
//     const validAgentIds = new Set(Agents.data?.map(agent => agent.agentId));
//     const result = await getCall11labs(req.params.callId);

//     //ensuring that the call is accessible by the user.
//     if (!validAgentIds.has(result.agentId)){
//       res.status(401).json({
//         error: "You do not have access to this call"
//       })
//     } else {
//       //gets the messages and who said them in a neater version
//       const transcript = await result.transcript;
//       const rolesAndMessages = await transcript
//       .filter(({message}) => message)
//       .map(({role,message}) => ({role,message}));
//       //gets the modelusagedata
//       const initiatedGenerationInputToken = result.metadata.charging?.llmUsage?.initiatedGeneration?.modelUsage;
//       const irreversibleGenerationInputToken = result.metadata.charging?.llmUsage?.irreversibleGeneration?.modelUsage;

//       const systemTimeUtc = result.conversationInitiationClientData?.dynamicVariables?.system__time_utc;

//       //getting call cost data 
//       const callDuration = result.metadata.callDurationSecs;
//       const totalCost = result.metadata.cost;
//       const llmPrice = result.metadata.charging?.llmPrice;
//       const llmCharge = result.metadata.charging?.llmCharge;
//       const callCharge = result.metadata.charging?.callCharge;

//       //gets the summary of the transcript
//       const transcriptsummary = result.analysis?.transcriptSummary;


//       // res.json(result);
//       res.json({
//         transcript: rolesAndMessages,
//         initiatedGenerationInputToken: initiatedGenerationInputToken,
//         irreversibleGenerationInputToken: irreversibleGenerationInputToken,
//         transcriptsummary: transcriptsummary,
//         systemTimeUtc: systemTimeUtc,
//         callDuration: callDuration,
//         totalCost: totalCost,
//         llmPrice: llmPrice,
//         llmCharge: llmCharge,
//         callCharge: callCharge
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch conversation' });
//   }
// });


// /**
//  * @swagger
//  * /api/elevenlabs/statistics/Day:
//  *   get:
//  *     summary: Gets the statistics for all conversations 
//  *     tags: [ElevenLabs]
//  *     responses:
//  *       200:
//  *         description: Successfully fetched all statistics 
//  *       500:
//  *         description: Failed to fetch all statistics
//  */


// router.get('/statistics/Day',userAuthenticate, async (req, res) => {
//   try { 

//     interface DailyStat {
//       totalCalls: number;
//       totalDurationMs: number;
//       totalCost: number;
//       llmCharge: number;
//       callCharge: number;
//     }

//     const dailyStats: Record<string, DailyStat> = {};

//     const now = new Date();
//         // Choose start date based on timeframe
//     let whichTimeFrame = new Date();
//     whichTimeFrame.setDate(whichTimeFrame.getDate() - 1);
//     let whichPreviousTimeFrame = new Date(whichTimeFrame);
//     whichPreviousTimeFrame.setDate(whichPreviousTimeFrame.getDate()-1);
        
//     // Pre-fill dailyStats from whichTimeFrame to now
//     const dateCursor = new Date(whichTimeFrame);
//     while (dateCursor <= now) {
//       const key = dateCursor.toISOString().split("T")[0];
//       dailyStats[key] = {
//         totalCalls: 0,
//         totalDurationMs: 0,
//         totalCost: 0,
//         llmCharge : 0,
//         callCharge: 0
//       };
//       dateCursor.setDate(dateCursor.getDate() + 1); 
//     }


    

//     //getting the agent data and filtering it out 
//     const userId = req.user;
//     const calls = await getCalls11labs();
//     const conversations = calls?.conversations;
//     const Agents = await getAllAgentFromUser11lab(userId);
//     const validAgentIds = new Set(Agents.data?.map(agent => agent.agentId));
//     const filteredCalls = conversations?.filter(object => validAgentIds.has(object.agentId));

//     //getting call cost data 
//     let totalCallDuration = 0;
//     let totalCostOverAllCalls = 0;
//     let totalLlmPrice = 0;
//     let totalLlmCharge = 0;
//     let totalCallChargeOverAllCalls = 0;

//     let previousTotalCallDuration = 0;
//     let previousTotalCostOverAllCalls = 0;
//     let previousTotalLlmPrice = 0;
//     let previousTotalLlmCharge = 0;
//     let previousTotalCallChargeOverAllCalls = 0;

//     //total number of calls
//     let totalNumberOfCalls = 0
//     let previousTotalNumberOfCalls = 0;


//     //summing up the cost data over all calls
//     if (filteredCalls) {
//       await Promise.all(filteredCalls.map(async element => {
//         const conversationDataBuffer = await getCall11labs(element.conversationId);
//         const callTime = new Date(conversationDataBuffer.metadata.startTimeUnixSecs*1000);
//         if (callTime >= whichTimeFrame){
//           let dateKey = callTime.toISOString().split("T")[0]
//           if (!dailyStats[dateKey]){
//             dailyStats[dateKey]  = {
//               totalCalls:  1,
//               totalDurationMs : conversationDataBuffer.metadata.callDurationSecs ?? 0,
//               totalCost : conversationDataBuffer.metadata.cost ?? 0,
//               llmCharge : conversationDataBuffer.metadata.charging?.llmCharge ?? 0,
//               callCharge : conversationDataBuffer.metadata.charging?.callCharge ?? 0,
//             } 
//           } else {
//             dailyStats[dateKey].totalCalls++
//             dailyStats[dateKey].totalDurationMs+= conversationDataBuffer.metadata.callDurationSecs ?? 0
//             dailyStats[dateKey].totalCost+= conversationDataBuffer.metadata.cost ?? 0
//             dailyStats[dateKey].llmCharge+= conversationDataBuffer.metadata.charging?.llmCharge ?? 0
//             dailyStats[dateKey].callCharge+= conversationDataBuffer.metadata.charging?.callCharge ?? 0
//           }
//           totalNumberOfCalls++;
//           totalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           totalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           totalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           totalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;
//         } 
//         else if (callTime >= whichPreviousTimeFrame){
//           previousTotalNumberOfCalls++;
//           previousTotalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           previousTotalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           previousTotalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           previousTotalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;        }
//       }));
//     }



//     res.json({
//       totalCallDuration: totalCallDuration,
//       totalCostOverAllCalls: totalCostOverAllCalls,
//       totalLlmPrice: totalLlmPrice,
//       totalLlmCharge: totalLlmCharge,
//       totalCallChargeOverAllCalls: totalCallChargeOverAllCalls,
//       totalNumberOfCalls: totalNumberOfCalls,
//       previousTotalNumberOfCalls: previousTotalNumberOfCalls,
//       previousTotalCallDuration: previousTotalCallDuration,
//       previousTotalCostOverAllCalls: previousTotalCostOverAllCalls,
//       previousTotalLlmCharge: previousTotalLlmCharge,
//       previousTotalLlmPrice: previousTotalLlmPrice,
//       previousTotalCallChargeOverAllCalls: previousTotalCallChargeOverAllCalls,
//       dailyStats: dailyStats
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// /**
//  * @swagger
//  * /api/elevenlabs/statistics/Week:
//  *   get:
//  *     summary: Gets the statistics for all conversations 
//  *     tags: [ElevenLabs]
//  *     responses:
//  *       200:
//  *         description: Successfully fetched all statistics 
//  *       500:
//  *         description: Failed to fetch all statistics
//  */


// router.get('/statistics/Week',userAuthenticate, async (req, res) => {
//   try { 

//     interface DailyStat {
//       totalCalls: number;
//       totalDurationMs: number;
//       totalCost: number;
//       llmCharge: number;
//       callCharge: number;
//     }

//     const dailyStats: Record<string, DailyStat> = {};

//     const now = new Date();
//         // Choose start date based on timeframe
//     let whichTimeFrame = new Date();
//     whichTimeFrame.setDate(whichTimeFrame.getDate() - 7);
//     let whichPreviousTimeFrame = new Date(whichTimeFrame);
//     whichPreviousTimeFrame.setDate(whichPreviousTimeFrame.getDate()-7);
        

//     // Pre-fill dailyStats from whichTimeFrame to now
//     const dateCursor = new Date(whichTimeFrame);
//     while (dateCursor <= now) {
//       const key = dateCursor.toISOString().split("T")[0];
//       dailyStats[key] = {
//         totalCalls: 0,
//         totalDurationMs: 0,
//         totalCost: 0,
//         llmCharge : 0,
//         callCharge: 0
//       };
//       dateCursor.setDate(dateCursor.getDate() + 1); 
//     }


    
//     //getting the agent data and filtering it out 
//     const userId = req.user;
//     const calls = await getCalls11labs();
//     const conversations = calls?.conversations;
//     const Agents = await getAllAgentFromUser11lab(userId);
//     const validAgentIds = new Set(Agents.data?.map(agent => agent.agentId));
//     const filteredCalls = conversations?.filter(object => validAgentIds.has(object.agentId));

//     //getting call cost data 
//     let totalCallDuration = 0;
//     let totalCostOverAllCalls = 0;
//     let totalLlmPrice = 0;
//     let totalLlmCharge = 0;
//     let totalCallChargeOverAllCalls = 0;

//     let previousTotalCallDuration = 0;
//     let previousTotalCostOverAllCalls = 0;
//     let previousTotalLlmPrice = 0;
//     let previousTotalLlmCharge = 0;
//     let previousTotalCallChargeOverAllCalls = 0;

//     //total number of calls
//     let totalNumberOfCalls = 0
//     let previousTotalNumberOfCalls = 0;


//     //summing up the cost data over all calls
//     if (filteredCalls) {
//       await Promise.all(filteredCalls.map(async element => {
//         const conversationDataBuffer = await getCall11labs(element.conversationId);
//         const callTime = new Date(conversationDataBuffer.metadata.startTimeUnixSecs*1000);
//         if (callTime >= whichTimeFrame){
//           let dateKey = callTime.toISOString().split("T")[0]
//           if (!dailyStats[dateKey]){
//             dailyStats[dateKey]  = {
//               totalCalls:  1,
//               totalDurationMs : conversationDataBuffer.metadata.callDurationSecs ?? 0,
//               totalCost : conversationDataBuffer.metadata.cost ?? 0,
//               llmCharge : conversationDataBuffer.metadata.charging?.llmCharge ?? 0,
//               callCharge : conversationDataBuffer.metadata.charging?.callCharge ?? 0,
//             } 
//           } else {
//             dailyStats[dateKey].totalCalls++
//             dailyStats[dateKey].totalDurationMs+= conversationDataBuffer.metadata.callDurationSecs ?? 0
//             dailyStats[dateKey].totalCost+= conversationDataBuffer.metadata.cost ?? 0
//             dailyStats[dateKey].llmCharge+= conversationDataBuffer.metadata.charging?.llmCharge ?? 0
//             dailyStats[dateKey].callCharge+= conversationDataBuffer.metadata.charging?.callCharge ?? 0
//           }
//           totalNumberOfCalls++;
//           totalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           totalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           totalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           totalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;
//         } 
//         else if (callTime >= whichPreviousTimeFrame){
//           previousTotalNumberOfCalls++;
//           previousTotalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           previousTotalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           previousTotalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           previousTotalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;        }
//       }));
//     }



//     res.json({
//       totalCallDuration: totalCallDuration,
//       totalCostOverAllCalls: totalCostOverAllCalls,
//       totalLlmPrice: totalLlmPrice,
//       totalLlmCharge: totalLlmCharge,
//       totalCallChargeOverAllCalls: totalCallChargeOverAllCalls,
//       totalNumberOfCalls: totalNumberOfCalls,
//       previousTotalNumberOfCalls: previousTotalNumberOfCalls,
//       previousTotalCallDuration: previousTotalCallDuration,
//       previousTotalCostOverAllCalls: previousTotalCostOverAllCalls,
//       previousTotalLlmCharge: previousTotalLlmCharge,
//       previousTotalLlmPrice: previousTotalLlmPrice,
//       previousTotalCallChargeOverAllCalls: previousTotalCallChargeOverAllCalls,
//       dailyStats: dailyStats
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// /**
//  * @swagger
//  * /api/elevenlabs/statistics/Month:
//  *   get:
//  *     summary: Gets the statistics for all conversations 
//  *     tags: [ElevenLabs]
//  *     responses:
//  *       200:
//  *         description: Successfully fetched all statistics 
//  *       500:
//  *         description: Failed to fetch all statistics
//  */


// router.get('/statistics/Month',userAuthenticate, async (req, res) => {
//   try { 

//     interface DailyStat {
//       totalCalls: number;
//       totalDurationMs: number;
//       totalCost: number;
//       llmCharge: number;
//       callCharge: number;
//     }

//     const dailyStats: Record<string, DailyStat> = {};

//     const now = new Date();
//         // Choose start date based on timeframe
//     let whichTimeFrame = new Date();
//     whichTimeFrame.setMonth(whichTimeFrame.getMonth() - 1);
//     let whichPreviousTimeFrame = new Date(whichTimeFrame);
//     whichPreviousTimeFrame.setMonth(whichPreviousTimeFrame.getMonth()-1);

       

//     // Pre-fill dailyStats from whichTimeFrame to now
//     const dateCursor = new Date(whichTimeFrame);
//     while (dateCursor <= now) {
//       const key = dateCursor.toISOString().split("T")[0];
//       dailyStats[key] = {
//         totalCalls: 0,
//         totalDurationMs: 0,
//         totalCost: 0,
//         llmCharge : 0,
//         callCharge: 0
//       };
//       dateCursor.setDate(dateCursor.getDate() + 1); 
//     }


    
//     //getting the agent data and filtering it out 
//     const userId = req.user;
//     const calls = await getCalls11labs();
//     const conversations = calls?.conversations;
//     const Agents = await getAllAgentFromUser11lab(userId);
//     const validAgentIds = new Set(Agents.data?.map(agent => agent.agentId));
//     const filteredCalls = conversations?.filter(object => validAgentIds.has(object.agentId));

//     //getting call cost data 
//     let totalCallDuration = 0;
//     let totalCostOverAllCalls = 0;
//     let totalLlmPrice = 0;
//     let totalLlmCharge = 0;
//     let totalCallChargeOverAllCalls = 0;

//     let previousTotalCallDuration = 0;
//     let previousTotalCostOverAllCalls = 0;
//     let previousTotalLlmPrice = 0;
//     let previousTotalLlmCharge = 0;
//     let previousTotalCallChargeOverAllCalls = 0;

//     //total number of calls
//     let totalNumberOfCalls = 0
//     let previousTotalNumberOfCalls = 0;


//     //summing up the cost data over all calls
//     if (filteredCalls) {
//       await Promise.all(filteredCalls.map(async element => {
//         const conversationDataBuffer = await getCall11labs(element.conversationId);
//         const callTime = new Date(conversationDataBuffer.metadata.startTimeUnixSecs*1000);
//         if (callTime >= whichTimeFrame){
//           let dateKey = callTime.toISOString().split("T")[0]
//           if (!dailyStats[dateKey]){
//             dailyStats[dateKey]  = {
//               totalCalls:  1,
//               totalDurationMs : conversationDataBuffer.metadata.callDurationSecs ?? 0,
//               totalCost : conversationDataBuffer.metadata.cost ?? 0,
//               llmCharge : conversationDataBuffer.metadata.charging?.llmCharge ?? 0,
//               callCharge : conversationDataBuffer.metadata.charging?.callCharge ?? 0,
//             } 
//           } else {
//             dailyStats[dateKey].totalCalls++
//             dailyStats[dateKey].totalDurationMs+= conversationDataBuffer.metadata.callDurationSecs ?? 0
//             dailyStats[dateKey].totalCost+= conversationDataBuffer.metadata.cost ?? 0
//             dailyStats[dateKey].llmCharge+= conversationDataBuffer.metadata.charging?.llmCharge ?? 0
//             dailyStats[dateKey].callCharge+= conversationDataBuffer.metadata.charging?.callCharge ?? 0
//           }
//           totalNumberOfCalls++;
//           totalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           totalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           totalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           totalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;
//         } 
//         else if (callTime >= whichPreviousTimeFrame){
//           previousTotalNumberOfCalls++;
//           previousTotalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           previousTotalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           previousTotalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           previousTotalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;        }
//       }));
//     }



//     res.json({
//       totalCallDuration: totalCallDuration,
//       totalCostOverAllCalls: totalCostOverAllCalls,
//       totalLlmPrice: totalLlmPrice,
//       totalLlmCharge: totalLlmCharge,
//       totalCallChargeOverAllCalls: totalCallChargeOverAllCalls,
//       totalNumberOfCalls: totalNumberOfCalls,
//       previousTotalNumberOfCalls: previousTotalNumberOfCalls,
//       previousTotalCallDuration: previousTotalCallDuration,
//       previousTotalCostOverAllCalls: previousTotalCostOverAllCalls,
//       previousTotalLlmCharge: previousTotalLlmCharge,
//       previousTotalLlmPrice: previousTotalLlmPrice,
//       previousTotalCallChargeOverAllCalls: previousTotalCallChargeOverAllCalls,
//       dailyStats: dailyStats
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// /**
//  * @swagger
//  * /api/elevenlabs/statistics/Year:
//  *   get:
//  *     summary: Gets the statistics for all conversations 
//  *     tags: [ElevenLabs]
//  *     responses:
//  *       200:
//  *         description: Successfully fetched all statistics 
//  *       500:
//  *         description: Failed to fetch all statistics
//  */


// router.get('/statistics/Year',userAuthenticate, async (req, res) => {
//   try { 

//     interface DailyStat {
//       totalCalls: number;
//       totalDurationMs: number;
//       totalCost: number;
//       llmCharge: number;
//       callCharge: number;
//     }

//     const dailyStats: Record<string, DailyStat> = {};

//     const now = new Date();
//         // Choose start date based on timeframe
//     let whichTimeFrame = new Date();
//     whichTimeFrame.setFullYear(whichTimeFrame.getFullYear() - 1);
//     let whichPreviousTimeFrame = new Date();
//     whichPreviousTimeFrame.setFullYear(whichPreviousTimeFrame.getFullYear()-1);

//     // Pre-fill dailyStats from whichTimeFrame to now
//     const dateCursor = new Date(whichTimeFrame);
//     while (dateCursor <= now) {
//       const key = dateCursor.toISOString().split("T")[0];
//       dailyStats[key] = {
//         totalCalls: 0,
//         totalDurationMs: 0,
//         totalCost: 0,
//         llmCharge : 0,
//         callCharge: 0
//       };
//       dateCursor.setDate(dateCursor.getDate() + 1); 
//     }


    
//     //getting the agent data and filtering it out 
//     const userId = req.user;
//     const calls = await getCalls11labs();
//     const conversations = calls?.conversations;
//     const Agents = await getAllAgentFromUser11lab(userId);
//     const validAgentIds = new Set(Agents.data?.map(agent => agent.agentId));
//     const filteredCalls = conversations?.filter(object => validAgentIds.has(object.agentId));

//     //getting call cost data 
//     let totalCallDuration = 0;
//     let totalCostOverAllCalls = 0;
//     let totalLlmPrice = 0;
//     let totalLlmCharge = 0;
//     let totalCallChargeOverAllCalls = 0;

//     let previousTotalCallDuration = 0;
//     let previousTotalCostOverAllCalls = 0;
//     let previousTotalLlmPrice = 0;
//     let previousTotalLlmCharge = 0;
//     let previousTotalCallChargeOverAllCalls = 0;

//     //total number of calls
//     let totalNumberOfCalls = 0
//     let previousTotalNumberOfCalls = 0;


//     //summing up the cost data over all calls
//     if (filteredCalls) {
//       await Promise.all(filteredCalls.map(async element => {
//         const conversationDataBuffer = await getCall11labs(element.conversationId);
//         const callTime = new Date(conversationDataBuffer.metadata.startTimeUnixSecs*1000);
//         if (callTime >= whichTimeFrame){
//           let dateKey = callTime.toISOString().split("T")[0]
//           if (!dailyStats[dateKey]){
//             dailyStats[dateKey]  = {
//               totalCalls:  1,
//               totalDurationMs : conversationDataBuffer.metadata.callDurationSecs ?? 0,
//               totalCost : conversationDataBuffer.metadata.cost ?? 0,
//               llmCharge : conversationDataBuffer.metadata.charging?.llmCharge ?? 0,
//               callCharge : conversationDataBuffer.metadata.charging?.callCharge ?? 0,
//             } 
//           } else {
//             dailyStats[dateKey].totalCalls++
//             dailyStats[dateKey].totalDurationMs+= conversationDataBuffer.metadata.callDurationSecs ?? 0
//             dailyStats[dateKey].totalCost+= conversationDataBuffer.metadata.cost ?? 0
//             dailyStats[dateKey].llmCharge+= conversationDataBuffer.metadata.charging?.llmCharge ?? 0
//             dailyStats[dateKey].callCharge+= conversationDataBuffer.metadata.charging?.callCharge ?? 0
//           }
//           totalNumberOfCalls++;
//           totalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           totalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           totalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           totalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;
//         } 
//         else if (callTime >= whichPreviousTimeFrame){
//           previousTotalNumberOfCalls++;
//           previousTotalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//           previousTotalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//           previousTotalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//           previousTotalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;        }
//       }));
//     }



//     res.json({
//       totalCallDuration: totalCallDuration,
//       totalCostOverAllCalls: totalCostOverAllCalls,
//       totalLlmPrice: totalLlmPrice,
//       totalLlmCharge: totalLlmCharge,
//       totalCallChargeOverAllCalls: totalCallChargeOverAllCalls,
//       totalNumberOfCalls: totalNumberOfCalls,
//       previousTotalNumberOfCalls: previousTotalNumberOfCalls,
//       previousTotalCallDuration: previousTotalCallDuration,
//       previousTotalCostOverAllCalls: previousTotalCostOverAllCalls,
//       previousTotalLlmCharge: previousTotalLlmCharge,
//       previousTotalLlmPrice: previousTotalLlmPrice,
//       previousTotalCallChargeOverAllCalls: previousTotalCallChargeOverAllCalls,
//       dailyStats: dailyStats
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// /**
//  * @swagger
//  * /api/elevenlabs/statistics/All:
//  *   get:
//  *     summary: Gets the statistics for all conversations 
//  *     tags: [ElevenLabs]
//  *     responses:
//  *       200:
//  *         description: Successfully fetched all statistics 
//  *       500:
//  *         description: Failed to fetch all statistics
//  */


// router.get('/statistics/All',userAuthenticate, async (req, res) => {
//   try { 

//     interface DailyStat {
//       totalCalls: number;
//       totalDurationMs: number;
//       totalCost: number;
//       llmCharge: number;
//       callCharge: number;
//     }

//     const dailyStats: Record<string, DailyStat> = {};

//         // Choose start date based on timeframe

//     // Pre-fill dailyStats from whichTimeFrame to now



    

//     //getting the agent data and filtering it out 
//     const userId = req.user;
//     const calls = await getCalls11labs();
//     const conversations = calls?.conversations;
//     const Agents = await getAllAgentFromUser11lab(userId);
//     const validAgentIds = new Set(Agents.data?.map(agent => agent.agentId));
//     const filteredCalls = conversations?.filter(object => validAgentIds.has(object.agentId));

//     //getting call cost data 
//     let totalCallDuration = 0;
//     let totalCostOverAllCalls = 0;
//     let totalLlmPrice = 0;
//     let totalLlmCharge = 0;
//     let totalCallChargeOverAllCalls = 0;

//     //total number of calls
//     let totalNumberOfCalls = 0


//     //summing up the cost data over all calls
//     if (filteredCalls) {
//       await Promise.all(filteredCalls.map(async element => {
//         const conversationDataBuffer = await getCall11labs(element.conversationId);
//         const callTime = new Date(conversationDataBuffer.metadata.startTimeUnixSecs*1000);
//         let dateKey = callTime.toISOString().split("T")[0]
//         if (!dailyStats[dateKey]){
//           dailyStats[dateKey]  = {
//             totalCalls:  1,
//             totalDurationMs : conversationDataBuffer.metadata.callDurationSecs ?? 0,
//             totalCost : conversationDataBuffer.metadata.cost ?? 0,
//             llmCharge : conversationDataBuffer.metadata.charging?.llmCharge ?? 0,
//             callCharge : conversationDataBuffer.metadata.charging?.callCharge ?? 0,
//           } 
//         } else {
//           dailyStats[dateKey].totalCalls++
//           dailyStats[dateKey].totalDurationMs+= conversationDataBuffer.metadata.callDurationSecs ?? 0
//           dailyStats[dateKey].totalCost+= conversationDataBuffer.metadata.cost ?? 0
//           dailyStats[dateKey].llmCharge+= conversationDataBuffer.metadata.charging?.llmCharge ?? 0
//           dailyStats[dateKey].callCharge+= conversationDataBuffer.metadata.charging?.callCharge ?? 0
//         }
//         totalNumberOfCalls++;
//         totalCallDuration += conversationDataBuffer.metadata.callDurationSecs ?? 0;
//         totalCostOverAllCalls += conversationDataBuffer.metadata.cost ?? 0;
//         totalLlmCharge += conversationDataBuffer.metadata.charging?.llmCharge ?? 0;
//         totalCallChargeOverAllCalls += conversationDataBuffer.metadata.charging?.callCharge ?? 0;
//       }));
//     }



//     res.json({
//       totalCallDuration: totalCallDuration,
//       totalCostOverAllCalls: totalCostOverAllCalls,
//       totalLlmPrice: totalLlmPrice,
//       totalLlmCharge: totalLlmCharge,
//       totalCallChargeOverAllCalls: totalCallChargeOverAllCalls,
//       totalNumberOfCalls: totalNumberOfCalls,
//       dailyStats: dailyStats
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });


export default router;