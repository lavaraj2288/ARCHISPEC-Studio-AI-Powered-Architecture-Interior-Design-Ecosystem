import React, { useState } from 'react';
import { RoomType, MaterialItem, UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../data/initialSpecs';
import { 
  Home, 
  BedDouble, 
  ChefHat, 
  DoorClosed, 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  Sliders, 
  Leaf, 
  Clock, 
  Tag, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../utils/boqCalculations';

interface RoomCanvasProps {
  activeRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  materials: MaterialItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onDeleteMaterial: (id: string) => void;
  onOpenAddModal: () => void;
  currentRole: UserRole;
  onOpenAIModal: () => void;
}

export const RoomCanvas: React.FC<RoomCanvasProps> = ({
  activeRoom,
  onSelectRoom,
  materials,
  onUpdateQuantity,
  onDeleteMaterial,
  onOpenAddModal,
  currentRole,
  onOpenAIModal
}) => {
  const roleInfo = ROLE_PERMISSIONS[currentRole];
  const roomMaterials = materials.filter(m => m.room === activeRoom);

  const rooms: { id: RoomType; label: string; icon: any }[] = [
    { id: 'living', label: 'Living Room', icon: Home },
    { id: 'master_bedroom', label: 'Master Bedroom', icon: BedDouble },
    { id: 'kitchen', label: 'Kitchen & Utility', icon: ChefHat },
    { id: 'foyer', label: 'Foyer & Entrance', icon: DoorClosed },
    { id: 'dining', label: 'Dining Area', icon: UtensilsCrossed }
  ];

  return (
    <div className="w-full space-y-5">
      {/* Room Tabs & Category Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2e2a25] pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {rooms.map(r => {
            const Icon = r.icon;
            const count = materials.filter(m => m.room === r.id).length;
            const isActive = activeRoom === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoom(r.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-amber-500/40 text-amber-200' : 'bg-neutral-800 text-neutral-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons for Drafting */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {roleInfo.canEditSpecs ? (
            <>
              <button
                onClick={onOpenAIModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Material Suggest</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-all shadow-md shadow-amber-950/20"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Material Spec</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 px-3 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Editing restricted for {roleInfo.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Moodboard & Spec Grid */}
      {roomMaterials.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800/60 flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-neutral-800/60 text-neutral-500">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-300">No specifications added to this room yet</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Use the AI Spec Agent to automatically populate this room with designer-grade materials, or click "Add Material Spec" to customize manually.
            </p>
          </div>
          <button
            onClick={onOpenAIModal}
            className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Room Spec via AI Agent</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomMaterials.map(mat => {
            const lineTotal = (mat.rate + mat.laborRatePerUnit) * mat.quantity;
            return (
              <div
                key={mat.id}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Material Swatch Preview Header */}
                <div>
                  <div className={`h-16 rounded-xl bg-gradient-to-r ${mat.textureGradient} p-3 flex flex-col justify-between relative shadow-inner mb-3.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                        {mat.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-emerald-300 font-semibold backdrop-blur-sm">
                        <Leaf className="w-3 h-3 text-emerald-400" /> Carbon {mat.carbonScore}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-white/90 drop-shadow-md">
                        {mat.vendorCode}
                      </span>
                      <span className="text-[10px] text-white/80 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mat.leadTimeDays}d lead
                      </span>
                    </div>
                  </div>

                  {/* Title & Technical Specs */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {mat.name}
                      </h4>
                      {roleInfo.canEditSpecs && (
                        <button
                          onClick={() => onDeleteMaterial(mat.id)}
                          className="text-neutral-500 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove material from room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{mat.brand}</span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed pt-1">
                      {mat.specs}
                    </p>
                  </div>
                </div>

                {/* Pricing & Quantity Controls */}
                <div className="mt-4 pt-3.5 border-t border-[#2e2a25] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Material Rate:</span>
                    <span className="font-mono text-white font-medium">
                      {formatINR(mat.rate)} / {mat.unit}
                    </span>
                  </div>

                  {roleInfo.canViewArchitectMargins && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Labor Rate:</span>
                      <span className="font-mono text-neutral-300">
                        {formatINR(mat.laborRatePerUnit)} / {mat.unit}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-neutral-400">Quantity:</div>
                    {roleInfo.canEditSpecs ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateQuantity(mat.id, Math.max(1, mat.quantity - 5))}
                          className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={mat.quantity}
                          onChange={(e) => onUpdateQuantity(mat.id, Number(e.target.value) || 0)}
                          className="w-14 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-center font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => onUpdateQuantity(mat.id, mat.quantity + 5)}
                          className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                        <span className="text-[11px] text-neutral-400 font-mono ml-1">{mat.unit}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-white">
                        {mat.quantity} {mat.unit}
                      </span>
                    )}
                  </div>

                  {/* Total Line Amount */}
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Est. Total
                    </span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {formatINR(lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
