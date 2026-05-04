<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Header -->
      <div class="text-center">
        <div
          class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <UserPlus :size="40" class="text-white" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Join us and start tracking your gold
        </p>
      </div>

      <!-- Register Form -->
      <div class="mt-8 bg-white rounded-2xl shadow-xl p-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p class="text-sm text-green-600">{{ successMessage }}</p>
          </div>

          <!-- Name Input -->
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <User :size="20" class="text-gray-400" />
              </div>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
                placeholder="John Doe"
              />
            </div>
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
                minlength="6"
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
            <p class="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters
            </p>
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
              {{ loading ? "Creating account..." : "Sign up" }}
            </button>
          </div>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <NuxtLink
              to="/login"
              class="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-gray-500">
        By signing up, you agree to our
        <a href="#" class="text-blue-600 hover:text-blue-500"
          >Terms of Service</a
        >
        and
        <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Loader2 } from "@lucide/vue";

const form = ref({
  name: "",
  email: "",
  password: "",
});

const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const { register } = useAuth();

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const result = await register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });

    if (result.success) {
      successMessage.value = "Account created successfully! Redirecting...";
      // Redirect to home after a short delay
      setTimeout(() => {
        navigateTo("/");
      }, 1500);
    } else {
      errorMessage.value =
        result.message || "Registration failed. Please try again.";
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    errorMessage.value = "An unexpected error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
