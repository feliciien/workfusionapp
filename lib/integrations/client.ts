import { 
  SlackAction, 
  GitHubAction, 
  JiraAction, 
  NotionAction,
  Integration,
  IntegrationSettings 
} from './types';

class IntegrationClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  // Generic request handler
  private async request(endpoint: string, options: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Slack Integration
  async slackAction(action: SlackAction, data: any) {
    return this.request('/api/integrations/slack', {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
  }

  // GitHub Integration
  async githubAction(action: GitHubAction, data: any) {
    return this.request('/api/integrations/github', {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
  }

  // Jira Integration
  async jiraAction(action: JiraAction, data: any) {
    return this.request('/api/integrations/jira', {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
  }

  // Notion Integration
  async notionAction(action: NotionAction, data: any) {
    return this.request('/api/integrations/notion', {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
  }

  // Get integration status
  async getStatus(integrationId: string): Promise<Integration> {
    return this.request(`/api/integrations/${integrationId}/status`, {
      method: 'GET',
    });
  }

  // Update integration settings
  async updateSettings(
    integrationId: string,
    settings: Partial<IntegrationSettings>
  ) {
    return this.request(`/api/integrations/${integrationId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Disconnect integration
  async disconnect(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}/disconnect`, {
      method: 'POST',
    });
  }

  // Sync integration data
  async sync(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }
}

export const integrationClient = new IntegrationClient();
