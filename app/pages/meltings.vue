<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gold Melting</h1>
        <p class="text-gray-600 mt-1">Track gold melting operations</p>
      </div>
      <el-button type="danger" @click="openCreateModal">
        <template #icon>
          <Flame :size="18" />
        </template>
        Add Melting
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
      <el-button type="primary" size="small" @click="fetchMeltings">
        Retry
      </el-button>
    </el-alert>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center"
          >
            <Flame :size="24" class="text-red-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ meltings.length }}
            </div>
            <div class="text-sm text-gray-600">Total Meltings</div>
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
            <div class="text-sm text-gray-600">Total Input Weight</div>
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
            <div class="text-sm text-gray-600">Total Output Weight</div>
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
            <div class="text-sm text-gray-600">
              Total Loss ({{ averageLossPercentage }}%)
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Meltings Table -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">All Meltings</span>
          <el-tag>{{ meltings.length }} Total</el-tag>
        </div>
      </template>

      <el-table :data="meltings" v-loading="loading" style="width: 100%" stripe>
        <el-table-column label="Input Weight" width="140" align="right">
          <template #default="{ row }">
            <span class="font-semibold">{{ row.weightBefore }}g</span>
          </template>
        </el-table-column>

        <el-table-column label="Output Weight" width="140" align="right">
          <template #default="{ row }">
            <span class="font-semibold text-amber-600"
              >{{ row.weightAfter }}g</span
            >
          </template>
        </el-table-column>

        <el-table-column label="Weight Loss" width="140" align="right">
          <template #default="{ row }">
            <span class="text-red-600 font-semibold">
              {{ (row.weightBefore - row.weightAfter).toFixed(2) }}g
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Loss %" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getLossPercentageType(row)" size="small">
              {{ calculateLossPercentage(row) }}%
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Yield %" width="110" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">
              {{ calculateYieldPercentage(row) }}%
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

        <el-table-column label="User" width="180">
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
              type="danger"
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
              plain
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
      :title="isEditMode ? 'Edit Melting' : 'Create Melting'"
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

        <el-form-item label="Input Weight (g)" required>
          <el-input-number
            v-model="form.weightBefore"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
            placeholder="Weight before melting"
          />
        </el-form-item>

        <el-form-item label="Output Weight (g)" required>
          <el-input-number
            v-model="form.weightAfter"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
            placeholder="Weight after melting"
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
          type="warning"
          :closable="false"
          class="mt-2"
        >
          <div class="text-sm">
            <div>
              <strong>Weight loss:</strong>
              {{ (form.weightBefore - form.weightAfter).toFixed(2) }}g ({{
                calculateFormLossPercentage()
              }}%)
            </div>
            <div>
              <strong>Yield:</strong> {{ calculateFormYieldPercentage() }}%
            </div>
          </div>
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">Cancel</el-button>
        <el-button type="danger" @click="handleSubmit" :loading="submitting">
          {{ isEditMode ? "Update" : "Create" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Flame, Weight, Scale, TrendingDown, Edit2, Trash2 } from "@lucide/vue";
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({
  layout: "default",
});

interface Melting {
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
}

interface User {
  id: number;
  name: string;
  email: string;
}

const { $api } = useNuxtApp();

// State
const meltings = ref<Melting[]>([]);
const users = ref<User[]>([]);
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
});

// Computed properties
const totalWeightBefore = computed(() => {
  return meltings.value.reduce((sum, m) => sum + m.weightBefore, 0);
});

const totalWeightAfter = computed(() => {
  return meltings.value.reduce((sum, m) => sum + m.weightAfter, 0);
});

const totalWeightLoss = computed(() => {
  return totalWeightBefore.value - totalWeightAfter.value;
});

const averageLossPercentage = computed(() => {
  if (totalWeightBefore.value === 0) return "0.00";
  const loss = (totalWeightLoss.value / totalWeightBefore.value) * 100;
  return loss.toFixed(2);
});

// Calculate loss percentage
const calculateLossPercentage = (melting: Melting) => {
  if (melting.weightBefore === 0) return "0.00";
  const loss =
    ((melting.weightBefore - melting.weightAfter) / melting.weightBefore) * 100;
  return loss.toFixed(2);
};

// Calculate yield percentage
const calculateYieldPercentage = (melting: Melting) => {
  if (melting.weightBefore === 0) return "0.00";
  const yield_ = (melting.weightAfter / melting.weightBefore) * 100;
  return yield_.toFixed(2);
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

// Calculate form yield percentage
const calculateFormYieldPercentage = () => {
  if (form.value.weightBefore === 0) return "0.00";
  const yield_ = (form.value.weightAfter / form.value.weightBefore) * 100;
  return yield_.toFixed(2);
};

// Get loss percentage tag type
const getLossPercentageType = (melting: Melting) => {
  const loss = parseFloat(calculateLossPercentage(melting));
  if (loss > 10) return "danger";
  if (loss > 5) return "warning";
  return "success";
};

// Fetch meltings
const fetchMeltings = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: apiError } = await $api.meltings.get();

    if (apiError) {
      error.value = "Failed to load meltings";
      return;
    }

    meltings.value = (data.data || []) as any;
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
  };
  formError.value = "";
  showModal.value = true;
};

// Open edit modal
const openEditModal = (melting: Melting) => {
  isEditMode.value = true;
  form.value = {
    id: melting.id,
    weightBefore: melting.weightBefore,
    weightAfter: melting.weightAfter,
    carat: melting.carat,
    userId: melting.user.id,
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
  if (!form.value.userId) {
    formError.value = "Please select a user";
    return false;
  }
  if (form.value.weightBefore <= 0) {
    formError.value = "Input weight must be greater than 0";
    return false;
  }
  if (form.value.weightAfter < 0) {
    formError.value = "Output weight cannot be negative";
    return false;
  }
  if (form.value.weightAfter > form.value.weightBefore) {
    formError.value = "Output weight cannot be greater than input weight";
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
      // Update melting
      const { data, error: apiError } = await $api
        .meltings({
          id: String(form.value.id),
        })
        .put({
          weightBefore: form.value.weightBefore,
          weightAfter: form.value.weightAfter,
          carat: form.value.carat,
          userId: form.value.userId,
        });

      if (apiError) {
        formError.value = apiError.value.message || "Failed to update melting";
        return;
      }

      // Update melting in list
      const index = meltings.value.findIndex((m) => m.id === form.value.id);
      if (index !== -1 && data.data) {
        meltings.value[index] = data.data as any;
      }

      ElMessage.success("Melting updated successfully");
    } else {
      // Create melting
      const { data, error: apiError } = await $api.meltings.post({
        weightBefore: form.value.weightBefore,
        weightAfter: form.value.weightAfter,
        carat: form.value.carat,
        userId: form.value.userId,
      });

      if (apiError) {
        formError.value = apiError.value.message || "Failed to create melting";
        return;
      }

      // Add melting to list
      if (data.data) {
        meltings.value.unshift(data.data as any);
      }
      ElMessage.success("Melting created successfully");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "An error occurred";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (melting: Melting) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete this melting record? This action cannot be undone.`,
      "Delete Melting",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // Proceed with deletion
    await handleDelete(melting);
  } catch {
    // User cancelled
  }
};

// Handle delete
const handleDelete = async (melting: Melting) => {
  const loading = ElMessage({
    message: "Deleting melting...",
    type: "info",
    duration: 0,
  });

  try {
    const { error: apiError } = await $api
      .meltings({
        id: String(melting.id),
      })
      .delete();

    if (apiError) {
      loading.close();
      ElMessage.error(apiError.value.message || "Failed to delete melting");
      return;
    }

    // Remove melting from list
    meltings.value = meltings.value.filter((m) => m.id !== melting.id);
    loading.close();
    ElMessage.success("Melting deleted successfully");
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
  await Promise.all([fetchMeltings(), fetchUsers()]);
});
</script>

<style scoped>
:deep(.el-input-number) {
  width: 100%;
}
</style>
