export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser } = useAuth();

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register"];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  // If user is not loaded yet, try to fetch from server
  if (!user.value) {
    const result = await fetchUser();

    // If we couldn't fetch the user and trying to access protected route
    if (!result.success && !isPublicRoute) {
      return navigateTo("/login");
    }
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (user.value && isPublicRoute) {
    return navigateTo("/");
  }

  // If no user and trying to access protected route, redirect to login
  if (!user.value && !isPublicRoute) {
    return navigateTo("/login");
  }
});
