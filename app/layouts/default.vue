<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header
      class="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16"
    >
      <div class="flex items-center justify-between h-full px-4">
        <!-- Logo and Toggle -->
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu :size="24" class="text-gray-600" />
          </button>
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center"
            >
              <Gem :size="20" class="text-white" />
            </div>
            <span
              class="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent"
            >
              Gold Tracker
            </span>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          <div class="hidden sm:block text-right">
            <p class="text-sm font-medium text-gray-700">{{ user?.name }}</p>
            <p class="text-xs text-gray-500">{{ user?.email }}</p>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut :size="18" />
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-30',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <nav class="p-4 space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
            isActiveRoute(item.path)
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-gray-700 hover:bg-gray-50',
          ]"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
    ></div>

    <!-- Main Content -->
    <main class="pt-16 lg:pl-64 min-h-screen transition-all duration-300">
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  Menu,
  Gem,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  Wrench,
  Flame,
  FileText,
  Settings,
  Users,
  Tags,
} from "@lucide/vue";

const { user, logout } = useAuth();
const router = useRouter();
const route = useRoute();

// Sidebar state
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Close sidebar on route change (mobile)
watch(
  () => route.path,
  () => {
    if (window.innerWidth < 1024) {
      isSidebarOpen.value = false;
    }
  },
);

// Menu items
const menuItems = [
  {
    label: "Dasbor",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Pembelian",
    path: "/purchases",
    icon: ShoppingCart,
  },
  {
    label: "Pembersihan",
    path: "/cleanings",
    icon: Sparkles,
  },
  {
    label: "Perbaikan",
    path: "/repairs",
    icon: Wrench,
  },
  {
    label: "Peleburan",
    path: "/meltings",
    icon: Flame,
  },
  {
    label: "Laporan",
    path: "/report",
    icon: FileText,
  },
  {
    label: "Kategori",
    path: "/categories",
    icon: Tags,
  },
  {
    label: "Manajemen Pengguna",
    path: "/users",
    icon: Users,
  },
  {
    label: "Pengaturan",
    path: "/settings",
    icon: Settings,
  },
];

const isActiveRoute = (path: string) => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  await logout();
  router.push("/login");
};
</script>
