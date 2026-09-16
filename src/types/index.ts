export type UserRole = 'architect' | 'drafter' | 'contractor' | 'client';

export interface RolePermission {
  role: UserRole;
  label: string;
  badgeColor: string;
  canEditSpecs: boolean;
  canViewArchitectMargins: boolean;
  canApproveVendorRates: boolean;
  canExportOfficialCAD_BOQ: boolean;
  description: string;
}

export type RoomType = 'living' | 'master_bedroom' | 'kitchen' | 'foyer' | 'dining';

export type MaterialCategory = 'wood' | 'stone' | 'metal' | 'paint' | 'lighting' | 'fabric';

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  room: RoomType;
  brand: string;
  specs: string;
  unit: string;
  rate: number; // INR ₹
  quantity: number;
  laborRatePerUnit: number;
  textureGradient: string;
  vendorCode: string;
  leadTimeDays: number;
  carbonScore: 'A+' | 'A' | 'B' | 'C';
  status: 'Draft' | 'Approved' | 'Procured';
}

export interface BOQSummary {
  materialSubtotal: number;
  laborSubtotal: number;
  baseCost: number;
  gstAmount: number; // 18% standard Indian GST on works contracts
  architectMarginAmount: number; // 15% agency margin (Hidden from Client/Contractor)
  finalClientTotal: number;
  totalSqFtCovered: number;
}

export interface VoiceActionLog {
  id: string;
  timestamp: string;
  spokenText: string;
  matchedAction: string;
  status: 'success' | 'clarification' | 'pending';
}

export interface AISpecPreset {
  id: string;
  title: string;
  theme: string;
  room: RoomType;
  description: string;
  materials: Omit<MaterialItem, 'id' | 'room'>[];
  estimatedBudget: number;
}
