
import React from 'react';
import type { Assistant } from '../constants';
import { XIcon, DiamondIcon } from './Icons';

interface PurchaseModalProps {
  isOpen: boolean;
  assistant: Assistant | null;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, assistant, onClose }) => {
  if (!isOpen || !assistant) return null;
  
  const handlePurchase = () => {
      // In a real app, you would integrate a payment gateway.
      // For now, we'll redirect to the placeholder checkout URL.
      if (assistant.checkoutUrl) {
          window.location.href = assistant.checkoutUrl;
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-ocs-darker rounded-2xl shadow-2xl w-full max-w-md m-4 border border-ocs-light/20 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-ocs-text-dim hover:text-white transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center text-center">
             <div className="relative mb-4">
                <img src={assistant.icon} alt={assistant.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-ocs-med" />
                <div className="absolute -bottom-1 -right-1 bg-ocs-purple text-white rounded-full p-2 shadow-lg ring-4 ring-ocs-darker">
                    <DiamondIcon className="w-5 h-5" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-2">Unlock {assistant.name}</h2>
            <p className="text-ocs-text-dim mt-2 max-w-sm">
                Get lifetime access to {assistant.name} to enhance your creative workflow.
            </p>

            <div className="w-full bg-ocs-dark rounded-lg p-4 mt-6 text-center">
                <p className="text-ocs-text-dim text-sm">Lifetime Access</p>
                <p className="text-4xl font-bold text-white my-1">
                    R${assistant.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-ocs-text-dim text-xs">Pagamento único</p>
            </div>
            
            <button
              onClick={handlePurchase}
              className="w-full mt-6 bg-ocs-blue text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ocs-darker focus:ring-ocs-blue"
            >
              Unlock Assistant Now
            </button>
            <p className="text-xs text-ocs-text-dim mt-3">
              Você será redirecionado para uma página de checkout segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
