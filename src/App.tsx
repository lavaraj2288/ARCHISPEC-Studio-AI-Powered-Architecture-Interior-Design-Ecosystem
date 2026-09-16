import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  RoomType, 
  MaterialItem, 
  BOQSummary 
} from './types';
import { INITIAL_MATERIALS, ROLE_PERMISSIONS } from './data/initialSpecs';
import { Header } from './components/Header';
import { VoiceController } from './components/VoiceController';
import { RoomCanvas } from './components/RoomCanvas';
import { BOQTable } from './components/BOQTable';
import { AIAgentModal } from './components/AIAgentModal';
import { AddMaterialModal } from './components/AddMaterialModal';
import { TechProofModal } from './components/TechProofModal';
import { ParsedVoiceAction } from './data/voiceGrammar';
import { exportBOQToCSV } from './utils/exportUtils';
import { calculateBOQ } from './utils/boqCalculations';
import { 
  Building, 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  CloudCheck, 
  MapPin, 
  Calendar,
  Zap,
  Info
} from 'lucide-react';

import { 
  checkBackendHealth, 
  fetchMaterialsFromDB, 
  createMaterialInDB, 
  updateMaterialInDB, 
  deleteMaterialFromDB, 
  fetchBOQAggregationFromDB 
} from './services/api';

export function App() {
  // LocalStorage persistence for realistic offline-first desktop feel
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('archispec_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [activeRoom, setActiveRoom] = useState<RoomType>('living');
  const [currentRole, setCurrentRole] = useState<UserRole>('architect');
  const [activeView, setActiveView] = useState<'workspace' | 'boq'>('workspace');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isTechProofOpen, setIsTechProofOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [aggregationMeta, setAggregationMeta] = useState<{
    engine: string;
    timeMs: string;
    categoryBreakdown?: any[];
  } | null>(null);

  // Check MongoDB connection and initial hydrate
  useEffect(() => {
    async function initDB() {
      const health = await checkBackendHealth();
      if (health.online) {
        setIsDbConnected(true);
        const dbMaterials = await fetchMaterialsFromDB();
        if (dbMaterials && dbMaterials.length > 0) {
          setMaterials(dbMaterials);
        }
        const agg = await fetchBOQAggregationFromDB();
        if (agg) {
          setAggregationMeta({
            engine: 'MongoDB Aggregation Pipeline ($facet, $group)',
            timeMs: agg.executionTimeMs,
            categoryBreakdown: agg.categoryBreakdown
          });
        }
      }
    }
    initDB();
  }, []);

  // Save to LocalStorage and update aggregation
  useEffect(() => {
    localStorage.setItem('archispec_materials', JSON.stringify(materials));
    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      setSyncStatus('synced');
      if (isDbConnected) {
        const agg = await fetchBOQAggregationFromDB();
        if (agg) {
          setAggregationMeta({
            engine: 'MongoDB Aggregation Pipeline ($facet, $group)',
            timeMs: agg.executionTimeMs,
            categoryBreakdown: agg.categoryBreakdown
          });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [materials, isDbConnected]);

  // Voice action dispatcher
  const handleExecuteVoiceCommand = (action: ParsedVoiceAction) => {
    switch (action.type) {
      case 'SWITCH_ROOM':
        if (action.payload?.room) {
          setActiveRoom(action.payload.room);
          setActiveView('workspace');
        }
        break;
      case 'SWITCH_ROLE':
        if (action.payload?.role) {
          setCurrentRole(action.payload.role);
        }
        break;
      case 'TRIGGER_AI':
        setIsAIModalOpen(true);
        break;
      case 'EXPORT_BOQ':
        const summary = calculateBOQ(materials);
        exportBOQToCSV(materials, summary, currentRole, 'Worli_Penthouse');
        break;
      case 'ADD_SAMPLE_MATERIAL':
        const newSample: MaterialItem = {
          id: `mat-${Date.now()}`,
          name: action.payload?.materialName || 'Botticino Italian Marble',
          category: (action.payload?.category as any) || 'stone',
          room: activeRoom,
          brand: 'Classic Marble Co.',
          specs: 'Standard polished specification',
          unit: 'sq.ft',
          rate: 580,
          quantity: 120,
          laborRatePerUnit: 110,
          textureGradient: 'from-stone-100 via-neutral-200 to-slate-300 text-stone-900',
          vendorCode: 'VND-MUM-991',
          leadTimeDays: 5,
          carbonScore: 'A',
          status: 'Approved'
        };
        setMaterials(prev => [newSample, ...prev]);
        break;
      default:
        break;
    }
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, quantity: newQty } : m));
    if (isDbConnected) {
      updateMaterialInDB(id, { quantity: newQty });
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    if (isDbConnected) {
      deleteMaterialFromDB(id);
    }
  };

  const handleAddMaterial = (newItem: MaterialItem) => {
    setMaterials(prev => [newItem, ...prev]);
    if (isDbConnected) {
      createMaterialInDB(newItem);
    }
  };

  const handleApplyAIMaterials = (newSpecs: MaterialItem[]) => {
    setMaterials(prev => [...newSpecs, ...prev]);
    if (isDbConnected) {
      newSpecs.forEach(spec => createMaterialInDB(spec));
    }
  };

  const handleExport = () => {
    const summary = calculateBOQ(materials);
    exportBOQToCSV(materials, summary, currentRole, 'Worli_Penthouse');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0d0c] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isListening={isListening}
        onToggleVoice={() => setIsListening(prev => !prev)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenTechProof={() => setIsTechProofOpen(true)}
        onExportBOQ={handleExport}
        syncStatus={syncStatus}
        isDbConnected={isDbConnected}
      />

      {/* Voice Trigger Engine Strip */}
      <VoiceController
        isListening={isListening}
        setIsListening={setIsListening}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Project Context & Meta Strip */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-amber-400 shrink-0">
              <Building className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Penthouse at Worli Sea Face (4,200 sq.ft)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Active Project
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-500" /> Worli, Mumbai
                </span>
                <span>•</span>
                <span>Client: Private Residence</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" /> Deadline: Sept 2026
                </span>
              </div>
            </div>
          </div>

          {/* View Switcher Tabs: Workspace (Moodboard) vs BOQ (Spreadsheet) */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 self-stretch lg:self-auto justify-center">
            <button
              onClick={() => setActiveView('workspace')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'workspace'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Room Canvas & Specs</span>
            </button>
            <button
              onClick={() => setActiveView('boq')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'boq'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Financial BOQ Table</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                {materials.length}
              </span>
            </button>
          </div>
        </div>

        {/* View Routing */}
        {activeView === 'workspace' ? (
          <RoomCanvas
            activeRoom={activeRoom}
            onSelectRoom={setActiveRoom}
            materials={materials}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteMaterial={handleDeleteMaterial}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            currentRole={currentRole}
            onOpenAIModal={() => setIsAIModalOpen(true)}
          />
        ) : (
          <BOQTable
            materials={materials}
            currentRole={currentRole}
            projectName="Worli_SeaFace_Penthouse"
            aggregationMetadata={aggregationMeta}
          />
        )}
      </main>

      {/* Footer & Ecosystem Note */}
      <footer className="mt-auto border-t border-[#22201d] bg-[#11100f] px-4 sm:px-8 py-5 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Engineered for <strong>India's Largest Arch/Design Tech Ecosystem</strong> • Built with Tauri v2 + React/TS + Rust
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTechProofOpen(true)}
              className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Zap className="w-3 h-3" />
              <span>View Technical Dossier & Architecture</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AIAgentModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        activeRoom={activeRoom}
        onApplyMaterials={handleApplyAIMaterials}
      />

      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeRoom={activeRoom}
        onAddMaterial={handleAddMaterial}
      />

      <TechProofModal
        isOpen={isTechProofOpen}
        onClose={() => setIsTechProofOpen(false)}
      />
    </div>
  );
}

export default App;
