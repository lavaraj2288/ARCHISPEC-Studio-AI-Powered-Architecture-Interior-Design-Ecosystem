import React, { useState } from 'react';
import { Sparkles, X, Check, Brain, Loader2, Compass, Layers, CheckCircle2, Sliders, ChevronRight } from 'lucide-react';
import { RoomType, MaterialItem } from '../types';
import { AI_PRESETS } from '../data/initialSpecs';

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: RoomType;
  onApplyMaterials: (newMaterials: MaterialItem[]) => void;
}

export const AIAgentModal: React.FC<AIAgentModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  onApplyMaterials
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('Japandi Zen');
  const [budgetTier, setBudgetTier] = useState<'Standard' | 'Premium' | 'Ultra-Luxury'>('Premium');
  const [customPrompt, setCustomPrompt] = useState<string>('Warm minimal aesthetic with fluted woodwork, bookmatched stone, and 3000K recessed lighting');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [generatedSpecs, setGeneratedSpecs] = useState<MaterialItem[] | null>(null);

  if (!isOpen) return null;

  const steps = [
    '1. Spatial & Mood Intent Decomposition',
    '2. Material Catalog & Vendor Rate Sourcing',
    '3. Dynamic BOQ & Labor Aggregation',
    '4. Architectural Spec Sheet Synthesis'
  ];

  const handleRunAgent = () => {
    setIsProcessing(true);
    setActiveStep(1);
    setGeneratedSpecs(null);

    // Step progression simulation for agent workflow transparency
    setTimeout(() => {
      setActiveStep(2);
    }, 600);

    setTimeout(() => {
      setActiveStep(3);
    }, 1200);

    setTimeout(() => {
      setActiveStep(4);
      // Pick matching preset or synthesize
      const preset = AI_PRESETS.find(p => p.theme.toLowerCase().includes('zen')) || AI_PRESETS[0];
      const synthesized: MaterialItem[] = preset.materials.map((m, idx) => ({
        ...m,
        id: `ai-gen-${Date.now()}-${idx}`,
        room: activeRoom,
        status: 'Draft'
      }));

      setGeneratedSpecs(synthesized);
      setIsProcessing(false);
    }, 1800);
  };

  const handleApply = () => {
    if (generatedSpecs) {
      onApplyMaterials(generatedSpecs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#171614] border border-[#2e2a25] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2a25] flex items-center justify-between bg-[#1f1e1b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                AI Architectural Spec Agent
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Autonomous Multi-Step Workflow
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Transforms client briefs into validated finish schedules, vendor rate matches, and itemized BOQs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Room & Style Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Target Room Environment
              </label>
              <div className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 text-sm font-medium capitalize">
                {activeRoom.replace('_', ' ')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Target Budget Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Standard', 'Premium', 'Ultra-Luxury'] as const).map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setBudgetTier(tier)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                      budgetTier === tier
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Design Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Architectural Design Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Japandi Zen', desc: 'Lime plaster & white ash' },
                { name: 'Indian Luxury', desc: 'Statuario & brass inlays' },
                { name: 'Scandinavian', desc: 'Oak veneer & bouclé' },
                { name: 'Industrial Loft', desc: 'Fluted glass & concrete' }
              ].map(style => (
                <button
                  key={style.name}
                  type="button"
                  onClick={() => setSelectedStyle(style.name)}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    selectedStyle === style.name
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{style.name}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Client Design Prompt & Spatial Constraints
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Master bedroom acoustic headboard, low VOC paint, and Häfele soft-close sliding hardware"
            />
          </div>

          {/* Agent Workflow Execution Pipeline Box */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Agent Workflow Execution Trace
              </span>
              {isProcessing && (
                <span className="text-xs text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reasoning & Optimizing...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {steps.map((step, idx) => {
                const isCurrent = activeStep === idx + 1;
                const isPassed = activeStep > idx + 1;
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-neutral-950 border-neutral-800/60 text-neutral-500'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-700 flex items-center justify-center text-[9px] shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Output Preview */}
          {generatedSpecs && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Generated {generatedSpecs.length} Material Specs for {activeRoom}
                </span>
                <span className="text-xs font-mono text-emerald-300">
                  Ready to Sync with BOQ
                </span>
              </div>
              <div className="space-y-2">
                {generatedSpecs.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800 text-xs">
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] text-neutral-400">{item.brand} • {item.specs}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-300 font-mono">₹{item.rate}/{item.unit}</div>
                      <div className="text-[10px] text-neutral-400">Qty: {item.quantity} {item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#2e2a25] bg-[#1a1916] flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">
            Model: Architectural Multimodal Agent v2.4
          </span>

          <div className="flex items-center gap-2">
            {!generatedSpecs ? (
              <button
                type="button"
                onClick={handleRunAgent}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors shadow-lg shadow-amber-950/30 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Specs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Agent Pipeline</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-950/30"
              >
                <Check className="w-4 h-4" />
                <span>Apply Specs to Room & BOQ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
