import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Slide {
  type?: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
  notes?: string;
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
  async chat(message: string): Promise<ApiResponse<{ response: string }>> {
    const response = await apiClient.post('/chat', { message });
    return response.data;
  },

  async generateContent(
    prompt: string,
    type: string = "blog",
    tone: string = "professional"
  ): Promise<ApiResponse<{ content: string }>> {
    const response = await apiClient.post('/content', { prompt, type, tone });
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

  async analyzeCode(code: string): Promise<ApiResponse<{ score: number; issues: Array<{ severity: string; message: string; line?: number }>; suggestions: string[] }>> {
    try {
      console.log('Sending code analysis request');
      const response = await apiClient.post('/code-analysis', { code });
      console.log('Code analysis response:', response);
      
      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Code analysis error:', error);
      throw error;
    }
  },

  // Business
  async analyzeData(data: any): Promise<ApiResponse<DataInsightsResponse>> {
    const response = await apiClient.post('/data-insights', { data });
    return response.data;
  },

  async generatePresentation(topic: string, template: string = 'business'): Promise<ApiResponse<PresentationResponse>> {
    try {
      const response = await apiClient.post('/presentation', { topic, template });
      
      // Add logging to debug response
      console.log('API Response:', response.data);
      
      if (!response.data?.slides) {
        throw new Error('Invalid response structure: missing slides');
      }
      
      return {
        success: true,
        data: {
          slides: response.data.slides
        }
      };
    } catch (error: any) {
      console.error('Presentation API error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to generate presentation'
      };
    }
  },

  // Learning
  async getStudyHelp(query: string, learningType: string = 'summary'): Promise<ApiResponse<{ answer: string }>> {
    const response = await apiClient.post('/learning', { 
      content: query,
      learningType 
    });
    return {
      success: true,
      data: {
        answer: response.data.content
      }
    };
  },

  async generateIdeas(topic: string): Promise<ApiResponse<{ ideas: string[] }>> {
    try {
      const response = await apiClient.post('/ideas', { topic });
      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
      return response.data;
    } catch (error) {
      console.error('Ideas API error:', error);
      throw error;
    }
  },
};

export default api;
