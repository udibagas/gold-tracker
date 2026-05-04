interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string | Date;
}

export const useAuth = () => {
  const { $api } = useNuxtApp();
  const user = useState<User | null>("user", () => null);
  const loading = useState<boolean>("auth-loading", () => false);

  const login = async (data: { email: string; password: string }) => {
    loading.value = true;
    try {
      const { data: response, error } = await $api.auth.login.post(data);

      if (error) {
        return {
          success: false,
          message: error.value?.message || "Login failed",
        };
      }

      if (response && response.success && response.data) {
        user.value = response.data.user;
        return { success: true, data: response.data };
      }

      return { success: false, message: response?.message || "Login failed" };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      const { data: response, error } = await $api.auth.logout.post();

      if (error) {
        return {
          success: false,
          message: "Logout failed",
        };
      }

      user.value = null;
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Logout failed",
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchUser = async () => {
    loading.value = true;
    try {
      const { data: response, error } = await $api.auth.me.get();

      if (error) {
        user.value = null;
        return { success: false };
      }

      if (response && response.success && response.data) {
        user.value = response.data.user;
        return { success: true, data: response.data };
      }

      return { success: false };
    } catch (error) {
      user.value = null;
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    login,
    logout,
    fetchUser,
  };
};
