import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import type { ChatMessage } from '../types';
import type { Assistant } from '../constants';
import { UserIcon, CopyIcon, CheckIcon, SendArrowIcon, ImageIcon, XIcon, DiamondIcon } from './Icons';
import { WelcomeScreen } from './WelcomeScreen';


interface ChatViewProps {
  assistant: Assistant;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string, images?: { mimeType: string, data: string }[]) => void;
  isLocked: boolean;
}

const LockedWelcomeScreen: React.FC<{ assistant: Assistant }> = ({ assistant }) => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="relative mb-6">
            <img src={assistant.icon} alt={assistant.name} className="w-28 h-28 rounded-full object-cover ring-4 ring-gray-200 dark:ring-ocs-med grayscale" />
            <div className="absolute -bottom-2 -right-2 bg-ocs-purple text-white rounded-full p-2.5 shadow-lg ring-4 ring-gray-100 dark:ring-ocs-darker">
                <DiamondIcon className="w-6 h-6" />
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white">
            {assistant.name} está bloqueado
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-ocs-text-dim max-w-xl mx-auto">
            Clique no ícone do assistente na barra lateral para desbloquear o acesso e começar a criar.
        </p>
    </div>
);


// Custom Code Block Component with Copy Button
const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return !inline ? (
    <div className="relative my-4 rounded-lg bg-gray-100 dark:bg-ocs-dark text-sm border border-gray-200 dark:border-ocs-light/20">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-ocs-light/20">
        <span className="text-xs font-sans text-gray-500 dark:text-ocs-text-dim">{match ? match[1] : 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-ocs-text-dim dark:hover:text-white transition-colors">
          {isCopied ? <CheckIcon className="w-4 h-4 text-ocs-green" /> : <CopyIcon className="w-4 h-4" />}
          {isCopied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre {...props} className="p-4 overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

const formatTimestamp = (isoString: string | undefined) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};


const ChatBubble: React.FC<{ message: ChatMessage; assistant: Assistant }> = ({ message, assistant }) => {
  const isUser = message.role === 'user';
  const textContent = (message.parts.find(p => 'text' in p) as { text: string })?.text ?? '';
  const imageParts = message.parts.filter(p => 'inlineData' in p) as { inlineData: { mimeType: string; data: string } }[];
  const timestamp = formatTimestamp(message.timestamp);
  
  const userAvatar = (
    <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-ocs-green flex items-center justify-center">
        <UserIcon className="h-6 w-6 text-white" />
    </div>
  );
  
  const assistantAvatar = <img src={assistant.icon} alt={assistant.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />;

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && assistantAvatar}
      
      <div className={`flex flex-col max-w-xl xl:max-w-2xl min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-ocs-text-dim mb-1 px-1">
          <span>{timestamp}</span>
        </div>
        
        <div className={`w-full rounded-xl p-3 prose prose-lg dark:prose-invert break-words ${isUser ? 'bg-gray-200 dark:bg-ocs-light' : 'bg-white border border-gray-200 dark:border-transparent dark:bg-ocs-med'}`}>
           {imageParts.length > 0 && (
                <div className={`grid gap-2 mb-2 ${imageParts.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {imageParts.map((part, index) => (
                        <img 
                            key={index}
                            src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                            alt="User upload"
                            className="max-w-xs rounded-lg my-0"
                        />
                    ))}
                </div>
            )}
            {textContent ? (
                <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{ 
                    code: CodeBlock,
                    table: ({node, ...props}) => (
                        <div className="overflow-x-auto">
                            <table {...props} className="my-0" />
                        </div>
                    ),
                }}
                >
                {textContent}
                </ReactMarkdown>
            ) : (
                // Render nothing if it's a model message that is still empty, or a user message that only contains images.
                !isUser || (isUser && imageParts.length > 0) ? null : <p>...</p>
            )}
        </div>
      </div>
      
      {isUser && userAvatar}
    </div>
  );
};

const LoadingBubble: React.FC<{ assistant: Assistant }> = ({ assistant }) => (
    <div className="flex items-start gap-4 justify-start">
        <img src={assistant.icon} alt={assistant.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      
        <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-ocs-text-dim mb-1 px-1">
                <span>{assistant.name} is typing...</span>
            </div>
        
            <div className="rounded-xl p-3 bg-white dark:bg-ocs-med border border-gray-200 dark:border-transparent">
                <div className="flex items-center space-x-1.5 py-1">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-ocs-lighter rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 dark:bg-ocs-lighter rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 dark:bg-ocs-lighter rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    </div>
);

export const ChatView: React.FC<ChatViewProps> = ({ assistant, chatHistory, isLoading, onSendMessage, isLocked }) => {
  const [input, setInput] = useState('');
  const [imagesToSend, setImagesToSend] = useState<{ id: string; mimeType: string; data: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNewChat = chatHistory.length === 0;

  const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
  const isAwaitingFirstChunk =
    isLoading &&
    lastMessage?.role === 'model' &&
    ((lastMessage.parts.find(p => 'text' in p) as { text: string })?.text ?? '').trim() === '';


  useEffect(() => {
    // Scroll smoothly unless we are awaiting the first chunk, to avoid jitter.
    if (!isAwaitingFirstChunk) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAwaitingFirstChunk]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImagePromises = Array.from(files).map((file: File) => {
        return new Promise<{ id: string; mimeType: string; data: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve({
                    id: `${file.name}-${Date.now()}`,
                    mimeType: file.type,
                    data: base64String,
                });
            };
            reader.readAsDataURL(file);
        });
    });

    Promise.all(newImagePromises).then(imageData => {
        setImagesToSend(prev => [...prev, ...imageData]);
    });
  };
  
  const handleRemoveImage = (idToRemove: string) => {
      setImagesToSend(prev => prev.filter(image => image.id !== idToRemove));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || imagesToSend.length > 0) && !isLoading) {
      onSendMessage(input.trim(), imagesToSend);
      setInput('');
      setImagesToSend([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleImageButtonClick = () => {
      fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-8 md:pt-12">
             {isLocked ? (
                <LockedWelcomeScreen assistant={assistant} />
            ) : isNewChat ? (
                <WelcomeScreen assistant={assistant} onSendMessage={onSendMessage} />
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                    {chatHistory.map((msg, index) => {
                        // Don't render the empty model bubble while waiting for the first chunk.
                        if (index === chatHistory.length - 1 && isAwaitingFirstChunk) {
                            return null;
                        }
                        return <ChatBubble key={index} message={msg} assistant={assistant} />;
                    })}
                    {isAwaitingFirstChunk && <LoadingBubble assistant={assistant} />}
                    <div ref={chatEndRef} />
                </div>
            )}
        </div>
        <div className={`p-4 md:px-6 md:pb-6 ${isLocked ? 'invisible' : ''}`}>
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-start mb-2 ml-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-ocs-darker border border-gray-200 dark:border-ocs-light/20 rounded-lg text-sm cursor-pointer">
                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                            <img src={assistant.icon} alt={assistant.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-ocs-text">{assistant.name}</span>
                        <svg className="w-4 h-4 text-gray-500 dark:text-ocs-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="relative">
                    <div className="bg-white dark:bg-ocs-darker rounded-2xl flex flex-col border border-gray-300 dark:border-ocs-light/30 shadow-lg">
                        {imagesToSend.length > 0 && (
                            <div className="p-2 flex flex-wrap gap-2 border-b border-gray-200 dark:border-ocs-light/30">
                                {imagesToSend.map(image => (
                                <div key={image.id} className="relative group w-16 h-16">
                                    <img src={`data:${image.mimeType};base64,${image.data}`} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                    <button
                                    type="button"
                                    onClick={() => handleRemoveImage(image.id)}
                                    className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 bg-gray-200 text-gray-700 dark:bg-ocs-darker dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                    >
                                    <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                                ))}
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="What do you want to see..."
                            className="flex-1 bg-transparent resize-none outline-none text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-ocs-text-dim p-4 max-h-48 w-full"
                            rows={1}
                        />
                        <div className="flex justify-between items-center p-2">
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                                multiple
                            />
                            <button
                                type="button"
                                onClick={handleImageButtonClick}
                                className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-ocs-light/60 transition-colors ${imagesToSend.length > 0 ? 'text-ocs-blue' : 'text-gray-500 dark:text-ocs-text-dim'}`}
                                aria-label="Add image"
                            >
                                <ImageIcon className="w-6 h-6" />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || (!input.trim() && imagesToSend.length === 0)}
                                className="p-2.5 rounded-lg bg-ocs-blue text-white disabled:bg-gray-300 dark:disabled:bg-ocs-light disabled:cursor-not-allowed transition-all hover:bg-blue-600 active:scale-95"
                                aria-label="Send message"
                            >
                                <SendArrowIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};