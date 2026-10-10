'use client';

import React, { useState } from 'react';
import {
  ScheduleVersion,
} from '@/lib/types';
import {
  Sparkles,
  AlertTriangle,
  HelpCircle,
  GitCompare,
  CheckCircle,
  Copy,
  Check,
  X,
  Info,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  version: ScheduleVersion;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  hasErrors: boolean;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  version,
  isOpen,
  onClose,
  onApprove,
  hasErrors,
}) => {
  const [activeTab, setActiveTab] = useState<'TRADEOFFS' | 'RISKS' | 'QUESTIONS' | 'DIFF'>('TRADEOFFS');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const diff = version.diffFromPrevious;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-white border-l-[3px] border-[#2E2E2E] shadow-[-6px_0_0_0_#2E2E2E] h-full flex flex-col">
        {/* Header Bar */}
        <div className="p-4 border-b-[2.5px] border-[#2E2E2E] bg-[#FF6F20] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 neo-box-sm bg-white text-[#2E2E2E] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#FF6F20]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">
                DispatchAI Agent Reasoning
              </h3>
              <p className="text-[11px] font-bold text-white/90">
                Schedule Snapshot v{version.versionNumber} • {version.source}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 neo-box-sm bg-white hover:bg-stone-100 text-[#2E2E2E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Executive Summary Card */}
        <div className="p-4 bg-[#fef08a] border-b-[2.5px] border-[#2E2E2E]">
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 neo-box-sm bg-[#FF6F20] text-white flex items-center justify-center shrink-0">
              <Info className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#2E2E2E]">
                Strategic Plan Overview
              </p>
              <p className="text-xs font-bold text-[#2E2E2E] mt-0.5 leading-relaxed">
                {version.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Neo-Brutalist filter chips) */}
        <div className="flex flex-wrap gap-2 p-3 border-b-[2px] border-[#2E2E2E] bg-[#F1F1F1]">
          <button
            onClick={() => setActiveTab('TRADEOFFS')}
            className={`neo-badge text-xs py-1 px-3 cursor-pointer transition-all ${
              activeTab === 'TRADEOFFS'
                ? 'bg-[#2E2E2E] text-white border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E]'
                : 'bg-white text-[#2E2E2E] hover:bg-stone-100'
            }`}
          >
            Trade-Offs ({version.tradeOffs.length})
          </button>

          <button
            onClick={() => setActiveTab('RISKS')}
            className={`neo-badge text-xs py-1 px-3 cursor-pointer transition-all ${
              activeTab === 'RISKS'
                ? 'bg-[#2E2E2E] text-white border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E]'
                : 'bg-white text-[#2E2E2E] hover:bg-stone-100'
            }`}
          >
            <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-500" />
            Risk Radar ({version.risks.length})
          </button>

          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`neo-badge text-xs py-1 px-3 cursor-pointer transition-all ${
              activeTab === 'QUESTIONS'
                ? 'bg-[#2E2E2E] text-white border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E]'
                : 'bg-white text-[#2E2E2E] hover:bg-stone-100'
            }`}
          >
            <HelpCircle className="h-3 w-3 inline mr-1 text-emerald-600" />
            Missing Info ({version.suggestedQuestions.length})
          </button>

          <button
            onClick={() => setActiveTab('DIFF')}
            className={`neo-badge text-xs py-1 px-3 cursor-pointer transition-all ${
              activeTab === 'DIFF'
                ? 'bg-[#2E2E2E] text-white border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E]'
                : 'bg-white text-[#2E2E2E] hover:bg-stone-100'
            }`}
          >
            <GitCompare className="h-3 w-3 inline mr-1 text-purple-600" />
            What Changed ({diff ? diff.modified.length + diff.added.length : 0})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
          {/* 1. Trade-offs */}
          {activeTab === 'TRADEOFFS' && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                Deliberate trade-offs evaluated by DispatchPulse AI:
              </p>
              {version.tradeOffs.length === 0 ? (
                <div className="neo-card-sm p-4 bg-white text-center text-xs font-bold text-stone-500">
                  Standard schedule allocation. No significant trade-offs required.
                </div>
              ) : (
                version.tradeOffs.map((tradeoff, idx) => (
                  <div
                    key={idx}
                    className="neo-card-sm p-3 bg-white flex items-start gap-2.5"
                  >
                    <div className="h-5 w-5 neo-box-sm bg-[#c8e6ff] text-[#2E2E2E] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs font-bold text-[#2E2E2E] leading-relaxed">
                      {tradeoff}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. Risk Radar */}
          {activeTab === 'RISKS' && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                Identified operational bottlenecks and tight capacity buffers:
              </p>
              {version.risks.length === 0 ? (
                <div className="neo-card-sm p-4 bg-[#86efac]/40 text-xs font-black text-green-900 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>No high-risk bottlenecks or overtime overruns identified.</span>
                </div>
              ) : (
                version.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="neo-card-sm p-3 bg-[#fef08a] flex items-start gap-2.5"
                  >
                    <AlertTriangle className="h-4 w-4 text-[#FF6F20] shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-[#2E2E2E] leading-relaxed">
                      {risk}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. Questions / Missing Info */}
          {activeTab === 'QUESTIONS' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                Missing work order details. Inquiries pre-drafted for customer outreach:
              </p>
              {version.suggestedQuestions.length === 0 ? (
                <div className="neo-card-sm p-4 bg-white text-center text-xs font-bold text-stone-500">
                  All work orders have complete technical specifications.
                </div>
              ) : (
                version.suggestedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="neo-card-sm p-3.5 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="neo-badge bg-[#c8e6ff] text-[#2E2E2E] text-[10px]">
                        {q.requestId} • {q.customer}
                      </span>
                      <button
                        onClick={() => handleCopyQuestion(q.question, idx)}
                        className="neo-btn neo-btn-white text-[10px] py-1 px-2"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600 inline mr-1" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 inline mr-1" />
                            <span>Copy Question</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs font-mono font-bold bg-[#F1F1F1] p-2.5 border-2 border-[#2E2E2E] text-[#2E2E2E]">
                      "{q.question}"
                    </p>
                    <p className="text-[11px] font-bold text-stone-500">
                      Why needed: {q.rationale}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. Diff / What Changed and Why */}
          {activeTab === 'DIFF' && (
            <div className="space-y-3">
              {!diff ? (
                <div className="neo-card-sm p-4 bg-white text-center text-xs font-bold text-stone-500">
                  Initial Schedule (v1) — No prior version to compare against.
                </div>
              ) : (
                <>
                  <div className="neo-card-sm p-3 bg-white text-xs font-bold text-[#2E2E2E]">
                    <span className="uppercase text-[#FF6F20] block mb-0.5">Diff Summary</span>
                    {diff.explanation}
                  </div>

                  {diff.modified.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-1.5">
                        Rescheduled & Reassigned Tasks ({diff.modified.length})
                      </h4>
                      <div className="space-y-2">
                        {diff.modified.map((mod, idx) => (
                          <div
                            key={idx}
                            className="neo-card-sm p-2.5 bg-[#fef08a] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-black text-[#2E2E2E]">
                              <span>{mod.requestTitle}</span>
                              <span className="font-mono text-[11px] bg-white px-1 border border-[#2E2E2E]">
                                {mod.oldStartTime} ➔ {mod.newStartTime}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-stone-700">
                              {mod.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diff.added.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-1.5">
                        Newly Scheduled Tasks ({diff.added.length})
                      </h4>
                      <div className="space-y-1.5">
                        {diff.added.map((add, idx) => (
                          <div
                            key={idx}
                            className="neo-card-sm p-2 bg-[#86efac]/50 text-xs font-black text-[#14532d] flex items-center justify-between"
                          >
                            <span>Request {add.requestId}</span>
                            <span className="font-mono text-[11px]">
                              {add.startTime}–{add.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t-[2.5px] border-[#2E2E2E] bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-white text-xs py-1.5 px-3"
          >
            Close Drawer
          </button>

          {(version.status === 'Draft' || version.status === 'Pending_Approval') && (
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              disabled={hasErrors}
              className="neo-btn neo-btn-orange text-xs py-1.5 px-4"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve & Dispatch Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
