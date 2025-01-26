import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Slide {
  type: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
}

export interface PresentationResponse {
  slides: Slide[];
}

export interface DataInsightsResponse {
  metrics: Record<string, number | string>;
  trends: string[];
  recommendations: string[];
}

export const api = {
  // Chat & Writing
  async chat(message: string): Promise<{ response: string }> {
    const response = await apiClient.post('/chat', { message });
    return response.data;
  },

  async generateContent(
    prompt: string,
    type: string = "blog",
    tone: string = "professional"
  ): Promise<{ content: string }> {
    const response = await apiClient.post('/content', { prompt, type, tone });
    return response.data;
  },

  async translate(text: string, targetLang: string): Promise<{ translation: string }> {
    const response = await apiClient.post('/translate', { text, targetLanguage: targetLang });
    return response.data;
  },

  // Creative Suite
  async generateImage(prompt: string): Promise<{ imageUrl: string }> {
    const response = await apiClient.post('/image', { prompt });
    return response.data;
  },

  async generateMusic(prompt: string): Promise<{ audioUrl: string }> {
    const response = await apiClient.post('/music', { prompt });
    return response.data;
  },

  async generateVideo(prompt: string): Promise<{ videoUrl: string }> {
    const response = await apiClient.post('/video', { prompt });
    return response.data;
  },

  // Development
  async generateCode(prompt: string, language: string): Promise<{ code: string }> {
    const response = await apiClient.post('/code', { prompt, language });
    return response.data;
  },

  async analyzeCode(code: string): Promise<{
    score: number;
    issues: Array<{ severity: string; message: string; line?: number }>;
    suggestions: string[];
  }> {
    const response = await apiClient.post('/code-analysis', { code });
    return response.data;
  },

  // Business
  async analyzeData(data: any): Promise<DataInsightsResponse> {
    const response = await apiClient.post('/data-insights', { data });
    return response.data;
  },

  async generatePresentation(
    topic: string,
    template: string = 'business',
    colorScheme: string = 'default'
  ): Promise<PresentationResponse> {
    const response = await apiClient.post('/presentation', { topic, template, colorScheme });
    return response.data;
  },

  // Learning
  async getStudyHelp(query: string): Promise<{ answer: string }> {
    const response = await apiClient.post('/study', { query });
    return response.data;
  },

  async generateIdeas(topic: string): Promise<{ ideas: string[] }> {
    const response = await apiClient.post('/ideas', { topic });
    return response.data;
  },
};

export default api;
