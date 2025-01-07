export interface NetworkMetric {
  value: number;
  timestamp: Date;
}

export interface NetworkMetrics {
  latency: NetworkMetric[];      // Array of latency measurements in ms
  bandwidth: NetworkMetric[];    // Array of bandwidth measurements in Mbps
  packetLoss: NetworkMetric[];   // Array of packet loss measurements in percentage
  jitter: NetworkMetric[];       // Array of jitter measurements in ms
  healthScore: number;           // Overall health score (0-100)
  status: NetworkStatus;         // Current network status
}

export type NetworkStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface NetworkHealth {
  score: number;                 // 0-100
  status: NetworkStatus;
  recommendations: NetworkRecommendation[];
}

export interface NetworkRecommendation {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  priority: number;              // 1-5, where 1 is highest priority
}

export interface NetworkInterface {
  name: string;
  address: string;
  type: string;
  isActive: boolean;
}

// API Response types
export interface NetworkMetricsResponse {
  metrics: NetworkMetrics;
  health: NetworkHealth;
  interfaces: NetworkInterface[];
}
