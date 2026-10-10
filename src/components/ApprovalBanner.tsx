'use client';

import React from 'react';
import { Sparkles, ArrowRight, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
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
    <div className="bg-[#fef08a] border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg p-4 text-[#222222]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Proposal Summary */}
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-lg bg-[#FF6F20] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#222222] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                Human-in-the-Loop Review
              </span>
              <span className="bg-white text-[#222222] border border-[#222222] text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                DRAFT PROPOSAL v{version.versionNumber}
              </span>
            </div>
            <p className="text-sm font-extrabold text-[#222222] mt-1.5 leading-snug">
              {version.summary}
            </p>
            {version.diffFromPrevious && (
              <p className="text-xs font-semibold text-stone-700 mt-1">
                {version.diffFromPrevious.explanation}
              </p>
            )}
          </div>
        </div>

        {/* Right: Explicit Neo-Brutalist Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          <button
            onClick={onViewRationale}
            className="inline-flex items-center gap-1.5 bg-white text-[#222222] border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-md px-3.5 py-2 text-xs font-black uppercase tracking-wide hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#222222] transition-all cursor-pointer"
          >
            <span>Review Diff & Rationale</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#FF6F20]" />
          </button>

          <button
            onClick={onReject}
            className="inline-flex items-center gap-1.5 bg-white text-red-700 border-2 border-red-700 shadow-[2px_2px_0_0_#b91c1c] rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-red-50 transition-all cursor-pointer"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Reject Draft</span>
          </button>

          <button
            onClick={onApprove}
            disabled={hasErrors}
            className="inline-flex items-center gap-1.5 bg-[#FF6F20] text-white border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-md px-4 py-2 text-xs font-black uppercase tracking-wide hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_#222222] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Approve & Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
