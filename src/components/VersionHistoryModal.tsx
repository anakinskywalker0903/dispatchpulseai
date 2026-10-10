'use client';

import React, { useState } from 'react';
import { ScheduleVersion } from '@/lib/types';
import {
  History,
  X,
  RotateCcw,
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ScheduleVersion[];
  currentVersionNumber: number;
  onRestoreVersion: (version: ScheduleVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  currentVersionNumber,
  onRestoreVersion,
}) => {
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(currentVersionNumber);

  if (!isOpen) return null;

  const selectedVersion = versions.find((v) => v.versionNumber === selectedVersionNum) || versions[0];

  const getSourceBadge = (source: ScheduleVersion['source']) => {
    switch (source) {
      case 'AI_INITIAL_PROPOSAL':
        return { label: 'AI Initial Plan', color: 'bg-[#c8e6ff] text-[#2E2E2E]' };
      case 'DISPATCHER_APPROVAL':
        return { label: 'Approved by Dispatcher', color: 'bg-[#86efac] text-[#14532d]' };
      case 'MANUAL_OVERRIDE':
        return { label: 'Manual Override', color: 'bg-[#fef08a] text-[#2E2E2E]' };
      case 'REPLAN_CANCELLATION':
        return { label: 'Disruption Replan', color: 'bg-[#ffdad6] text-red-900' };
      case 'REPLAN_EMERGENCY':
        return { label: 'Emergency Replan', color: 'bg-red-600 text-white' };
      default:
        return { label: 'System', color: 'bg-[#F1F1F1] text-stone-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-4xl h-[620px] neo-card bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b-[2.5px] border-[#2E2E2E] bg-[#FF6F20] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 neo-box-sm bg-white text-[#2E2E2E] flex items-center justify-center">
              <History className="h-5 w-5 text-[#FF6F20]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">
                Schedule Snapshot History
              </h3>
              <p className="text-[11px] font-bold text-white/90">
                Preserved immutable versions of dispatch schedules
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

        {/* Content: Left Sidebar Version List, Right Details */}
        <div className="flex-1 flex overflow-hidden">
          {/* Version List */}
          <div className="w-72 border-r-[2.5px] border-[#2E2E2E] bg-[#F1F1F1] overflow-y-auto divide-y-[2px] divide-[#2E2E2E]">
            {versions.map((ver) => {
              const badge = getSourceBadge(ver.source);
              const isCurrent = ver.versionNumber === currentVersionNumber;
              const isSelected = ver.versionNumber === selectedVersionNum;

              return (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersionNum(ver.versionNumber)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white border-l-[4px] border-[#FF6F20]'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#2E2E2E]">
                      v{ver.versionNumber}{' '}
                      {isCurrent && (
                        <span className="text-[10px] text-[#FF6F20] font-black">
                          (ACTIVE)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500">
                      {new Date(ver.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className={`neo-badge text-[9px] py-0 px-1.5 font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-stone-700 mt-1 line-clamp-1">
                    {ver.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Version Detail View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
            {selectedVersion && (
              <>
                <div className="flex items-center justify-between border-b-[2px] border-[#2E2E2E] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black uppercase text-[#2E2E2E]">
                        Version v{selectedVersion.versionNumber}
                      </h4>
                      <span className="neo-badge bg-[#fef08a] text-[#2E2E2E] text-[10px]">
                        Status: {selectedVersion.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-500 mt-0.5">
                      Created at {new Date(selectedVersion.createdAt).toLocaleString()} via{' '}
                      {selectedVersion.source}
                    </p>
                  </div>

                  {selectedVersion.versionNumber !== currentVersionNumber && (
                    <button
                      onClick={() => {
                        onRestoreVersion(selectedVersion);
                        onClose();
                      }}
                      className="neo-btn neo-btn-orange text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore Snapshot</span>
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="neo-card-sm p-3.5 bg-[#FAF8F5] text-xs font-bold text-[#2E2E2E]">
                  <span className="uppercase text-stone-500 block mb-1">Executive Summary</span>
                  {selectedVersion.summary}
                </div>

                {/* Diff from previous */}
                {selectedVersion.diffFromPrevious && (
                  <div className="neo-card-sm p-3.5 bg-[#fef08a] space-y-2 text-xs text-[#2E2E2E]">
                    <span className="font-black uppercase block">
                      Changes from v{selectedVersion.diffFromPrevious.previousVersionNumber}:
                    </span>
                    <p className="font-semibold">
                      {selectedVersion.diffFromPrevious.explanation}
                    </p>

                    {selectedVersion.diffFromPrevious.modified.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider block">
                          Modified Work Orders:
                        </span>
                        {selectedVersion.diffFromPrevious.modified.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white border-[1.5px] border-[#2E2E2E] text-[11px] font-bold"
                          >
                            <strong>{m.requestTitle}:</strong> {m.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Assignments in this version */}
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-[#2E2E2E] mb-2">
                    Scheduled Assignments ({selectedVersion.assignments.length})
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedVersion.assignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="neo-card-sm p-2 bg-white flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-black text-[#2E2E2E]">
                            {asg.requestId}
                          </span>
                          <span className="text-[11px] font-bold text-stone-500 ml-1">
                            ➔ {asg.technicianId}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#FF6F20]">
                          {asg.startTime}–{asg.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-[2.5px] border-[#2E2E2E] bg-[#F1F1F1] flex justify-end">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-white text-xs py-1.5 px-4 font-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
