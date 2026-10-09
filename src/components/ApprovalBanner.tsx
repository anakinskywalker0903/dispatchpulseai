'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScheduleVersion } from '@/lib/types';

interface ApprovalBannerProps {
  version: ScheduleVersion;
  onApprove: () => void;
  onReject: () => void;
  onViewRationale: () => void;
  hasErrors: boolean;
}

export const ApprovalBanner: React.FC<ApprovalBannerProps> = ({
  version,
  onApprove,
  onReject,
  onViewRationale,
  hasErrors,
}) => {
  if (version.status !== 'Pending_Approval' && version.status !== 'Draft') {
    return null;
  }

  return (
    <div className="relative overflow-hidden border-b border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 px-4 py-3 sm:px-6 shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Human-in-the-Loop Review
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                Draft v{version.versionNumber}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 mt-0.5">
              {version.summary}
            </p>
            {version.diffFromPrevious && (
              <p className="text-xs text-indigo-300 mt-0.5">
                {version.diffFromPrevious.explanation}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          <button
            onClick={onViewRationale}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <span>Review Trade-Offs & Diff</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={onReject}
            className="flex items-center gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/60 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Reject Draft</span>
          </button>

          <button
            onClick={onApprove}
            disabled={hasErrors}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Approve & Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
