import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      workspace: 'default',
      language: 'en',
      branding: {
        brandName: 'AI Organic CMS',
        logo: '',
        primaryColor: '#2563eb',
        secondaryColor: '#0f172a',
        fontFamily: 'Inter',
      },
      aiSettings: {
        provider: 'OpenRouter',
        model: 'openai/gpt-4o',
        temperature: 0.7,
        autoPublish: false,
        verbosity: 'full', // Default to full as requested
        languages: ['en', 'es', 'fr', 'de', 'hi'],
      },
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      updateBranding: (branding) => set((state) => ({ branding: { ...state.branding, ...branding } })),
      setAiSettings: (settings) => set((state) => ({ aiSettings: { ...state.aiSettings, ...settings } })),
    }),
    {
      name: 'ai-cms-storage',
    }
  )
);
