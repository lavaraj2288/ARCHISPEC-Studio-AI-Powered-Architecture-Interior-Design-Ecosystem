import { MaterialItem, BOQSummary } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://archispec-api.onrender.com/api');

export interface HealthStatus {
  online: boolean;
  databaseStatus: string;
  databaseHost: string;
  databaseName: string;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Health check failed');
    const data = await res.json();
    return {
      online: true,
      databaseStatus: data.database?.status || 'connected',
      databaseHost: data.database?.host || 'MongoDB',
      databaseName: data.database?.databaseName || 'archispec'
    };
  } catch (e) {
    return {
      online: false,
      databaseStatus: 'disconnected',
      databaseHost: 'Local Cache',
      databaseName: 'browser-storage'
    };
  }
}

export async function fetchMaterialsFromDB(params?: { room?: string; category?: string; search?: string }): Promise<MaterialItem[] | null> {
  try {
    const query = new URLSearchParams();
    if (params?.room && params.room !== 'all') query.set('room', params.room);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE_URL}/materials?${query.toString()}`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Failed to fetch materials from MongoDB');
    const json = await res.json();
    
    // Map customId or _id to id
    return json.data.map((m: any) => ({
      ...m,
      id: m.customId || m._id
    }));
  } catch (e) {
    console.warn('Backend API offline or unreachable, using local state fallback');
    return null;
  }
}

export async function createMaterialInDB(item: MaterialItem): Promise<MaterialItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...item,
        customId: item.id
      })
    });
    if (!res.ok) throw new Error('Failed to insert material into MongoDB');
    const json = await res.json();
    return {
      ...json.data,
      id: json.data.customId || json.data._id
    };
  } catch (e) {
    console.warn('Backend offline, material saved locally');
    return null;
  }
}

export async function updateMaterialInDB(id: string, updates: Partial<MaterialItem>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function deleteMaterialFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchBOQAggregationFromDB(): Promise<{
  summary: BOQSummary;
  categoryBreakdown: any[];
  roomBreakdown: any[];
  executionTimeMs: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/boq/aggregate`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Failed to fetch BOQ aggregation');
    const json = await res.json();
    return {
      summary: json.data.summary,
      categoryBreakdown: json.data.categoryBreakdown,
      roomBreakdown: json.data.roomBreakdown,
      executionTimeMs: json.executionTimeMs
    };
  } catch (e) {
    return null;
  }
}

export async function seedDatabase(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/materials/seed`, { method: 'POST' });
    return res.ok;
  } catch (e) {
    return false;
  }
}
