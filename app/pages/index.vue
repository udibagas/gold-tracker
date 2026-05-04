<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Gold Tracker</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">Welcome, {{ user?.name }}</span>
            <el-button @click="handleLogout" type="danger">Logout</el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Dashboard</h2>
        <p>{{ data?.message }}</p>
        <p class="mt-4 text-gray-600">You are successfully authenticated!</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
const { user, logout } = useAuth();

const { data } = await useAsyncData(async () => {
  const { data, error } = await $api.hello.get();

  if (error) throw new Error("Failed to call API");

  return data;
});

const handleLogout = async () => {
  await logout();
  navigateTo("/login");
};
</script>
