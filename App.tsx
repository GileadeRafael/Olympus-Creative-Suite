

import React from 'react';
import { useState, useCallback, useEffect } from 'react';
// FIX: The User type from Supabase is now recommended to be imported from '@supabase/auth-js'
// to avoid issues with re-exports in different versions of '@supabase/supabase-js'.
// This also helps resolve type inference issues for auth methods like `onAuthStateChange`.
import type { User } from '@supabase/auth-js';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Header } from './components/Header';
import { ASSISTANTS, Assistant } from './constants';
import type { ChatMessage, ChatSession, Part } from './types';
import { getChatResponse, getChatTitle } from './services/geminiService';
import { AuthScreen } from './components/AuthScreen';
import { PurchaseModal } from './components/PurchaseModal';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant>(ASSISTANTS[0]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatSession[]>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // --- Authentication and Purchase State ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unlockedAssistants, setUnlockedAssistants] = useState<Set<string>>(new Set());
  const [purchaseModalState, setPurchaseModalState] = useState<{
    isOpen: boolean;
    assistant: Assistant | null;
    isLoading: boolean;
    error: string | null;
  }>({
    isOpen: false,
    assistant: null,
    isLoading: false,
    error: null,
  });
  
  // Simplified and robust authentication effect
  useEffect(() => {
    setAuthLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            try {
                const { data, error } = await supabase
                    .from('unlocked_assistants')
                    .select('assistant_id')
                    .eq('user_id', currentUser.id);

                if (error) throw error;
                
                const unlockedIds = new Set(data.map(item => String(item.assistant_id)));
                setUnlockedAssistants(unlockedIds);
            } catch (error: any) {
                console.error('Error fetching unlocked assistants:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                });
                setUnlockedAssistants(new Set()); // Reset on error
            }
        } else {
            // Clear all user-specific data on logout or session expiry
            setUnlockedAssistants(new Set());
            setChatHistories({});
            setCurrentSessionId(null);
            setIsLoading(false); // Ensure loading indicators are off
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
          if (!assistantHistory) return newHistories;
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
      // FIX: Replaced non-existent 'aistudio.libs.Date' with standard 'Date' object to fix timestamp creation.
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

    } catch (error: any) {
      console.error("Error getting chat response:", error);
      // Use the specific error message propagated from the service to give the user better feedback.
      const errorText = `**Oops! Something went wrong.**\n\n${error.message || 'Please check the server logs or browser console for more details.'}`;
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: errorText }],
        timestamp: new Date().toISOString(),
      };
      setChatHistories(prev => {
         const newHistories = { ...prev };
         const session = newHistories[selectedAssistant.id]?.find(s => s.id === currentSessionId);
         if (session) {
             // Replace the empty 'in-progress' model message with the error message.
             session.messages.pop(); 
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
          setPurchaseModalState({ isOpen: true, assistant, isLoading: false, error: null });
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
  
  const handlePurchaseSuccess = (purchasedAssistant: Assistant) => {
    // 1. Update the local state to reflect the unlock
    setUnlockedAssistants(prev => new Set(prev).add(purchasedAssistant.id));
    // 2. Close the modal and reset state
    setPurchaseModalState({ isOpen: false, assistant: null, isLoading: false, error: null });
    // 3. Directly select the assistant, bypassing the lock check
    setSelectedAssistant(purchasedAssistant);
    const sessions = chatHistories[purchasedAssistant.id] || [];
    if (sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
    } else {
        setCurrentSessionId(null); // will trigger new chat creation in useEffect
    }
  };

  const handleConfirmPurchase = async (assistantToPurchase: Assistant) => {
    if (!user) {
        setPurchaseModalState(prev => ({ ...prev, error: "You must be logged in to make a purchase." }));
        return;
    }

    setPurchaseModalState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
        const { error: insertError } = await supabase
            .from('unlocked_assistants')
            .insert({
                user_id: user.id,
                assistant_id: assistantToPurchase.id,
            });

        if (insertError) {
            // Handle case where user might already own the assistant (e.g., race condition)
            if (insertError.code === '23505') { // Postgres unique_violation
                 console.warn('User already owns this assistant. Unlocking.');
                 handlePurchaseSuccess(assistantToPurchase);
                 return;
            }
            throw insertError;
        }

        handlePurchaseSuccess(assistantToPurchase);

    } catch (err: any) {
        console.error("Purchase error:", err);
        const errorMessage = err.message || "An error occurred during the purchase. Please try again.";
        setPurchaseModalState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  };
  
  const handleClosePurchaseModal = () => {
    setPurchaseModalState({ isOpen: false, assistant: null, isLoading: false, error: null });
  };
  
  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    }
    // The onAuthStateChange listener is the single source of truth
    // and will handle all UI and state updates automatically.
  }, []);
  
  if (authLoading) {
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
          <Header user={user} onLogout={handleLogout} />
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
        onClose={handleClosePurchaseModal}
        onConfirmPurchase={handleConfirmPurchase}
        isLoading={purchaseModalState.isLoading}
        error={purchaseModalState.error}
      />
    </>
  );
};

export default App;