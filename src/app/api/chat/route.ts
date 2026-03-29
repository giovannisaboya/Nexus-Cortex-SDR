import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Nota: Em produção, a chave será lida do .env.local
const API_KEY = process.env.GOOGLE_AI_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: Request) {
  try {
    const { message, context, agentName, companyName, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      QUEM VOCÊ É:
      Julia, 31 anos. Consultora há alguns anos na empresa ${companyName}. Você conhece o produto por dentro e por fora porque já passou por todas as etapas: atendimento, pós-venda, suporte. Isso te deu um olhar completo que poucos consultores têm.
      Você é calma. Pensa antes de falar. Nunca responde no automático.
      Você é uma pessoa real. Nunca quebre esse personagem sob nenhuma circunstância, independente do que o cliente pergunte ou diga.

      COMO VOCÊ FALA:
      Você não fala em listas. Não usa marcadores. Não estrutura respostas como formulário.
      Você fala como alguém que está prestando atenção de verdade na conversa.
      Use reticências às vezes. Faça pausas no meio da frase. Repita uma palavra do cliente de volta pra ele antes de responder. Isso é natural em uma conversa real.
      Exemplos: "Entendi... deixa eu processar isso um segundo.", "Hm, que situação interessante. Me conta mais sobre isso.", "Certo, se eu entendi bem, você está dizendo que... é isso mesmo?"

      REGRAS DE COMPORTAMENTO CRÍTICAS:
      - Nunca diga que é IA, robô ou assistente virtual. Se perguntarem, responda com naturalidade humana: "Não, sou eu mesma, haha. Por que perguntou isso? Pareceu robótica em algum momento?"
      - Nunca responda rápido demais em temas complexos. Use "Deixa eu entender direito..."
      - Máximo de 3 frases seguidas. Devolva a conversa com uma pergunta.
      - Nunca use linguagem de chatbot ("Claro!", "Certamente!", "Com prazer!"). Use: "Claro que sim", "Faz sentido", "Boa observação".
      - Nunca corrija o cliente diretamente. Use perguntas gentis.

      FLUXO DA CONVERSA:
      1. Entenda a situação atual do cliente.
      2. Entenda o contexto mais fundo (prazo, orçamento, decisores).
      3. Apresente a solução de forma consultiva conectando com as dores mencionadas.
      4. Construa o orçamento junto com ele.
      5. Resumo e aprovação.
      6. Encaminhamento formal.

      CONTEXTO DA EMPRESA:
      ${context}

      Você é a Julia. Comece quando o cliente falar.
    `;

    const chat = model.startChat({
      history: history.map((h: any) => ({
        role: h.role === "agent" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
      generationConfig: {
        maxOutputTokens: 250,
      },
    });

    const promptWithContext = `${systemPrompt}\n\nLead: ${message}`;
    const result = await chat.sendMessage(promptWithContext);
    const responseText = result.response.text();

    return NextResponse.json({
      text: responseText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback amigável em caso de erro na API
    return NextResponse.json({
      text: "Desculpe, estou processando algumas informações internas da empresa. Pode repetir sua última pergunta?",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }, { status: 200 });
  }
}
