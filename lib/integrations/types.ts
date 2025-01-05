// Integration Status
export type IntegrationStatus = 'connected' | 'disconnected' | 'pending';

// Base Integration Type
export interface Integration {
  id: string;
  name: string;
  status: IntegrationStatus;
  connectedAt?: Date;
  lastSyncedAt?: Date;
}

// Slack Integration
export interface SlackIntegration extends Integration {
  workspaceName: string;
  channels: string[];
  botToken?: string;
  webhooks: {
    id: string;
    channel: string;
    events: string[];
  }[];
}

// GitHub Integration
export interface GitHubIntegration extends Integration {
  repositories: string[];
  accessToken?: string;
  webhooks: {
    id: string;
    repository: string;
    events: string[];
  }[];
}

// Jira Integration
export interface JiraIntegration extends Integration {
  host: string;
  projects: string[];
  accessToken?: string;
  webhooks: {
    id: string;
    project: string;
    events: string[];
  }[];
}

// Notion Integration
export interface NotionIntegration extends Integration {
  workspace: string;
  databases: {
    id: string;
    name: string;
    synced: boolean;
  }[];
  accessToken?: string;
}

// Integration Actions
export type SlackAction = 'createChannel' | 'sendMessage' | 'listChannels';
export type GitHubAction = 'createPR' | 'listRepos' | 'createWebhook';
export type JiraAction = 'createIssue' | 'getIssue' | 'listProjects' | 'createWebhook';
export type NotionAction = 'createPage' | 'searchDatabase' | 'createDatabase' | 'syncContent';

// Integration Events
export interface IntegrationEvent {
  id: string;
  type: string;
  createdAt: Date;
  data: any;
}

// Integration Settings
export interface IntegrationSettings {
  autoSync: boolean;
  syncInterval: number;
  notifications: boolean;
  webhookEnabled: boolean;
}
