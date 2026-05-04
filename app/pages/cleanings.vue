<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pembersihan Emas</h1>
        <p class="text-gray-600 mt-1">Lacak operasi pembersihan emas</p>
      </div>
      <el-button type="success" @click="openCreateModal">
        <template #icon>
          <Sparkles :size="18" />
        </template>
        Tambah Pembersihan
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
      <el-button type="primary" size="small" @click="fetchCleanings">
        Coba Lagi
      </el-button>
    </el-alert>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"
          >
            <Sparkles :size="24" class="text-green-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ cleanings.length }}
            </div>
            <div class="text-sm text-gray-600">Total Pembersihan</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"
          >
            <Weight :size="24" class="text-blue-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ totalWeightBefore.toFixed(2) }}g
            </div>
            <div class="text-sm text-gray-600">Total Berat Sebelum</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center"
          >
            <Scale :size="24" class="text-amber-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ totalWeightAfter.toFixed(2) }}g
            </div>
            <div class="text-sm text-gray-600">Total Berat Sesudah</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center"
          >
            <TrendingDown :size="24" class="text-red-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">
              {{ totalWeightLoss.toFixed(2) }}g
            </div>
            <div class="text-sm text-gray-600">Total Kehilangan Berat</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Cleanings Table -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">Semua Pembersihan</span>
          <el-tag>{{ cleanings.length }} Total</el-tag>
        </div>
      </template>

      <el-table
        :data="cleanings"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column label="Kategori" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-tag type="warning" size="small">{{
                row.category.name
              }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Berat Sebelum" width="140" align="right">
          <template #default="{ row }">
            <span class="font-semibold">{{ row.weightBefore }}g</span>
          </template>
        </el-table-column>

        <el-table-column label="Berat Sesudah" width="140" align="right">
          <template #default="{ row }">
            <span class="font-semibold text-green-600"
              >{{ row.weightAfter }}g</span
            >
          </template>
        </el-table-column>

        <el-table-column label="Kehilangan Berat" width="140" align="right">
          <template #default="{ row }">
            <span class="text-red-600 font-semibold">
              {{ (row.weightBefore - row.weightAfter).toFixed(2) }}g
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Kehilangan %" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getLossPercentageType(row)" size="small">
              {{ calculateLossPercentage(row) }}%
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Karat" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCaratTagType(row.carat)" size="small">
              {{ row.carat }}K
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Pengguna" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar
                :size="30"
                style="background-color: #dbeafe; color: #2563eb"
              >
                {{ row.user.name.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="text-sm">{{ row.user.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Tanggal" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="success"
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
              title="Hapus"
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
      :title="isEditMode ? 'Ubah Pembersihan' : 'Buat Pembersihan'"
      width="600px"
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

      <el-form :model="form" label-width="140px" label-position="left">
        <el-form-item label="Kategori" required>
          <el-select
            v-model="form.categoryId"
            placeholder="Pilih kategori"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Pengguna" required>
          <el-select
            v-model="form.userId"
            placeholder="Pilih pengguna"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.name} (${user.email})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-divider />

        <el-form-item label="Berat Sebelum (g)" required>
          <el-input-number
            v-model="form.weightBefore"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Berat Sesudah (g)" required>
          <el-input-number
            v-model="form.weightAfter"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Karat" required>
          <el-select
            v-model="form.carat"
            placeholder="Pilih karat"
            style="width: 100%"
          >
            <el-option label="9K" :value="9" />
            <el-option label="14K" :value="14" />
            <el-option label="18K" :value="18" />
            <el-option label="22K" :value="22" />
            <el-option label="24K" :value="24" />
          </el-select>
        </el-form-item>

        <el-alert
          v-if="form.weightBefore > 0 && form.weightAfter > 0"
          :type="form.weightAfter < form.weightBefore ? 'warning' : 'success'"
          :title="`Weight change: ${(form.weightAfter - form.weightBefore).toFixed(2)}g (${calculateFormLossPercentage()}%)`"
          :closable="false"
          class="mt-2"
        />
      </el-form>

      <template #footer>
        <el-button @click="closeModal">Batal</el-button>
        <el-button type="success" @click="handleSubmit" :loading="submitting">
          {{ isEditMode ? "Perbarui" : "Buat" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Sparkles,
  Weight,
  Scale,
  TrendingDown,
  Edit2,
  Trash2,
} from "@lucide/vue";
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({
  layout: "default",
});

interface Cleaning {
  id: number;
  weightBefore: number;
  weightAfter: number;
  carat: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Category {
  id: number;
  name: string;
}

const { $api } = useNuxtApp();

// State
const cleanings = ref<Cleaning[]>([]);
const users = ref<User[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formError = ref("");

const form = ref({
  id: 0,
  weightBefore: 0,
  weightAfter: 0,
  carat: 24,
  userId: 0,
  categoryId: 0,
});

// Computed properties
const totalWeightBefore = computed(() => {
  return cleanings.value.reduce((sum, c) => sum + c.weightBefore, 0);
});

const totalWeightAfter = computed(() => {
  return cleanings.value.reduce((sum, c) => sum + c.weightAfter, 0);
});

const totalWeightLoss = computed(() => {
  return totalWeightBefore.value - totalWeightAfter.value;
});

// Calculate loss percentage
const calculateLossPercentage = (cleaning: Cleaning) => {
  if (cleaning.weightBefore === 0) return "0.00";
  const loss =
    ((cleaning.weightBefore - cleaning.weightAfter) / cleaning.weightBefore) *
    100;
  return loss.toFixed(2);
};

// Calculate form loss percentage
const calculateFormLossPercentage = () => {
  if (form.value.weightBefore === 0) return "0.00";
  const loss =
    ((form.value.weightBefore - form.value.weightAfter) /
      form.value.weightBefore) *
    100;
  return loss.toFixed(2);
};

// Get loss percentage tag type
const getLossPercentageType = (cleaning: Cleaning) => {
  const loss = parseFloat(calculateLossPercentage(cleaning));
  if (loss > 5) return "danger";
  if (loss > 2) return "warning";
  return "success";
};

// Fetch cleanings
const fetchCleanings = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: apiError } = await $api.cleanings.get();

    if (apiError) {
      error.value = "Gagal memuat pembersihan";
      return;
    }

    cleanings.value = (data.data || []) as any;
  } catch (err: any) {
    error.value = err.message || "An error occurred";
  } finally {
    loading.value = false;
  }
};

// Fetch users
const fetchUsers = async () => {
  try {
    const { data, error: apiError } = await $api.users.get();
    if (!apiError && data.data) {
      users.value = data.data as any;
    }
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
};

// Fetch categories
const fetchCategories = async () => {
  try {
    const { data, error: apiError } = await $api.categories.get();
    if (!apiError && data.data) {
      categories.value = data.data as any;
    }
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }
};

// Get carat tag type
const getCaratTagType = (carat: number) => {
  if (carat >= 22) return "danger";
  if (carat >= 18) return "warning";
  return "info";
};

// Open create modal
const openCreateModal = () => {
  isEditMode.value = false;
  form.value = {
    id: 0,
    weightBefore: 0,
    weightAfter: 0,
    carat: 24,
    userId: users.value[0]?.id || 0,
    categoryId: categories.value[0]?.id || 0,
  };
  formError.value = "";
  showModal.value = true;
};

// Open edit modal
const openEditModal = (cleaning: Cleaning) => {
  isEditMode.value = true;
  form.value = {
    id: cleaning.id,
    weightBefore: cleaning.weightBefore,
    weightAfter: cleaning.weightAfter,
    carat: cleaning.carat,
    userId: cleaning.user.id,
    categoryId: cleaning.category.id,
  };
  formError.value = "";
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  formError.value = "";
};

// Validate form
const validateForm = () => {
  if (!form.value.categoryId) {
    formError.value = "Please select a category";
    return false;
  }
  if (!form.value.userId) {
    formError.value = "Please select a user";
    return false;
  }
  if (form.value.weightBefore <= 0) {
    formError.value = "Weight before must be greater than 0";
    return false;
  }
  if (form.value.weightAfter < 0) {
    formError.value = "Weight after cannot be negative";
    return false;
  }
  return true;
};

// Handle form submit
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  submitting.value = true;
  formError.value = "";

  try {
    if (isEditMode.value) {
      // Update cleaning
      const { data, error: apiError } = await $api
        .cleanings({
          id: String(form.value.id),
        })
        .put({
          weightBefore: form.value.weightBefore,
          weightAfter: form.value.weightAfter,
          carat: form.value.carat,
          userId: form.value.userId,
          categoryId: form.value.categoryId,
        });

      if (apiError) {
        formError.value =
          apiError.value.message || "Gagal memperbarui pembersihan";
        return;
      }

      // Update cleaning in list
      const index = cleanings.value.findIndex((c) => c.id === form.value.id);
      if (index !== -1 && data.data) {
        cleanings.value[index] = data.data as any;
      }

      ElMessage.success("Pembersihan berhasil diperbarui");
    } else {
      // Create cleaning
      const { data, error: apiError } = await $api.cleanings.post({
        weightBefore: form.value.weightBefore,
        weightAfter: form.value.weightAfter,
        carat: form.value.carat,
        userId: form.value.userId,
        categoryId: form.value.categoryId,
      });

      if (apiError) {
        formError.value = apiError.value.message || "Gagal membuat pembersihan";
        return;
      }

      // Add cleaning to list
      if (data.data) {
        cleanings.value.unshift(data.data as any);
      }
      ElMessage.success("Pembersihan berhasil dibuat");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "An error occurred";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (cleaning: Cleaning) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus catatan pembersihan ini? Tindakan ini tidak dapat dibatalkan.`,
      "Hapus Pembersihan",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // Proceed with deletion
    await handleDelete(cleaning);
  } catch {
    // User cancelled
  }
};

// Handle delete
const handleDelete = async (cleaning: Cleaning) => {
  const loading = ElMessage({
    message: "Deleting cleaning...",
    type: "info",
    duration: 0,
  });

  try {
    const { error: apiError } = await $api
      .cleanings({
        id: String(cleaning.id),
      })
      .delete();

    if (apiError) {
      loading.close();
      ElMessage.error(apiError.value.message || "Gagal menghapus pembersihan");
      return;
    }

    // Remove cleaning from list
    cleanings.value = cleanings.value.filter((c) => c.id !== cleaning.id);
    loading.close();
    ElMessage.success("Pembersihan berhasil dihapus");
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

// Fetch data on mount
onMounted(async () => {
  await Promise.all([fetchCleanings(), fetchUsers(), fetchCategories()]);
});
</script>

<style scoped>
:deep(.el-input-number) {
  width: 100%;
}
</style>
