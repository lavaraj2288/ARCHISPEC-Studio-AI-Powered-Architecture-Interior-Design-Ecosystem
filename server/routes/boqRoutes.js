import express from 'express';
import dbStore from '../db.js';

const router = express.Router();

/**
 * @route   GET /api/boq/aggregate
 * @desc    Executes high-performance MongoDB Aggregation Pipeline ($facet, $group)
 *          to compute itemized BOQ financial metrics, trade categories & room allocations
 * @access  Public / RBAC controlled
 */
router.get('/aggregate', async (req, res) => {
  try {
    const startTime = process.hrtime();

    const [aggregationResult] = await dbStore.aggregate([
      {
        $facet: {
          // Sub-pipeline 1: Financial & Works Totals
          financialSummary: [
            {
              $project: {
                matCost: { $multiply: ['$rate', '$quantity'] },
                labCost: { $multiply: ['$laborRatePerUnit', '$quantity'] },
                unit: 1,
                quantity: 1
              }
            },
            {
              $group: {
                _id: null,
                materialSubtotal: { $sum: '$matCost' },
                laborSubtotal: { $sum: '$labCost' },
                totalItems: { $sum: 1 },
                totalSqFtCovered: {
                  $sum: {
                    $cond: [{ $eq: ['$unit', 'sq.ft'] }, '$quantity', 0]
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                materialSubtotal: 1,
                laborSubtotal: 1,
                baseCost: { $add: ['$materialSubtotal', '$laborSubtotal'] },
                gstAmount: {
                  $round: [{ $multiply: [{ $add: ['$materialSubtotal', '$laborSubtotal'] }, 0.18] }, 0]
                },
                architectMarginAmount: {
                  $round: [{ $multiply: [{ $add: ['$materialSubtotal', '$laborSubtotal'] }, 0.15] }, 0]
                },
                finalClientTotal: {
                  $round: [{ $multiply: [{ $add: ['$materialSubtotal', '$laborSubtotal'] }, 1.33] }, 0]
                },
                totalItems: 1,
                totalSqFtCovered: 1
              }
            }
          ],

          // Sub-pipeline 2: Trade Category Breakdown (Wood, Stone, Metal, Lighting, Paint)
          categoryBreakdown: [
            {
              $group: {
                _id: '$category',
                totalSpend: {
                  $sum: {
                    $add: [
                      { $multiply: ['$rate', '$quantity'] },
                      { $multiply: ['$laborRatePerUnit', '$quantity'] }
                    ]
                  }
                },
                itemCount: { $sum: 1 }
              }
            },
            { $sort: { totalSpend: -1 } }
          ],

          // Sub-pipeline 3: Room Spatial Budget Allocation
          roomBreakdown: [
            {
              $group: {
                _id: '$room',
                totalSpend: {
                  $sum: {
                    $add: [
                      { $multiply: ['$rate', '$quantity'] },
                      { $multiply: ['$laborRatePerUnit', '$quantity'] }
                    ]
                  }
                },
                itemCount: { $sum: 1 }
              }
            },
            { $sort: { totalSpend: -1 } }
          ]
        }
      }
    ]);

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const executionTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    const summary = aggregationResult.financialSummary[0] || {
      materialSubtotal: 0,
      laborSubtotal: 0,
      baseCost: 0,
      gstAmount: 0,
      architectMarginAmount: 0,
      finalClientTotal: 0,
      totalItems: 0,
      totalSqFtCovered: 0
    };

    res.json({
      success: true,
      executionEngine: 'MongoDB Aggregation Pipeline ($facet, $group)',
      executionTimeMs: `${executionTimeMs}ms`,
      data: {
        summary,
        categoryBreakdown: aggregationResult.categoryBreakdown,
        roomBreakdown: aggregationResult.roomBreakdown
      }
    });
  } catch (error) {
    console.error('BOQ Aggregation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
