import React from 'react';
import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../data/initialSpecs';
import { 
  Compass, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  CloudCheck, 
  Terminal, 
  Layers, 
  Sparkles,
  Download
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isListening: boolean;
  onToggleVoice: () => void;
  onOpenAIModal: () => void;
  onOpenTechProof: () => void;
  onExportBOQ: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  isDbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isListening,
  onToggleVoice,
  onOpenAIModal,
  onOpenTechProof,
  onExportBOQ,
  syncStatus,
  isDbConnected = false
}) => {
  const roleInfo = ROLE_PERMISSIONS[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2723] bg-[#121110]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Brand & Ecosystem Badges */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 text-stone-950">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wider uppercase text-amber-400 font-semibold">Tauri v2 Ready</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              ARCHISPEC <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-normal">MERN Studio</span>
            </h1>
          </div>
        </div>

        {/* Sync & Tech Stack Badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span>
              DB: <strong className={isDbConnected ? 'text-emerald-400' : 'text-amber-300'}>
                {isDbConnected ? 'MongoDB (Live Aggregation Active)' : 'Local Cache'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tauri v2 + Rust Core</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, RBAC Selector & Voice Mic */}
      <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
        {/* AI Spec Generator Button */}
        <button
          onClick={onOpenAIModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>AI Spec Agent</span>
        </button>

        {/* Voice Trigger System */}
        <button
          onClick={onToggleVoice}
          title={isListening ? "Listening to voice commands... (Click to stop)" : "Click to speak voice commands (e.g., 'Switch to Client', 'Go to Kitchen')"}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Voice: Live Listening</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-neutral-400" />
              <span>Voice Trigger</span>
            </>
          )}
        </button>

        {/* RBAC Access & Rights Role Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800 rounded-lg px-2.5 py-1">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Access Role</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="architect" className="bg-neutral-900 text-amber-300">Principal Architect (Admin)</option>
              <option value="drafter" className="bg-neutral-900 text-cyan-300">Junior Drafter / CAD</option>
              <option value="contractor" className="bg-neutral-900 text-emerald-300">Allied Contractor / Vendor</option>
              <option value="client" className="bg-neutral-900 text-purple-300">Client / Homeowner</option>
            </select>
          </div>
        </div>

        {/* BOQ Export */}
        <button
          onClick={onExportBOQ}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors"
          title="Export itemized Bill of Quantities"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export BOQ</span>
        </button>

        {/* Tech Proof / Architecture Inspector Modal Trigger */}
        <button
          onClick={onOpenTechProof}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-md shadow-amber-950/20"
          title="View Tech Proof for Recruiter (Tauri, AI, DB, Security)"
        >
          <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Tech Proof</span>
        </button>
      </div>
    </header>
  );
};
