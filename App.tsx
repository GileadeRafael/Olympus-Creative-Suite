
import React, { useState, useCallback, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Header } from './components/Header';
import { ASSISTANTS, Assistant } from './constants';
import type { ChatMessage, ChatSession, Part } from './types';
import { getChatResponse, getChatTitle } from './services/geminiService';
import { AuthScreen } from './components/AuthScreen';
import { PurchaseModal } from './components/PurchaseModal';
import { supabase } from './services/supabaseClient';

const MissingSecretsScreen: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-full bg-dark-gradient font-sans text-ocs-text">
    <div className="w-full max-w-lg p-8 space-y-4 bg-ocs-darker rounded-2xl shadow-2xl text-center border border-ocs-light/20">
      <h1 className="text-2xl font-bold text-red-400">Erro de Configuração</h1>
      <p className="text-ocs-text-dim">
        A URL e a Chave do Supabase não foram configuradas corretamente.
      </p>
      <div className="text-left bg-ocs-dark p-4 mt-4 rounded-lg border border-ocs-light/20">
        <p className="text-ocs-text-dim text-sm font-semibold mb-2">
          Por favor, siga estes passos:
        </p>
        <ol className="text-sm text-ocs-text space-y-2 list-decimal list-inside">
          <li>Clique no ícone de <strong>Secrets</strong> (🔑) na barra de ferramentas à esquerda.</li>
          <li>Adicione duas novas chaves com os nomes e valores do seu projeto Supabase.</li>
        </ol>
        <div className="text-left text-sm text-white bg-black/30 p-3 my-3 rounded-md space-y-2 font-mono">
          <div>
            <p><strong>Name:</strong> <code>SUPABASE_URL</code></p>
            <p className="text-ocs-text-dim text-xs"><strong>Value:</strong> <code>&lt;Sua URL do Projeto Supabase&gt;</code></p>
          </div>
          <div className="pt-1">
            <p><strong>Name:</strong> <code>SUPABASE_ANON_KEY</code></p>
            <p className="text-ocs-text-dim text-xs"><strong>Value:</strong> <code>&lt;Sua Chave Pública 'anon'&gt;</code></p>
          </div>
        </div>
        <p className="text-ocs-text-dim text-sm">
          3. Após adicionar os segredos, <strong>atualize esta página de preview</strong>.
        </p>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  if (!supabase) {
    return <MissingSecretsScreen />;
  }

  const [selectedAssistant, setSelectedAssistant] = useState<Assistant>(ASSISTANTS[0]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatSession[]>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // --- Authentication and Purchase State ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unlockedAssistants, setUnlockedAssistants] = useState<Set<string>>(new Set()); // All assistants locked by default
  const [purchaseModalState, setPurchaseModalState] = useState<{ isOpen: boolean; assistant: Assistant | null }>({ isOpen: false, assistant: null });

  // Handle Auth State Changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            // Fetch unlocked assistants when user logs in
            const { data, error } = await supabase
                .from('unlocked_assistants')
                .select('assistant_id')
                .eq('user_id', currentUser.id);
            
            if (error) {
                console.error('Error fetching unlocked assistants:', error);
            } else {
                const unlockedIds = new Set(data.map(item => item.assistant_id));
                setUnlockedAssistants(unlockedIds);
            }
        } else {
            // Reset when user logs out
            setUnlockedAssistants(new Set());
        }
        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const assistantSessions = chatHistories[selectedAssistant.id] || [];
  const currentSession = assistantSessions.find(s => s.id === currentSessionId);
  const currentChatHistory = currentSession?.messages || [];

  const updateChatTitle = useCallback(async (sessionId: string, history: ChatMessage[]) => {
      const newTitle = await getChatTitle(history);
      setChatHistories(prev => {
          const newHistories = { ...prev };
          const assistantHistory = newHistories[selectedAssistant.id];
          const sessionIndex = assistantHistory.findIndex(s => s.id === sessionId);
          if (sessionIndex !== -1) {
              assistantHistory[sessionIndex].title = newTitle;
          }
          return newHistories;
      });
  }, [selectedAssistant.id]);


  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString() + Math.random().toString(36),
      title: 'New Chat',
      date: new Date().toISOString(),
      messages: [],
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedAssistant.id]: [newSession, ...(prev[selectedAssistant.id] || [])],
    }));
    
    setCurrentSessionId(newSession.id);
  }, [selectedAssistant.id]);
  
  // Effect to handle initial chat creation or selection
  useEffect(() => {
    if (!user) return; // Don't create chats if not logged in

    const isSelectedAssistantUnlocked = unlockedAssistants.has(selectedAssistant.id);
    if (!isSelectedAssistantUnlocked) return; // Don't create chat for locked assistant

    const sessions = chatHistories[selectedAssistant.id] || [];
    if (sessions.length === 0) {
      handleNewChat();
    } else if (!sessions.find(s => s.id === currentSessionId)) {
      setCurrentSessionId(sessions[0].id);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssistant.id, chatHistories, user, unlockedAssistants]);


  const handleSendMessage = useCallback(async (message: string, images?: { mimeType: string; data: string }[]) => {
    if (!currentSessionId) return;

    const userParts: Part[] = [];
    
    if (images && images.length > 0) {
        const imageParts: Part[] = images.map(image => ({
            inlineData: {
                mimeType: image.mimeType,
                data: image.data,
            }
        }));
        userParts.push(...imageParts);
    }
    
    if (message) {
        userParts.push({ text: message });
    }

    const newUserMessage: ChatMessage = {
      role: 'user',
      parts: userParts,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory: ChatMessage[] = [...currentChatHistory, newUserMessage];
    
    setChatHistories(prev => {
        const newHistories = { ...prev };
        const session = newHistories[selectedAssistant.id]?.find(s => s.id === currentSessionId);
        if(session) session.messages = updatedHistory;
        return newHistories;
    });
    
    setIsLoading(true);

    const modelTimestamp = new Date().toISOString();
    const modelResponse: ChatMessage = {
      role: 'model',
      parts: [{ text: '' }],
      timestamp: modelTimestamp,
    };
    
    setChatHistories(prev => {
        const newHistories = { ...prev };
        const session = newHistories[selectedAssistant.id]?.find(s => s.id === currentSessionId);
        if(session) session.messages = [...updatedHistory, modelResponse];
        return newHistories;
    });

    try {
      const stream = getChatResponse(selectedAssistant, updatedHistory);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setChatHistories(prev => {
          const newHistories = { ...prev };
          const session = newHistories[selectedAssistant.id]?.find(s => s.id === currentSessionId);
          if (session && session.messages.length > 0) {
            const lastMessage = session.messages[session.messages.length - 1];
            if(lastMessage.role === 'model') {
                lastMessage.parts = [{ text: fullResponse }];
            }
          }
          return newHistories;
        });
      }

      if (currentSession?.title === 'New Chat' && fullResponse) {
          const finalHistory: ChatMessage[] = [...updatedHistory, { role: 'model', parts: [{ text: fullResponse }], timestamp: modelTimestamp }];
          updateChatTitle(currentSessionId, finalHistory);
      }

    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: 'Sorry, I encountered an error. Please try again.' }],
        timestamp: new Date().toISOString(),
      };
      setChatHistories(prev => {
         const newHistories = { ...prev };
         const session = newHistories[selectedAssistant.id]?.find(s => s.id === currentSessionId);
         if (session) {
             session.messages.pop(); // remove the empty model message
             session.messages.push(errorMessage);
         }
         return newHistories;
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedAssistant, currentSessionId, currentChatHistory, currentSession?.title, updateChatTitle]);
    
  const handleSelectAssistant = (assistant: Assistant) => {
      if (!unlockedAssistants.has(assistant.id)) {
          setPurchaseModalState({ isOpen: true, assistant });
          return;
      }

      setSelectedAssistant(assistant);
      const sessions = chatHistories[assistant.id] || [];
      if(sessions.length > 0){
          setCurrentSessionId(sessions[0].id);
      } else {
          setCurrentSessionId(null); // will trigger new chat creation in useEffect
      }
  };
  
  if (authLoading) {
      // You can return a loading spinner here
      return <div className="flex items-center justify-center h-screen w-full bg-dark-gradient font-sans text-ocs-text">Loading...</div>;
  }
  
  if (!user) {
      return <AuthScreen />;
  }

  return (
    <>
      <div className="flex h-screen w-full font-sans text-ocs-text bg-gray-100 dark:bg-dark-gradient">
        <Sidebar
          assistants={ASSISTANTS}
          selectedAssistant={selectedAssistant}
          onSelectAssistant={handleSelectAssistant}
          theme={theme}
          setTheme={setTheme}
          onNewChat={handleNewChat}
          unlockedAssistants={unlockedAssistants}
        />
        <div className="flex-1 flex flex-col relative">
          <Header user={user} />
          <main className="flex-1 flex flex-col min-h-0">
              <ChatView
                  key={currentSessionId} // Re-mount component on session change
                  assistant={selectedAssistant}
                  chatHistory={currentChatHistory}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  isLocked={!unlockedAssistants.has(selectedAssistant.id)}
              />
          </main>
        </div>
      </div>
      <PurchaseModal
        isOpen={purchaseModalState.isOpen}
        assistant={purchaseModalState.assistant}
        onClose={() => setPurchaseModalState({ isOpen: false, assistant: null })}
      />
    </>
  );
};

export default App;
