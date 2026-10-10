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
        return 'bg-[#fde047] text-[#222222] border-[#222222]';
      case 'Medium':
        return 'bg-[#c8e6ff] text-[#222222] border-[#222222]';
      case 'Low':
      default:
        return 'bg-[#F4F2EE] text-stone-700 border-[#222222]';
    }
  };

  return (
    <div className="bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b-2 border-[#222222] bg-[#FAF8F5] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#FF6F20] border border-[#222222] text-white flex items-center justify-center">
              <Inbox className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#222222]">
              Unassigned Queue
            </h3>
            <span className="bg-[#222222] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {unassignedRequests.length}
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {['ALL', 'Emergency', 'High', 'Medium', 'Low'].map((p) => {
            const isActive = filterPriority === p;
            return (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#222222] text-white border-[#222222] shadow-[1.5px_1.5px_0_0_#222222]'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center p-4 bg-[#FAF8F5] border border-dashed border-stone-300 rounded-md">
            <div className="h-9 w-9 rounded-full bg-[#86efac] border border-[#222222] text-[#14532d] flex items-center justify-center mb-1.5">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase text-[#222222]">Queue Clear</p>
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
              className="bg-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] rounded-md p-3 space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getPriorityBadgeClass(
                        req.priority
                      )}`}
                    >
                      {req.priority === 'Emergency' && <Flame className="h-2.5 w-2.5 inline mr-0.5" />}
                      {req.priority}
                    </span>
                    <span className="text-[11px] font-mono font-black text-stone-600">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-[#222222] truncate">
                      • {req.customer}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#222222] mt-1 line-clamp-1">
                    {req.title}
                  </h4>
                </div>

                <button
                  onClick={() => onOpenManualAssign(req)}
                  className="bg-[#FF6F20] text-white border border-[#222222] shadow-[1.5px_1.5px_0_0_#222222] rounded text-[10px] font-black uppercase py-1 px-2.5 shrink-0 hover:bg-[#e85e10] cursor-pointer"
                >
                  Assign
                </button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#222222]">
                <span className="bg-[#c8e6ff] border border-[#222222] text-[9px] py-0 px-1.5 rounded">
                  <Wrench className="h-2.5 w-2.5 inline mr-1 text-[#FF6F20]" />
                  {req.requiredSkill}
                </span>
                <span className="bg-[#FAF8F5] border border-stone-300 text-[9px] py-0 px-1.5 rounded text-stone-600">
                  <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
                  {req.region}
                </span>
                <span className="bg-[#FAF8F5] border border-stone-300 text-[9px] py-0 px-1.5 rounded text-stone-600">
                  <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                  {formatDuration(req.estimatedDuration)}
                </span>
                {req.preferredTimeWindow && (
                  <span className="bg-[#fef08a] border border-[#222222] text-[9px] py-0 px-1.5 rounded">
                    Pref: {req.preferredTimeWindow.start}–{req.preferredTimeWindow.end}
                  </span>
                )}
              </div>

              {/* Missing Information Banner */}
              {req.missingInfoFlags && req.missingInfoFlags.length > 0 && (
                <div className="bg-[#fef08a] border border-[#222222] rounded p-1.5 text-[10px] font-bold text-[#222222] flex items-start gap-1">
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
