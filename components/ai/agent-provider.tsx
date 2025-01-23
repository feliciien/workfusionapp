"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AgentContextType {
  isEnabled: boolean;
  preferences: AgentPreferences;
  updatePreferences: (prefs: Partial<AgentPreferences>) => void;
  toggleAgent: () => void;
}

interface AgentPreferences {
  showSuggestions: boolean;
  notifyNewFeatures: boolean;
  adaptiveHelp: boolean;
}

const defaultPreferences: AgentPreferences = {
  showSuggestions: true,
  notifyNewFeatures: true,
  adaptiveHelp: true,
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [preferences, setPreferences] = useState<AgentPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('agent-preferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error loading agent preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('agent-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (prefs: Partial<AgentPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...prefs,
    }));
  };

  const toggleAgent = () => {
    setIsEnabled(prev => !prev);
  };

  const value = {
    isEnabled,
    preferences,
    updatePreferences,
    toggleAgent,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
