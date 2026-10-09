'use client';

import React, { useState } from 'react';
import { ServiceRequest, Priority, Skill } from '@/lib/types';
import { formatDuration } from '@/lib/timeUtils';
import {
  Inbox,
  AlertTriangle,
  Clock,
  MapPin,
  Wrench,
  Flame,
  ChevronRight,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface ServiceRequestQueueProps {
  requests: ServiceRequest[];
  unassignedIds: string[];
  onSelectRequest: (request: ServiceRequest) => void;
  onOpenManualAssign: (request: ServiceRequest) => void;
}

export const ServiceRequestQueue: React.FC<ServiceRequestQueueProps> = ({
  requests,
  unassignedIds,
  onSelectRequest,
  onOpenManualAssign,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const unassignedRequests = requests.filter((r) => unassignedIds.includes(r.id));

  const filtered = unassignedRequests.filter((r) => {
    if (filterPriority === 'ALL') return true;
    return r.priority === filterPriority;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'Low':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Unassigned Queue
          </h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-300 border border-slate-700">
            {unassignedRequests.length}
          </span>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 text-xs">
          <Filter className="h-3 w-3 text-slate-500" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All ({unassignedRequests.length})</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-slate-500">
            <CheckCircle className="h-8 w-8 text-emerald-500/60 mb-2" />
            <p className="text-sm font-medium text-slate-300">Queue is Clear</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {unassignedRequests.length === 0
                ? 'All requests have been successfully scheduled.'
                : 'No unassigned requests match the selected filter.'}
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {req.id}
                    </span>
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {req.customer}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 mt-1 line-clamp-1">
                    {req.title}
                  </h4>
                </div>

                <button
                  onClick={() => onOpenManualAssign(req)}
                  className="rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                >
                  Assign
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 bg-slate-800/70 px-1.5 py-0.5 rounded">
                  <Wrench className="h-3 w-3 text-indigo-400" />
                  <span>{req.requiredSkill}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-800/70 px-1.5 py-0.5 rounded">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>{req.region}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-800/70 px-1.5 py-0.5 rounded">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{formatDuration(req.estimatedDuration)}</span>
                </span>
                {req.preferredTimeWindow && (
                  <span className="text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/50">
                    Pref: {req.preferredTimeWindow.start}–{req.preferredTimeWindow.end}
                  </span>
                )}
              </div>

              {/* Missing Information Alerts */}
              {req.missingInfoFlags && req.missingInfoFlags.length > 0 && (
                <div className="mt-2 rounded bg-amber-950/40 border border-amber-900/50 p-1.5 text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{req.missingInfoFlags[0]}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
