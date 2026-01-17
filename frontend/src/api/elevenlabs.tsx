import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/elevenlabs"
});


const get11LabsCallsForAgentPath = () => `/calls`;
export interface I11LabsAgentCallsResponse {
  calls: string[];
}

export const get11LabsCallsForAgent = async (): Promise<I11LabsAgentCallsResponse | null> => {
  const { data } = await api.get<I11LabsAgentCallsResponse>(get11LabsCallsForAgentPath());
  return data;
};


const get11LabsCallDetailsPath = (callId: string) => `/calls/${callId}`;
export interface I11LabsCallResponse {
  transcript: { role: string; message: string }[];
  initiatedGenerationInputToken: number;
  irreversibleGenerationInputToken: number;
  transcriptsummary: string;
  systemTimeUtc: string;
  callDuration: number;
  totalCost: number;
  llmPrice: number;
  llmCharge: number;
  callCharge: number;
}

export const get11LabsCallDetails = async (callId: string): Promise<I11LabsCallResponse | null> => {
  const { data } = await api.get<I11LabsCallResponse>(get11LabsCallDetailsPath( callId));
  return data;
};


const get11labsStatisticsPath = (whichTimeFrame: string) => `/statistics/${whichTimeFrame}`;
export interface I11labsStatisticsResponse {
  totalCallDuration: number;
  totalCostOverAllCalls: number;
  totalLlmPrice: number;
  totalLlmCharge: number;
  totalCallChargeOverAllCalls: number;
  totalNumberOfCalls: number;
  previousTotalNumberOfCalls: number;
  previousTotalCallDuration: number;
  previousTotalCostOverAllCalls: number;
  previousTotalLlmCharge: number;
  previousTotalLlmPrice: number;
  previousTotalCallChargeOverAllCalls: number;
  dailyStats: Record<string, {
    totalCalls: number;
    totalDurationMs: number;
    totalCost: number;
    llmCharge : number;
    callCharge: number;
  }>;
}

export const get11labsStatistics = async (WhichTimeFrame: string): Promise<I11labsStatisticsResponse | null> => {
  const { data } = await api.get<I11labsStatisticsResponse>(get11labsStatisticsPath(WhichTimeFrame));
  return data;
};