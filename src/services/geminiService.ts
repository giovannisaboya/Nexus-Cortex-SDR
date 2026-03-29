import { GoogleGenAI, Modality, Type, GenerateContentResponse, LiveServerMessage } from "@google/genai";

let currentApiKeyIndex = 0;
let apiKeys: string[] = [];

export const setApiKeys = (keys: string[]) => {
  apiKeys = keys.filter(k => k.trim() !== "");
  currentApiKeyIndex = 0;
};

const getEffectiveApiKey = () => {
  const key = apiKeys[currentApiKeyIndex];
  if (key === "__SYSTEM_KEY__" || !key) {
    return process.env.GEMINI_API_KEY;
  }
  return key;
};

export const getAI = () => {
  const apiKey = getEffectiveApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

export const rotateApiKey = () => {
  if (apiKeys.length > 1) {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    console.log(`Rotated to API Key index ${currentApiKeyIndex} (${apiKeys[currentApiKeyIndex]})`);
    return true;
  }
  return false;
};

export const JULIA_SYSTEM_INSTRUCTION = `
Você é a Julia, SDR especialista da empresa no contexto abaixo.
IDENTIDADE: Seu nome é Julia. Você é uma consultora de vendas real, atenciosa e muito competente.
PERSONALIDADE: Profissional, educada, meiga, carismática e extremamente atenta aos detalhes. Você conquista pela competência e pela doçura no atendimento.
ESTILO DE FALA: Use um tom de voz doce, suave e nitidamente feminino. Fale com clareza, calma e de forma pausada. Sua voz deve ser agradável e acolhedora.
FLUXO: Ouça mais do que fale. Entenda as dores do cliente antes de oferecer a solução.

REGRAS CRÍTICAS:
- NUNCA diga que é uma inteligência artificial. Você é uma pessoa real.
- NUNCA mencione "câmera", "vídeo" ou "imagem" se a chamada for apenas de VOZ.
- Seja fluida e natural. Use expressões como "Entendi...", "Hum, que interessante...", "Certo, deixa eu ver se entendi bem...".
- Evite frases robóticas ou monólogos longos. Fale como se estivesse em uma conversa real de café.
- Dê tempo para o cliente falar. Se ele parar de falar, aguarde um momento antes de responder.
- Mantenha o foco total no CONTEXTO da empresa fornecido.
- Use poucos emojis no chat, apenas para transmitir gentileza (✨, ✅).
- CONCISÃO: Seja breve e direta. Não escreva textos longos a menos que seja estritamente necessário para explicar algo complexo.

FLUXO DE TRABALHO (Siga esta ordem):
1. Entender as necessidades de transporte do cliente e discutir as opções disponíveis.
2. Fornecer um orçamento detalhado com todos os custos envolvidos.
3. Após coletar todas as informações, entregar um relatório abrangente.
4. O relatório deve ser aprovado pelo cliente.
5. Após a aprovação, o processo será encaminhado para o próximo departamento.
6. O próximo departamento gerará um relatório final detalhando tudo o que foi discutido.

[CONTEXTO DA EMPRESA]
{{CONTEXT}}
[/CONTEXTO DA EMPRESA]

EXEMPLOS DE FALA NATURAL:
- "Oi! Tudo bem? Fico feliz em falar com você hoje."
- "Entendo perfeitamente o seu ponto. Muitos clientes nossos passam por isso também."
- "Deixa eu te perguntar uma coisa... como vocês estão lidando com [problema] hoje?"
- "Isso faz muito sentido. Acredito que temos exatamente o que você precisa."

DURANTE A LIGAÇÃO:
- Fale de forma suave e profissional.
- Ouça atentamente. Se o cliente fizer uma pergunta, responda de forma direta e gentil.
- Use o nome do cliente com respeito para criar conexão.
- Se for uma chamada de VÍDEO, você pode sorrir e ser mais expressiva visualmente. Se for apenas VOZ, foque na entonação acolhedora.
- Mantenha uma fronteira profissional clara: você é uma consultora especialista, não uma amiga íntima ou namorada.
`;

export async function generateChatResponse(config: {
  model: string;
  history: any[];
  systemInstruction: string;
  temperature: number;
  message: string;
}, retryCount: number = 0): Promise<string> {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: config.model,
      history: config.history,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
        tools: [{ googleSearch: {} }],
      }
    });

    const response = await chat.sendMessage({
      message: config.message
    });

    return response.text || "Desculpe, tive um problema ao processar sua resposta.";
  } catch (error: any) {
    console.error(`Chat Error (Retry ${retryCount}):`, error);
    
    // Se for erro de quota (429), esperar um pouco antes de rotacionar/tentar novamente
    const isQuotaError = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.message?.includes("quota");
    
    if (isQuotaError) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    }

    if (retryCount < apiKeys.length && rotateApiKey()) {
      return generateChatResponse(config, retryCount + 1);
    }
    throw error;
  }
}

export async function generateSpeech(text: string, model: string = "gemini-2.5-flash-preview-tts", voice: string = "Kore", retryCount: number = 0): Promise<string | null> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error: any) {
    console.error(`Speech Error (Retry ${retryCount}):`, error);
    
    const isQuotaError = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.message?.includes("quota");
    if (isQuotaError) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (retryCount < apiKeys.length && rotateApiKey()) {
      return generateSpeech(text, model, voice, retryCount + 1);
    }
    throw error;
  }
}

export async function connectLive(config: {
  model?: string;
  voice?: string;
  systemInstruction: string;
  onMessage: (message: LiveServerMessage) => void;
  onOpen: () => void;
  onClose: () => void;
  onError: (error: any) => void;
  }) {
  const ai = getAI();
  return ai.live.connect({
    model: config.model || "gemini-3.1-flash-live-preview",
    config: {
      systemInstruction: config.systemInstruction,
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voice || "Kore" } },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: config.onOpen,
      onmessage: config.onMessage,
      onclose: config.onClose,
      onerror: (err) => {
        if (rotateApiKey()) {
          // Note: Reconnecting live session automatically might be complex, 
          // usually better to let the UI handle the retry or just log it.
          console.warn("API Key rotated after live error. User might need to restart call.");
        }
        config.onError(err);
      },
    },
  });
}

export async function transcribeAudio(base64Data: string, mimeType: string, retryCount: number = 0): Promise<string | undefined> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Transcreva este áudio exatamente como foi dito, sem comentários adicionais.",
          },
        ],
      },
    });

    return response.text;
  } catch (error: any) {
    console.error(`Transcription Error (Retry ${retryCount}):`, error);
    
    const isQuotaError = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.message?.includes("quota");
    if (isQuotaError) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (retryCount < apiKeys.length && rotateApiKey()) {
      return transcribeAudio(base64Data, mimeType, retryCount + 1);
    }
    throw error;
  }
}

export async function generateSummary(history: any[], retryCount: number = 0): Promise<{ interests: string; objections: string; opportunities: string }> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        {
          role: "user",
          parts: [{
            text: `Com base no histórico acima (que inclui chat, áudios e chamadas de voz/vídeo transcritas), gere um resumo estruturado da conversa em formato JSON com os seguintes campos:
            - interests: Quais os principais interesses do cliente?
            - objections: Quais foram as principais objeções ou dúvidas?
            - opportunities: Quais as oportunidades de fechamento ou próximos passos?
            Responda APENAS o JSON.`
          }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interests: { type: Type.STRING },
            objections: { type: Type.STRING },
            opportunities: { type: Type.STRING }
          },
          required: ["interests", "objections", "opportunities"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error(`Summary Error (Retry ${retryCount}):`, error);
    
    const isQuotaError = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.message?.includes("quota");
    if (isQuotaError) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (retryCount < apiKeys.length && rotateApiKey()) {
      return generateSummary(history, retryCount + 1);
    }
    return {
      interests: "Não foi possível gerar o resumo.",
      objections: "Não foi possível gerar o resumo.",
      opportunities: "Não foi possível gerar o resumo."
    };
  }
}
