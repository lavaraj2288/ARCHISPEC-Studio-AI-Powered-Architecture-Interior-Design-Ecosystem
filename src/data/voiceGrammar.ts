import { RoomType, UserRole } from '../types';

export interface ParsedVoiceAction {
  type: 'SWITCH_ROOM' | 'SWITCH_ROLE' | 'TRIGGER_AI' | 'EXPORT_BOQ' | 'ADD_SAMPLE_MATERIAL' | 'FILTER_CATEGORY' | 'UNKNOWN';
  payload?: {
    room?: RoomType;
    role?: UserRole;
    presetTheme?: string;
    category?: string;
    materialName?: string;
  };
  humanDescription: string;
}

export function parseVoiceCommand(transcript: string): ParsedVoiceAction {
  const text = transcript.toLowerCase().trim();

  // 1. Role Switching
  if (text.includes('role') || text.includes('switch to') || text.includes('as a') || text.includes('view as')) {
    if (text.includes('client') || text.includes('homeowner')) {
      return {
        type: 'SWITCH_ROLE',
        payload: { role: 'client' },
        humanDescription: 'Switched access role to Client / Homeowner presentation view'
      };
    }
    if (text.includes('contractor') || text.includes('vendor')) {
      return {
        type: 'SWITCH_ROLE',
        payload: { role: 'contractor' },
        humanDescription: 'Switched access role to Allied Contractor / Vendor'
      };
    }
    if (text.includes('drafter') || text.includes('junior')) {
      return {
        type: 'SWITCH_ROLE',
        payload: { role: 'drafter' },
        humanDescription: 'Switched access role to Junior Drafter / CAD Specialist'
      };
    }
    if (text.includes('architect') || text.includes('admin') || text.includes('principal')) {
      return {
        type: 'SWITCH_ROLE',
        payload: { role: 'architect' },
        humanDescription: 'Switched access role to Principal Architect (Full Access)'
      };
    }
  }

  // 2. Room Navigation
  if (text.includes('living') || text.includes('hall') || text.includes('drawing room')) {
    return {
      type: 'SWITCH_ROOM',
      payload: { room: 'living' },
      humanDescription: 'Navigated to Living Room workspace'
    };
  }
  if (text.includes('kitchen') || text.includes('pantry') || text.includes('utility')) {
    return {
      type: 'SWITCH_ROOM',
      payload: { room: 'kitchen' },
      humanDescription: 'Navigated to Kitchen & Modular Utility workspace'
    };
  }
  if (text.includes('bedroom') || text.includes('master bed')) {
    return {
      type: 'SWITCH_ROOM',
      payload: { room: 'master_bedroom' },
      humanDescription: 'Navigated to Master Bedroom workspace'
    };
  }
  if (text.includes('foyer') || text.includes('entrance') || text.includes('lobby')) {
    return {
      type: 'SWITCH_ROOM',
      payload: { room: 'foyer' },
      humanDescription: 'Navigated to Foyer & Entrance workspace'
    };
  }
  if (text.includes('dining')) {
    return {
      type: 'SWITCH_ROOM',
      payload: { room: 'dining' },
      humanDescription: 'Navigated to Dining Area workspace'
    };
  }

  // 3. Trigger AI Workflow
  if (text.includes('ai') || text.includes('generate') || text.includes('agent') || text.includes('scandinavian') || text.includes('japandi') || text.includes('luxury')) {
    const theme = text.includes('japandi') ? 'japandi' : 'luxury';
    return {
      type: 'TRIGGER_AI',
      payload: { presetTheme: theme },
      humanDescription: `Activated AI Design Agent workflow for ${theme.toUpperCase()} specification`
    };
  }

  // 4. Export BOQ
  if (text.includes('export') || text.includes('download') || text.includes('bill of quantities') || text.includes('boq') || text.includes('quote')) {
    return {
      type: 'EXPORT_BOQ',
      humanDescription: 'Triggered dynamic BOQ spreadsheet and quotation export'
    };
  }

  // 5. Add Material shortcuts
  if (text.includes('add marble') || text.includes('italian marble')) {
    return {
      type: 'ADD_SAMPLE_MATERIAL',
      payload: { materialName: 'Botticino Classic Italian Marble', category: 'stone' },
      humanDescription: 'Added Botticino Italian Marble specification to active room'
    };
  }
  if (text.includes('add veneer') || text.includes('fluted wood') || text.includes('oak')) {
    return {
      type: 'ADD_SAMPLE_MATERIAL',
      payload: { materialName: 'Smoked Oak Architectural Veneer', category: 'wood' },
      humanDescription: 'Added Smoked Oak Veneer specification to active room'
    };
  }

  return {
    type: 'UNKNOWN',
    humanDescription: `Recognized voice prompt: "${transcript}". Try saying: "Switch to Architect", "Go to Kitchen", "Generate Japandi spec", or "Export BOQ".`
  };
}
