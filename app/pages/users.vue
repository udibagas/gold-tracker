<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600 mt-1">Manage system users and permissions</p>
      </div>
      <el-button type="warning" @click="openCreateModal">
        <template #icon>
          <UserPlus :size="18" />
        </template>
        Add User
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
      <el-button type="primary" size="small" @click="fetchUsers">
        Retry
      </el-button>
    </el-alert>

    <!-- Users Table -->
    <el-card shadow="hover">
      <el-table
        :data="users"
        v-loading="loading"
        style="width: 100%"
        stripe
        :empty-text="'No users found'"
      >
        <el-table-column prop="name" label="Name" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar
                :size="40"
                style="background-color: #fef3c7; color: #d97706"
              >
                <User :size="20" />
              </el-avatar>
              <span class="font-medium">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="Email" min-width="250" />

        <el-table-column label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="150" align="center">
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
      :title="isEditMode ? 'Edit User' : 'Create User'"
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

      <el-form :model="form" label-width="100px" label-position="top">
        <el-form-item label="Name" required>
          <el-input v-model="form.name" placeholder="John Doe" />
        </el-form-item>

        <el-form-item label="Email" required>
          <el-input
            v-model="form.email"
            type="email"
            placeholder="john@example.com"
          />
        </el-form-item>

        <el-form-item
          :label="isEditMode ? 'Password (optional)' : 'Password'"
          :required="!isEditMode"
        >
          <el-input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            show-password
          />
          <template #extra>
            <span class="text-xs text-gray-500">
              {{
                isEditMode
                  ? "Leave blank to keep current password"
                  : "Minimum 6 characters"
              }}
            </span>
          </template>
        </el-form-item>
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
import { UserPlus, User, Edit2, Trash2 } from "@lucide/vue";
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({
  layout: "default",
});

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const { $api } = useNuxtApp();

// State
const users = ref<User[]>([]);
const loading = ref(false);
const error = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formError = ref("");

const form = ref({
  id: 0,
  name: "",
  email: "",
  password: "",
});

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: apiError } = await $api.users.get();

    if (apiError) {
      error.value = "Failed to load users";
      return;
    }

    users.value = (data.data || []) as any;
  } catch (err: any) {
    error.value = err.message || "An error occurred";
  } finally {
    loading.value = false;
  }
};

// Open create modal
const openCreateModal = () => {
  isEditMode.value = false;
  form.value = {
    id: 0,
    name: "",
    email: "",
    password: "",
  };
  formError.value = "";
  showModal.value = true;
};

// Open edit modal
const openEditModal = (user: User) => {
  isEditMode.value = true;
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: "",
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
  if (!form.value.name || !form.value.email) {
    formError.value = "Please fill in all required fields";
    return;
  }

  if (!isEditMode.value && !form.value.password) {
    formError.value = "Password is required";
    return;
  }

  if (form.value.password && form.value.password.length < 6) {
    formError.value = "Password must be at least 6 characters";
    return;
  }

  submitting.value = true;
  formError.value = "";

  try {
    if (isEditMode.value) {
      // Update user
      const { data, error: apiError } = await $api
        .users({ id: String(form.value.id) })
        .put({
          name: form.value.name,
          email: form.value.email,
          password: form.value.password || undefined,
        });

      if (apiError) {
        formError.value = apiError.value.message || "Failed to update user";
        return;
      }

      // Update user in list
      const index = users.value.findIndex((u) => u.id === form.value.id);
      if (index !== -1 && data.data) {
        users.value[index] = data.data as any;
      }

      ElMessage.success("User updated successfully");
    } else {
      // Create user
      const { data, error: apiError } = await $api.users.post({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
      });

      if (apiError) {
        formError.value = apiError.value.message || "Failed to create user";
        return;
      }

      // Add user to list
      if (data.data) {
        users.value.unshift(data.data as any);
      }
      ElMessage.success("User created successfully");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "An error occurred";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      "Delete User",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // Proceed with deletion
    await handleDelete(user);
  } catch {
    // User cancelled
  }
};

// Handle delete
const handleDelete = async (user: User) => {
  const loading = ElMessage({
    message: "Deleting user...",
    type: "info",
    duration: 0,
  });

  try {
    const { error: apiError } = await $api
      .users({ id: String(user.id) })
      .delete();

    if (apiError) {
      loading.close();
      ElMessage.error(apiError.value.message || "Failed to delete user");
      return;
    }

    // Remove user from list
    users.value = users.value.filter((u) => u.id !== user.id);
    loading.close();
    ElMessage.success("User deleted successfully");
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

// Fetch users on mount
onMounted(() => {
  fetchUsers();
});
</script>
