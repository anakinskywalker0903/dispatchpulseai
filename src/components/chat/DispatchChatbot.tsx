'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Flame,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Clock,
  Radio,
} from 'lucide-react';
import { Technician, ServiceRequest, ScheduleAssignment } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionSuggestion?: {
    type: string;
    label: string;
    payload?: any;
  } | null;
}

interface DispatchChatbotProps {
  technicians: Technician[];
  requests: ServiceRequest[];
  assignments: ScheduleAssignment[];
  groqApiKey?: string;
  onSimulateEmergency: () => void;
  onSimulateDisruption: () => void;
  onTriggerAIPlanning: () => void;
}

export const DispatchChatbot: React.FC<DispatchChatbotProps> = ({
  technicians,
  requests,
  assignments,
  groqApiKey,
  onSimulateEmergency,
  onSimulateDisruption,
  onTriggerAIPlanning,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      role: 'assistant',
      text: "👋 **Hello Dispatcher! I am DispatchPulse AI Copilot.**\n\nI monitor technician workloads, skill qualifications, regional territories, and disruption events in real time.\n\nHow can I help you optimize today's schedule?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (groqApiKey) headers['x-groq-key'] = groqApiKey;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(-6),
          technicians,
          requests,
          assignments,
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I processed your request.',
        actionSuggestion: data.actionSuggestion || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          text: 'Encountered a connection delay. The offline heuristic engine is active.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (action: Message['actionSuggestion']) => {
    if (!action) return;
    if (action.type === 'INJECT_EMERGENCY') {
      onSimulateEmergency();
    } else if (action.type === 'DISRUPT_TECH') {
      onSimulateDisruption();
    } else {
      onTriggerAIPlanning();
    }
  };

  const QUICK_PROMPTS = [
    {
      label: '🚨 Hospital Emergency',
      prompt: 'Hospital ICU generator failed in Downtown. Who can take it right away?',
    },
    {
      label: '⚠️ Marcus Breakdown',
      prompt: 'Marcus Vance van broke down on I-95. How should we replan his tickets?',
    },
    {
      label: '📊 Overtime Risk',
      prompt: 'Are any technicians close to exceeding their maximum workload cap today?',
    },
    {
      label: '🔧 Skills Check',
      prompt: 'Which technicians are certified in HVAC and Electrical?',
    },
  ];

  return (
    <div className="bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b-2 border-[#222222] bg-[#FF6F20] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-white border-2 border-[#222222] text-[#222222] flex items-center justify-center">
            <Bot className="h-5 w-5 text-[#FF6F20]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight text-white leading-none">
              DispatchPulse AI Copilot
            </h3>
            <p className="text-[10px] font-bold text-white/90 mt-0.5">
              Groq LLaMA 3.3 70B • Conversational Dispatch Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#222222] text-white text-[10px] font-mono font-bold px-2 py-1 rounded border border-white/20">
          <Radio className="h-3 w-3 text-[#86efac] animate-pulse" />
          <span>Interactive</span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 border-b border-stone-200 bg-[#FAF8F5] flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-black uppercase text-stone-500 mr-1">
          Quick Inquiries:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            className="text-[10px] font-bold bg-white text-[#222222] border border-[#222222] shadow-[1px_1px_0_0_#222222] rounded px-2 py-0.5 hover:bg-[#fef08a] transition-all cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`h-8 w-8 rounded-full border-2 border-[#222222] flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-[#c8e6ff] text-[#222222]' : 'bg-[#FF6F20] text-white'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-lg border-2 border-[#222222] p-3 text-xs shadow-[2px_2px_0_0_#222222] ${
                  isUser
                    ? 'bg-white text-[#222222] font-bold'
                    : 'bg-white text-[#222222] font-medium leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Action Suggestion Card */}
                {m.actionSuggestion && (
                  <div className="mt-2.5 pt-2 border-t border-stone-200">
                    <button
                      onClick={() => handleExecuteAction(m.actionSuggestion)}
                      className="w-full bg-[#fef08a] text-[#222222] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] rounded py-1.5 px-2.5 text-xs font-black uppercase flex items-center justify-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                    >
                      <span>⚡ {m.actionSuggestion.label}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 bg-white border border-[#222222] rounded-md p-2 w-fit">
            <Sparkles className="h-4 w-4 text-[#FF6F20] animate-spin" />
            <span>Copilot analyzing technician constraints...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t-2 border-[#222222] bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask AI Copilot to check availability, slot a job, or replan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#FAF8F5] border-2 border-[#222222] rounded-md px-3 py-2 text-xs font-bold text-[#222222] focus:outline-none focus:bg-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-[#FF6F20] text-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] rounded-md px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 hover:bg-[#e85e10] disabled:opacity-50 cursor-pointer"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};
