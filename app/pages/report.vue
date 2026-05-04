<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
      <p class="text-gray-600 mt-1">
        Ikhtisar komprehensif dari semua operasi emas
      </p>
    </div>

    <!-- Filters -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex items-center gap-2">
          <Filter :size="20" />
          <span class="font-semibold">Filter</span>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Date Range -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block"
            >Rentang Tanggal</label
          >
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="sampai"
            start-placeholder="Tanggal mulai"
            end-placeholder="Tanggal akhir"
            style="width: 100%"
            @change="fetchReport"
          />
        </div>

        <!-- Period View -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block"
            >Tampilan Periode</label
          >
          <el-select
            v-model="selectedPeriod"
            placeholder="Pilih periode"
            style="width: 100%"
            @change="handlePeriodChange"
          >
            <el-option label="Semua Waktu" value="all" />
            <el-option label="Hari Ini" value="today" />
            <el-option label="Minggu Ini" value="week" />
            <el-option label="Bulan Ini" value="month" />
            <el-option label="30 Hari Terakhir" value="last30" />
            <el-option label="90 Hari Terakhir" value="last90" />
            <el-option label="Rentang Kustom" value="custom" />
          </el-select>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-end gap-2">
          <el-button type="primary" @click="fetchReport" :loading="loading">
            <template #icon>
              <RefreshCw :size="16" />
            </template>
            Refresh
          </el-button>
          <el-button @click="resetFilters">
            <template #icon>
              <X :size="16" />
            </template>
            Reset
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Error Alert -->
    <el-alert
      v-if="error"
      type="error"
      :title="error"
      show-icon
      closable
      @close="error = ''"
      class="mb-4"
    />

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Purchases Card -->
      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"
          >
            <ShoppingCart :size="24" class="text-blue-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ summary.purchases.count }}
            </div>
            <div class="text-sm text-gray-600">Pembelian</div>
          </div>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Total Berat:</span>
            <span class="font-semibold"
              >{{ summary.purchases.totalRealWeight.toFixed(2) }}g</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Biaya:</span>
            <span class="font-semibold text-blue-600"
              >${{ summary.purchases.totalPurchasePrice.toFixed(2) }}</span
            >
          </div>
        </div>
      </el-card>

      <!-- Cleanings Card -->
      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"
          >
            <Sparkles :size="24" class="text-green-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ summary.cleanings.count }}
            </div>
            <div class="text-sm text-gray-600">Pembersihan</div>
          </div>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Kehilangan Berat:</span>
            <span class="font-semibold text-red-600"
              >{{ summary.cleanings.totalWeightLoss.toFixed(2) }}g</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Avg Loss %:</span>
            <span class="font-semibold"
              >{{ summary.cleanings.averageLossPercentage.toFixed(2) }}%</span
            >
          </div>
        </div>
      </el-card>

      <!-- Repairs Card -->
      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center"
          >
            <Wrench :size="24" class="text-amber-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ summary.repairs.count }}
            </div>
            <div class="text-sm text-gray-600">Perbaikan</div>
          </div>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Perubahan Berat:</span>
            <span
              class="font-semibold"
              :class="
                summary.repairs.totalWeightChange >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ summary.repairs.totalWeightChange >= 0 ? "+" : ""
              }}{{ summary.repairs.totalWeightChange.toFixed(2) }}g
            </span>
          </div>
        </div>
      </el-card>

      <!-- Meltings Card -->
      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center"
          >
            <Flame :size="24" class="text-red-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ summary.meltings.count }}
            </div>
            <div class="text-sm text-gray-600">Peleburan</div>
          </div>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Weight Loss:</span>
            <span class="font-semibold text-red-600"
              >{{ summary.meltings.totalWeightLoss.toFixed(2) }}g</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Avg Loss %:</span>
            <span class="font-semibold"
              >{{ summary.meltings.averageLossPercentage.toFixed(2) }}%</span
            >
          </div>
        </div>
      </el-card>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Operations Timeline Chart -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Operasi Dari Waktu ke Waktu</span>
            <el-tag>{{ dailyData.length }} Hari</el-tag>
          </div>
        </template>
        <Line
          v-if="!loading && dailyData.length > 0"
          :data="operationsChartData"
          :options="lineChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-8 text-gray-500">
          No data available for the selected period
        </div>
      </el-card>

      <!-- Operations Breakdown -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <span class="font-semibold">Rincian Operasi</span>
        </template>
        <Doughnut
          v-if="!loading && hasOperations"
          :data="operationsBreakdownData"
          :options="doughnutChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-8 text-gray-500">
          No operations recorded for the selected period
        </div>
      </el-card>
    </div>

    <!-- More Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Weight Analysis -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <span class="font-semibold">Analisis Alur Berat</span>
        </template>
        <Bar
          v-if="!loading && hasOperations"
          :data="weightAnalysisData"
          :options="barChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-8 text-gray-500">
          No weight data available
        </div>
      </el-card>

      <!-- Carat Distribution -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <span class="font-semibold">Distribusi Karat</span>
        </template>
        <Bar
          v-if="!loading && hasOperations"
          :data="caratDistributionData"
          :options="barChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-8 text-gray-500">
          No carat data available
        </div>
      </el-card>
    </div>

    <!-- Category Breakdown -->
    <el-card shadow="hover" v-loading="loading" v-if="hasCategories">
      <template #header>
        <span class="font-semibold">Operasi berdasarkan Kategori</span>
      </template>
      <Bar
        v-if="!loading"
        :data="categoryBreakdownData"
        :options="barChartOptions"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line, Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  ShoppingCart,
  Sparkles,
  Wrench,
  Flame,
  Filter,
  RefreshCw,
  X,
} from "@lucide/vue";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

definePageMeta({
  layout: "default",
});

const { $api } = useNuxtApp();

// State
const loading = ref(false);
const error = ref("");
const dateRange = ref<[Date, Date] | null>(null);
const selectedPeriod = ref("all");
const dailyData = ref<any[]>([]);

const summary = ref({
  purchases: {
    count: 0,
    totalRealWeight: 0,
    totalReceiptWeight: 0,
    totalPurchasePrice: 0,
    totalReceiptPrice: 0,
    byCategory: {} as Record<string, number>,
    byCarat: {} as Record<number, number>,
  },
  cleanings: {
    count: 0,
    totalWeightBefore: 0,
    totalWeightAfter: 0,
    totalWeightLoss: 0,
    averageLossPercentage: 0,
    byCategory: {} as Record<string, number>,
    byCarat: {} as Record<number, number>,
  },
  repairs: {
    count: 0,
    totalWeightBefore: 0,
    totalWeightAfter: 0,
    totalWeightChange: 0,
    byCategory: {} as Record<string, number>,
    byCarat: {} as Record<number, number>,
  },
  meltings: {
    count: 0,
    totalWeightBefore: 0,
    totalWeightAfter: 0,
    totalWeightLoss: 0,
    averageLossPercentage: 0,
    byCarat: {} as Record<number, number>,
  },
});

// Computed properties
const hasOperations = computed(() => {
  return (
    summary.value.purchases.count > 0 ||
    summary.value.cleanings.count > 0 ||
    summary.value.repairs.count > 0 ||
    summary.value.meltings.count > 0
  );
});

const hasCategories = computed(() => {
  return (
    Object.keys(summary.value.purchases.byCategory).length > 0 ||
    Object.keys(summary.value.cleanings.byCategory).length > 0 ||
    Object.keys(summary.value.repairs.byCategory).length > 0
  );
});

// Chart data
const operationsChartData = computed(() => ({
  labels: dailyData.value.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  ),
  datasets: [
    {
      label: "Purchases",
      data: dailyData.value.map((d) => d.purchases.count),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Cleanings",
      data: dailyData.value.map((d) => d.cleanings.count),
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Repairs",
      data: dailyData.value.map((d) => d.repairs.count),
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Meltings",
      data: dailyData.value.map((d) => d.meltings.count),
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ],
}));

const operationsBreakdownData = computed(() => ({
  labels: ["Purchases", "Cleanings", "Repairs", "Meltings"],
  datasets: [
    {
      data: [
        summary.value.purchases.count,
        summary.value.cleanings.count,
        summary.value.repairs.count,
        summary.value.meltings.count,
      ],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
      borderColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
      borderWidth: 2,
    },
  ],
}));

const weightAnalysisData = computed(() => ({
  labels: ["Purchases", "Cleanings Loss", "Repairs Change", "Meltings Loss"],
  datasets: [
    {
      label: "Weight (grams)",
      data: [
        summary.value.purchases.totalRealWeight,
        -summary.value.cleanings.totalWeightLoss,
        summary.value.repairs.totalWeightChange,
        -summary.value.meltings.totalWeightLoss,
      ],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        summary.value.repairs.totalWeightChange >= 0
          ? "rgba(16, 185, 129, 0.8)"
          : "rgba(239, 68, 68, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
      borderColor: [
        "#3b82f6",
        "#ef4444",
        summary.value.repairs.totalWeightChange >= 0 ? "#10b981" : "#ef4444",
        "#ef4444",
      ],
      borderWidth: 2,
    },
  ],
}));

const caratDistributionData = computed(() => {
  const carats = [9, 14, 18, 22, 24];
  const purchasesData = carats.map(
    (c) => summary.value.purchases.byCarat[c] || 0,
  );
  const cleaningsData = carats.map(
    (c) => summary.value.cleanings.byCarat[c] || 0,
  );
  const repairsData = carats.map((c) => summary.value.repairs.byCarat[c] || 0);
  const meltingsData = carats.map(
    (c) => summary.value.meltings.byCarat[c] || 0,
  );

  return {
    labels: carats.map((c) => `${c}K`),
    datasets: [
      {
        label: "Purchases",
        data: purchasesData,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3b82f6",
        borderWidth: 2,
      },
      {
        label: "Cleanings",
        data: cleaningsData,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
      },
      {
        label: "Repairs",
        data: repairsData,
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "#f59e0b",
        borderWidth: 2,
      },
      {
        label: "Meltings",
        data: meltingsData,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
      },
    ],
  };
});

const categoryBreakdownData = computed(() => {
  const allCategories = new Set<string>();
  Object.keys(summary.value.purchases.byCategory).forEach((c) =>
    allCategories.add(c),
  );
  Object.keys(summary.value.cleanings.byCategory).forEach((c) =>
    allCategories.add(c),
  );
  Object.keys(summary.value.repairs.byCategory).forEach((c) =>
    allCategories.add(c),
  );

  const categories = Array.from(allCategories);
  const purchasesData = categories.map(
    (c) => summary.value.purchases.byCategory[c] || 0,
  );
  const cleaningsData = categories.map(
    (c) => summary.value.cleanings.byCategory[c] || 0,
  );
  const repairsData = categories.map(
    (c) => summary.value.repairs.byCategory[c] || 0,
  );

  return {
    labels: categories,
    datasets: [
      {
        label: "Purchases",
        data: purchasesData,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3b82f6",
        borderWidth: 2,
      },
      {
        label: "Cleanings",
        data: cleaningsData,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
      },
      {
        label: "Repairs",
        data: repairsData,
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "#f59e0b",
        borderWidth: 2,
      },
    ],
  };
});

// Chart options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

// Handle period change
const handlePeriodChange = () => {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;

  switch (selectedPeriod.value) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "week":
      start = new Date(now.setDate(now.getDate() - now.getDay()));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date();
      break;
    case "last30":
      start = new Date(now.setDate(now.getDate() - 30));
      end = new Date();
      break;
    case "last90":
      start = new Date(now.setDate(now.getDate() - 90));
      end = new Date();
      break;
    case "all":
      dateRange.value = null;
      fetchReport();
      return;
    case "custom":
      // User will set custom range manually
      return;
  }

  if (start && end) {
    dateRange.value = [start, end];
    fetchReport();
  }
};

// Reset filters
const resetFilters = () => {
  dateRange.value = null;
  selectedPeriod.value = "all";
  fetchReport();
};

// Fetch report
const fetchReport = async () => {
  loading.value = true;
  error.value = "";

  try {
    const params: any = {};
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.startDate = dateRange.value[0].toISOString().split("T")[0];
      params.endDate = dateRange.value[1].toISOString().split("T")[0];
    }

    // Fetch main report
    const { data, error: apiError } = await $api.reports.get({ query: params });

    if (apiError) {
      error.value = "Gagal memuat data laporan";
      return;
    }

    if (data.data) {
      summary.value = data.data.summary;
    }

    // Fetch daily data
    const { data: dailyResponse, error: dailyError } =
      await $api.reports.daily.get({ query: params });

    if (dailyError) {
      console.error("Failed to load daily data");
    } else if (dailyResponse.data) {
      dailyData.value = dailyResponse.data;
    }
  } catch (err: any) {
    error.value = err.message || "An error occurred";
  } finally {
    loading.value = false;
  }
};

// Fetch report on mount
onMounted(() => {
  fetchReport();
});
</script>

<style scoped>
:deep(.el-date-picker) {
  width: 100%;
}
</style>
