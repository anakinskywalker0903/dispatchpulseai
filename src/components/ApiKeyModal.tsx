'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, Shield, Info, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setApiKeyInput(currentKey || '');
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(apiKeyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg neo-card p-6 bg-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#2E2E2E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 neo-box-sm bg-[#FF6F20] text-white flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#2E2E2E]">
                Groq AI Engine Configuration
              </h3>
              <p className="text-xs font-semibold text-stone-500">
                Ultra-fast LPU inference (Llama 3.3 70B)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 neo-box-sm bg-white hover:bg-[#F1F1F1] text-[#2E2E2E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Vercel Instructions Banner */}
        <div className="p-3.5 neo-card-sm bg-[#fef08a] space-y-1.5 text-xs text-[#2E2E2E]">
          <div className="flex items-center gap-1.5 font-black uppercase tracking-wide">
            <Info className="h-4 w-4 text-[#FF6F20]" />
            <span>How to configure on Vercel:</span>
          </div>
          <p className="leading-relaxed font-medium">
            In your <strong>Vercel Dashboard</strong> &rarr; select this Project &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>:
          </p>
          <div className="bg-white p-2 border-2 border-[#2E2E2E] font-mono text-[11px] font-bold">
            Key: <span className="text-[#FF6F20]">GROQ_API_KEY</span><br />
            Value: <span className="text-stone-600">gsk_your_groq_api_key_here</span>
          </div>
          <p className="text-[11px] font-medium text-stone-600 pt-0.5">
            After saving the variable on Vercel, trigger a <strong>Redeploy</strong>.
          </p>
        </div>

        {/* In-Browser Override */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-[#2E2E2E]">
            Client-Side API Key Override (Optional):
          </label>
          <input
            type="password"
            placeholder="gsk_..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full neo-card-sm px-3 py-2 text-xs font-mono bg-[#F1F1F1] focus:bg-white focus:outline-none"
          />
          <p className="text-[11px] font-medium text-stone-500">
            You can also paste a key directly in this session to test live AI planning without waiting for redeployment.
          </p>
        </div>

        {/* Zero-Key Guarantee */}
        <div className="p-2.5 neo-card-sm bg-[#c8e6ff] text-xs text-[#2E2E2E] flex items-start gap-2">
          <Shield className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
          <p className="font-semibold text-[11px] leading-snug">
            <strong>Offline Fallback Built-In:</strong> If no Groq key is provided, DispatchPulse automatically runs the deterministic heuristic constraint engine with zero failure states or downtime.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-[2.5px] border-[#2E2E2E] pt-3">
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#FF6F20] hover:underline flex items-center gap-1"
          >
            <span>Get Free Groq Key</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="neo-btn neo-btn-white text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="neo-btn neo-btn-orange text-xs py-1.5 px-4"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
