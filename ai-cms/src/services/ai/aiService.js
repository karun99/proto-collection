import { useAppStore } from '../store/appStore';

export const generateContent = async (prompt, options = {}) => {
  const { aiSettings, language } = useAppStore.getState();
  const { 
    model = aiSettings.model, 
    temperature = aiSettings.temperature,
    verbosity = aiSettings.verbosity || 'basic'
  } = options;

  try {
    // In a real app, this would call OpenRouter or another provider
    // For this prototype, we simulate the AI response
    console.log(`[AI Request] Model: ${model}, Language: ${language}, Verbosity: ${verbosity}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResponses = {
      en: {
        title: "Scaling Your Business with AI Automation",
        content: "AI automation is transforming how businesses operate. By leveraging machine learning models...",
        seo: { score: 92, keywords: ["AI", "Automation", "SaaS"] }
      },
      hi: {
        title: "AI ऑटोमेशन के साथ अपने व्यवसाय को बढ़ाना",
        content: "AI ऑटोमेशन व्यवसायों के काम करने के तरीके को बदल रहा है। मशीन लर्निंग मॉडल का लाभ उठाकर...",
        seo: { score: 88, keywords: ["एआई", "ऑटोमेशन", "बिजनेस"] }
      },
      es: {
        title: "Escalando su negocio con automatización de IA",
        content: "La automatización de la IA está transformando la forma en que operan las empresas...",
        seo: { score: 90, keywords: ["IA", "Automatización", "Negocios"] }
      }
    };

    const response = mockResponses[language] || mockResponses.en;
    
    if (verbosity === 'full') {
      console.log('[AI Debug] Full response metadata:', {
        tokens: 450,
        latency: '1.5s',
        model_id: model,
        finish_reason: 'stop'
      });
    }

    return response;
  } catch (error) {
    if (verbosity === 'full') {
      console.error('[AI Error Details]', error);
    }
    throw new Error(`AI Generation failed: ${error.message}`);
  }
};
