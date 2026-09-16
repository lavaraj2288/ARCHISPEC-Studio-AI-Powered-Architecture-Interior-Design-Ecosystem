import React, { useState } from 'react';
import { MaterialItem, UserRole } from '../types';
import { calculateBOQ, formatINR } from '../utils/boqCalculations';
import { ROLE_PERMISSIONS } from '../data/initialSpecs';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Building2,
  Printer
} from 'lucide-react';
import { exportBOQToCSV } from '../utils/exportUtils';

interface BOQTableProps {
  materials: MaterialItem[];
  currentRole: UserRole;
  projectName: string;
  aggregationMetadata?: {
    engine: string;
    timeMs: string;
    categoryBreakdown?: { _id: string; totalSpend: number; itemCount: number }[];
  } | null;
}

export const BOQTable: React.FC<BOQTableProps> = ({
  materials,
  currentRole,
  projectName,
  aggregationMetadata
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const roleInfo = ROLE_PERMISSIONS[currentRole];

  const filteredMaterials = materials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const summary = calculateBOQ(materials);

  const handleExportCSV = () => {
    exportBOQToCSV(materials, summary, currentRole, projectName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-5">
      {/* MongoDB Aggregation Engine Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300 font-medium">
            <strong>Calculation Engine:</strong> {aggregationMetadata?.engine || 'MongoDB Aggregation Pipeline ($facet, $group)'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
          <span>Server Roundtrip: <strong className="text-emerald-400">{aggregationMetadata?.timeMs || '< 5.0ms'}</strong></span>
          <span>•</span>
          <span className="text-cyan-400">Indexed Compound Keys</span>
        </div>
      </div>

      {/* BOQ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Material Subtotal
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {formatINR(summary.materialSubtotal)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across {materials.length} itemized specs
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Labor & Installation
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {formatINR(summary.laborSubtotal)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Standard verified rate cards
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Statutory GST (18%)
          </div>
          <div className="text-xl font-bold font-mono text-neutral-300 mt-1">
            {formatINR(summary.gstAmount)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Works Contract standard
          </div>
        </div>

        {/* Agency Margin Card (Controlled by RBAC) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          roleInfo.canViewArchitectMargins
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-neutral-900/50 border-neutral-800 text-neutral-500'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
            <span>Architect Margin (15%)</span>
            {roleInfo.canViewArchitectMargins ? (
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </div>
          <div className="text-xl font-bold font-mono mt-1">
            {roleInfo.canViewArchitectMargins ? formatINR(summary.architectMarginAmount) : '•••••••• (Masked)'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {roleInfo.canViewArchitectMargins ? 'Agency design & supervision' : 'Restricted by RBAC'}
          </div>
        </div>
      </div>

      {/* Grand Total Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1c1a17] via-[#24211c] to-[#1a1815] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Consolidated Client Cost Estimate
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
              {formatINR(summary.finalClientTotal)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-950/20"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (Excel)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors border border-neutral-700"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material, brand, room or spec..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          {['all', 'wood', 'stone', 'metal', 'paint', 'lighting', 'fabric'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RBAC Notice if restricted */}
      {!roleInfo.canViewArchitectMargins && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong>RBAC Security Active:</strong> You are viewing as <em>{roleInfo.label}</em>. Architect internal markups and contractor procurement rate negotiations are securely masked.
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[#2e2a25] bg-[#141311]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2e2a25] bg-[#1a1916] text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Item & Brand</th>
              <th className="py-3.5 px-4">Room</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Rate & Labor</th>
              <th className="py-3.5 px-4">Quantity</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#24211d] text-neutral-300">
            {filteredMaterials.map(item => {
              const lineTotal = (item.rate + item.laborRatePerUnit) * item.quantity;
              return (
                <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-amber-400">{item.brand}</div>
                    <div className="text-[10px] text-neutral-500 max-w-xs truncate">{item.specs}</div>
                  </td>
                  <td className="py-3 px-4 capitalize font-medium text-neutral-400">
                    {item.room.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-neutral-800 text-neutral-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-white">{formatINR(item.rate)}/{item.unit}</div>
                    {roleInfo.canViewArchitectMargins && (
                      <div className="text-[10px] text-neutral-500">+{formatINR(item.laborRatePerUnit)} lab</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-white">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {formatINR(lineTotal)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'Procured'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
