<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p class="text-gray-600 mt-1">Kelola pengguna dan izin sistem</p>
      </div>
      <el-button type="warning" @click="openCreateModal">
        <template #icon>
          <UserPlus :size="18" />
        </template>
        Tambah Pengguna
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
        Coba Lagi
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
        <el-table-column prop="name" label="Nama" min-width="200">
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

        <el-table-column label="Dibuat Pada" width="180">
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
      :title="isEditMode ? 'Ubah Pengguna' : 'Buat Pengguna'"
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
        <el-form-item label="Nama" required>
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
                  ? "Biarkan kosong untuk mempertahankan kata sandi saat ini"
                  : "Minimal 6 karakter"
              }}
            </span>
          </template>
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
      error.value = "Gagal memuat pengguna";
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
    formError.value = "Harap isi semua kolom yang wajib diisi";
    return;
  }

  if (!isEditMode.value && !form.value.password) {
    formError.value = "Kata sandi wajib diisi";
    return;
  }

  if (form.value.password && form.value.password.length < 6) {
    formError.value = "Kata sandi harus minimal 6 karakter";
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
        formError.value =
          apiError.value.message || "Gagal memperbarui pengguna";
        return;
      }

      // Update user in list
      const index = users.value.findIndex((u) => u.id === form.value.id);
      if (index !== -1 && data.data) {
        users.value[index] = data.data as any;
      }

      ElMessage.success("Pengguna berhasil diperbarui");
    } else {
      // Create user
      const { data, error: apiError } = await $api.users.post({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
      });

      if (apiError) {
        formError.value = apiError.value.message || "Gagal membuat pengguna";
        return;
      }

      // Add user to list
      if (data.data) {
        users.value.unshift(data.data as any);
      }
      ElMessage.success("Pengguna berhasil dibuat");
    }

    closeModal();
  } catch (err: any) {
    formError.value = err.message || "Terjadi kesalahan";
  } finally {
    submitting.value = false;
  }
};

// Confirm delete
const confirmDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus ${user.name}? Tindakan ini tidak dapat dibatalkan.`,
      "Hapus Pengguna",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
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
      ElMessage.error(apiError.value.message || "Gagal menghapus pengguna");
      return;
    }

    // Remove user from list
    users.value = users.value.filter((u) => u.id !== user.id);
    loading.close();
    ElMessage.success("Pengguna berhasil dihapus");
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
