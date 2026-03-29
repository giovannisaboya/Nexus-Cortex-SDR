export interface PromptVersion {
  id: string;
  name: string;
  content: string;
  timestamp: Date;
}

export interface AppConfig {
  apiKeys: string[];
  systemPrompt: string;
  temperature: number;
  context: string;
  companyName: string;
  selectedModelChat: string;
  selectedModelLive: string;
  selectedModelTts: string;
  selectedVoice: string;
  promptVersions: PromptVersion[];
}

export const DEFAULT_CONFIG: AppConfig = {
  apiKeys: ["__SYSTEM_KEY__"],
  systemPrompt: "",
  temperature: 0.7,
  context: "",
  companyName: "",
  selectedModelChat: "gemini-2.0-flash",
  selectedModelLive: "gemini-2.0-flash-live",
  selectedModelTts: "gemini-2.5-flash-preview-tts",
  selectedVoice: "Kore",
  promptVersions: []
};
