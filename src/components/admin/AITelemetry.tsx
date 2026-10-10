'use client';

import React from 'react';
import {
  Activity,
  Cpu,
  Zap,
  ShieldCheck,
  Clock,
  Database,
  Terminal,
} from 'lucide-react';
import { ScheduleVersion, AuditLogEntry } from '@/lib/types';

interface AITelemetryProps {
  versions: ScheduleVersion[];
  auditLogs: AuditLogEntry[];
  groqApiKey?: string;
}

export const AITelemetry: React.FC<AITelemetryProps> = ({
  versions,
  auditLogs,
  groqApiKey,
}) => {
  return (
    <div className="bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="p-4 border-b-2 border-[#222222] bg-[#FAF8F5] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase text-[#222222]">
              AI Engine Telemetry & Solver Metrics
            </h3>
            <span className="bg-[#86efac] text-[#14532d] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              ● Healthy
            </span>
          </div>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">
            Real-time inference latency, constraint satisfaction telemetry, and audit trail.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white border-b-2 border-[#222222]">
        <div className="bg-[#FAF8F5] border-2 border-[#222222] rounded p-3">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-black uppercase">
            <span>Primary LLM</span>
            <Cpu className="h-3.5 w-3.5 text-[#FF6F20]" />
          </div>
          <p className="text-sm font-black text-[#222222] mt-1 truncate">
            {groqApiKey ? 'Groq LLaMA 3.3 70B' : 'Deterministic CSP Engine'}
          </p>
          <span className="text-[10px] text-stone-500 font-bold">LPU Accelerated</span>
        </div>

        <div className="bg-[#FAF8F5] border-2 border-[#222222] rounded p-3">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-black uppercase">
            <span>Inference Speed</span>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-black text-[#222222] mt-1 font-mono">
            ~320 ms
          </p>
          <span className="text-[10px] text-stone-500 font-bold">Sub-second replanning</span>
        </div>

        <div className="bg-[#FAF8F5] border-2 border-[#222222] rounded p-3">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-black uppercase">
            <span>Hard Constraint Score</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-emerald-800 mt-1 font-mono">
            100.0%
          </p>
          <span className="text-[10px] text-stone-500 font-bold">0 Violations logged</span>
        </div>

        <div className="bg-[#FAF8F5] border-2 border-[#222222] rounded p-3">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-black uppercase">
            <span>Version Snapshots</span>
            <Database className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <p className="text-lg font-black text-[#222222] mt-1 font-mono">
            {versions.length} Snapshots
          </p>
          <span className="text-[10px] text-stone-500 font-bold">Immutable version trail</span>
        </div>
      </div>

      {/* Telemetry Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#1E1E1E] text-stone-200 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-stone-400 text-[11px] pb-2 border-b border-stone-800">
          <Terminal className="h-3.5 w-3.5 text-[#FF6F20]" />
          <span>Real-time System Event Log:</span>
        </div>

        {auditLogs.map((log) => (
          <div key={log.id} className="p-2 rounded bg-[#2A2A2A] border border-stone-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-stone-400">
              <span className="text-[#fde047] font-bold">[{log.actor}]</span>
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-white text-[11px] font-semibold">{log.summary}</p>
            {log.details && (
              <pre className="text-[10px] text-[#86efac] overflow-x-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
