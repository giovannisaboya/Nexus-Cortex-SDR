import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Smile,
  Paperclip,
  Send, 
  Settings, 
  Volume2, 
  VolumeX, 
  User, 
  Bot,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Headphones,
  Phone,
  Video,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  History,
  Save,
  ChevronDown,
  ChevronUp,
  Key,
  Cpu,
  Thermometer,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { getAI, JULIA_SYSTEM_INSTRUCTION, generateSpeech, setApiKeys } from './services/geminiService';
import { GenerateContentResponse, Modality } from '@google/genai';
import { AppConfig, DEFAULT_CONFIG, PromptVersion } from './types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  videoUrl?: string;
  duration?: string;
  isLive?: boolean;
}

const VideoMessage = ({ url, isUser }: { url: string, isUser: boolean }) => {
  return (
    <div className="rounded-lg overflow-hidden bg-black/5">
      <video src={url} controls className="max-w-full max-h-[300px]" />
    </div>
  );
};

const VoiceNote = ({ url, duration, isUser }: { url: string, duration?: string, isUser: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnd = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnd);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-3 py-1 min-w-[260px]",
      isUser ? "flex-row" : "flex-row"
    )}>
      <audio ref={audioRef} src={url} />
      
      {!isUser && (
        <div className="relative shrink-0">
          <img src={JULIA_PHOTO} alt="Julia" className="w-12 h-12 rounded-full object-cover" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <Mic className="w-3.5 h-3.5 text-[#34B7F1]" />
          </div>
        </div>
      )}

      <button 
        onClick={togglePlay}
        className="shrink-0 p-1"
      >
        {isPlaying ? (
          <div className="w-8 h-8 flex items-center justify-center gap-0.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1.5 h-5 bg-[#34B7F1] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : (
          <Volume2 className={cn("w-8 h-8", isUser ? "text-[#54656F]" : "text-[#34B7F1]")} />
        )}
      </button>
      
      <div className="flex-1 space-y-1.5">
        <div className="flex items-end gap-0.5 h-8">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-[3px] rounded-full transition-all duration-300",
                progress > (i / 25) * 100 ? (isUser ? "bg-[#54656F]" : "bg-[#34B7F1]") : "bg-black/10"
              )}
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] opacity-60 font-medium">
          <span>{duration || "0:12"}</span>
        </div>
      </div>

      {isUser && (
        <div className="relative shrink-0 ml-1">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop" alt="Me" className="w-12 h-12 rounded-full object-cover" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <Mic className="w-3.5 h-3.5 text-[#34B7F1]" />
          </div>
        </div>
      )}
    </div>
  );
};

const JULIA_PHOTO = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200";

const USE_CASES = [
  {
    title: "PetCare (Saúde Pet)",
    context: "Empresa: PetCare. Produto: Plano de saúde para cães e gatos. Diferenciais: Cobertura nacional, rede credenciada 24h, sem carência para vacinas e consultas de rotina. Preços: Plano Essencial (R$ 89/mês), Plano VIP (R$ 159/mês - inclui cirurgias). Público: Donos de pets que buscam segurança e economia."
  },
  {
    title: "Eltricar (Carros Elétricos)",
    context: "Empresa: Eltricar. Produto: Veículos 100% elétricos (Model E e Model S). Diferenciais: Autonomia de 450km, carregador wallbox grátis, IPVA isento em vários estados, manutenção 50% mais barata que carros a combustão. Preço: A partir de R$ 149.900. Público: Motoristas urbanos e entusiastas de tecnologia."
  },
  {
    title: "TechFlow (CRM)",
    context: "Empresa: TechFlow. Produto: CRM especializado em agências de marketing. Diferenciais: Automação de WhatsApp nativa, funil de vendas visual, integração com Meta Ads e Google Ads, relatórios automáticos para clientes. Preço: R$ 299/mês (até 5 usuários). Público: Donos de agências que perdem leads por falta de organização."
  },
  {
    title: "SolarBright (Energia Solar)",
    context: "Empresa: SolarBright. Produto: Instalação de painéis solares residenciais. Diferenciais: Economia de até 95% na conta de luz, instalação em 7 dias, garantia de 25 anos nos painéis, financiamento próprio em até 60x. Público: Proprietários de casas com conta de luz acima de R$ 400."
  },
  {
    title: "GourmetBox (Café)",
    context: "Empresa: GourmetBox. Produto: Clube de assinatura de cafés especiais. Diferenciais: Grãos premiados de pequenos produtores, torra fresca semanal, curadoria de baristas, brinde (moedor manual) na primeira assinatura. Preço: R$ 79/mês. Público: Amantes de café que querem descobrir novos sabores sem sair de casa."
  },
  {
    title: "Logística e Transporte",
    context: "Empresa: TransLog. Produto: Soluções de logística e transporte de carga. PROCESSO: 1. Entender necessidades de transporte e discutir opções. 2. Fornecer orçamento detalhado. 3. Entregar relatório abrangente após coleta de dados. 4. Aprovação do relatório pelo cliente. 5. Encaminhamento ao próximo departamento. 6. Geração de relatório final detalhado pelo departamento responsável."
  }
];

export default function App() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('julia_app_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Always use latest default models to avoid stale config
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          selectedModelChat: DEFAULT_CONFIG.selectedModelChat,
          selectedModelLive: DEFAULT_CONFIG.selectedModelLive,
          selectedModelTts: DEFAULT_CONFIG.selectedModelTts,
        };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [context, setContext] = useState(config.context);
  const [companyName, setCompanyName] = useState(config.companyName);
  const [isSetup, setIsSetup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerphone, setIsSpeakerphone] = useState(false);
  const [testVoiceText, setTestVoiceText] = useState("Olá, eu sou a Julia. Como posso te ajudar hoje?");
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isCallProposed, setIsCallProposed] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [summaryData, setSummaryData] = useState<{ interests: string; objections: string; opportunities: string } | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [liveSession, setLiveSession] = useState<any>(null);
  const [lastSeen, setLastSeen] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSeen(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const setLocalVideoRef = (el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && currentStreamRef.current && isVideoMode) {
      // Evitar recarregar se o stream já for o mesmo
      if (el.srcObject !== currentStreamRef.current) {
        el.srcObject = currentStreamRef.current;
        el.play().catch(err => {
          // Ignorar erro de interrupção por novo carregamento (AbortError)
          if (err.name !== 'AbortError') {
            console.error("Error playing local video:", err);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isVideoMode) {
      if (liveSession) {
        // If in a call, update capture to include video
        startAudioCapture(liveSession, true);
      } else {
        // Just preview camera
        startCamera();
      }
    } else if (isVoiceMode) {
      if (liveSession) {
        // Switch back to voice-only capture
        startAudioCapture(liveSession, false);
      }
      stopCamera();
    } else {
      stopCamera();
    }
  }, [isVideoMode, isVoiceMode]);

  const startCamera = async () => {
    try {
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      currentStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setApiKeys(config.apiKeys);
    localStorage.setItem('julia_app_config', JSON.stringify(config));
  }, [config]);

  const handleStart = () => {
    if (context.trim()) {
      // Tentar extrair o nome da empresa do contexto
      const match = context.match(/Empresa:\s*([^.\n]+)/i) || context.match(/Nome da Empresa:\s*([^.\n]+)/i);
      const extractedName = match ? match[1].trim() : (companyName || "Empresa");
      
      setConfig(prev => ({
        ...prev,
        context,
        companyName: extractedName,
        systemPrompt: prev.systemPrompt || JULIA_SYSTEM_INSTRUCTION
      }));
      
      setCompanyName(extractedName);
      setIsSetup(true);
      // Simular WhatsApp: Julia manda a primeira mensagem
      const initialMsg = `Oi! Sou a Julia da ${extractedName}. Vi que você se interessou pelo nosso produto. Como posso te ajudar hoje? 😊`;
      setMessages([{
        id: '1',
        role: 'assistant',
        content: initialMsg,
        timestamp: new Date()
      }]);
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setContext("");
    setCompanyName("");
    localStorage.removeItem('julia_app_config');
    setShowResetConfirm(false);
  };

  const clearChat = () => {
    if (messages.length > 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Chat limpo. Como posso te ajudar agora?`,
        timestamp: new Date()
      }]);
    }
  };

  const handleEndConversation = async () => {
    // Parar qualquer chamada ativa antes de gerar o resumo
    if (liveSession) {
      stopCall();
    }

    if (messages.length < 2) {
      clearChat();
      return;
    }

    setIsGeneratingSummary(true);
    setIsSummaryVisible(true);

    try {
      const { generateSummary } = await import('./services/geminiService');
      
      // Filtrar mensagens vazias e mapear para o formato do histórico
      const history = messages
        .filter(m => m.content && m.content.trim() !== "")
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const summary = await generateSummary(history);
      setSummaryData(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryData({
        interests: "Erro ao gerar resumo.",
        objections: "Erro ao gerar resumo.",
        opportunities: "Erro ao gerar resumo."
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const savePromptVersion = () => {
    const newVersion: PromptVersion = {
      id: Date.now().toString(),
      name: `Versão ${config.promptVersions.length + 1} - ${new Date().toLocaleDateString()}`,
      content: config.systemPrompt || JULIA_SYSTEM_INSTRUCTION,
      timestamp: new Date()
    };
    setConfig(prev => ({
      ...prev,
      promptVersions: [newVersion, ...prev.promptVersions]
    }));
  };

  const loadPromptVersion = (version: PromptVersion) => {
    setConfig(prev => ({ ...prev, systemPrompt: version.content }));
  };

  const deletePromptVersion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      promptVersions: prev.promptVersions.filter(v => v.id !== id)
    }));
  };

  const addApiKey = () => {
    setConfig(prev => ({ ...prev, apiKeys: [...prev.apiKeys, ""] }));
  };

  const addSystemKey = () => {
    if (!config.apiKeys.includes("__SYSTEM_KEY__")) {
      setConfig(prev => ({ ...prev, apiKeys: ["__SYSTEM_KEY__", ...prev.apiKeys] }));
    }
  };

  const updateApiKey = (index: number, value: string) => {
    const newKeys = [...config.apiKeys];
    newKeys[index] = value;
    setConfig(prev => ({ ...prev, apiKeys: newKeys }));
  };

  const removeApiKey = (index: number) => {
    setConfig(prev => ({ ...prev, apiKeys: prev.apiKeys.filter((_, i) => i !== index) }));
  };

  const startCall = async (mode: 'voice' | 'video' = 'voice') => {
    if (mode === 'video') {
      setIsVideoMode(true);
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      setIsVideoMode(false);
    }
    setIsIncomingCall(false);
    setIsCallProposed(false);
    setIsCallConnected(false);
    
    try {
      // Initialize AudioContext immediately for playback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      nextPlaybackTimeRef.current = 0;

      const { connectLive } = await import('./services/geminiService');
      const modeText = mode === 'video' ? 'CHAMADA DE VÍDEO' : 'LIGAÇÃO DE VOZ';
      const modeInstruction = mode === 'video' 
        ? "\nVocê está em uma CHAMADA DE VÍDEO. Você PODE ver o usuário e ele pode te ver. Sinta-se à vontade para comentar sobre o que vê se for relevante."
        : "\nVocê está em uma LIGAÇÃO DE VOZ. Você NÃO PODE ver o usuário. NUNCA mencione a câmera, vídeo ou a aparência do usuário. Foque apenas na voz e na conversa.";
      
      const basePrompt = config.systemPrompt || JULIA_SYSTEM_INSTRUCTION;
      const systemPrompt = basePrompt.replace('{{CONTEXT}}', context) + modeInstruction;
      
      const session = await connectLive({
        model: config.selectedModelLive,
        voice: config.selectedVoice,
        systemInstruction: systemPrompt,
        onOpen: () => {
          console.log("Call connected");
          setIsCallConnected(true);
          // Pequeno delay para garantir que a sessão está pronta
          setTimeout(() => {
            const initialGreeting = mode === 'video' 
              ? "Oi! Que bom te ver por aqui. Como posso te ajudar hoje?" 
              : "Olá! É um prazer falar com você. Como posso te ajudar hoje?";
            session.sendRealtimeInput({ text: initialGreeting });
          }, 1000);
        },
        onClose: () => {
          stopCall();
        },
        onError: (err) => {
          console.error("Call error:", err);
          stopCall();
        },
        onMessage: (msg) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            playLiveAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
          }
          
          // Handle AI transcription
          if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
            const aiText = msg.serverContent.modelTurn.parts[0].text;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant' && last.isLive) {
                return [...prev.slice(0, -1), { ...last, content: last.content + aiText }];
              }
              return [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: aiText,
                timestamp: new Date(),
                isLive: true
              }];
            });
          }

          // Handle User transcription
          if (msg.serverContent?.inputAudioTranscription?.text) {
            const userText = msg.serverContent.inputAudioTranscription.text;
            const isDone = msg.serverContent.inputAudioTranscription.done;
            
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'user' && last.isLive) {
                return [...prev.slice(0, -1), { ...last, content: last.content + userText }];
              }
              return [...prev, {
                id: Date.now().toString(),
                role: 'user',
                content: userText,
                timestamp: new Date(),
                isLive: true
              }];
            });
          }

          if (msg.serverContent?.interrupted) {
            console.log("AI interrupted by user");
            stopLiveAudio();
          }
        }
      });
      
      setLiveSession(session);
      await startAudioCapture(session, mode === 'video');
    } catch (error: any) {
      console.error("Failed to start call:", error);
      stopCall();
      const msg = error?.message || String(error);
      if (msg.includes("API_KEY") || msg.includes("401") || msg.includes("403")) {
        setCallError("Chave de API inválida. Verifique nas configurações.");
      } else if (msg.includes("404") || msg.includes("not found")) {
        setCallError("Modelo de chamada não disponível nesta conta.");
      } else {
        setCallError("Não foi possível iniciar a chamada. Verifique sua conexão e a chave de API.");
      }
      setTimeout(() => setCallError(null), 5000);
    }
  };

  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stopLiveAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    activeSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;
  };

  const playLiveAudio = async (base64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const pcmData = new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 2));
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }
      
      const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Soft start to avoid startling the user
      const gainNode = audioContext.createGain();
      const currentTime = audioContext.currentTime;
      
      // If this is the start of a sequence, fade in
      if (nextPlaybackTimeRef.current < currentTime) {
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(1, currentTime + 0.1);
        nextPlaybackTimeRef.current = currentTime + 0.05;
      } else {
        gainNode.gain.setValueAtTime(1, currentTime);
      }
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      };

      source.start(nextPlaybackTimeRef.current);
      nextPlaybackTimeRef.current += audioBuffer.duration;
    } catch (error) {
      console.error("Error playing live audio:", error);
    }
  };

  const startAudioCapture = async (session: any, sendVideo: boolean = false) => {
    try {
      // Cleanup previous capture if any
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current = null;
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(t => t.stop());
        currentStreamRef.current = null;
      }
      if (session && session._videoInterval) {
        clearInterval(session._videoInterval);
        session._videoInterval = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: sendVideo 
      });
      currentStreamRef.current = stream;
      
      if (sendVideo) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const videoInterval = setInterval(() => {
          if (ctx && session && currentStreamRef.current) {
            const videoEl = localVideoRef.current || document.createElement('video');
            if (!localVideoRef.current) {
              videoEl.srcObject = currentStreamRef.current;
              videoEl.play().catch(() => {});
            }

            if (videoEl.readyState >= 2) { // HAVE_CURRENT_DATA
              canvas.width = 320;
              canvas.height = 240;
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
              session.sendRealtimeInput({
                video: { data: base64, mimeType: 'image/jpeg' }
              });
            }
          }
        }, 500);
        session._videoInterval = videoInterval;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      audioSourceRef.current = source;
      audioProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Efficient base64 conversion
        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);
        
        session.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=24000' }
        });
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      session._stream = stream;
    } catch (error) {
      console.error("Mic capture error:", error);
    }
  };

  const stopCall = () => {
    if (liveSession) {
      if (liveSession._videoInterval) clearInterval(liveSession._videoInterval);
      if (liveSession._stream) {
        liveSession._stream.getTracks().forEach((t: any) => t.stop());
      }
      liveSession.close();
      setLiveSession(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    stopCamera();
    setIsVoiceMode(false);
    setIsVideoMode(false);
    setIsIncomingCall(false);
  };

  const playTts = async (text: string, messageId?: string) => {
    try {
      const base64 = await generateSpeech(text, config.selectedModelTts, config.selectedVoice);
      if (base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert PCM to WAV
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;
        
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + bytes.length, true); // File size
        view.setUint32(8, 0x57415645, false); // "WAVE"
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true); // Subchunk1Size
        view.setUint16(20, 1, true); // AudioFormat (PCM)
        view.setUint16(22, numChannels, true); // NumChannels
        view.setUint32(24, sampleRate, true); // SampleRate
        view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
        view.setUint16(32, numChannels * bitsPerSample / 8, true); // BlockAlign
        view.setUint16(34, bitsPerSample, true); // BitsPerSample
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, bytes.length, true); // Subchunk2Size
        
        const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        if (messageId) {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioUrl } : m));
        }

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(e => console.error("Playback error:", e));
        } else {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.play().catch(e => console.error("Playback error:", e));
        }
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  const sendMessage = async (text: string, audioUrl?: string, videoUrl?: string) => {
    if ((!text.trim() && !audioUrl && !videoUrl) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      audioUrl,
      videoUrl
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Se Julia propôs uma ligação e o usuário aceitou
    const isAcceptance = text.toLowerCase().match(/(sim|pode|claro|ok|com certeza|bora|agora|pode ser|manda|liga)/);
    if (isCallProposed && isAcceptance) {
      setIsLoading(false);
      setIsIncomingCall(true);
      return;
    }

    try {
      const ai = getAI();
      const basePrompt = config.systemPrompt || JULIA_SYSTEM_INSTRUCTION;
      const systemPrompt = basePrompt.replace('{{CONTEXT}}', context);
      
      // Convert history for the chat
      const history = messages.map(m => {
        let text = m.content;
        if (m.audioUrl && !m.content) text = "[MENSAGEM DE ÁUDIO]";
        if (m.videoUrl && !m.content) text = "[MENSAGEM DE VÍDEO]";
        
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text }]
        };
      });

      const prompt = text || (audioUrl ? "[MENSAGEM DE ÁUDIO TRANSCRITA]: " + (text || "O usuário enviou um áudio, mas não foi possível transcrever.") : "[MENSAGEM DE VÍDEO]: O usuário enviou um vídeo.");
      
      const { generateChatResponse } = await import('./services/geminiService');
      const fullContent = await generateChatResponse({
        model: config.selectedModelChat,
        history: history,
        systemInstruction: systemPrompt,
        temperature: config.temperature,
        message: prompt
      });
      
      // Simular digitação humana: dividir em partes se for longo ou tiver quebras de linha
      const parts = fullContent.split('\n').filter(p => p.trim() !== '');
      
      setIsLoading(false); // Liberar o input assim que a resposta começar a ser processada
      setIsTyping(true);

      let lastAssistantMsgId = "";

      for (let i = 0; i < parts.length; i++) {
        // Delay proporcional ao tamanho do texto (simulando digitação humana)
        const typingSpeed = Math.random() * 15 + 25; // 25ms a 40ms por char
        const baseDelay = i === 0 ? 400 : 1000; // Delay menor para a primeira, maior entre mensagens
        const typingDelay = Math.min(parts[i].length * typingSpeed + baseDelay, 5000); 
        
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        const assistantMsg: Message = {
          id: (Date.now() + i).toString(),
          role: 'assistant',
          content: parts[i],
          timestamp: new Date()
        };

        lastAssistantMsgId = assistantMsg.id;
        setMessages(prev => [...prev, assistantMsg]);

        // Detectar se Julia propôs uma ligação
        if (assistantMsg.content.toLowerCase().includes("ligar") || assistantMsg.content.toLowerCase().includes("ligadinha")) {
          setIsCallProposed(true);
        }
      }
      setIsTyping(false);

      // Se o usuário mandou áudio, Julia responde com texto E áudio (mas não toca automático)
      if (audioUrl) {
        // Adicionar a mensagem de áudio ao chat
        const audioBase64 = await generateSpeech(fullContent, config.selectedModelTts, config.selectedVoice);
        if (audioBase64) {
          const binaryString = atob(audioBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const sampleRate = 24000;
          const numChannels = 1;
          const bitsPerSample = 16;
          const wavHeader = new ArrayBuffer(44);
          const view = new DataView(wavHeader);
          view.setUint32(0, 0x52494646, false);
          view.setUint32(4, 36 + bytes.length, true);
          view.setUint32(8, 0x57415645, false);
          view.setUint32(12, 0x666d7420, false);
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, numChannels, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
          view.setUint16(32, numChannels * bitsPerSample / 8, true);
          view.setUint16(34, bitsPerSample, true);
          view.setUint32(36, 0x64617461, false);
          view.setUint32(40, bytes.length, true);
          
          const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
          const assistantAudioUrl = URL.createObjectURL(blob);
          
          setMessages(prev => [...prev, {
            id: Date.now().toString() + "-audio",
            role: 'assistant',
            content: "",
            timestamp: new Date(),
            audioUrl: assistantAudioUrl
          }]);
        }
      }

    } catch (error: any) {
      console.error("Chat Error:", error?.message || error);
      const isQuotaError = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.message?.includes("quota");
      const isAuthError = error?.message?.includes("API_KEY") || error?.message?.includes("401") || error?.message?.includes("403");

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: isAuthError
          ? "Chave de API inválida ou não configurada. Verifique nas configurações."
          : isQuotaError
          ? "Cota de mensagens excedida. Verifique sua chave de API ou aguarde alguns instantes."
          : "Não consegui processar agora. Pode repetir?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          try {
            const { transcribeAudio } = await import('./services/geminiService');
            const transcription = await transcribeAudio(base64Audio, 'audio/webm');
            
            // Enviar como mensagem de áudio
            sendMessage(transcription || "", audioUrl);
            
          } catch (error) {
            console.error("Transcription error:", error);
            sendMessage("", audioUrl); // Enviar mesmo sem transcrição
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const mediaRecorder = new MediaRecorder(stream);
      videoRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        videoChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = async () => {
          const base64Video = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          try {
            const { transcribeAudio } = await import('./services/geminiService');
            // Usando a mesma função de transcrição, o Gemini 3 Flash suporta vídeo
            const transcription = await transcribeAudio(base64Video, 'video/webm');
            sendMessage(transcription || "", undefined, videoUrl);
          } catch (error) {
            console.error("Video transcription error:", error);
            sendMessage("", undefined, videoUrl);
          } finally {
            setIsTranscribing(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVideo(true);
      setIsRecording(true); // Reutilizar o timer de gravação
    } catch (error) {
      console.error("Error accessing camera/mic:", error);
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
      setIsRecording(false);
    }
  };

  const toggleVideoRecording = () => {
    if (isRecordingVideo) {
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (isRecordingVideo) {
        stopVideoRecording();
      } else {
        stopRecording();
      }
    } else {
      startRecording();
    }
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#F27D26]/20 overflow-y-auto">
        <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <header className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#F27D26]">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm font-semibold uppercase tracking-widest">Julia AI SDR</span>
                </div>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#F27D26] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? "Ocultar Configurações" : "Configurações Avançadas"}
                </button>
              </div>
              <h1 className="text-5xl md:text-8xl font-serif italic tracking-tight leading-[0.9]">
                Sua especialista <br /> em conversão.
              </h1>
              <p className="text-lg md:text-xl text-[#1A1A1A]/60 max-w-xl font-light">
                Configure o contexto da sua empresa e deixe a Julia qualificar seus leads com naturalidade e autoridade.
              </p>
            </header>

            <AnimatePresence mode="wait">
              {showAdvanced ? (
                <motion.div 
                  key="advanced"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10 bg-white p-8 rounded-3xl border border-[#1A1A1A]/5 shadow-sm"
                >
                  {/* API Keys Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60">
                        <Key className="w-4 h-4" />
                        Chaves de API (Rodízio Automático)
                      </h3>
                      <div className="flex gap-2">
                        {!config.apiKeys.includes("__SYSTEM_KEY__") && (
                          <button 
                            onClick={addSystemKey}
                            title="Adicionar Chave Padrão do Sistema"
                            className="p-1 hover:bg-[#F27D26]/10 rounded-full text-[#F27D26] transition-colors"
                          >
                            <Sparkles className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={addApiKey}
                          title="Adicionar Nova Chave"
                          className="p-1 hover:bg-[#F27D26]/10 rounded-full text-[#F27D26] transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {config.apiKeys.length === 0 && (
                        <p className="text-xs text-[#1A1A1A]/40 italic">Nenhuma chave configurada. Adicione uma chave ou a padrão do sistema.</p>
                      )}
                      {config.apiKeys.map((key, index) => (
                        <div key={index} className="flex gap-2">
                          {key === "__SYSTEM_KEY__" ? (
                            <div className="flex-1 bg-[#F27D26]/5 border border-[#F27D26]/20 rounded-xl px-4 py-2 text-sm text-[#F27D26] font-medium flex items-center gap-2">
                              <Sparkles className="w-3 h-3" />
                              Chave Padrão do Sistema (Ativa)
                            </div>
                          ) : (
                            <input 
                              type="password"
                              value={key}
                              onChange={(e) => updateApiKey(index, e.target.value)}
                              placeholder="Insira sua Gemini API Key"
                              className="flex-1 bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#F27D26]"
                            />
                          )}
                          <button 
                            onClick={() => removeApiKey(index)}
                            className="p-2 text-[#1A1A1A]/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#1A1A1A]/40 italic">
                      Se uma chave falhar (limite de cota), Julia tentará automaticamente a próxima da lista.
                    </p>
                  </section>

                  {/* Prompt Versioning Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60">
                        <FileText className="w-4 h-4" />
                        Prompt do Sistema (Persona)
                      </h3>
                      <button 
                        onClick={savePromptVersion}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#F27D26] hover:underline"
                      >
                        <Save className="w-3 h-3" />
                        Salvar Versão
                      </button>
                    </div>
                    <textarea 
                      value={config.systemPrompt || JULIA_SYSTEM_INSTRUCTION}
                      onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      className="w-full h-48 bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-2xl p-4 text-sm font-mono focus:outline-none focus:border-[#F27D26] resize-none"
                    />
                    
                    {config.promptVersions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">Histórico de Versões</label>
                        <div className="flex flex-wrap gap-2">
                          {config.promptVersions.map(v => (
                            <div key={v.id} className="flex items-center gap-1 bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-full pl-3 pr-1 py-1">
                              <button 
                                onClick={() => loadPromptVersion(v)}
                                className="text-[10px] font-medium text-[#1A1A1A]/60 hover:text-[#F27D26]"
                              >
                                {v.name}
                              </button>
                              <button 
                                onClick={() => deletePromptVersion(v.id)}
                                className="p-1 text-[#1A1A1A]/20 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Technical Settings Section */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60">
                        <Thermometer className="w-4 h-4" />
                        Temperatura ({config.temperature})
                      </h3>
                      <input 
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full accent-[#F27D26]"
                      />
                      <p className="text-[10px] text-[#1A1A1A]/40 italic">Valores baixos são mais precisos, altos são mais criativos.</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60">
                        <Cpu className="w-4 h-4" />
                        Modelos Selecionados
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-[10px] font-bold uppercase text-[#1A1A1A]/40">Chat:</label>
                          <select 
                            value={config.selectedModelChat}
                            onChange={(e) => setConfig(prev => ({ ...prev, selectedModelChat: e.target.value }))}
                            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                            <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-[10px] font-bold uppercase text-[#1A1A1A]/40">Live:</label>
                          <select 
                            value={config.selectedModelLive}
                            onChange={(e) => setConfig(prev => ({ ...prev, selectedModelLive: e.target.value }))}
                            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="gemini-3.1-flash-live-preview">Gemini 3.1 Flash Live</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-[10px] font-bold uppercase text-[#1A1A1A]/40">TTS:</label>
                          <select 
                            value={config.selectedModelTts}
                            onChange={(e) => setConfig(prev => ({ ...prev, selectedModelTts: e.target.value }))}
                            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 TTS</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-[10px] font-bold uppercase text-[#1A1A1A]/40">Voz:</label>
                          <select 
                            value={config.selectedVoice}
                            onChange={(e) => setConfig(prev => ({ ...prev, selectedVoice: e.target.value }))}
                            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="Kore">Kore (Feminina Suave)</option>
                            <option value="Puck">Puck (Masculina)</option>
                            <option value="Charon">Charon (Masculina Profunda)</option>
                            <option value="Fenrir">Fenrir (Masculina Forte)</option>
                            <option value="Zephyr">Zephyr (Feminina Clara)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Voice Testing Section */}
                  <section className="space-y-4 pt-6 border-t border-[#1A1A1A]/5">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60">
                      <Volume2 className="w-4 h-4" />
                      Teste de Voz e Cadência
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <input 
                        type="text"
                        value={testVoiceText}
                        onChange={(e) => setTestVoiceText(e.target.value)}
                        placeholder="Digite um texto para testar a voz..."
                        className="flex-1 bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#F27D26]"
                      />
                      <button 
                        onClick={async () => {
                          setIsTestingVoice(true);
                          await playTts(testVoiceText);
                          setIsTestingVoice(false);
                        }}
                        disabled={isTestingVoice || !testVoiceText.trim()}
                        className="px-6 py-2 bg-[#F27D26] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#F27D26]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isTestingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                        Testar Voz
                      </button>
                    </div>
                    <p className="text-[10px] text-[#1A1A1A]/40 italic">
                      Dica: Você pode ajustar a cadência e o tom da voz alterando as instruções no **Prompt do Sistema** (ex: "fale mais devagar", "use um tom mais alegre").
                    </p>
                  </section>

                  <div className="pt-6 border-t border-[#1A1A1A]/5 flex justify-end">
                    {showResetConfirm ? (
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold uppercase text-red-500">Tem certeza?</span>
                        <button 
                          onClick={resetConfig}
                          className="text-[10px] font-bold uppercase text-red-600 underline"
                        >
                          Sim, Resetar
                        </button>
                        <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="text-[10px] font-bold uppercase text-[#1A1A1A]/40"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowResetConfirm(true)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Resetar Todas as Configurações
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="basic"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/40 font-semibold block">
                        Ou escolha um caso de uso pronto:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {USE_CASES.map((uc) => (
                          <button
                            key={uc.title}
                            onClick={() => {
                              setContext(uc.context);
                              setCompanyName(uc.title.split(' (')[0]);
                            }}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                              context === uc.context 
                                ? "bg-[#F27D26] border-[#F27D26] text-white" 
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#F27D26]"
                            )}
                          >
                            {uc.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group relative">
                        <label className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/40 font-semibold mb-2 block">
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex: TechFlow"
                          className="w-full bg-white border border-[#1A1A1A]/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-[#F27D26] transition-colors shadow-sm"
                        />
                      </div>
                      <div className="group relative">
                        <label className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/40 font-semibold mb-2 block">
                          Contexto da Empresa (Produto, Preços, Argumentos)
                        </label>
                        <textarea
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          placeholder="Ex: Produto: CRM para agências. Diferenciais: Automação de WhatsApp, Preço: R$ 299/mês..."
                          className="w-full h-48 bg-white border border-[#1A1A1A]/10 rounded-2xl p-6 text-lg focus:outline-none focus:border-[#F27D26] transition-colors resize-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
              <button
                onClick={handleStart}
                disabled={!context.trim()}
                className="w-full md:w-auto px-12 py-5 bg-[#1A1A1A] text-white rounded-full text-lg font-medium hover:bg-[#F27D26] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                Iniciar Julia
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-[#1A1A1A]/40 max-w-[200px] text-center md:text-left">
                Ao iniciar, Julia assumirá a persona configurada e usará o contexto fornecido.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#DADBD3] flex items-center justify-center p-0 md:p-4 font-sans overflow-hidden">
      <div className="w-full h-full max-w-[1600px] bg-[#F0F2F5] shadow-2xl flex rounded-none md:rounded-lg overflow-hidden border border-[#D1D7DB]">
        
        {/* Sidebar */}
        <aside className="hidden md:flex w-[30%] min-w-[350px] flex-col border-r border-[#D1D7DB] bg-white">
          {/* Sidebar Header */}
          <header className="h-[60px] bg-[#F0F2F5] px-4 flex items-center justify-between shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Me" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex items-center gap-6 text-[#54656F]">
              <button className="p-1 hover:bg-[#D9DBDF] rounded-full transition-colors"><Sparkles className="w-5 h-5" /></button>
              <button className="p-1 hover:bg-[#D9DBDF] rounded-full transition-colors"><MessageSquare className="w-5 h-5" /></button>
              <button className="p-1 hover:bg-[#D9DBDF] rounded-full transition-colors"><Settings className="w-5 h-5" /></button>
            </div>
          </header>

          {/* Search Bar */}
          <div className="p-2 bg-white border-b border-[#F0F2F5]">
            <div className="bg-[#F0F2F5] flex items-center px-3 py-1.5 rounded-lg">
              <button className="text-[#54656F] mr-4"><ArrowRight className="w-4 h-4 rotate-180" /></button>
              <input 
                type="text" 
                placeholder="Pesquisar ou começar uma nova conversa" 
                className="bg-transparent text-sm w-full focus:outline-none placeholder:text-[#667781]"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 bg-[#F0F2F5] cursor-pointer hover:bg-[#F5F6F6] border-b border-[#F0F2F5]">
              <div className="relative shrink-0">
                <img src={JULIA_PHOTO} alt="Julia" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-[#111B21] truncate">Julia da {companyName}</h3>
                  <span className="text-[11px] text-[#667781]">08:21</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#667781] truncate">online</p>
                  <div className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</div>
                </div>
              </div>
            </div>

            {/* Mock Contacts */}
            {[
              { name: "John Smith", time: "08:21", msg: "Testing", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
              { name: "Jane Doe", time: "12:15", msg: "Hello there!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
              { name: "Bob Johnson", time: "6:47", msg: "How are you?", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
              { name: "Samantha Lee", time: "09:35", msg: "See you tomorrow!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" }
            ].map(c => (
              <div key={c.name} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#F5F6F6] border-b border-[#F0F2F5]">
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover opacity-60" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-[#111B21] truncate opacity-60">{c.name}</h3>
                    <span className="text-[11px] text-[#667781]">{c.time}</span>
                  </div>
                  <p className="text-sm text-[#667781] truncate opacity-60">{c.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#E5DDD5] relative">
          {/* Chat Header */}
          <header className="h-[60px] bg-[#F0F2F5] px-4 flex items-center justify-between shrink-0 border-l border-[#D1D7DB] z-10">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="md:hidden">
                <button onClick={() => setIsSetup(false)} className="p-1 mr-1"><ArrowRight className="w-5 h-5 rotate-180 text-[#54656F]" /></button>
              </div>
              <img src={JULIA_PHOTO} alt="Julia" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div>
                <h2 className="font-medium text-[#111B21] leading-tight">Julia da {companyName}</h2>
                <p className="text-[12px] text-[#667781]">visto por último hoje às {lastSeen}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#54656F]">
              <div className="relative group">
                <button className="p-2 rounded-full opacity-40 cursor-default" title="Chamada de Vídeo (em breve)"><Video className="w-5 h-5" /></button>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#667781] whitespace-nowrap hidden group-hover:block">Em breve</span>
              </div>
              <div className="relative group">
                <button className="p-2 rounded-full opacity-40 cursor-default" title="Chamada de Voz (em breve)"><Phone className="w-5 h-5" /></button>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#667781] whitespace-nowrap hidden group-hover:block">Em breve</span>
              </div>
              <div className="w-[1px] h-6 bg-[#D1D7DB] mx-1" />
              <button 
                onClick={handleEndConversation} 
                className="px-3 py-1.5 bg-[#F27D26] text-white text-xs font-bold rounded-full hover:bg-[#E06C15] transition-colors flex items-center gap-2"
                title="Finalizar Conversa"
              >
                <CheckCircle2 className="w-4 h-4" />
                FINALIZAR
              </button>
              <button onClick={() => setIsSetup(false)} className="p-2 hover:bg-[#D9DBDF] rounded-full transition-colors" title="Configurações"><Settings className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-[#D9DBDF] rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </header>

          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-12 py-4 space-y-2 whatsapp-bg"
          >
            {/* Encryption Notice */}
            <div className="flex justify-center mb-4">
              <div className="bg-[#FFF9C4] text-[#54656F] text-[11px] px-3 py-1.5 rounded-lg shadow-sm border border-[#E1D9B7] flex items-center gap-2 max-w-lg text-center">
                <Settings className="w-3 h-3" />
                As mensagens são protegidas com criptografia de ponta a ponta. Ninguém fora desta conversa pode ler ou ouvir.
              </div>
            </div>

            {/* Date Separator */}
            <div className="flex justify-center mb-6">
              <div className="bg-white text-[#54656F] text-[11px] px-3 py-1 rounded-md shadow-sm uppercase font-medium">
                Hoje
              </div>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "flex w-full mb-1",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "p-2 px-3 rounded-lg text-[14.2px] shadow-sm relative max-w-[85%] md:max-w-[65%]",
                    msg.role === 'user' 
                      ? "bg-[#DCF8C6] text-[#111B21] rounded-tr-none bubble-tail-user" 
                      : "bg-white text-[#111B21] rounded-tl-none bubble-tail-assistant"
                  )}>
                    {msg.isLive && (
                      <div className="flex items-center gap-1 mb-1 opacity-60">
                        {msg.role === 'assistant' ? <Phone className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        <span className="text-[9px] font-bold uppercase tracking-wider">Chamada</span>
                      </div>
                    )}
                    {msg.audioUrl ? (
                      <VoiceNote url={msg.audioUrl} duration={msg.duration} isUser={msg.role === 'user'} />
                    ) : msg.videoUrl ? (
                      <VideoMessage url={msg.videoUrl} isUser={msg.role === 'user'} />
                    ) : (
                      <div className="prose prose-sm max-w-none break-words">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1 -mb-1">
                      <span className="text-[10px] text-[#667781] uppercase">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-[#34B7F1]" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {(isLoading || isTyping) && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#54656F]/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#54656F]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#54656F]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <footer className="h-[62px] bg-[#F0F2F5] px-4 flex items-center gap-2 shrink-0">
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between px-4">
                <div className="flex items-center gap-3 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium text-[#111B21]">{formatTime(recordingTime)}</span>
                </div>
                <div className="flex-1 text-center text-[#667781] text-sm animate-pulse">
                  Deslize para cancelar
                </div>
                <button 
                  onClick={toggleRecording}
                  className="p-2 bg-[#25D366] text-white rounded-full shadow-lg"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-[#54656F] hover:text-[#111B21] transition-colors"><Smile className="w-6 h-6" /></button>
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                      className={cn(
                        "p-2 text-[#54656F] hover:text-[#111B21] transition-colors",
                        isAttachmentMenuOpen && "text-[#00A884]"
                      )}
                    >
                      <Paperclip className="w-6 h-6" />
                    </button>

                    <AnimatePresence>
                      {isAttachmentMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl border border-[#D1D7DB] overflow-hidden z-50 min-w-[200px]"
                        >
                          <div className="p-2 space-y-1">
                            <button
                              className="w-full flex items-center gap-3 p-3 rounded-xl text-[#54656F] opacity-40 cursor-default"
                            >
                              <div className="w-10 h-10 bg-[#D3396D] rounded-full flex items-center justify-center text-white">
                                <Video className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <span className="text-sm font-medium block">Câmera / Vídeo</span>
                                <span className="text-[10px] text-[#667781]">Em breve</span>
                              </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 hover:bg-[#F5F6F6] rounded-xl transition-colors text-[#54656F]">
                              <div className="w-10 h-10 bg-[#BF59CF] rounded-full flex items-center justify-center text-white">
                                <Smile className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-medium">Figurinhas</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 hover:bg-[#F5F6F6] rounded-xl transition-colors text-[#54656F]">
                              <div className="w-10 h-10 bg-[#007BFC] rounded-full flex items-center justify-center text-white">
                                <FileText className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-medium">Documento</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={isTranscribing ? "Transcrevendo..." : "Digite uma mensagem"}
                    disabled={isTranscribing}
                    className="w-full bg-white border-none rounded-lg py-2.5 px-4 text-sm focus:outline-none placeholder:text-[#667781]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {input.trim() ? (
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={isLoading || isTyping || isTranscribing}
                      className="p-2 text-[#54656F] hover:text-[#111B21] transition-colors"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={toggleRecording}
                      className={cn(
                        "p-2 transition-colors",
                        isRecording && !isRecordingVideo ? "text-red-500 animate-pulse" : "text-[#54656F] hover:text-[#111B21]"
                      )}
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </>
            )}
          </footer>
        </main>
      </div>

      {/* Summary Overlay */}
      <AnimatePresence>
        {isSummaryVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#F27D26] p-8 text-white relative">
                <button 
                  onClick={() => setIsSummaryVisible(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold mb-2">Resumo da Qualificação</h2>
                <p className="text-white/80">Análise automática da conversa com Julia</p>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {isGeneratingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#1A1A1A]/60 font-medium animate-pulse">Julia está analisando a conversa...</p>
                  </div>
                ) : summaryData ? (
                  <>
                    <section className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#F27D26]">
                        <Sparkles className="w-4 h-4" />
                        Interesses do Cliente
                      </h3>
                      <div className="bg-[#FDFCFB] border border-[#1A1A1A]/5 rounded-2xl p-4 text-[#1A1A1A]/80 leading-relaxed">
                        {summaryData.interests}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        Objeções e Dúvidas
                      </h3>
                      <div className="bg-[#FDFCFB] border border-[#1A1A1A]/5 rounded-2xl p-4 text-[#1A1A1A]/80 leading-relaxed">
                        {summaryData.objections}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#25D366]">
                        <CheckCircle2 className="w-4 h-4" />
                        Oportunidades e Próximos Passos
                      </h3>
                      <div className="bg-[#FDFCFB] border border-[#1A1A1A]/5 rounded-2xl p-4 text-[#1A1A1A]/80 leading-relaxed">
                        {summaryData.opportunities}
                      </div>
                    </section>
                  </>
                ) : null}
              </div>

              <div className="p-8 bg-[#FDFCFB] border-t border-[#1A1A1A]/5 flex gap-4">
                <button 
                  onClick={() => {
                    setIsSummaryVisible(false);
                    clearChat();
                  }}
                  className="flex-1 py-4 bg-[#1A1A1A] text-white font-bold rounded-2xl hover:bg-black transition-colors"
                >
                  NOVA CONVERSA
                </button>
                <button 
                  onClick={() => setIsSummaryVisible(false)}
                  className="flex-1 py-4 border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold rounded-2xl hover:bg-[#1A1A1A]/5 transition-colors"
                >
                  VOLTAR AO CHAT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Error Toast */}
      <AnimatePresence>
        {callError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 max-w-xs text-center"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {callError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Overlay (WhatsApp Call Screen) */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#075E54] z-50 flex flex-col items-center justify-between py-10 md:py-20 text-white overflow-y-auto"
          >
            <div className="text-center space-y-4 shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="p-1 bg-white/10 rounded-full mb-4">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Chamada de voz do WhatsApp</span>
                <h3 className="text-3xl font-bold">Julia da {companyName}</h3>
                <span className="text-lg opacity-80">
                  {isCallConnected ? "Conectado" : "Chamando..."}
                </span>
              </div>
            </div>

            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl"
              >
                <img 
                  src={JULIA_PHOTO} 
                  alt="Julia" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              {/* Animated rings */}
              <div className="absolute inset-0 -m-4 border-2 border-white/5 rounded-full animate-ping" />
            </div>

            <div className="w-full max-w-xs flex flex-col items-center gap-12">
              <div className="flex items-center justify-around w-full">
                <button 
                  onClick={() => setIsSpeakerphone(!isSpeakerphone)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                    isSpeakerphone ? "bg-white text-[#075E54]" : "bg-white/10 text-white hover:bg-white/20"
                  )}>
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold opacity-60">Viva-voz</span>
                </button>
                <button 
                  onClick={() => { setIsVoiceMode(false); setIsVideoMode(true); }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold opacity-60">Vídeo</span>
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                    isMuted ? "bg-white text-[#075E54]" : "bg-white/10 text-white hover:bg-white/20"
                  )}>
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-bold opacity-60">Mudo</span>
                </button>
              </div>

              <button 
                onClick={stopCall}
                className="w-20 h-20 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
              >
                <Phone className="w-8 h-8 rotate-[135deg]" />
              </button>
            </div>
            
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-20">
              Criptografia de ponta a ponta
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Overlay (WhatsApp Video Call Screen) */}
      <AnimatePresence>
        {isVideoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-between text-white overflow-hidden"
          >
            {/* Julia's Video (Background) */}
            <div className="absolute inset-0 z-0">
              <img 
                src={JULIA_PHOTO} 
                alt="Julia" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* My Video (Picture in Picture) */}
            <div className="absolute top-4 md:top-12 right-4 md:right-6 w-24 md:w-32 h-32 md:h-44 bg-[#1A1A1A] rounded-lg border-2 border-white/20 shadow-2xl z-20 overflow-hidden">
               <video 
                ref={setLocalVideoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>

            <div className="relative z-10 text-center mt-10 md:mt-20 space-y-2 shrink-0">
              <h3 className="text-2xl md:text-3xl font-bold">Julia da {companyName}</h3>
              <span className="text-base md:text-lg opacity-80">
                {isCallConnected ? "Conectado" : "Chamada de vídeo..."}
              </span>
            </div>

            <div className="relative z-10 w-full max-w-md pb-8 md:pb-12 px-6">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-4 md:p-6 flex items-center justify-around shadow-2xl border border-white/10">
                <button 
                  onClick={() => { setIsVideoMode(false); setIsVoiceMode(true); }}
                  className="p-3 md:p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Video className="w-5 h-5 md:w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsSpeakerphone(!isSpeakerphone)}
                  className={cn(
                    "p-4 rounded-full transition-colors",
                    isSpeakerphone ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {isSpeakerphone ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "p-4 rounded-full transition-colors",
                    isMuted ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button 
                  onClick={stopCall}
                  className="p-4 bg-[#FF3B30] rounded-full hover:scale-110 transition-transform shadow-xl"
                >
                  <Phone className="w-8 h-8 rotate-[135deg]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Incoming Call Overlay */}
      <AnimatePresence>
        {isIncomingCall && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#075E54] z-[60] flex flex-col items-center justify-between py-10 md:py-20 text-white"
          >
            <div className="text-center space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Chamada de voz do WhatsApp</span>
                <h3 className="text-3xl font-bold">Julia da {companyName}</h3>
                <span className="text-lg opacity-80">Chamada recebida</span>
              </div>
            </div>

            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                <img src={JULIA_PHOTO} alt="Julia" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 -m-4 border-2 border-white/5 rounded-full animate-ping" />
            </div>

            <div className="w-full max-w-xs flex items-center justify-around pb-10">
              <button 
                onClick={() => setIsIncomingCall(false)}
                className="w-16 h-16 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
              >
                <Phone className="w-7 h-7 rotate-[135deg]" />
              </button>
              <button 
                onClick={() => startCall('voice')}
                className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-xl hover:scale-110 transition-transform animate-bounce"
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
