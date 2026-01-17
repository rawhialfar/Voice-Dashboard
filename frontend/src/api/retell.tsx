import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/retell"
});

// Existing calls API
const getCallsForAgentPath = () => `/calls`;

export interface IRetellAgentCallsResponse {
  calls: Array<{
    call_id: string;
    direction: string;
  }>;
}

export const getRetellCallsForAgent = async (): Promise<IRetellAgentCallsResponse | null> => {
  const { data } = await api.get<IRetellAgentCallsResponse>(getCallsForAgentPath());
  return data;
};

const getRetellCallDetailsPath = (callId: string) => `/calls/${callId}`;
export interface IRetellCallResponse {
  transcript: string;
  callType: string;
  status: string;
  durationSeconds: number;
  totalCost: number;
  product: string;
  direction: string;
  summary: string;
  recordingUrl: any;
  disconnectionReason: string;
  sentiment: string;
  timestamp: number;
  fromNumber: string;
  toNumber: string;
}

export const getRetellCallDetails = async (callId: string): Promise<IRetellCallResponse | null> => {
  const { data } = await api.get<IRetellCallResponse>(getRetellCallDetailsPath(callId));
  return data;
};

const getRetellStatisticsPath = (whichTimeFrame: string, type?: string) => {
  const basePath = `/statistics/${whichTimeFrame}?type=${type}`;
  const params = new URLSearchParams();
  return params.toString() ? `${basePath}?${params.toString()}` : basePath;
};

export interface IRetellStatisticsResponse {
  totalCallDuration: number;
  totalCostOverAllCalls: number;
  totalNumberOfCalls: number;
  totalCallChargeOverAllCalls: number;
  previousTotalNumberOfCalls: number;
  previousTotalCallDuration: number;
  previousTotalCostOverAllCalls: number;
  dailyStats: Record<string, {
    totalCalls: number;
    totalDurationMs: number;
    totalCost: number;
  }>;
}

export const getRetellStatistics = async (whichTimeFrame: string, type?: string): Promise<IRetellStatisticsResponse | null> => {
  const { data } = await api.get<IRetellStatisticsResponse>(getRetellStatisticsPath(whichTimeFrame, type));
  return data;
};

// ========== NEW AGENT-RELATED API CALLS ==========

export interface RetellAgent {
  agentId: string;
  name: string;
  description?: string;
}

export interface AgentDetails {
  agentGeneralInfo: {
    agent_id: string;
    name: string;
    description?: string;
    llm_id: string;
    voice_id: string;
    language?: string;
    webhook_url?: string;
    response_engine: {
      type: string;
      llm_id: string;
    };
  };
  knowledgebases: Array<{
    knowledge_base_id: string;
    knowledge_base_name: string;
    knowledge_base_sources: Array<any>;
  }>;
}

export const getRetellAgents = async (): Promise<RetellAgent[]> => {
  const { data } = await api.get<RetellAgent[]>('/agents');
  return data;
};

export const getRetellAgentDetails = async (agentId: string): Promise<AgentDetails> => {
  const { data } = await api.get<AgentDetails>(`/agent/${agentId}`);
  return data;
};

export const deleteRetellAgent = async (agentId: string): Promise<void> => {
  await api.delete(`/agent/${agentId}`);
};

export const addKnowledgebaseToRetellAgent = async (agentId: string, knowledgebaseName: string): Promise<void> => {
  await api.post(`/agent/${agentId}/addKnowledgebase`, { knowledgebaseName });
};

export const deleteKnowledgebaseFromRetellAgent = async (agentId: string, knowledgebaseName: string): Promise<void> => {
  await api.delete(`/agent/${agentId}/deleteKnowledgebase`, {
    data: { knowledgebaseName }
  });
};

export interface CreateAgentRequest {
  agentName: string;
  agentType: 'inbound' | 'outbound';
  voiceId?: string;
  language?: string;
  knowledgeBaseNames?: string[];
  customSettings?: {
    maxCallDurationMs?: number;
    interruptionSensitivity?: number;
    allowUserDtmf?: boolean;
    userDtmfOptions?: any;
    postCallAnalysisModel?: string;
    piiConfig?: {
      mode: string;
      categories: string[];
    };
    dataStorageSetting?: 'everything' | 'transcript' | 'none';
    optInSignedUrl?: boolean;
  };
}

export interface QuickCreateAgentRequest {
  agentName: string;
  voiceId?: string;
  language?: string;
}

export interface CreateAgentResponse {
  message: string;
  agentId: string;
  agentName: string;
  llmId: string;
  voiceId: string;
  language: string;
  knowledgeBaseIds?: string[];
}

export interface QuickCreateAgentResponse {
  message: string;
  agentId: string;
  agentName: string;
  voiceId: string;
  language: string;
}

export const createRetellAgent = async (
  request: CreateAgentRequest
): Promise<CreateAgentResponse> => {
  const { data } = await api.post<CreateAgentResponse>('/agent', request);
  return data;
};

export const quickCreateRetellAgent = async (
  request: QuickCreateAgentRequest
): Promise<QuickCreateAgentResponse> => {
  const { data } = await api.post<QuickCreateAgentResponse>('/agent/quick', request);
  return data;
};

export const createOutboundAgent = async (
  agentName: string,
  options?: {
    voiceId?: string;
    language?: string;
    knowledgeBaseNames?: string[];
    customSettings?: Partial<CreateAgentRequest['customSettings']>;
  }
): Promise<CreateAgentResponse> => {
  return createRetellAgent({
    agentName,
    agentType: 'outbound',
    voiceId: options?.voiceId,
    language: options?.language,
    knowledgeBaseNames: options?.knowledgeBaseNames,
    customSettings: options?.customSettings,
  });
};

export const createInboundAgent = async (
  agentName: string,
  options?: {
    voiceId?: string;
    language?: string;
    knowledgeBaseNames?: string[];
    customSettings?: Partial<CreateAgentRequest['customSettings']>;
  }
): Promise<CreateAgentResponse> => {
  return createRetellAgent({
    agentName,
    agentType: 'inbound',
    voiceId: options?.voiceId,
    language: options?.language,
    knowledgeBaseNames: options?.knowledgeBaseNames,
    customSettings: options?.customSettings,
  });
};

// ========== HELPER FUNCTIONS FOR COMMON USE CASES ==========

export const VOICE_IDS = {
  CIMO: '11labs-Cimo',
  JENNY: '11labs-Jenny',
  ADAM: '11labs-Adam',
  ANTONI: '11labs-Antoni',
  ARNOLD: '11labs-Arnold',
  BELLA: '11labs-Bella',
  DOMI: '11labs-Domi',
  ELLE: '11labs-Elle',
  JOSH: '11labs-Josh',
  RACHEL: '11labs-Rachel',
  SAM: '11labs-Sam',
};

export const LANGUAGES = {
  EN_US: 'en-US',
  EN_GB: 'en-GB',
  DE_DE: 'de-DE',
  ES_ES: 'es-ES',
  FR_FR: 'fr-FR',
  IT_IT: 'it-IT',
  JA_JP: 'ja-JP',
  KO_KR: 'ko-KR',
  PT_BR: 'pt-BR',
  ZH_CN: 'zh-CN',
};

export const AGENT_PRESETS = {
  SALES_OUTBOUND: {
    voiceId: VOICE_IDS.CIMO,
    language: LANGUAGES.EN_US,
    customSettings: {
      interruptionSensitivity: 0.7,
      maxCallDurationMs: 1800000, 
      allowUserDtmf: false,
      postCallAnalysisModel: 'gpt-4.1-mini',
    },
  },
  CUSTOMER_SUPPORT_INBOUND: {
    voiceId: VOICE_IDS.JENNY,
    language: LANGUAGES.EN_US,
    customSettings: {
      interruptionSensitivity: 0.9,
      maxCallDurationMs: 3600000, 
      allowUserDtmf: true,
      postCallAnalysisModel: 'gpt-4.1-mini',
    },
  },
  APPOINTMENT_REMINDER: {
    voiceId: VOICE_IDS.BELLA,
    language: LANGUAGES.EN_US,
    customSettings: {
      interruptionSensitivity: 0.5,
      maxCallDurationMs: 600000, 
      allowUserDtmf: true,
    },
  },
  TECH_SUPPORT: {
    voiceId: VOICE_IDS.ADAM,
    language: LANGUAGES.EN_US,
    customSettings: {
      interruptionSensitivity: 0.8,
      maxCallDurationMs: 3600000,
      allowUserDtmf: true,
    },
  },
};

export const createAgentWithPreset = async (
  agentName: string,
  preset: keyof typeof AGENT_PRESETS,
  agentType: 'inbound' | 'outbound' = 'inbound',
  knowledgeBaseNames?: string[]
): Promise<CreateAgentResponse> => {
  const presetConfig = AGENT_PRESETS[preset];
  
  return createRetellAgent({
    agentName,
    agentType,
    voiceId: presetConfig.voiceId,
    language: presetConfig.language,
    knowledgeBaseNames,
    customSettings: presetConfig.customSettings,
  });
};

export interface UpdateAgentRequest {
  voiceId?: string;
  language?: string;
  maxCallDurationMs?: number;
  interruptionSensitivity?: number;
  allowUserDtmf?: boolean;
  userDtmfOptions?: any;
  webhookUrl?: string;
}

export const updateRetellAgent = async (
  agentId: string,
  updates: UpdateAgentRequest
): Promise<void> => {
  await api.patch(`/agent/${agentId}`, updates);
};

// ========== PHONE NUMBER MANAGEMENT ==========
export interface PhoneNumber {
  phone_number: string;
  phone_number_pretty: string;
  phone_number_type: string;
  inbound_agent_id?: string;
  outbound_agent_id?: string;
  nickname?: string;
  area_code?: number;
  inbound_webhook_url?: string;
  inbound_allowed_countries?: string[];
  outbound_allowed_countries?: string[];
}

export interface CreatePhoneNumberRequest {
  phone_number?: string;
  phone_number_type?: string;
  last_modification_timestamp?: number;
  area_code?: number;
  inbound_agent_id?: string;
  outbound_agent_id?: string;
  nickname?: string;
  inbound_webhook_url?: string;
  inbound_allowed_countries?: string[];
  outbound_allowed_countries?: string[];
}

export interface UpdatePhoneNumberRequest {
  inbound_agent_id?: string | null;
  outbound_agent_id?: string | null;
  nickname?: string;
  inbound_webhook_url?: string;
  inbound_allowed_countries?: string[];
  outbound_allowed_countries?: string[];
}

// In your frontend api/retell.ts
export const getPhoneNumbers = async (): Promise<PhoneNumber[]> => {
  const { data } = await api.get<PhoneNumber[]>('/phone-numbers');
  return data;
};

export const createPhoneNumber = async (request: CreatePhoneNumberRequest): Promise<PhoneNumber> => {
  const { data } = await api.post<PhoneNumber>('/phone-number', request);
  return data;
};

export const updatePhoneNumber = async (
  phoneNumber: string,
  updates: UpdatePhoneNumberRequest
): Promise<PhoneNumber> => {
  const { data } = await api.patch<PhoneNumber>(`/phone-number/${encodeURIComponent(phoneNumber)}`, updates);
  return data;
};

export const deletePhoneNumber = async (phoneNumber: string): Promise<void> => {
  await api.delete(`/phone-number/${encodeURIComponent(phoneNumber)}`);
};

// Helper function to get phone numbers for a specific agent
export const getPhoneNumbersForAgent = async (agentId: string): Promise<PhoneNumber[]> => {
  const { data } = await api.get<PhoneNumber[]>(`/agent/${agentId}/phone-numbers`);
  return data;
};