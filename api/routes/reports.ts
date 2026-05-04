import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";

export const reports = new Elysia({ prefix: "/reports" })
  // Get comprehensive report with date filtering
  .get(
    "/",
    async ({ query }) => {
      try {
        const { startDate, endDate } = query;

        // Build date filter
        const dateFilter: any = {};
        if (startDate || endDate) {
          dateFilter.createdAt = {};
          if (startDate) {
            dateFilter.createdAt.gte = new Date(startDate);
          }
          if (endDate) {
            // Add 1 day to include the end date fully
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            dateFilter.createdAt.lt = end;
          }
        }

        // Fetch all data with date filter
        const [purchases, cleanings, repairs, meltings, categories] =
          await Promise.all([
            prisma.purchase.findMany({
              where: dateFilter,
              include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            }),
            prisma.cleaning.findMany({
              where: dateFilter,
              include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            }),
            prisma.repair.findMany({
              where: dateFilter,
              include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            }),
            prisma.melting.findMany({
              where: dateFilter,
              include: {
                user: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            }),
            prisma.goldCategory.findMany(),
          ]);

        // Calculate summary statistics
        const summary = {
          purchases: {
            count: purchases.length,
            totalRealWeight: purchases.reduce(
              (sum, p) => sum + p.realWeight,
              0,
            ),
            totalReceiptWeight: purchases.reduce(
              (sum, p) => sum + p.receiptWeight,
              0,
            ),
            totalPurchasePrice: purchases.reduce(
              (sum, p) => sum + p.purchasePrice,
              0,
            ),
            totalReceiptPrice: purchases.reduce(
              (sum, p) => sum + p.recieptPrice,
              0,
            ),
            byCategory: {} as Record<string, number>,
            byCarat: {} as Record<number, number>,
          },
          cleanings: {
            count: cleanings.length,
            totalWeightBefore: cleanings.reduce(
              (sum, c) => sum + c.weightBefore,
              0,
            ),
            totalWeightAfter: cleanings.reduce(
              (sum, c) => sum + c.weightAfter,
              0,
            ),
            totalWeightLoss: 0,
            averageLossPercentage: 0,
            byCategory: {} as Record<string, number>,
            byCarat: {} as Record<number, number>,
          },
          repairs: {
            count: repairs.length,
            totalWeightBefore: repairs.reduce(
              (sum, r) => sum + r.weightBefore,
              0,
            ),
            totalWeightAfter: repairs.reduce(
              (sum, r) => sum + r.weightAfter,
              0,
            ),
            totalWeightChange: 0,
            byCategory: {} as Record<string, number>,
            byCarat: {} as Record<number, number>,
          },
          meltings: {
            count: meltings.length,
            totalWeightBefore: meltings.reduce(
              (sum, m) => sum + m.weightBefore,
              0,
            ),
            totalWeightAfter: meltings.reduce(
              (sum, m) => sum + m.weightAfter,
              0,
            ),
            totalWeightLoss: 0,
            averageLossPercentage: 0,
            byCarat: {} as Record<number, number>,
          },
        };

        // Calculate derived values
        summary.cleanings.totalWeightLoss =
          summary.cleanings.totalWeightBefore -
          summary.cleanings.totalWeightAfter;
        summary.cleanings.averageLossPercentage =
          summary.cleanings.totalWeightBefore > 0
            ? (summary.cleanings.totalWeightLoss /
                summary.cleanings.totalWeightBefore) *
              100
            : 0;

        summary.repairs.totalWeightChange =
          summary.repairs.totalWeightAfter - summary.repairs.totalWeightBefore;

        summary.meltings.totalWeightLoss =
          summary.meltings.totalWeightBefore -
          summary.meltings.totalWeightAfter;
        summary.meltings.averageLossPercentage =
          summary.meltings.totalWeightBefore > 0
            ? (summary.meltings.totalWeightLoss /
                summary.meltings.totalWeightBefore) *
              100
            : 0;

        // Group by category
        purchases.forEach((p) => {
          const catName = p.category.name;
          summary.purchases.byCategory[catName] =
            (summary.purchases.byCategory[catName] || 0) + 1;
        });
        cleanings.forEach((c) => {
          const catName = c.category.name;
          summary.cleanings.byCategory[catName] =
            (summary.cleanings.byCategory[catName] || 0) + 1;
        });
        repairs.forEach((r) => {
          const catName = r.category.name;
          summary.repairs.byCategory[catName] =
            (summary.repairs.byCategory[catName] || 0) + 1;
        });

        // Group by carat
        purchases.forEach((p) => {
          summary.purchases.byCarat[p.carat] =
            (summary.purchases.byCarat[p.carat] || 0) + 1;
        });
        cleanings.forEach((c) => {
          summary.cleanings.byCarat[c.carat] =
            (summary.cleanings.byCarat[c.carat] || 0) + 1;
        });
        repairs.forEach((r) => {
          summary.repairs.byCarat[r.carat] =
            (summary.repairs.byCarat[r.carat] || 0) + 1;
        });
        meltings.forEach((m) => {
          summary.meltings.byCarat[m.carat] =
            (summary.meltings.byCarat[m.carat] || 0) + 1;
        });

        return {
          data: {
            summary,
            purchases,
            cleanings,
            repairs,
            meltings,
            categories,
          },
        };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to fetch report" },
        };
      }
    },
    {
      query: t.Object({
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
      }),
    },
  )

  // Get daily aggregated data for charts
  .get(
    "/daily",
    async ({ query }) => {
      try {
        const { startDate, endDate } = query;

        // Build date filter
        const dateFilter: any = {};
        if (startDate || endDate) {
          dateFilter.createdAt = {};
          if (startDate) {
            dateFilter.createdAt.gte = new Date(startDate);
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            dateFilter.createdAt.lt = end;
          }
        }

        // Fetch all data
        const [purchases, cleanings, repairs, meltings] = await Promise.all([
          prisma.purchase.findMany({ where: dateFilter }),
          prisma.cleaning.findMany({ where: dateFilter }),
          prisma.repair.findMany({ where: dateFilter }),
          prisma.melting.findMany({ where: dateFilter }),
        ]);

        // Group by date
        const dailyData: Record<string, any> = {};

        const addToDaily = (date: Date, type: string, data: any) => {
          const dateKey = date.toISOString().split("T")[0];
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              date: dateKey,
              purchases: { count: 0, weight: 0, price: 0 },
              cleanings: { count: 0, weightLoss: 0 },
              repairs: { count: 0, weightChange: 0 },
              meltings: { count: 0, weightLoss: 0 },
            };
          }
          dailyData[dateKey][type] = {
            ...dailyData[dateKey][type],
            ...data,
          };
        };

        purchases.forEach((p) => {
          const existing = dailyData[p.createdAt.toISOString().split("T")[0]]
            ?.purchases || {
            count: 0,
            weight: 0,
            price: 0,
          };
          addToDaily(p.createdAt, "purchases", {
            count: existing.count + 1,
            weight: existing.weight + p.realWeight,
            price: existing.price + p.purchasePrice,
          });
        });

        cleanings.forEach((c) => {
          const existing = dailyData[c.createdAt.toISOString().split("T")[0]]
            ?.cleanings || {
            count: 0,
            weightLoss: 0,
          };
          addToDaily(c.createdAt, "cleanings", {
            count: existing.count + 1,
            weightLoss: existing.weightLoss + (c.weightBefore - c.weightAfter),
          });
        });

        repairs.forEach((r) => {
          const existing = dailyData[r.createdAt.toISOString().split("T")[0]]
            ?.repairs || {
            count: 0,
            weightChange: 0,
          };
          addToDaily(r.createdAt, "repairs", {
            count: existing.count + 1,
            weightChange:
              existing.weightChange + (r.weightAfter - r.weightBefore),
          });
        });

        meltings.forEach((m) => {
          const existing = dailyData[m.createdAt.toISOString().split("T")[0]]
            ?.meltings || {
            count: 0,
            weightLoss: 0,
          };
          addToDaily(m.createdAt, "meltings", {
            count: existing.count + 1,
            weightLoss: existing.weightLoss + (m.weightBefore - m.weightAfter),
          });
        });

        // Convert to array and sort by date
        const dailyArray = Object.values(dailyData).sort((a: any, b: any) =>
          a.date.localeCompare(b.date),
        );

        return { data: dailyArray };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to fetch daily report" },
        };
      }
    },
    {
      query: t.Object({
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
      }),
    },
  );
