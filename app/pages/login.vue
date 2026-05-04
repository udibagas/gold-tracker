<template>
  <div class="max-w-md w-full space-y-8">
    <!-- Logo and Header -->
    <div class="text-center">
      <div
        class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
      >
        <LockKeyhole :size="40" class="text-white" />
      </div>
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
      <p class="mt-2 text-sm text-gray-600">
        Sign in to your account to continue
      </p>
    </div>

    <!-- Login Form -->
    <div class="mt-8 bg-white rounded-2xl shadow-xl p-8">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Email Input -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Email address
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Mail :size="20" class="text-gray-400" />
            </div>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Lock :size="20" class="text-gray-400" />
            </div>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Eye
                v-if="!showPassword"
                :size="20"
                class="text-gray-400 hover:text-gray-600"
              />
              <EyeOff
                v-else
                :size="20"
                class="text-gray-400 hover:text-gray-600"
              />
            </button>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              for="remember-me"
              class="ml-2 block text-sm text-gray-700 cursor-pointer"
            >
              Remember me
            </label>
          </div>
          <div class="text-sm">
            <a
              href="#"
              class="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2
              v-if="loading"
              :size="20"
              class="animate-spin -ml-1 mr-3 text-white"
            />
            {{ loading ? "Signing in..." : "Sign in" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LockKeyhole, Mail, Lock, Eye, EyeOff, Loader2 } from "@lucide/vue";

definePageMeta({
  layout: "auth",
});

const form = ref({
  email: "",
  password: "",
  rememberMe: false,
});

const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const { login } = useAuth();

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const result = await login({
      email: form.value.email,
      password: form.value.password,
    });

    if (result.success) {
      // Redirect to home/dashboard on success
      await navigateTo("/");
    } else {
      errorMessage.value = result.message || "Login failed. Please try again.";
    }
  } catch (error: any) {
    console.error("Login error:", error);
    errorMessage.value = "An unexpected error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
