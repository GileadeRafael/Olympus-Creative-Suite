
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Header } from './components/Header';
import { ASSISTANTS, Assistant } from './constants';
import type { ChatMessage, ChatSession, Part } from './types';
import { getChatResponse, getChatTitle } from './services/geminiService';

const App: React.FC = () => {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant>(ASSISTANTS[0]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatSession[]>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
    const sessions = chatHistories[selectedAssistant.id] || [];
    if (sessions.length === 0) {
      handleNewChat();
    } else if (!sessions.find(s => s.id === currentSessionId)) {
      setCurrentSessionId(sessions[0].id);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssistant.id, chatHistories]);


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
      setSelectedAssistant(assistant);
      const sessions = chatHistories[assistant.id] || [];
      if(sessions.length > 0){
          setCurrentSessionId(sessions[0].id);
      } else {
          setCurrentSessionId(null); // will trigger new chat creation in useEffect
      }
  };


  return (
    <div className="flex h-screen w-full font-sans text-ocs-text bg-gray-100 dark:bg-dark-gradient">
      <Sidebar
        assistants={ASSISTANTS}
        selectedAssistant={selectedAssistant}
        onSelectAssistant={handleSelectAssistant}
        theme={theme}
        setTheme={setTheme}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col relative">
        <Header />
        <main className="flex-1 flex flex-col min-h-0">
            <ChatView
                key={currentSessionId} // Re-mount component on session change
                assistant={selectedAssistant}
                chatHistory={currentChatHistory}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
            />
        </main>
      </div>
    </div>
  );
};

export default App;