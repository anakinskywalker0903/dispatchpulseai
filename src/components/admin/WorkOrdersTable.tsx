'use client';

import React, { useState } from 'react';
import {
  ServiceRequest,
  Skill,
  Region,
  Priority,
  ScheduleAssignment,
} from '@/lib/types';
import { formatDuration } from '@/lib/timeUtils';
import {
  Plus,
  Search,
  Wrench,
  MapPin,
  Clock,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
} from 'lucide-react';

interface WorkOrdersTableProps {
  requests: ServiceRequest[];
  assignments: ScheduleAssignment[];
  onCreateRequest: (newReq: ServiceRequest) => void;
  onDeleteRequest: (reqId: string) => void;
  onAssignRequest: (req: ServiceRequest) => void;
}

export const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({
  requests,
  assignments,
  onCreateRequest,
  onDeleteRequest,
  onAssignRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Ticket Form State
  const [customer, setCustomer] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState<Region>('Downtown');
  const [requiredSkill, setRequiredSkill] = useState<Skill>('HVAC');
  const [priority, setPriority] = useState<Priority>('High');
  const [duration, setDuration] = useState<number>(90);
  const [prefStart, setPrefStart] = useState('09:00');
  const [prefEnd, setPrefEnd] = useState('13:00');

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSkill = filterSkill === 'ALL' || r.requiredSkill === filterSkill;
    const matchPriority = filterPriority === 'ALL' || r.priority === filterPriority;
    return matchSearch && matchSkill && matchPriority;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !title.trim()) return;

    const newId = `SR-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: ServiceRequest = {
      id: newId,
      customer: customer.trim(),
      address: `${customer.trim()} Facility, ${region}`,
      title: title.trim(),
      description: description.trim() || 'Custom work order entered by dispatcher.',
      region,
      requiredSkill,
      priority,
      estimatedDuration: Number(duration) || 60,
      preferredTimeWindow: { start: prefStart, end: prefEnd },
      status: 'Unassigned',
    };

    onCreateRequest(newReq);
    setIsCreateModalOpen(false);

    // Reset Form
    setCustomer('');
    setTitle('');
    setDescription('');
    setDuration(90);
  };

  const asgMap = new Map<string, ScheduleAssignment>(
    assignments.map((a) => [a.requestId, a])
  );

  return (
    <div className="bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg overflow-hidden flex flex-col h-[650px]">
      {/* Top Header & Search Bar */}
      <div className="p-4 border-b-2 border-[#222222] bg-[#FAF8F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase text-[#222222]">
              Work Orders Directory ({requests.length})
            </h3>
            <span className="bg-[#222222] text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              CRUD Database
            </span>
          </div>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">
            Create, manage, and assign custom service requests in real time.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#FF6F20] text-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] rounded-md px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Service Request</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-3 border-b border-stone-200 bg-white flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, customer, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-3 pl-8 py-1.5 text-xs font-bold text-[#222222] focus:outline-none"
          />
        </div>

        <select
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
          className="bg-[#FAF8F5] border border-stone-300 rounded px-2.5 py-1.5 text-xs font-bold text-[#222222]"
        >
          <option value="ALL">All Skills</option>
          <option value="HVAC">HVAC</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Appliances">Appliances</option>
          <option value="Networking">Networking</option>
          <option value="Security">Security</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-[#FAF8F5] border border-stone-300 rounded px-2.5 py-1.5 text-xs font-bold text-[#222222]"
        >
          <option value="ALL">All Priorities</option>
          <option value="Emergency">Emergency</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FAF8F5] border-b-2 border-[#222222] text-[10px] font-black uppercase text-stone-600 sticky top-0">
            <tr>
              <th className="p-3">ID / Priority</th>
              <th className="p-3">Customer & Title</th>
              <th className="p-3">Skill & Region</th>
              <th className="p-3">Duration & Window</th>
              <th className="p-3">Assignment Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filtered.map((req) => {
              const asg = asgMap.get(req.id);

              return (
                <tr key={req.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-3 font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-[#222222]">{req.id}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${
                          req.priority === 'Emergency'
                            ? 'bg-[#ffdad6] text-red-900 border-red-700'
                            : req.priority === 'High'
                            ? 'bg-[#fde047] text-[#222222] border-[#222222]'
                            : 'bg-[#c8e6ff] text-[#222222] border-[#222222]'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <p className="font-black text-[#222222]">{req.customer}</p>
                    <p className="text-[11px] font-medium text-stone-500 truncate max-w-xs">
                      {req.title}
                    </p>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="bg-[#c8e6ff] border border-[#222222] text-[9px] px-1.5 py-0.2 rounded">
                        {req.requiredSkill}
                      </span>
                      <span className="text-stone-600 text-[10px]">
                        • {req.region}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <p className="font-bold text-[#222222]">{formatDuration(req.estimatedDuration)}</p>
                    <p className="text-[10px] text-stone-500 font-mono">
                      {req.preferredTimeWindow
                        ? `${req.preferredTimeWindow.start}-${req.preferredTimeWindow.end}`
                        : 'Anytime'}
                    </p>
                  </td>

                  <td className="p-3">
                    {asg ? (
                      <span className="bg-[#86efac] text-[#14532d] border border-[#222222] font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                        {asg.technicianId} ({asg.startTime})
                      </span>
                    ) : (
                      <span className="bg-[#fef08a] text-[#222222] border border-[#222222] text-[10px] font-bold px-2 py-0.5 rounded">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!asg && (
                        <button
                          onClick={() => onAssignRequest(req)}
                          className="bg-[#FF6F20] text-white border border-[#222222] rounded px-2 py-1 text-[10px] font-black uppercase hover:bg-[#e85e10] cursor-pointer"
                        >
                          Assign
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteRequest(req.id)}
                        className="p-1 text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete work order"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Create Custom Service Request */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b-2 border-[#222222] pb-3">
              <h3 className="text-sm font-black uppercase text-[#222222]">
                Create Custom Work Order
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-stone-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-black uppercase text-stone-600 mb-1">
                  Customer / Facility Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sterling Industrial Hub"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-stone-600 mb-1">
                  Work Order Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chiller Condenser Overheat Warning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Required Skill:
                  </label>
                  <select
                    value={requiredSkill}
                    onChange={(e) => setRequiredSkill(e.target.value as Skill)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Networking">Networking</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Region Territory:
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                  >
                    <option value="Downtown">Downtown</option>
                    <option value="North">North</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Priority Urgency:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                  >
                    <option value="Emergency">🚨 Emergency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Duration (Minutes):
                  </label>
                  <input
                    type="number"
                    step="15"
                    min="30"
                    max="240"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Preferred Window Start:
                  </label>
                  <input
                    type="time"
                    value={prefStart}
                    onChange={(e) => setPrefStart(e.target.value)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Preferred Window End:
                  </label>
                  <input
                    type="time"
                    value={prefEnd}
                    onChange={(e) => setPrefEnd(e.target.value)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t-2 border-[#222222] pt-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-white border-2 border-[#222222] px-3 py-1.5 text-xs font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF6F20] text-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] px-4 py-1.5 text-xs font-black uppercase rounded cursor-pointer"
              >
                Create Work Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
