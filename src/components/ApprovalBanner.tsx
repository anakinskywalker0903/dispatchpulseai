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
    <div className="neo-card bg-[#fef08a] p-4 text-[#2E2E2E] space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 neo-box-sm bg-[#FF6F20] text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="neo-badge bg-white text-[#2E2E2E] text-[10px]">
                HUMAN-IN-THE-LOOP APPROVAL GATE
              </span>
              <span className="neo-badge bg-[#2E2E2E] text-white text-[10px]">
                DRAFT PROPOSAL v{version.versionNumber}
              </span>
            </div>
            <p className="text-sm font-extrabold text-[#2E2E2E] mt-1 leading-snug">
              {version.summary}
            </p>
            {version.diffFromPrevious && (
              <p className="text-xs font-semibold text-stone-700 mt-0.5">
                {version.diffFromPrevious.explanation}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={onViewRationale}
            className="neo-btn neo-btn-white text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <span>Review Diff & Trade-Offs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onReject}
            className="neo-btn neo-btn-white text-xs py-2 px-3 flex items-center gap-1.5 text-red-700 hover:bg-[#ffdad6]"
          >
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            <span>Reject Draft</span>
          </button>

          <button
            onClick={onApprove}
            disabled={hasErrors}
            className="neo-btn neo-btn-orange text-xs py-2 px-4 flex items-center gap-1.5 font-black"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Approve & Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
