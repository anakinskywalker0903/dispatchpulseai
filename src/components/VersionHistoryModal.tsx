'use client';

import React, { useState } from 'react';
import { ScheduleVersion } from '@/lib/types';
import {
  History,
  GitCommit,
  CheckCircle2,
  X,
  RotateCcw,
  Sparkles,
  User,
  AlertTriangle,
  ArrowRight,
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
        return { label: 'AI Initial Plan', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800' };
      case 'DISPATCHER_APPROVAL':
        return { label: 'Approved by Dispatcher', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
      case 'MANUAL_OVERRIDE':
        return { label: 'Manual Override', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
      case 'REPLAN_CANCELLATION':
        return { label: 'Disruption Replan', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
      case 'REPLAN_EMERGENCY':
        return { label: 'Emergency Replan', color: 'text-red-400 bg-red-950/60 border-red-800' };
      default:
        return { label: 'System', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[650px] rounded-xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Schedule Version History & Audit Trace
              </h3>
              <p className="text-xs text-slate-400">
                Preserving immutable snapshots of all proposed, approved, and replanned dispatch schedules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content: Left Sidebar Version List, Right Details */}
        <div className="flex-1 flex overflow-hidden">
          {/* Version List */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/60 overflow-y-auto divide-y divide-slate-800/60">
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
                      ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      v{ver.versionNumber}{' '}
                      {isCurrent && (
                        <span className="text-[10px] text-indigo-400 font-semibold">
                          (Active)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(ver.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                    {ver.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Version Detail View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950">
            {selectedVersion && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white">
                        Version v{selectedVersion.versionNumber}
                      </h4>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                        Status: {selectedVersion.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore This Version</span>
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3.5 text-xs text-slate-200">
                  <span className="font-bold text-white block mb-1">Overview:</span>
                  {selectedVersion.summary}
                </div>

                {/* Diff from previous */}
                {selectedVersion.diffFromPrevious && (
                  <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3.5 space-y-2 text-xs">
                    <span className="font-bold text-indigo-400 block">
                      Changes from v{selectedVersion.diffFromPrevious.previousVersionNumber}:
                    </span>
                    <p className="text-slate-300">
                      {selectedVersion.diffFromPrevious.explanation}
                    </p>

                    {selectedVersion.diffFromPrevious.modified.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                          Modified Assignments:
                        </span>
                        {selectedVersion.diffFromPrevious.modified.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
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
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Assignments ({selectedVersion.assignments.length})
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedVersion.assignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white font-mono">
                            {asg.requestId}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-1">
                            ➔ {asg.technicianId}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-indigo-300">
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
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
