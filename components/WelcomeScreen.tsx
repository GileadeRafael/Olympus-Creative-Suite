
import React from 'react';
import type { Assistant } from '../constants';

interface WelcomeScreenProps {
  assistant: Assistant;
  onSendMessage: (message: string) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

const SuggestionCard: React.FC<{
  title: string;
  image: string;
  onClick: () => void;
}> = ({ title, image, onClick }) => (
  <button
    onClick={onClick}
    className="relative w-full h-24 rounded-xl overflow-hidden group bg-gray-800/50 hover:scale-105 transition-transform duration-300"
  >
    <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    <div className="relative h-full flex items-end p-4">
      <h3 className="text-white text-base font-semibold text-left">{title}</h3>
    </div>
  </button>
);


export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ assistant, onSendMessage }) => {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div>
            <p className="text-gray-400 dark:text-ocs-text-dim text-lg">
                {greeting}, Gileade
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white">
                Como posso ajudar?
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-ocs-text-dim max-w-xl mx-auto">
                {assistant.welcomeMessage}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
            {assistant.suggestions.map((suggestion, index) => (
                <SuggestionCard
                    key={index}
                    title={suggestion.title}
                    image={suggestion.image}
                    onClick={() => onSendMessage(suggestion.title)}
                />
            ))}
        </div>
    </div>
  );
};