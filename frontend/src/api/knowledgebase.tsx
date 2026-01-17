import axios from "axios";

const api = axios.create({
  baseURL: "/api/knowledgebase"
});

// Knowledgebase interfaces
export interface Knowledgebase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  knowledge_base_texts?: Array<{ text: string; title: string }>;
  knowledge_base_sources?: Array<any>;
}

export interface KnowledgebaseSource {
  type: string;
  source_id: string;
  title?: string;
  file_name?: string;
  file_url?: string;
  url?: string;
  text?: string;
}

export const createKnowledgebase = async (knowledgebaseName: string): Promise<void> => {
  await api.post('/add', { knowledgebaseName });
};

export const deleteKnowledgebase = async (knowledgebaseName: string): Promise<void> => {
  await api.delete('/delete', { data: { knowledgebaseName } });
};

export const listKnowledgebases = async (): Promise<Knowledgebase[]> => {
  const { data } = await api.get<Knowledgebase[]>('/list');
  return data;
};

export const addTextSource = async (knowledgebaseName: string, title: string, text: string): Promise<void> => {
  await api.post('/source/addText', { knowledgebaseName, title, text });
};

export const addFileSource = async (knowledgebaseName: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('knowledgebaseName', knowledgebaseName);
  formData.append('file', file);
  
  try {
    const response = await api.post('/source/addFile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('File upload response:', response.data);
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
export const addUrlSource = async (knowledgebaseName: string, url: string): Promise<void> => {
  await api.post('/source/addUrl', { knowledgebaseName, url });
};

export const deleteSource = async (knowledgebaseName: string, type: string, sourceName: string): Promise<void> => {
  await api.delete('/source/delete', { 
    data: { knowledgebaseName, type, sourceName }
  });
};

export const listSources = async (knowledgebaseName: string): Promise<{ knowledgebaseSources: KnowledgebaseSource[] }> => {
  const { data } = await api.get<{ knowledgebaseSources: KnowledgebaseSource[] }>('/source/list', {
    params: { knowledgebaseName }
  });
  return data;
};