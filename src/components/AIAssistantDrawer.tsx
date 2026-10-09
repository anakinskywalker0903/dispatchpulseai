'use client';

import React, { useState } from 'react';
import {
  ScheduleVersion,
  ScheduleDiff,
  ClarificationQuestion,
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
  ArrowRight,
  ShieldAlert,
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                DispatchAI Agent Insights & Analysis
              </h3>
              <p className="text-xs text-slate-400">
                Schedule Version v{version.versionNumber} • {version.source}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Executive Summary Card */}
        <div className="p-4 bg-indigo-950/30 border-b border-indigo-900/30">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Executive Strategy Summary
              </p>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                {version.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('TRADEOFFS')}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              activeTab === 'TRADEOFFS'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Trade-Offs ({version.tradeOffs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RISKS')}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              activeTab === 'RISKS'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Risk Radar ({version.risks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              activeTab === 'QUESTIONS'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Missing Info ({version.suggestedQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DIFF')}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              activeTab === 'DIFF'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>What Changed ({diff ? diff.modified.length + diff.added.length : 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 1. Trade-offs */}
          {activeTab === 'TRADEOFFS' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">
                The agent evaluated multiple constraints and alternative routes, making these deliberate balance decisions:
              </p>
              {version.tradeOffs.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  No major trade-offs required. Standard capacity was sufficient.
                </div>
              ) : (
                version.tradeOffs.map((tradeoff, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 flex items-start gap-2.5"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
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
              <p className="text-xs text-slate-400">
                Proactive warnings detected by the constraint engine regarding capacity and timing:
              </p>
              {version.risks.length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>No high-risk schedule bottlenecks identified.</span>
                </div>
              ) : (
                version.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-amber-900/40 bg-amber-950/20 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200 leading-relaxed">{risk}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. Questions / Missing Info */}
          {activeTab === 'QUESTIONS' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Service requests with incomplete specifications. Suggested customer inquiries drafted by DispatchAI:
              </p>
              {version.suggestedQuestions.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  All requests have complete technical specifications.
                </div>
              ) : (
                version.suggestedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        {q.requestId} • {q.customer}
                      </span>
                      <button
                        onClick={() => handleCopyQuestion(q.question, idx)}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs italic bg-slate-950/80 p-2.5 rounded border border-slate-800 text-slate-300">
                      "{q.question}"
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Rationale: {q.rationale}
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
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  Initial version (v1) — no previous schedule version to compare against.
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-white">Summary: </span>
                    {diff.explanation}
                  </div>

                  {diff.modified.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                        Rescheduled / Reassigned Tasks ({diff.modified.length})
                      </h4>
                      <div className="space-y-2">
                        {diff.modified.map((mod, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded border border-amber-900/40 bg-amber-950/20 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold text-amber-200">
                              <span>{mod.requestTitle}</span>
                              <span className="font-mono text-[11px]">
                                {mod.oldStartTime} ➔ {mod.newStartTime}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              {mod.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diff.added.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                        Newly Scheduled ({diff.added.length})
                      </h4>
                      <div className="space-y-1.5">
                        {diff.added.map((add, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded border border-emerald-900/40 bg-emerald-950/20 text-xs text-emerald-200 flex items-center justify-between"
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

                  {diff.removed.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1.5">
                        Moved to Unassigned ({diff.removed.length})
                      </h4>
                      <div className="space-y-1.5">
                        {diff.removed.map((rem, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded border border-rose-900/40 bg-rose-950/20 text-xs text-rose-200"
                          >
                            <span>Request {rem.requestId}</span>
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Close Panel
          </button>

          {(version.status === 'Draft' || version.status === 'Pending_Approval') && (
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              disabled={hasErrors}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all disabled:opacity-50"
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
