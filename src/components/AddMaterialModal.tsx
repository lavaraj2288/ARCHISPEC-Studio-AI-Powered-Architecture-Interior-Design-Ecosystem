import React, { useState } from 'react';
import { X, Plus, Sparkles, Tag, Layers, IndianRupee } from 'lucide-react';
import { MaterialItem, MaterialCategory, RoomType } from '../types';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: RoomType;
  onAddMaterial: (item: MaterialItem) => void;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  onAddMaterial
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('wood');
  const [specs, setSpecs] = useState('');
  const [unit, setUnit] = useState('sq.ft');
  const [rate, setRate] = useState<number>(350);
  const [laborRate, setLaborRate] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const gradients: Record<MaterialCategory, string> = {
      wood: 'from-amber-900 via-amber-800 to-yellow-950 text-amber-100',
      stone: 'from-stone-100 via-neutral-200 to-slate-300 text-stone-900',
      metal: 'from-yellow-200 via-amber-400 to-yellow-600 text-stone-950',
      paint: 'from-amber-50 via-stone-100 to-orange-50 text-stone-800',
      lighting: 'from-neutral-800 via-neutral-900 to-black text-amber-300',
      fabric: 'from-stone-200 via-stone-300 to-amber-100 text-stone-900'
    };

    const newItem: MaterialItem = {
      id: `mat-${Date.now()}`,
      name,
      brand: brand || 'Generic Architect Grade',
      category,
      room: activeRoom,
      specs: specs || 'Standard architectural finish specification',
      unit,
      rate: Number(rate) || 0,
      quantity: Number(quantity) || 1,
      laborRatePerUnit: Number(laborRate) || 0,
      textureGradient: gradients[category],
      vendorCode: `VND-DIR-${Math.floor(100 + Math.random() * 900)}`,
      leadTimeDays: 5,
      carbonScore: 'A',
      status: 'Draft'
    };

    onAddMaterial(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#181714] border border-[#2e2a25] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        <div className="px-6 py-4 border-b border-[#2e2a25] flex items-center justify-between bg-[#1f1e1b]">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Add Material Specification</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">Material / Finish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fluted Teak Wall Louvers, Calacatta Gold Marble"
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Brand / Supplier</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. CenturyPly, Häfele, CMC"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 capitalize"
              >
                <option value="wood">Wood & Veneer</option>
                <option value="stone">Stone & Tile</option>
                <option value="metal">Metal & Glass</option>
                <option value="paint">Paint & Polish</option>
                <option value="lighting">Lighting</option>
                <option value="fabric">Fabric & Upholstery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1">Technical Specification / Notes</label>
            <textarea
              rows={2}
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="e.g. 18mm BWP calibrated marine plywood with PU matte clear sealer"
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Rate (₹/Unit)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Labor (₹/Unit)</label>
              <input
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-cyan-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Quantity ({unit})</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
            >
              Save Specification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
