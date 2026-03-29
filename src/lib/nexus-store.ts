import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  role: "agent" | "lead";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  leadName: string;
  leadContact: string;
  status: "Quente" | "Morno" | "Frio";
  score: number;
  origin: string;
  lastMessage: string;
  messages: Message[];
}

export interface AgentConfig {
  companyName: string;
  agentName: string;
  objective: string;
  context: string;
}

export interface NexusState {
  // User & Agent
  userName: string;
  agent: AgentConfig;
  
  // App State
  hasCompletedOnboarding: boolean;
  
  // Data
  conversations: Conversation[];
  
  // Actions
  setUserName: (name: string) => void;
  updateAgent: (config: Partial<AgentConfig>) => void;
  completeOnboarding: () => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateConversationStatus: (id: string, status: Conversation["status"], score: number) => void;
  resetAll: () => void;
}

const DEFAULT_AGENT: AgentConfig = {
  companyName: "Minha Empresa",
  agentName: "Julia",
  objective: "Qualificar e agendar call",
  context: "",
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    leadName: "Carlos M.",
    leadContact: "+55 11 9XXXX-1234",
    status: "Quente",
    score: 86,
    origin: "WhatsApp",
    lastMessage: "Qual o próximo passo pra ativar?",
    messages: [
      { role: "lead", text: "Qual o próximo passo pra ativar?", timestamp: "09:18" },
      { role: "agent", text: "Me manda o contexto do seu produto e eu configuro a Julia pra responder hoje.", timestamp: "09:19" },
    ],
  },
  {
    id: "c2",
    leadName: "Fernanda A.",
    leadContact: "+55 21 9XXXX-7781",
    status: "Morno",
    score: 63,
    origin: "Instagram",
    lastMessage: "Consigo enviar um PDF com a oferta?",
    messages: [
      { role: "lead", text: "Consigo enviar um PDF com a oferta?", timestamp: "Ontem" },
    ],
  },
];

export const useNexusStore = create<NexusState>()(
  persist(
    (set) => ({
      userName: "Giovanni",
      agent: DEFAULT_AGENT,
      hasCompletedOnboarding: false,
      conversations: MOCK_CONVERSATIONS,

      setUserName: (name) => set({ userName: name }),
      
      updateAgent: (config) => set((state) => ({ 
        agent: { ...state.agent, ...config } 
      })),
      
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      addMessage: (id, msg) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === id 
            ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text } 
            : c
        )
      })),

      updateConversationStatus: (id, status, score) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === id ? { ...c, status, score } : c
        )
      })),

      resetAll: () => set({
        userName: "Usuário",
        agent: DEFAULT_AGENT,
        hasCompletedOnboarding: false,
        conversations: MOCK_CONVERSATIONS,
      }),
    }),
    {
      name: "nexus-cortex-storage",
    }
  )
);
