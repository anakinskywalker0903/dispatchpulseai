'use client';

import React, { useState } from 'react';
import { ServiceRequest, Priority } from '@/lib/types';
import { formatDuration } from '@/lib/timeUtils';
import {
  Inbox,
  AlertTriangle,
  Clock,
  MapPin,
  Wrench,
  Flame,
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

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-[#ffdad6] text-red-900 border-red-700 animate-pulse';
      case 'High':
        return 'bg-[#fde047] text-[#2E2E2E] border-[#2E2E2E]';
      case 'Medium':
        return 'bg-[#c8e6ff] text-[#2E2E2E] border-[#2E2E2E]';
      case 'Low':
      default:
        return 'bg-[#F1F1F1] text-stone-700 border-[#2E2E2E]';
    }
  };

  return (
    <div className="neo-card bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b-[2.5px] border-[#2E2E2E] bg-[#F1F1F1] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 neo-box-sm bg-[#FF6F20] text-white flex items-center justify-center">
              <Inbox className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2E2E2E]">
              Unassigned Queue
            </h3>
            <span className="neo-badge bg-[#2E2E2E] text-white text-[10px] py-0 px-1.5">
              {unassignedRequests.length}
            </span>
          </div>
        </div>

        {/* Filter Chips Row (Stylist AI style) */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {['ALL', 'Emergency', 'High', 'Medium', 'Low'].map((p) => {
            const isActive = filterPriority === p;
            return (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`neo-badge text-[10px] py-0.5 px-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#2E2E2E] text-white border-[#2E2E2E] shadow-[1.5px_1.5px_0_0_#2E2E2E]'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="h-10 w-10 neo-box-sm bg-[#86efac] text-[#14532d] flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase text-[#2E2E2E]">Queue Clear</p>
            <p className="text-[11px] font-medium text-stone-500 mt-0.5">
              {unassignedRequests.length === 0
                ? 'All requests have been scheduled for the day.'
                : 'No unassigned tickets match this priority filter.'}
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="neo-card-sm p-3 bg-white space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`neo-badge text-[9px] py-0 px-1.5 font-black ${getPriorityBadgeClass(
                        req.priority
                      )}`}
                    >
                      {req.priority === 'Emergency' && <Flame className="h-2.5 w-2.5 inline mr-0.5" />}
                      {req.priority}
                    </span>
                    <span className="text-[11px] font-mono font-black text-stone-600">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-[#2E2E2E] truncate">
                      • {req.customer}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#2E2E2E] mt-1 line-clamp-1">
                    {req.title}
                  </h4>
                </div>

                <button
                  onClick={() => onOpenManualAssign(req)}
                  className="neo-btn neo-btn-orange text-[10px] py-1 px-2.5 shrink-0"
                >
                  Assign
                </button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#2E2E2E]">
                <span className="neo-badge bg-[#c8e6ff] text-[9px] py-0 px-1.5">
                  <Wrench className="h-2.5 w-2.5 inline mr-1 text-[#FF6F20]" />
                  {req.requiredSkill}
                </span>
                <span className="neo-badge bg-[#F1F1F1] text-[9px] py-0 px-1.5 text-stone-600">
                  <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
                  {req.region}
                </span>
                <span className="neo-badge bg-[#F1F1F1] text-[9px] py-0 px-1.5 text-stone-600">
                  <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                  {formatDuration(req.estimatedDuration)}
                </span>
                {req.preferredTimeWindow && (
                  <span className="neo-badge bg-[#fef08a] text-[9px] py-0 px-1.5">
                    Pref: {req.preferredTimeWindow.start}–{req.preferredTimeWindow.end}
                  </span>
                )}
              </div>

              {/* Missing Information Banner */}
              {req.missingInfoFlags && req.missingInfoFlags.length > 0 && (
                <div className="neo-card-sm bg-[#fef08a] p-1.5 text-[10px] font-bold text-[#2E2E2E] flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 text-[#FF6F20] shrink-0 mt-0.5" />
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
