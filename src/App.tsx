
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import '@tailwindcss/browser';
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {GeneratedContent} from './components/GeneratedContent';
import {ParametersPanel} from './components/ParametersPanel';
import {Taskbar} from './components/Taskbar';
import {Terminal} from './components/Terminal';
import {Window} from './components/Window';
import {VoiceAssistant} from './components/VoiceAssistant';
import {Desktop} from './components/Desktop';
import {ImageStudio} from './components/ImageStudio';
import {Translator} from './components/Translator';
import {SEOArticleWriter} from './components/SEOArticleWriter';
import {Gallery} from './components/Gallery';
import {KeywordResearcher} from './components/KeywordResearcher';
import {ToDoList} from './components/ToDoList';
import {Browser} from './components/Browser';
import {GeminiLens} from './components/GeminiLens';
import {FileExplorer} from './components/FileExplorer';
import {GoogleTrends} from './components/GoogleTrends';
import {Calendar} from './components/Calendar';
import {Wallet} from './components/Wallet';
import {StartMenu} from './components/StartMenu';
import {ContentPlanner} from './components/ContentPlanner';
import {AppStore} from './components/AppStore';
import {VideoGenerator} from './components/VideoGenerator';
import {INITIAL_MAX_HISTORY_LENGTH, APP_DEFINITIONS_CONFIG} from './constants';
import {
  streamAppContent,
  openAppFunctionDeclaration,
  printContentFunctionDeclaration,
  openUrlFunctionDeclaration
} from './services/geminiService';
import {AppDefinition, AppInstance, InteractionData, ConversationalResponse, DesktopLayout, WindowState} from './types';
import {AuthContext, AuthProvider, useAuth} from './context/AuthContext';
import {GoogleGenAI, LiveServerMessage, Modality} from '@google/genai';


function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function pcmToBase64(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export const App: React.FC = () => {
  const { userId, login } = useAuth();


  const [openApps, setOpenApps] = useState<AppInstance[]>([]);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const [isParametersOpen, setIsParametersOpen] = useState<boolean>(false);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);
  const [currentMaxHistoryLength, setCurrentMaxHistoryLength] =
    useState<number>(INITIAL_MAX_HISTORY_LENGTH);
  const [isStatefulnessEnabled, setIsStatefulnessEnabled] =
    useState<boolean>(false);
  const [isDeepThinkingEnabled, setIsDeepThinkingEnabled] = useState<boolean>(false);
  const [desktopLayout, setDesktopLayout] = useState<DesktopLayout>('categorized');

  // Voice Assistant State
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [voiceAssistantState, setVoiceAssistantState] = useState<
    'idle' | 'listening' | 'processing' | 'speaking'
  >('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<ConversationalResponse>({text: '', sources: [], functionCalls: []});
  
  // Live API Refs
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const bringToFront = useCallback((appId: string) => {
    setOpenApps(prev => {
      const maxZ = Math.max(0, ...prev.map(a => a.zIndex));
      return prev.map(a => a.definition.id === appId ? { ...a, zIndex: maxZ + 1, isMinimized: false } : a);
    });
    setActiveAppId(appId);
  }, []);

  const internalHandleLlmRequest = useCallback(
    async (appId: string, history: InteractionData[], maxHistory: number, deepThinking: boolean) => {
      setOpenApps((prev) =>
        prev.map((app) =>
          app.definition.id === appId ? {...app, isLoading: true, error: null} : app,
        ),
      );

      try {
        const stream = streamAppContent(history, maxHistory, deepThinking);
        let fullContent = '';

        for await (const chunk of stream) {
          fullContent += chunk;
          setOpenApps((prev) =>
            prev.map((app) =>
              app.definition.id === appId
                ? {...app, content: fullContent, isLoading: true} 
                : app,
            ),
          );
        }
        setOpenApps((prev) =>
          prev.map((app) =>
            app.definition.id === appId
              ? {...app, content: fullContent, isLoading: false} 
              : app,
          ),
        );
      } catch (error) {
        console.error('Error streaming app content:', error);
        setOpenApps((prev) =>
          prev.map((app) =>
            app.definition.id === appId
              ? {...app, error: error instanceof Error ? error.message : 'An unknown error occurred', isLoading: false}
              : app,
          ),
        );
      }
    },
    [],
  );

  const handleInteractionForApp = useCallback(
    (appId: string, interaction: InteractionData) => {
      setOpenApps((prev) => {
        const appIndex = prev.findIndex((a) => a.definition.id === appId);
        if (appIndex === -1) return prev;

        const app = prev[appIndex];
        const newHistory = [...app.history, interaction];
        
        const clientSideApps = ['file_explorer', 'image_studio', 'translator_app', 'seo_article_writer_app', 'gallery_app', 'keyword_researcher_app', 'to_do_list_app', 'gemini_lens', 'google_trends_app', 'calendar_app', 'wallet_app', 'content_planner_app'];
        
        if (!clientSideApps.includes(appId)) {
           internalHandleLlmRequest(
                appId,
                newHistory,
                currentMaxHistoryLength,
                isDeepThinkingEnabled
            );
        }

        const newApps = [...prev];
        newApps[appIndex] = {
            ...app,
            history: newHistory,
        };
        return newApps;
      });
    },
    [currentMaxHistoryLength, isDeepThinkingEnabled, internalHandleLlmRequest],
  );

  if (!userId) {
    return (
  // Live API Connection
  const connectToLive = async () => {
      try {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
          const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          inputSourceRef.current = inputContext.createMediaStreamSource(stream);
          processorRef.current = inputContext.createScriptProcessor(4096, 1, 1);
          
          const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              callbacks: {
                  onopen: () => {
                      setVoiceAssistantState('listening');
                      if (inputSourceRef.current && processorRef.current) {
                           inputSourceRef.current.connect(processorRef.current);
                           processorRef.current.connect(inputContext.destination);
                           processorRef.current.onaudioprocess = (e) => {
                               const inputData = e.inputBuffer.getChannelData(0);
                               const base64Data = pcmToBase64(inputData);
                               sessionPromise.then(session => {
                                   session.sendRealtimeInput({
                                       media: {
                                           mimeType: 'audio/pcm;rate=16000',
                                           data: base64Data
                                       }
                                   });
                               });
                           };
                      }
                  },
                  onmessage: async (message: LiveServerMessage) => {
                      if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentOutputTranscription.current += text;
                        setAssistantResponse(prev => ({...prev, text: currentOutputTranscription.current}));
                      } else if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscription.current += text;
                        setUserTranscript(currentInputTranscription.current);
                      }
                      if (message.serverContent?.turnComplete) {
                          currentInputTranscription.current = '';
                          currentOutputTranscription.current = '';
                          setVoiceAssistantState('listening');
                      }
                      const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      if (audioData) {
                          setVoiceAssistantState('speaking');
                          if (audioContextRef.current) {
                              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
                              const audioBuffer = await decodeAudioData(
                                  decode(audioData),
                                  audioContextRef.current,
                                  24000,
                                  1
                              );
                              const source = audioContextRef.current.createBufferSource();
                              source.buffer = audioBuffer;
                              source.connect(audioContextRef.current.destination);
                              source.start(nextStartTimeRef.current);
                              nextStartTimeRef.current += audioBuffer.duration;
                              outputSourcesRef.current.add(source);
                              source.onended = () => {
                                  outputSourcesRef.current.delete(source);
                              }
                          }
                      }
                      if (message.toolCall) {
                          for (const fc of message.toolCall.functionCalls) {
                              let result: any = { result: "ok" };
                              try {
                                  if (fc.name === 'openApp') {
                                      const appName = fc.args.appName as string;
                                      const appToOpen = APP_DEFINITIONS_CONFIG.find(app => app.name.toLowerCase() === appName.toLowerCase());
                                      if (appToOpen) {
                                          handleAppOpen(appToOpen);
                                          result = { result: `Opened ${appToOpen.name}` };
                                      } else {
                                          result = { result: `App ${appName} not found` };
                                      }
                                  } else if (fc.name === 'printContent') {
                                      alert(`Printing: ${fc.args.content}`);
                                      result = { result: "Content printed" };
                                  } else if (fc.name === 'openUrl') {
                                      const url = fc.args.url as string;
                                      const webApp = APP_DEFINITIONS_CONFIG.find(app => app.id === 'web_browser_app');
                                      if (webApp) {
                                          handleAppOpen(webApp, url);
                                          result = { result: `Opened ${url}` };
                                      } else {
                                          result = { result: "Web browser not found" };
                                      }
                                  }
                              } catch (e: any) {
                                  result = { error: e.message };
                              }
                              sessionPromise.then(session => {
                                  session.sendToolResponse({
                                      functionResponses: [{
                                          id: fc.id,
                                          name: fc.name,
                                          response: result
                                      }]
                                  });
                              });
                          }
                      }
                      if (message.serverContent?.interrupted) {
                          outputSourcesRef.current.forEach(source => source.stop());
                          outputSourcesRef.current.clear();
                          nextStartTimeRef.current = 0;
                          currentOutputTranscription.current = '';
                      }
                  },
                  onclose: () => {
                      setVoiceAssistantState('idle');
                  },
                  onerror: (err) => {
                      console.error("Live API Error:", err);
                      setVoiceAssistantState('idle');
                      setAssistantResponse({ text: "Connection error. Please try again.", sources: [], functionCalls: [] });
                  }
              },
              config: {
                  responseModalities: [Modality.AUDIO],
                  tools: [{functionDeclarations: [openAppFunctionDeclaration, printContentFunctionDeclaration, openUrlFunctionDeclaration]}],
                  inputAudioTranscription: {},
                  outputAudioTranscription: {},
                  systemInstruction: 'You are G Assistant, a helpful and friendly voice assistant integrated into G OS.'
              }
          });
          sessionRef.current = sessionPromise;
      } catch (e) {
          console.error("Failed to connect to Live API", e);
          setIsVoiceAssistantOpen(false);
      }
  };

  const disconnectLive = async () => {
      if (sessionRef.current) {
          const session = await sessionRef.current;
          session.close();
          sessionRef.current = null;
      }
      if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current.onaudioprocess = null;
          processorRef.current = null;
      }
      if (inputSourceRef.current) {
          inputSourceRef.current.disconnect();
          inputSourceRef.current = null;
      }
      outputSourcesRef.current.forEach(s => s.stop());
      outputSourcesRef.current.clear();
      setVoiceAssistantState('idle');
      setUserTranscript('');
      setAssistantResponse({text: '', sources: [], functionCalls: []});
      currentInputTranscription.current = '';
      currentOutputTranscription.current = '';
  };

  useEffect(() => {
      if (isVoiceAssistantOpen) {
          connectToLive();
      } else {
          disconnectLive();
      }
      return () => {
          disconnectLive();
      };
  }, [isVoiceAssistantOpen]);

  const handleCloseApp = (appId: string) => {
    setOpenApps(prev => prev.filter(app => app.definition.id !== appId));
    if (activeAppId === appId) {
      setActiveAppId(null);
    }
  };

  const handleMinimizeApp = (appId: string) => {
      setOpenApps(prev => prev.map(a => a.definition.id === appId ? { ...a, isMinimized: true } : a));
      if (activeAppId === appId) setActiveAppId(null);
  }

  const handleMaximizeApp = (appId: string) => {
    setOpenApps(prev => prev.map(a => a.definition.id === appId ? { ...a, windowState: a.windowState === 'maximized' ? 'normal' : 'maximized', isMinimized: false } : a));
    bringToFront(appId);
  };

  const handleSplitScreenLeft = (appId: string) => {
    setOpenApps(prev => prev.map(a => a.definition.id === appId ? { ...a, windowState: 'split-left', isMinimized: false } : a));
    bringToFront(appId);
  };

  const handleSplitScreenRight = (appId: string) => {
    setOpenApps(prev => prev.map(a => a.definition.id === appId ? { ...a, windowState: 'split-right', isMinimized: false } : a));
    bringToFront(appId);
  };

  const handleUpdateHistoryLength = (newLength: number) => {
    setCurrentMaxHistoryLength(newLength);
  };

  const handleToggleParameters = () => {
    setIsParametersOpen(!isParametersOpen);
  };

  const handleToggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };
  
  const handleDragWindow = (appId: string, x: number, y: number) => {
      setOpenApps(prev => prev.map(a => a.definition.id === appId ? { ...a, position: { x, y } } : a));
  };

  return (
    <AuthProvider>
    <div className="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center font-sans text-gray-900 select-none">
      
      {/* Desktop Icons */}
      <div className="absolute inset-0 z-0" onClick={() => { if(isStartMenuOpen) setIsStartMenuOpen(false); }}>
          <Desktop onAppOpen={handleAppOpen} layout={desktopLayout} />
      </div>

      {/* Windows */}
      {openApps.map((app) => (
        !app.isMinimized && (
            <Window
              key={app.definition.id}
              appId={app.definition.id}
              title={app.definition.name}
              onClose={() => handleCloseApp(app.definition.id)}
              onMinimize={() => handleMinimizeApp(app.definition.id)}
              onFocus={() => bringToFront(app.definition.id)}
              isActive={activeAppId === app.definition.id}
              zIndex={app.zIndex}
              position={app.position}
              onDrag={(x, y) => handleDragWindow(app.definition.id, x, y)}
              onToggleParameters={handleToggleParameters}
              isParametersPanelOpen={isParametersOpen && activeAppId === app.definition.id}
              onBack={() => {}}
              onForward={() => {}}
              canGoBack={false}
              canGoForward={false}
              onMaximize={() => handleMaximizeApp(app.definition.id)}
              onSplitScreenLeft={() => handleSplitScreenLeft(app.definition.id)}
              onSplitScreenRight={() => handleSplitScreenRight(app.definition.id)}
              windowState={app.windowState}
            >
              {app.definition.id === 'my_computer' ? (
                 <div className="p-8">
                     <h1 className="text-2xl font-bold mb-4">System Information</h1>
                     <p>G OS v1.0</p>
                     <p>Powered by Google Gemini 2.5 & 3.0 Models</p>
                 </div>
              ) : app.definition.id === 'image_studio' ? (
                  <ImageStudio />
              ) : app.definition.id === 'translator_app' ? (
                  <Translator />
              ) : app.definition.id === 'seo_article_writer_app' ? (
                  <SEOArticleWriter />
              ) : app.definition.id === 'gallery_app' ? (
                  <Gallery />
              ) : app.definition.id === 'keyword_researcher_app' ? (
                  <KeywordResearcher />
              ) : app.definition.id === 'to_do_list_app' ? (
                  <ToDoList />
              ) : app.definition.id === 'file_explorer' ? (
                  <FileExplorer />
              ) : app.definition.id === 'gemini_lens' ? (
                  <GeminiLens />
              ) : app.definition.id === 'google_trends_app' ? (
                  <GoogleTrends />
              ) : app.definition.id === 'calendar_app' ? (
                  <Calendar />
              ) : app.definition.id === 'wallet_app' ? (
                  <Wallet />
              ) : app.definition.id === 'content_planner_app' ? (
                  <ContentPlanner />
              ) : app.definition.id === 'app_store' ? (
                  <AppStore onAppOpen={handleAppOpen} />
              ) : app.definition.id === 'video_generator' ? (
                  <VideoGenerator onAppOpen={handleAppOpen} />
              ) : app.definition.id === 'web_browser_app' ? (
                 <Browser 
                    content={app.content}
                    isLoading={app.isLoading}
                    onInteract={(interaction) => handleInteractionForApp(app.definition.id, interaction)}
                    appContext={app.definition.id}
                    history={app.history}
                 />
              ) : app.definition.id === 'terminal_app' ? (
                  <Terminal 
                    content={app.content} 
                    onInteract={(interaction) => handleInteractionForApp(app.definition.id, interaction)}
                    appContext={app.definition.id}
                    isLoading={app.isLoading}
                  />
              ) : (
                <GeneratedContent
                  htmlContent={app.content}
                  onInteract={(interaction) => handleInteractionForApp(app.definition.id, interaction)}
                  appContext={app.definition.id}
                  isLoading={app.isLoading}
                />
              )}
            </Window>
        )
      ))}

      {/* Start Menu Overlay */}
      {isStartMenuOpen && (
          <StartMenu 
            isOpen={isStartMenuOpen}
            onAppOpen={handleAppOpen}
            onClose={() => setIsStartMenuOpen(false)}
          />
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 w-full z-50">
        <Taskbar
          openApps={openApps.map(a => a.definition)}
          activeAppId={activeAppId}
          onSwitchApp={(id) => {
              const app = openApps.find(a => a.definition.id === id);
              if (app?.isMinimized) {
                  setOpenApps(prev => prev.map(a => a.definition.id === id ? { ...a, isMinimized: false } : a));
              }
              bringToFront(id);
          }}
          onCloseApp={handleCloseApp}
          onToggleStartMenu={handleToggleStartMenu}
          onToggleVoiceAssistant={() => setIsVoiceAssistantOpen(prev => !prev)}
        />
      </div>

      {/* Parameters Panel (Modal) */}
      {isParametersOpen && activeAppId && (
          <div className="absolute right-4 top-16 w-80 h-[500px] bg-white rounded-xl shadow-2xl z-[60] overflow-hidden border border-gray-200">
             <ParametersPanel 
                currentLength={currentMaxHistoryLength}
                onUpdateHistoryLength={handleUpdateHistoryLength}
                onClosePanel={() => setIsParametersOpen(false)}
                isStatefulnessEnabled={isStatefulnessEnabled}
                onSetStatefulness={setIsStatefulnessEnabled}
                isDeepThinkingEnabled={isDeepThinkingEnabled}
                onSetDeepThinking={setIsDeepThinkingEnabled}
                desktopLayout={desktopLayout}
                onSetDesktopLayout={setDesktopLayout}
             />
          </div>
      )}

      {/* Voice Assistant Overlay */}
      <VoiceAssistant 
         isOpen={isVoiceAssistantOpen}
         state={voiceAssistantState}
         userTranscript={userTranscript}
         assistantResponse={assistantResponse}
         onClose={() => setIsVoiceAssistantOpen(false)}
         onMicClick={() => {}}
      />

    </div>
  );
};


