<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gold Repairs</h1>
        <p class="text-gray-600 mt-1">Track gold repair operations</p>
      </div>
      <el-button type="warning" @click="openCreateModal">
        <template #icon>
          <Wrench :size="18" />
        </template>
        Add Repair
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
      <el-button type="primary" size="small" @click="fetchRepairs">
        Retry
      </el-button>
    </el-alert>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center"
          >
            <Wrench :size="24" class="text-orange-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ repairs.length }}
            </div>
            <div class="text-sm text-gray-600">Total Repairs</div>
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
            <div class="text-sm text-gray-600">Total Weight Before</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"
          >
            <Scale :size="24" class="text-green-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ totalWeightAfter.toFixed(2) }}g
            </div>
            <div class="text-sm text-gray-600">Total Weight After</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg"
            :class="totalWeightChange >= 0 ? 'bg-green-100' : 'bg-red-100'"
          >
            <component
              :is="totalWeightChange >= 0 ? TrendingUp : TrendingDown"
              :size="24"
              :class="
                totalWeightChange >= 0 ? 'text-green-600' : 'text-red-600'
              "
              class="mx-auto mt-3"
            />
          </div>
          <div>
            <div
              class="text-2xl font-bold"
              :class="
                totalWeightChange >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ totalWeightChange >= 0 ? "+" : ""
              }}{{ totalWeightChange.toFixed(2) }}g
            </div>
            <div class="text-sm text-gray-600">Total Weight Change</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Repairs Table -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">All Repairs</span>
          <el-tag>{{ repairs.length }} Total</el-tag>
        </div>
      </template>

      <el-table :data="repairs" v-loading="loading" style="width: 100%" stripe>
        <el-table-column label="Category" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-tag type="warning" size="small">{{
                row.category.name
              }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Weight Before" width="140" align="right">
          <template #default="{ row }">
            <span class="font-semibold">{{ row.weightBefore }}g</span>
          </template>
        </el-table-column>

        <el-table-column label="Weight After" width="140" align="right">
          <template #default="{ row }">
            <span
              class="font-semibold"
              :class="
                row.weightAfter >= row.weightBefore
                  ? 'text-green-600'
                  : 'text-orange-600'
              "
            >
              {{ row.weightAfter }}g
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Weight Change" width="150" align="right">
          <template #default="{ row }">
            <span
              :class="
                getWeightChange(row) >= 0 ? 'text-green-600' : 'text-red-600'
              "
              class="font-semibold"
            >
              {{ getWeightChange(row) >= 0 ? "+" : ""
              }}{{ getWeightChange(row).toFixed(2) }}g
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Change %" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getChangePercentageType(row)" size="small">
              {{ calculateChangePercentage(row) >= 0 ? "+" : ""
              }}{{ calculateChangePercentage(row) }}%
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Carat" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCaratTagType(row.carat)" size="small">
              {{ row.carat }}K
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="User" width="150">
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

        <el-table-column label="Date" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="Actions"
          width="150"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="warning"
              size="small"
              circle
              @click="openEditModal(row)"
              title="Edit"
            >
              <Edit2 :size="16" />
            </el-button>
            <el-button
              type="danger"
              size="small"
              circle
              @click="confirmDelete(row)"
              title="Delete"
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
      :title="isEditMode ? 'Edit Repair' : 'Create Repair'"
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
        <el-form-item label="Category" required>
          <el-select
            v-model="form.categoryId"
            placeholder="Select category"
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

        <el-form-item label="User" required>
          <el-select
            v-model="form.userId"
            placeholder="Select user"
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

        <el-form-item label="Weight Before (g)" required>
          <el-input-number
            v-model="form.weightBefore"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Weight After (g)" required>
          <el-input-number
            v-model="form.weightAfter"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Carat" required>
          <el-select
            v-model="form.carat"
            placeholder="Select carat"
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
          :type="getFormAlertType()"
          :title="getFormChangeText()"
          :closable="false"
          class="mt-2"
        />
      </el-form>

      <template #footer>
        <el-button @click="closeModal">Cancel</el-button>
        <el-button type="warning" @click="handleSubmit" :loading="submitting">
          {{ isEditMode ? "Update" : "Create" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Wrench,
  Weight,
  Scale,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
} from "@lucide/vue";
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({
  layout: "default",
});

interface Repair {
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
const repairs = ref<Repair[]>([]);
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
  return repairs.value.reduce((sum, r) => sum + r.weightBefore, 0);
});

const totalWeightAfter = computed(() => {
  return repairs.value.reduce((sum, r) => sum + r.weightAfter, 0);
});

const totalWeightChange = computed(() => {
  return totalWeightAfter.value - totalWeightBefore.value;
});

// Get weight change for a repair
const getWeightChange = (repair: Repair) => {
  return repair.weightAfter - repair.weightBefore;
};

// Calculate change percentage
const calculateChangePercentage = (repair: Repair) => {
  if (repair.weightBefore === 0) return "0.00";
  const change =
    ((repair.weightAfter - repair.weightBefore) / repair.weightBefore) * 100;
  return change.toFixed(2);
};

// Calculate form change percentage
const calculateFormChangePercentage = () => {
  if (form.value.weightBefore === 0) return "0.00";
  const change =
    ((form.value.weightAfter - form.value.weightBefore) /
      form.value.weightBefore) *
    100;
  return change.toFixed(2);
};

// Get form alert type
const getFormAlertType = () => {
  const change = form.value.weightAfter - form.value.weightBefore;
  if (change > 0) return "success";
  if (change < 0) return "warning";
  return "info";
};

// Get form change text
const getFormChangeText = () => {
  const change = form.value.weightAfter - form.value.weightBefore;
  const percentage = calculateFormChangePercentage();
  return `Weight change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}g (${percentage >= "0" ? "+" : ""}${percentage}%)`;
};

// Get change percentage tag type
const getChangePercentageType = (repair: Repair) => {
  const change = parseFloat(calculateChangePercentage(repair));
  if (change > 0) return "success";
  if (change < -5) return "danger";
  if (change < 0) return "warning";
  return "info";
};

// Fetch repairs
const fetchRepairs = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: apiError } = await $api.repairs.get();

    if (apiError) {
      error.value = "Failed to load repairs";
      return;
    }

    repairs.value = (data.data || []) as any;
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
const openEditModal = (repair: Repair) => {
  isEditMode.value = true;
  form.value = {
    id: repair.id,
    weightBefore: repair.weightBefore,
    weightAfter: repair.weightAfter,
    carat: repair.carat,
    userId: repair.user.id,
    categoryId: repair.category.id,
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
      // Update repair
      const { data, error: apiError } = await $api
        .repairs({
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
        formError.value = apiError.value.message || "Failed to update repair";
        return;
      }

      // Update repair in list
      const index = repairs.value.findIndex((r) => r.id === form.value.id);
      if (index !== -1 && data.data) {
        repairs.value[index] = data.data as any;
      }

      ElMessage.success("Repair updated successfully");
    } else {
      // Create repair
      const { data, error: apiError } = await $api.repairs.post({
        weightBefore: form.value.weightBefore,
        weightAfter: form.value.weightAfter,
        carat: form.value.carat,
        userId: form.value.userId,
        categoryId: form.value.categoryId,
      });

      if (apiError) {
        formError.value = apiError.value.message || "Failed to create repair";
        return;
      }

      // Add repair to list
      if (data.data) {
        repairs.value.unshift(data.data as any);
      }
      ElMessage.success("Repair created successfully");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "An error occurred";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (repair: Repair) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete this repair record? This action cannot be undone.`,
      "Delete Repair",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // Proceed with deletion
    await handleDelete(repair);
  } catch {
    // User cancelled
  }
};

// Handle delete
const handleDelete = async (repair: Repair) => {
  const loading = ElMessage({
    message: "Deleting repair...",
    type: "info",
    duration: 0,
  });

  try {
    const { error: apiError } = await $api
      .repairs({
        id: String(repair.id),
      })
      .delete();

    if (apiError) {
      loading.close();
      ElMessage.error(apiError.value.message || "Failed to delete repair");
      return;
    }

    // Remove repair from list
    repairs.value = repairs.value.filter((r) => r.id !== repair.id);
    loading.close();
    ElMessage.success("Repair deleted successfully");
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
  await Promise.all([fetchRepairs(), fetchUsers(), fetchCategories()]);
});
</script>

<style scoped>
:deep(.el-input-number) {
  width: 100%;
}
</style>
