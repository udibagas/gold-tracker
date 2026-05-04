<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pembelian Emas</h1>
        <p class="text-gray-600 mt-1">Lacak dan kelola pembelian emas</p>
      </div>
      <el-button type="primary" @click="openCreateModal">
        <template #icon>
          <ShoppingCart :size="18" />
        </template>
        Tambah Pembelian
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
      <el-button type="primary" size="small" @click="fetchPurchases">
        Coba Lagi
      </el-button>
    </el-alert>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"
          >
            <ShoppingCart :size="24" class="text-blue-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ purchases.length }}
            </div>
            <div class="text-sm text-gray-600">Total Pembelian</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center"
          >
            <Weight :size="24" class="text-amber-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ totalRealWeight.toFixed(2) }}g
            </div>
            <div class="text-sm text-gray-600">Total Berat Asli</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"
          >
            <DollarSign :size="24" class="text-green-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              ${{ totalPurchasePrice.toFixed(2) }}
            </div>
            <div class="text-sm text-gray-600">Total Harga Pembelian</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center"
          >
            <TrendingUp :size="24" class="text-purple-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ averageCarat.toFixed(1) }}K
            </div>
            <div class="text-sm text-gray-600">Rata-rata Karat</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Purchases Table -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">Semua Pembelian</span>
          <el-tag>{{ purchases.length }} Total</el-tag>
        </div>
      </template>

      <el-table
        :data="purchases"
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

        <el-table-column label="Berat Kwitansi" width="120" align="right">
          <template #default="{ row }"> {{ row.receiptWeight }}g </template>
        </el-table-column>

        <el-table-column label="Berat Asli" width="120" align="right">
          <template #default="{ row }">
            <span class="font-semibold">{{ row.realWeight }}g</span>
          </template>
        </el-table-column>

        <el-table-column label="Karat" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCaratTagType(row.carat)" size="small">
              {{ row.carat }}K
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Harga Kwitansi" width="130" align="right">
          <template #default="{ row }">
            ${{ row.recieptPrice.toFixed(2) }}
          </template>
        </el-table-column>

        <el-table-column label="Harga Pembelian" width="140" align="right">
          <template #default="{ row }">
            <span class="font-semibold text-green-600">
              ${{ row.purchasePrice.toFixed(2) }}
            </span>
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
              type="primary"
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
      :title="isEditMode ? 'Ubah Pembelian' : 'Buat Pembelian'"
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

        <el-form-item label="Berat Kwitansi (g)" required>
          <el-input-number
            v-model="form.receiptWeight"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Berat Asli (g)" required>
          <el-input-number
            v-model="form.realWeight"
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

        <el-divider />

        <el-form-item label="Harga Kwitansi ($)" required>
          <el-input-number
            v-model="form.recieptPrice"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Harga Pembelian ($)" required>
          <el-input-number
            v-model="form.purchasePrice"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">Batal</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditMode ? "Perbarui" : "Buat" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ShoppingCart,
  Weight,
  DollarSign,
  TrendingUp,
  Edit2,
  Trash2,
} from "@lucide/vue";
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({
  layout: "default",
});

interface Purchase {
  id: number;
  receiptWeight: number;
  realWeight: number;
  carat: number;
  recieptPrice: number;
  purchasePrice: number;
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
const purchases = ref<Purchase[]>([]);
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
  receiptWeight: 0,
  realWeight: 0,
  carat: 24,
  recieptPrice: 0,
  purchasePrice: 0,
  userId: 0,
  categoryId: 0,
});

// Computed properties
const totalRealWeight = computed(() => {
  return purchases.value.reduce((sum, p) => sum + p.realWeight, 0);
});

const totalPurchasePrice = computed(() => {
  return purchases.value.reduce((sum, p) => sum + p.purchasePrice, 0);
});

const averageCarat = computed(() => {
  if (purchases.value.length === 0) return 0;
  return (
    purchases.value.reduce((sum, p) => sum + p.carat, 0) /
    purchases.value.length
  );
});

// Fetch purchases
const fetchPurchases = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: apiError } = await $api.purchases.get();

    if (apiError) {
      error.value = "Gagal memuat pembelian";
      return;
    }

    purchases.value = (data.data || []) as any;
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
    receiptWeight: 0,
    realWeight: 0,
    carat: 24,
    recieptPrice: 0,
    purchasePrice: 0,
    userId: users.value[0]?.id || 0,
    categoryId: categories.value[0]?.id || 0,
  };
  formError.value = "";
  showModal.value = true;
};

// Open edit modal
const openEditModal = (purchase: Purchase) => {
  isEditMode.value = true;
  form.value = {
    id: purchase.id,
    receiptWeight: purchase.receiptWeight,
    realWeight: purchase.realWeight,
    carat: purchase.carat,
    recieptPrice: purchase.recieptPrice,
    purchasePrice: purchase.purchasePrice,
    userId: purchase.user.id,
    categoryId: purchase.category.id,
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
  if (form.value.receiptWeight <= 0) {
    formError.value = "Receipt weight must be greater than 0";
    return false;
  }
  if (form.value.realWeight <= 0) {
    formError.value = "Real weight must be greater than 0";
    return false;
  }
  if (form.value.recieptPrice <= 0) {
    formError.value = "Receipt price must be greater than 0";
    return false;
  }
  if (form.value.purchasePrice <= 0) {
    formError.value = "Purchase price must be greater than 0";
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
      // Update purchase
      const { data, error: apiError } = await $api
        .purchases({
          id: String(form.value.id),
        })
        .put({
          receiptWeight: form.value.receiptWeight,
          realWeight: form.value.realWeight,
          carat: form.value.carat,
          recieptPrice: form.value.recieptPrice,
          purchasePrice: form.value.purchasePrice,
          userId: form.value.userId,
          categoryId: form.value.categoryId,
        });

      if (apiError) {
        formError.value =
          apiError.value.message || "Gagal memperbarui pembelian";
        return;
      }

      // Update purchase in list
      const index = purchases.value.findIndex((p) => p.id === form.value.id);
      if (index !== -1 && data.data) {
        purchases.value[index] = data.data as any;
      }

      ElMessage.success("Pembelian berhasil diperbarui");
    } else {
      // Create purchase
      const { data, error: apiError } = await $api.purchases.post({
        receiptWeight: form.value.receiptWeight,
        realWeight: form.value.realWeight,
        carat: form.value.carat,
        recieptPrice: form.value.recieptPrice,
        purchasePrice: form.value.purchasePrice,
        userId: form.value.userId,
        categoryId: form.value.categoryId,
      });

      if (apiError) {
        formError.value = apiError.value.message || "Gagal membuat pembelian";
        return;
      }

      // Add purchase to list
      if (data.data) {
        purchases.value.unshift(data.data as any);
      }
      ElMessage.success("Pembelian berhasil dibuat");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "An error occurred";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (purchase: Purchase) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus pembelian ini? Tindakan ini tidak dapat dibatalkan.`,
      "Hapus Pembelian",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // Proceed with deletion
    await handleDelete(purchase);
  } catch {
    // User cancelled
  }
};

// Handle delete
const handleDelete = async (purchase: Purchase) => {
  const loading = ElMessage({
    message: "Deleting purchase...",
    type: "info",
    duration: 0,
  });

  try {
    const { error: apiError } = await $api
      .purchases({
        id: String(purchase.id),
      })
      .delete();

    if (apiError) {
      loading.close();
      ElMessage.error(apiError.value.message || "Gagal menghapus pembelian");
      return;
    }

    // Remove purchase from list
    purchases.value = purchases.value.filter((p) => p.id !== purchase.id);
    loading.close();
    ElMessage.success("Pembelian berhasil dihapus");
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
  await Promise.all([fetchPurchases(), fetchUsers(), fetchCategories()]);
});
</script>

<style scoped>
:deep(.el-input-number) {
  width: 100%;
}
</style>
