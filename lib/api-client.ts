import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface Slide {
  type: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
}

export interface PresentationResponse {
  data: {
    slides: Slide[];
  };
}

export const api = {
  // Chat & Writing
  async chat(message: string): Promise<ApiResponse<{ response: string }>> {
    const response = await apiClient.post('/chat', { message });
    return response.data;
  },

  async generateContent(prompt: string): Promise<ApiResponse<{ content: string }>> {
    const response = await apiClient.post('/content', { prompt });
    return response.data;
  },

  async translate(text: string, targetLang: string): Promise<ApiResponse<{ translation: string }>> {
    const response = await apiClient.post('/translate', { text, targetLang });
    return response.data;
  },

  // Creative Suite
  async generateImage(prompt: string): Promise<ApiResponse<{ imageUrl: string }>> {
    const response = await apiClient.post('/image', { prompt });
    return response.data;
  },

  async generateMusic(prompt: string): Promise<ApiResponse<{ audioUrl: string }>> {
    const response = await apiClient.post('/music', { prompt });
    return response.data;
  },

  async generateVideo(prompt: string): Promise<ApiResponse<{ videoUrl: string }>> {
    const response = await apiClient.post('/video', { prompt });
    return response.data;
  },

  // Development
  async generateCode(prompt: string, language: string): Promise<ApiResponse<{ code: string }>> {
    const response = await apiClient.post('/code', { prompt, language });
    return response.data;
  },

  async analyzeCode(code: string): Promise<ApiResponse<{ data: any }>> {
    const response = await apiClient.post('/code-analysis', { code });
    return response.data;
  },

  // Business
  async analyzeData(data: any): Promise<ApiResponse<{ data: any }>> {
    const response = await apiClient.post('/data-insights', { data });
    return response.data;
  },

  async generatePresentation(topic: string): Promise<ApiResponse<PresentationResponse>> {
    const response = await apiClient.post('/presentation', { topic });
    return response.data;
  },

  // Learning
  async getStudyHelp(query: string): Promise<ApiResponse<{ data: { answer: string } }>> {
    const response = await apiClient.post('/study', { query });
    return response.data;
  },

  async generateIdeas(topic: string): Promise<ApiResponse<{ data: { ideas: string[] } }>> {
    const response = await apiClient.post('/ideas', { topic });
    return response.data;
  },
};

export default api;
