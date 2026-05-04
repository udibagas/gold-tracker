<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600 mt-1">Welcome back, {{ user?.name }}!</p>
    </div>

    <!-- Dashboard Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Stats Cards -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Purchase</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div
            class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <ShoppingCart :size="24" class="text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Cleaning</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div
            class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
          >
            <Sparkles :size="24" class="text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Repair</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div
            class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center"
          >
            <Wrench :size="24" class="text-amber-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Melting</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div
            class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
          >
            <Flame :size="24" class="text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- API Test -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">API Status</h2>
      <p class="text-gray-600">
        {{ data?.message || "API connected successfully!" }}
      </p>
      <p class="text-sm text-green-600 mt-2">✓ You are authenticated</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Sparkles, Wrench, Flame } from "@lucide/vue";

definePageMeta({
  layout: "default",
});

const { $api } = useNuxtApp();
const { user } = useAuth();

const { data } = await useAsyncData(async () => {
  const { data, error } = await $api.hello.get();

  if (error) throw new Error("Failed to call API");

  return data;
});
</script>
