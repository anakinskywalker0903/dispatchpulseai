'use client';

import React, { useState } from 'react';
import { Technician, Skill, Region } from '@/lib/types';
import { formatDuration } from '@/lib/timeUtils';
import {
  Users,
  Plus,
  Wrench,
  MapPin,
  Clock,
  UserX,
  UserCheck,
  X,
  CheckCircle2,
} from 'lucide-react';

interface TechniciansRosterProps {
  technicians: Technician[];
  onToggleStatus: (techId: string) => void;
  onAddTechnician: (newTech: Technician) => void;
}

export const TechniciansRoster: React.FC<TechniciansRosterProps> = ({
  technicians,
  onToggleStatus,
  onAddTechnician,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Tech Form
  const [name, setName] = useState('');
  const [assignedRegion, setAssignedRegion] = useState<Region>('Downtown');
  const [skills, setSkills] = useState<Skill[]>(['HVAC']);
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('17:00');
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('13:00');
  const [maxMinutes, setMaxMinutes] = useState(420);

  const toggleSkill = (skill: Skill) => {
    if (skills.includes(skill)) {
      if (skills.length > 1) {
        setSkills(skills.filter((s) => s !== skill));
      }
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `TECH-${technicians.length + 1}`;
    const newTech: Technician = {
      id: newId,
      name: name.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      skills,
      assignedRegion,
      workingHours: { start: startHour, end: endHour },
      breakTime: { start: breakStart, end: breakEnd },
      maxWorkloadMinutes: Number(maxMinutes) || 420,
      status: 'Active',
    };

    onAddTechnician(newTech);
    setIsAddModalOpen(false);
    setName('');
  };

  const ALL_SKILLS: Skill[] = [
    'HVAC',
    'Electrical',
    'Plumbing',
    'Appliances',
    'Networking',
    'Security',
  ];

  return (
    <div className="bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="p-4 border-b-2 border-[#222222] bg-[#FAF8F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase text-[#222222]">
              Field Technicians Roster ({technicians.length})
            </h3>
            <span className="bg-[#222222] text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              Staff Management
            </span>
          </div>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">
            Configure certifications, regional territories, and shift availability.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#FF6F20] text-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] rounded-md px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Field Technician</span>
        </button>
      </div>

      {/* Technicians Grid Cards */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#FAF8F5]">
        {technicians.map((t) => {
          const isUnavailable = t.status === 'Unavailable';

          return (
            <div
              key={t.id}
              className={`bg-white border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-lg p-4 flex flex-col justify-between space-y-3 ${
                isUnavailable ? 'bg-red-50/40 border-red-700' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-[#222222] shadow-[2px_2px_0_0_#222222]"
                    />
                    <div>
                      <h4 className="text-sm font-black uppercase text-[#222222]">
                        {t.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="bg-[#F1F1F1] border border-[#222222] text-[9px] font-bold px-1.5 py-0.2 rounded">
                          {t.assignedRegion}
                        </span>
                        <span className="font-mono text-[10px] text-stone-500 font-bold">
                          {t.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleStatus(t.id)}
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded border-2 transition-all cursor-pointer ${
                      isUnavailable
                        ? 'bg-red-600 text-white border-red-800'
                        : 'bg-[#86efac] text-[#14532d] border-[#222222]'
                    }`}
                  >
                    {isUnavailable ? 'Unavailable' : 'Active'}
                  </button>
                </div>

                {isUnavailable && (
                  <p className="text-[11px] font-bold text-red-700 mt-2 bg-red-100 p-1.5 rounded border border-red-300">
                    Disruption: {t.disruptionReason || 'Vehicle / health report'}
                  </p>
                )}

                {/* Skills Chips */}
                <div className="mt-3">
                  <span className="text-[10px] font-black uppercase text-stone-500 block mb-1">
                    Certified Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {t.skills.map((s) => (
                      <span
                        key={s}
                        className="bg-[#c8e6ff] text-[#222222] border border-[#222222] text-[9px] font-bold px-1.5 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shift Details Footer */}
              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Working Hours:</span>
                  <span className="font-mono text-[#222222]">
                    {t.workingHours.start} – {t.workingHours.end}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>Lunch Break:</span>
                  <span className="font-mono text-[#222222]">
                    {t.breakTime.start} – {t.breakTime.end}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>Max Workload:</span>
                  <span className="font-mono text-[#FF6F20] font-black">
                    {formatDuration(t.maxWorkloadMinutes)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Technician Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-lg bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b-2 border-[#222222] pb-3">
              <h3 className="text-sm font-black uppercase text-[#222222]">
                Add New Field Technician
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-stone-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-black uppercase text-stone-600 mb-1">
                  Technician Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jason Rodriguez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-stone-600 mb-1">
                  Assigned Region Territory:
                </label>
                <select
                  value={assignedRegion}
                  onChange={(e) => setAssignedRegion(e.target.value as Region)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                >
                  <option value="Downtown">Downtown</option>
                  <option value="North">North</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                </select>
              </div>

              <div>
                <label className="block font-black uppercase text-stone-600 mb-1">
                  Certifications / Skills (Select all that apply):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SKILLS.map((skill) => {
                    const isSelected = skills.includes(skill);

                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs font-bold px-2.5 py-1 rounded border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#222222] text-white border-[#222222]'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Shift Start Hour:
                  </label>
                  <input
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Shift End Hour:
                  </label>
                  <input
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Lunch Break Start:
                  </label>
                  <input
                    type="time"
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-stone-600 mb-1">
                    Lunch Break End:
                  </label>
                  <input
                    type="time"
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black uppercase text-stone-600 mb-1">
                  Maximum Workload Cap (Minutes):
                </label>
                <input
                  type="number"
                  step="30"
                  min="180"
                  max="480"
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border-2 border-[#222222] rounded p-2 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t-2 border-[#222222] pt-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-white border-2 border-[#222222] px-3 py-1.5 text-xs font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF6F20] text-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] px-4 py-1.5 text-xs font-black uppercase rounded cursor-pointer"
              >
                Add Technician
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
