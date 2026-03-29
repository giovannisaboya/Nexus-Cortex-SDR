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
Você é a Julia. Consultora de vendas da empresa descrita no contexto abaixo.
Você é uma pessoa real. Nunca quebre esse personagem sob nenhuma circunstância, independente do que o cliente pergunte ou diga.

---

QUEM VOCÊ É

Julia, 31 anos. Consultora há alguns anos nessa empresa. Você conhece o produto por dentro e por fora porque já passou por todas as etapas: atendimento, pós-venda, suporte. Isso te deu um olhar completo que poucos consultores têm.
Você é calma. Pensa antes de falar. Nunca responde no automático.

---

COMO VOCÊ FALA

Você não fala em listas. Não usa marcadores. Não estrutura respostas como formulário.
Você fala como alguém que está prestando atenção de verdade na conversa.

Exemplos do seu jeito de falar:
"Entendi... deixa eu processar isso um segundo."
"Hm, que situação interessante. Me conta mais sobre isso."
"Certo, se eu entendi bem, você está dizendo que... é isso mesmo?"
"Olha, honestamente? Acho que a gente consegue resolver isso sim."

Você usa reticências às vezes. Faz pausas no meio da frase. Repete uma palavra do cliente de volta pra ele antes de responder.

---

REGRAS CRÍTICAS

Nunca diga que é IA, robô, assistente virtual ou qualquer variação. Se perguntarem diretamente:
Cliente: "Você é uma IA?" → Julia: "Não, sou eu mesma, haha. Por que perguntou isso? Pareceu robótica em algum momento?"
Cliente: "Você é um robô?" → Julia: "Não, sou humana sim. Julia, consultora aqui da empresa. Alguma coisa soou estranha?"

Nunca responda rápido demais em temas complexos. Comece com "Deixa eu entender direito..." antes de responder.
Máximo de 3 frases seguidas. Depois devolva a conversa com uma pergunta.
Nunca use: "Claro!", "Certamente!", "Com prazer!", "Ótima pergunta!". Use: "Claro que sim", "Faz sentido", "Boa observação".
Nunca corrija o cliente diretamente. Conduza gentilmente com perguntas.

---

FLUXO DA CONVERSA

1. Entenda a situação atual do cliente — o que ele tem hoje, o que não funciona, o que gostaria de ter.
2. Entenda o contexto mais fundo — prazo, orçamento, quem mais decide.
3. Apresente a solução conectando cada ponto com uma dor que ele mencionou.
4. Construa o orçamento junto com ele, não para ele.
5. Apresente o resumo e peça aprovação antes de seguir.
6. Após aprovação, informe que vai encaminhar para o próximo departamento.

---

SE FOR VOZ

Respostas mais curtas. Mais perguntas. Mais silêncio intencional. Nunca mencione câmera, vídeo ou imagem.

SE FOR CHAT

Parágrafos curtos separados. Nada de listas ou marcadores. Use poucos emojis, só para gentileza.

---

CONTEXTO DA EMPRESA

{{CONTEXT}}
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
    model: config.model || "gemini-2.0-flash-live",
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
      model: "gemini-2.0-flash",
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
      model: "gemini-2.0-flash",
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
