import express from 'express';
import dbStore from '../db.js';

const router = express.Router();

/**
 * @route   GET /api/materials
 * @desc    Fetch materials with compound query index support
 */
router.get('/', async (req, res) => {
  try {
    const { room, category, status, search } = req.query;
    const query = {};

    // Leverages compound index: { room: 1, category: 1 }
    if (room && room !== 'all') query.room = room;
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;

    // Text search query
    if (search) {
      query.$text = { $search: search };
    }

    const materials = await dbStore.find(query);
    res.json({ success: true, count: materials.length, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/materials
 * @desc    Create new material specification
 */
router.post('/', async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      customId: req.body.customId || `mat-${Date.now()}`
    };

    const newMaterial = await dbStore.create(materialData);
    res.status(201).json({ success: true, data: newMaterial });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/materials/:id
 * @desc    Update material specification (quantity, rate, status)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbStore.findOneAndUpdate(
      { $or: [{ _id: id }, { customId: id }] },
      { $set: req.body }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/materials/:id
 * @desc    Remove material specification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbStore.findOneAndDelete({
      $or: [{ _id: id }, { customId: id }]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    res.json({ success: true, message: 'Material removed from specification' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/materials/seed
 * @desc    Reset & seed initial architectural materials dataset
 */
router.post('/seed', async (req, res) => {
  try {
    const inserted = await dbStore.seed();
    res.json({
      success: true,
      message: `Database successfully seeded with ${inserted.length} verified architectural materials`,
      data: inserted
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
