<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dasbor</h1>
      <p class="text-gray-600 mt-1">
        Selamat datang kembali, {{ user?.name }}!
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"
          >
            <ShoppingCart :size="24" class="text-blue-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ summary.purchases.count }}
            </div>
            <div class="text-sm text-gray-600">Total Pembelian</div>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Berat:</span>
            <span class="font-semibold"
              >{{ summary.purchases.totalRealWeight.toFixed(1) }}g</span
            >
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">Nilai:</span>
            <span class="font-semibold text-blue-600"
              >${{ summary.purchases.totalPurchasePrice.toFixed(0) }}</span
            >
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3">
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
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Kehilangan Berat:</span>
            <span class="font-semibold text-red-600"
              >{{ summary.cleanings.totalWeightLoss.toFixed(2) }}g</span
            >
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">Avg Loss:</span>
            <span class="font-semibold"
              >{{ summary.cleanings.averageLossPercentage.toFixed(2) }}%</span
            >
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3">
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
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex justify-between text-sm">
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

      <el-card shadow="hover" v-loading="loading">
        <div class="flex items-center gap-3">
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
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Kehilangan Berat:</span>
            <span class="font-semibold text-red-600"
              >{{ summary.meltings.totalWeightLoss.toFixed(2) }}g</span
            >
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">Avg Loss:</span>
            <span class="font-semibold"
              >{{ summary.meltings.averageLossPercentage.toFixed(2) }}%</span
            >
          </div>
        </div>
      </el-card>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Recent Activity Chart -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold"
              >Aktivitas Terkini (7 Hari Terakhir)</span
            >
            <el-tag type="info">{{ recentDailyData.length }} Hari</el-tag>
          </div>
        </template>
        <Line
          v-if="!loading && recentDailyData.length > 0"
          :data="activityChartData"
          :options="lineChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
          <TrendingUp :size="48" class="mx-auto mb-2 opacity-50" />
          <p>Tidak ada aktivitas terkini</p>
        </div>
      </el-card>

      <!-- Operations Distribution -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <span class="font-semibold">Distribusi Operasi</span>
        </template>
        <Doughnut
          v-if="!loading && hasOperations"
          :data="distributionChartData"
          :options="doughnutChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
          <PieChart :size="48" class="mx-auto mb-2 opacity-50" />
          <p>Belum ada operasi yang tercatat</p>
        </div>
      </el-card>
    </div>

    <!-- Additional Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Weight Overview -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <span class="font-semibold">Ringkasan Alur Berat</span>
        </template>
        <Bar
          v-if="!loading && hasOperations"
          :data="weightFlowData"
          :options="barChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
          <Weight :size="48" class="mx-auto mb-2 opacity-50" />
          <p>Tidak ada data berat tersedia</p>
        </div>
      </el-card>

      <!-- Gold Quality Distribution -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <span class="font-semibold">Distribusi Kualitas Emas</span>
        </template>
        <Bar
          v-if="!loading && hasOperations"
          :data="caratChartData"
          :options="barChartOptions"
        />
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
          <Award :size="48" class="mx-auto mb-2 opacity-50" />
          <p>Tidak ada data karat tersedia</p>
        </div>
      </el-card>
    </div>

    <!-- Recent Operations Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Purchases -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Pembelian Terkini</span>
            <el-button
              type="primary"
              text
              size="small"
              @click="navigateTo('/purchases')"
            >
              Lihat Semua
            </el-button>
          </div>
        </template>
        <div v-if="recentPurchases.length > 0" class="space-y-3">
          <div
            v-for="purchase in recentPurchases"
            :key="purchase.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <el-tag :type="getCaratTagType(purchase.carat)" size="small"
                  >{{ purchase.carat }}K</el-tag
                >
                <el-tag size="small">{{ purchase.category.name }}</el-tag>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                {{ formatDate(purchase.createdAt) }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold">{{ purchase.realWeight }}g</div>
              <div class="text-sm text-blue-600">
                ${{ purchase.purchasePrice }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          Tidak ada pembelian terkini
        </div>
      </el-card>

      <!-- Recent Cleanings -->
      <el-card shadow="hover" v-loading="loading">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Pembersihan Terkini</span>
            <el-button
              type="primary"
              text
              size="small"
              @click="navigateTo('/cleanings')"
            >
              Lihat Semua
            </el-button>
          </div>
        </template>
        <div v-if="recentCleanings.length > 0" class="space-y-3">
          <div
            v-for="cleaning in recentCleanings"
            :key="cleaning.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <el-tag :type="getCaratTagType(cleaning.carat)" size="small"
                  >{{ cleaning.carat }}K</el-tag
                >
                <el-tag size="small">{{ cleaning.category.name }}</el-tag>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                {{ formatDate(cleaning.createdAt) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">
                {{ cleaning.weightBefore }}g → {{ cleaning.weightAfter }}g
              </div>
              <div class="text-sm text-red-600">
                -{{
                  (cleaning.weightBefore - cleaning.weightAfter).toFixed(2)
                }}g
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          Tidak ada pembersihan terkini
        </div>
      </el-card>
    </div>
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
  TrendingUp,
  PieChart,
  Weight,
  Award,
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
const { user } = useAuth();

// State
const loading = ref(false);
const summary = ref({
  purchases: {
    count: 0,
    totalRealWeight: 0,
    totalPurchasePrice: 0,
    byCarat: {} as Record<number, number>,
  },
  cleanings: {
    count: 0,
    totalWeightLoss: 0,
    averageLossPercentage: 0,
    byCarat: {} as Record<number, number>,
  },
  repairs: {
    count: 0,
    totalWeightChange: 0,
    byCarat: {} as Record<number, number>,
  },
  meltings: {
    count: 0,
    totalWeightLoss: 0,
    averageLossPercentage: 0,
    byCarat: {} as Record<number, number>,
  },
});

const recentPurchases = ref<any[]>([]);
const recentCleanings = ref<any[]>([]);
const dailyData = ref<any[]>([]);

// Computed
const hasOperations = computed(() => {
  return (
    summary.value.purchases.count > 0 ||
    summary.value.cleanings.count > 0 ||
    summary.value.repairs.count > 0 ||
    summary.value.meltings.count > 0
  );
});

const recentDailyData = computed(() => {
  return dailyData.value.slice(-7);
});

// Chart Data
const activityChartData = computed(() => ({
  labels: recentDailyData.value.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  ),
  datasets: [
    {
      label: "Purchases",
      data: recentDailyData.value.map((d) => d.purchases.count),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Cleanings",
      data: recentDailyData.value.map((d) => d.cleanings.count),
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Repairs",
      data: recentDailyData.value.map((d) => d.repairs.count),
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Meltings",
      data: recentDailyData.value.map((d) => d.meltings.count),
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ],
}));

const distributionChartData = computed(() => ({
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

const weightFlowData = computed(() => ({
  labels: ["Purchases", "Cleaning Loss", "Repair Change", "Melting Loss"],
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

const caratChartData = computed(() => {
  const carats = [9, 14, 18, 22, 24];
  return {
    labels: carats.map((c) => `${c}K`),
    datasets: [
      {
        label: "Purchases",
        data: carats.map((c) => summary.value.purchases.byCarat[c] || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3b82f6",
        borderWidth: 2,
      },
      {
        label: "Cleanings",
        data: carats.map((c) => summary.value.cleanings.byCarat[c] || 0),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
      },
      {
        label: "Repairs",
        data: carats.map((c) => summary.value.repairs.byCarat[c] || 0),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "#f59e0b",
        borderWidth: 2,
      },
      {
        label: "Meltings",
        data: carats.map((c) => summary.value.meltings.byCarat[c] || 0),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
      },
    ],
  };
});

// Chart Options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { position: "bottom" as const },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { position: "bottom" as const },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { position: "bottom" as const },
  },
};

// Helpers
const getCaratTagType = (carat: number) => {
  if (carat >= 22) return "danger";
  if (carat >= 18) return "warning";
  return "info";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Fetch dashboard data
const fetchDashboard = async () => {
  loading.value = true;

  try {
    // Get last 30 days for dashboard
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const params = {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };

    // Fetch summary and daily data
    const [reportResponse, dailyResponse] = await Promise.all([
      $api.reports.get({ query: params }),
      $api.reports.daily.get({ query: params }),
    ]);

    if (reportResponse.data?.data) {
      summary.value = reportResponse.data.data.summary;

      // Get recent items
      recentPurchases.value = (reportResponse.data.data.purchases || []).slice(
        0,
        3,
      );
      recentCleanings.value = (reportResponse.data.data.cleanings || []).slice(
        0,
        3,
      );
    }

    if (dailyResponse.data?.data) {
      dailyData.value = dailyResponse.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
  } finally {
    loading.value = false;
  }
};

// Fetch on mount
onMounted(() => {
  fetchDashboard();
});
</script>
