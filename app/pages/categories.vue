<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kategori Emas</h1>
        <p class="text-gray-600 mt-1">Kelola kategori barang emas</p>
      </div>
      <el-button type="warning" @click="openCreateModal">
        <template #icon>
          <Plus :size="18" />
        </template>
        Tambah Kategori
      </el-button>
    </div>

    <!-- Error Alert -->
    <el-alert
      v-if="error"
      type="error"
      :title="error"
      show-icon
      closable
      @close="error = ''"
      class="mb-4"
    >
      <el-button type="primary" size="small" @click="fetchCategories">
        Coba Lagi
      </el-button>
    </el-alert>

    <!-- Categories Chart -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">Ikhtisar Kategori</span>
          <el-tag>{{ categories.length }} Categories</el-tag>
        </div>
      </template>

      <div v-if="loading" class="flex justify-center items-center h-96">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="categories.length > 0" class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <el-empty v-else description="Tidak ada kategori ditemukan" class="py-8">
        <el-button type="warning" @click="openCreateModal">
          Tambah Kategori Pertama
        </el-button>
      </el-empty>
    </el-card>

    <!-- Categories Table (Alternative View) -->
    <el-card shadow="hover" class="mt-6">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">Semua Kategori</span>
          <el-tag>{{ categories.length }} Total</el-tag>
        </div>
      </template>

      <el-table
        :data="categories"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="name" label="Nama Kategori" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar
                :size="35"
                style="background-color: #fef3c7; color: #d97706"
              >
                <Tag :size="18" />
              </el-avatar>
              <span class="font-medium">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Pembelian" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row._count.purchases }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Pembersihan" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{
              row._count.cleanings
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Perbaikan" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{
              row._count.repairs
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Dibuat Pada" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="150" align="center">
          <template #default="{ row }">
            <el-button
              type="warning"
              size="small"
              circle
              @click="openEditModal(row)"
              title="Ubah"
            >
              <Edit2 :size="16" />
            </el-button>
            <el-button
              type="danger"
              size="small"
              circle
              @click="confirmDelete(row)"
              :disabled="getTotalRecords(row) > 0"
              :title="
                getTotalRecords(row) > 0
                  ? 'Tidak dapat menghapus - memiliki data terkait'
                  : 'Hapus'
              "
            >
              <Trash2 :size="16" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="showModal"
      :title="isEditMode ? 'Ubah Kategori' : 'Buat Kategori'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="formError"
        type="error"
        :title="formError"
        show-icon
        closable
        @close="formError = ''"
        class="mb-4"
      />

      <el-form :model="form" label-width="120px" label-position="top">
        <el-form-item label="Nama Kategori" required>
          <el-input
            v-model="form.name"
            placeholder="e.g., Rings, Necklaces, Bracelets"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">Batal</el-button>
        <el-button type="warning" @click="handleSubmit" :loading="submitting">
          {{ isEditMode ? "Perbarui" : "Buat" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus, Tag, Edit2, Trash2 } from "@lucide/vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

definePageMeta({
  layout: "default",
});

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    purchases: number;
    cleanings: number;
    repairs: number;
  };
}

const { $api } = useNuxtApp();

// State
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formError = ref("");

const form = ref({
  id: 0,
  name: "",
});

// Chart data
const chartData = computed(() => {
  return {
    labels: categories.value.map((cat) => cat.name),
    datasets: [
      {
        label: "Purchases",
        data: categories.value.map((cat) => cat._count.purchases),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
      {
        label: "Cleanings",
        data: categories.value.map((cat) => cat._count.cleanings),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
      {
        label: "Repairs",
        data: categories.value.map((cat) => cat._count.repairs),
        backgroundColor: "rgba(245, 158, 11, 0.7)",
        borderColor: "rgb(245, 158, 11)",
        borderWidth: 1,
      },
    ],
  };
});

// Chart options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };
});

// Fetch categories
const fetchCategories = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: apiError } = await $api.categories.get();

    if (apiError) {
      error.value = "Gagal memuat kategori";
      return;
    }

    categories.value = (data.data || []) as any;
  } catch (err: any) {
    error.value = err.message || "An error occurred";
  } finally {
    loading.value = false;
  }
};

// Get total records count
const getTotalRecords = (category: Category) => {
  return (
    category._count.purchases +
    category._count.cleanings +
    category._count.repairs
  );
};

// Open create modal
const openCreateModal = () => {
  isEditMode.value = false;
  form.value = {
    id: 0,
    name: "",
  };
  formError.value = "";
  showModal.value = true;
};

// Open edit modal
const openEditModal = (category: Category) => {
  isEditMode.value = true;
  form.value = {
    id: category.id,
    name: category.name,
  };
  formError.value = "";
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  formError.value = "";
};

// Handle form submit
const handleSubmit = async () => {
  // Validate form
  if (!form.value.name || form.value.name.trim().length < 2) {
    formError.value = "Category name must be at least 2 characters";
    return;
  }

  submitting.value = true;
  formError.value = "";

  try {
    if (isEditMode.value) {
      // Update category
      const { data, error: apiError } = await $api
        .categories({
          id: String(form.value.id),
        })
        .put({
          name: form.value.name.trim(),
        });

      if (apiError) {
        formError.value =
          apiError.value.message || "Gagal memperbarui kategori";
        return;
      }

      // Update category in list
      const index = categories.value.findIndex((c) => c.id === form.value.id);
      if (index !== -1 && data.data) {
        categories.value[index] = data.data as any;
      }

      ElMessage.success("Kategori berhasil diperbarui");
    } else {
      // Create category
      const { data, error: apiError } = await $api.categories.post({
        name: form.value.name.trim(),
      });

      if (apiError) {
        formError.value = apiError.value.message || "Gagal membuat kategori";
        return;
      }

      // Add category to list
      if (data.data) {
        categories.value.unshift(data.data as any);
      }
      ElMessage.success("Kategori berhasil dibuat");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "An error occurred";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (category: Category) => {
  const totalRecords = getTotalRecords(category);

  if (totalRecords > 0) {
    ElMessage.warning(
      `Tidak dapat menghapus kategori ini. Terdapat ${totalRecords} data terkait.`,
    );
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus "${category.name}"? Tindakan ini tidak dapat dibatalkan.`,
      "Hapus Kategori",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // Proceed with deletion
    await handleDelete(category);
  } catch {
    // User cancelled
  }
};

// Handle delete
const handleDelete = async (category: Category) => {
  const loading = ElMessage({
    message: "Deleting category...",
    type: "info",
    duration: 0,
  });

  try {
    const { error: apiError } = await $api
      .categories({
        id: String(category.id),
      })
      .delete();

    if (apiError) {
      loading.close();
      ElMessage.error(apiError.value.message || "Gagal menghapus kategori");
      return;
    }

    // Remove category from list
    categories.value = categories.value.filter((c) => c.id !== category.id);
    loading.close();
    ElMessage.success("Kategori berhasil dihapus");
  } catch (err: any) {
    loading.close();
    ElMessage.error(err.message || "An error occurred");
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Fetch categories on mount
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-card :deep(.el-card__header) {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.category-card :deep(.el-card__body) {
  padding: 16px;
}

.chart-container {
  padding: 20px;
  min-height: 400px;
}
</style>
