import mongoose from 'mongoose';
import Material from './models/Material.js';

// Initial verified dataset for Indian architectural materials
export const INITIAL_MATERIALS_DATA = [
  {
    customId: 'mat-1',
    name: 'Statuario Extra Italian Marble',
    category: 'stone',
    room: 'living',
    brand: 'Classic Marble Co. (CMC)',
    specs: 'Bookmatched 18mm slab, high-gloss diamond polish with anti-stain nano seal',
    unit: 'sq.ft',
    rate: 850,
    quantity: 280,
    laborRatePerUnit: 120,
    textureGradient: 'from-stone-100 via-neutral-200 to-slate-300 text-stone-900',
    vendorCode: 'VND-MUM-402',
    leadTimeDays: 7,
    carbonScore: 'B',
    status: 'Approved'
  },
  {
    customId: 'mat-2',
    name: 'Smoked Burma Teak Veneer (Fluted)',
    category: 'wood',
    room: 'living',
    brand: 'CenturyPly Architect Reserve',
    specs: '4mm natural wood veneer pressed on 18mm BWP marine plywood, PU matte finish',
    unit: 'sq.ft',
    rate: 420,
    quantity: 160,
    laborRatePerUnit: 150,
    textureGradient: 'from-amber-900 via-amber-800 to-yellow-950 text-amber-100',
    vendorCode: 'VND-BLR-109',
    leadTimeDays: 5,
    carbonScore: 'A',
    status: 'Approved'
  },
  {
    customId: 'mat-3',
    name: 'Architectural Magnetic Track 48V',
    category: 'lighting',
    room: 'living',
    brand: 'Plus Light Tech (CRI 95+)',
    specs: 'Extruded aluminum recessed profile with DALI dimmable 3000K warm flood & spot modules',
    unit: 'running ft',
    rate: 1450,
    quantity: 36,
    laborRatePerUnit: 250,
    textureGradient: 'from-neutral-800 via-neutral-900 to-black text-amber-300',
    vendorCode: 'VND-DEL-781',
    leadTimeDays: 4,
    carbonScore: 'A+',
    status: 'Approved'
  },
  {
    customId: 'mat-4',
    name: 'Royale Aspira Velvet Finish Paint',
    category: 'paint',
    room: 'living',
    brand: 'Asian Paints (Signature Off-White)',
    specs: 'Low VOC water-based acrylic luxury emulsion with anti-fungal Teflon surface protection',
    unit: 'sq.ft',
    rate: 65,
    quantity: 520,
    laborRatePerUnit: 35,
    textureGradient: 'from-amber-50 via-stone-100 to-orange-50 text-stone-800',
    vendorCode: 'VND-CHN-311',
    leadTimeDays: 2,
    carbonScore: 'A+',
    status: 'Procured'
  },
  {
    customId: 'mat-5',
    name: 'Brushed Champagne PVD Fluted Glass Partition',
    category: 'metal',
    room: 'foyer',
    brand: 'DormaKaba / Saint-Gobain',
    specs: '10mm Toughened Moru fluted glass with electroplated aerospace-grade aluminum slim frame',
    unit: 'sq.ft',
    rate: 1150,
    quantity: 65,
    laborRatePerUnit: 220,
    textureGradient: 'from-yellow-100 via-amber-200 to-amber-400 text-stone-900',
    vendorCode: 'VND-MUM-512',
    leadTimeDays: 10,
    carbonScore: 'A',
    status: 'Draft'
  },
  {
    customId: 'mat-6',
    name: 'Belgian Bouclé Acoustic Fabric',
    category: 'fabric',
    room: 'master_bedroom',
    brand: 'D’Decor Architect Haute Edition',
    specs: 'Heavy textured boucle wool blend with acoustic backing for bespoke headboard fluting',
    unit: 'running ft',
    rate: 1850,
    quantity: 24,
    laborRatePerUnit: 380,
    textureGradient: 'from-stone-200 via-stone-300 to-amber-100 text-stone-900',
    vendorCode: 'VND-SUR-890',
    leadTimeDays: 6,
    carbonScore: 'B',
    status: 'Approved'
  },
  {
    customId: 'mat-7',
    name: 'Seamless Silestone Quartz Countertop',
    category: 'stone',
    room: 'kitchen',
    brand: 'Cosentino Spain (Charcoal Soapstone)',
    specs: '20mm engineered quartz slab, non-porous, NSF-certified food safe, waterfall edge detail',
    unit: 'sq.ft',
    rate: 1250,
    quantity: 75,
    laborRatePerUnit: 280,
    textureGradient: 'from-zinc-800 via-neutral-900 to-stone-950 text-zinc-100',
    vendorCode: 'VND-PUN-229',
    leadTimeDays: 8,
    carbonScore: 'A',
    status: 'Approved'
  },
  {
    customId: 'mat-8',
    name: 'Hafele Matrix Box Concealed Soft-Close Hardware',
    category: 'metal',
    room: 'kitchen',
    brand: 'Häfele Germany',
    specs: 'Full-extension synchronized soft-close tandem runners with 40kg dynamic load capacity',
    unit: 'nos',
    rate: 3400,
    quantity: 14,
    laborRatePerUnit: 450,
    textureGradient: 'from-slate-400 via-zinc-500 to-slate-700 text-white',
    vendorCode: 'VND-BLR-004',
    leadTimeDays: 3,
    carbonScore: 'A+',
    status: 'Approved'
  }
];

class DatabaseStore {
  constructor() {
    this.isUsingExternalMongoDB = false;
    this.inMemoryCollection = [...INITIAL_MATERIALS_DATA];
  }

  setExternalMongoDB(val) {
    this.isUsingExternalMongoDB = val;
  }

  // Find with compound query index emulation
  async find(query = {}) {
    if (this.isUsingExternalMongoDB && mongoose.connection.readyState === 1) {
      return await Material.find(query).sort({ createdAt: -1 }).lean();
    }

    let results = [...this.inMemoryCollection];
    if (query.room && query.room !== 'all') {
      results = results.filter(i => i.room === query.room);
    }
    if (query.category && query.category !== 'all') {
      results = results.filter(i => i.category === query.category);
    }
    if (query.status && query.status !== 'all') {
      results = results.filter(i => i.status === query.status);
    }
    if (query.$text?.$search) {
      const s = query.$text.$search.toLowerCase();
      results = results.filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.brand.toLowerCase().includes(s) ||
        i.specs.toLowerCase().includes(s)
      );
    }
    return results;
  }

  // Create
  async create(data) {
    if (this.isUsingExternalMongoDB && mongoose.connection.readyState === 1) {
      return await Material.create(data);
    }
    const newItem = {
      ...data,
      customId: data.customId || `mat-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inMemoryCollection.unshift(newItem);
    return newItem;
  }

  // Update
  async findOneAndUpdate(filter, update) {
    if (this.isUsingExternalMongoDB && mongoose.connection.readyState === 1) {
      return await Material.findOneAndUpdate(filter, update, { new: true });
    }
    const id = filter.$or?.[0]?._id || filter.$or?.[1]?.customId || filter.customId || filter._id;
    const idx = this.inMemoryCollection.findIndex(i => i.customId === id || i._id === id);
    if (idx === -1) return null;

    this.inMemoryCollection[idx] = {
      ...this.inMemoryCollection[idx],
      ...update.$set,
      updatedAt: new Date()
    };
    return this.inMemoryCollection[idx];
  }

  // Delete
  async findOneAndDelete(filter) {
    if (this.isUsingExternalMongoDB && mongoose.connection.readyState === 1) {
      return await Material.findOneAndDelete(filter);
    }
    const id = filter.$or?.[0]?._id || filter.$or?.[1]?.customId || filter.customId || filter._id;
    const idx = this.inMemoryCollection.findIndex(i => i.customId === id || i._id === id);
    if (idx === -1) return null;
    const removed = this.inMemoryCollection.splice(idx, 1)[0];
    return removed;
  }

  // Execute MongoDB Aggregation Pipeline ($facet, $group)
  async aggregate(pipeline) {
    if (this.isUsingExternalMongoDB && mongoose.connection.readyState === 1) {
      return await Material.aggregate(pipeline);
    }

    // High-performance local aggregation pipeline emulation matching MongoDB $facet output
    let matSub = 0;
    let labSub = 0;
    let totalSqFt = 0;
    const catMap = {};
    const roomMap = {};

    for (const item of this.inMemoryCollection) {
      const mCost = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
      const lCost = (Number(item.laborRatePerUnit) || 0) * (Number(item.quantity) || 0);
      const lineCost = mCost + lCost;

      matSub += mCost;
      labSub += lCost;

      if (item.unit === 'sq.ft') {
        totalSqFt += Number(item.quantity) || 0;
      }

      catMap[item.category] = (catMap[item.category] || 0) + lineCost;
      roomMap[item.room] = (roomMap[item.room] || 0) + lineCost;
    }

    const baseCost = matSub + labSub;
    const gstAmount = Math.round(baseCost * 0.18);
    const architectMarginAmount = Math.round(baseCost * 0.15);
    const finalClientTotal = Math.round(baseCost * 1.33);

    const categoryBreakdown = Object.entries(catMap).map(([cat, total]) => ({
      _id: cat,
      totalSpend: total,
      itemCount: this.inMemoryCollection.filter(i => i.category === cat).length
    })).sort((a, b) => b.totalSpend - a.totalSpend);

    const roomBreakdown = Object.entries(roomMap).map(([rm, total]) => ({
      _id: rm,
      totalSpend: total,
      itemCount: this.inMemoryCollection.filter(i => i.room === rm).length
    })).sort((a, b) => b.totalSpend - a.totalSpend);

    return [{
      financialSummary: [{
        materialSubtotal: matSub,
        laborSubtotal: labSub,
        baseCost,
        gstAmount,
        architectMarginAmount,
        finalClientTotal,
        totalItems: this.inMemoryCollection.length,
        totalSqFtCovered: totalSqFt
      }],
      categoryBreakdown,
      roomBreakdown
    }];
  }

  async seed() {
    if (this.isUsingExternalMongoDB && mongoose.connection.readyState === 1) {
      await Material.deleteMany({});
      return await Material.insertMany(INITIAL_MATERIALS_DATA);
    }
    this.inMemoryCollection = [...INITIAL_MATERIALS_DATA];
    return this.inMemoryCollection;
  }
}

export const dbStore = new DatabaseStore();
export default dbStore;
