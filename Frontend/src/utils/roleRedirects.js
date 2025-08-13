/**
 * Get the appropriate dashboard route based on user role
 * @param {string} role - The user's role
 * @returns {string} - The dashboard route for the role
 */
export const getDashboardRoute = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'facility_owner':
      return '/facility-owner-dashboard';
    case 'player':
    default:
      return '/';
  }
};

/**
 * Get success message for role-based login
 * @param {string} role - The user's role
 * @returns {string} - Success message
 */
export const getLoginSuccessMessage = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin login successful! Redirecting to admin dashboard...';
    case 'facility_owner':
      return 'Facility owner login successful! Redirecting to dashboard...';
    case 'player':
    default:
      return 'Login successful! Redirecting...';
  }
};

/**
 * Check if user can access a route based on their role
 * @param {string} userRole - The user's role
 * @param {string} route - The route being accessed
 * @returns {boolean} - Whether user can access the route
 */
export const canAccessRoute = (userRole, route) => {
  // Admin routes
  if (route.startsWith('/admin')) {
    return userRole === 'admin';
  }
  
  // Facility owner routes  
  if (route.startsWith('/facility-owner-dashboard') || 
      route.startsWith('/facility-management') ||
      route.startsWith('/booking-overview') ||
      route.startsWith('/time-slot-management') ||
      route.startsWith('/court-management') ||
      route.startsWith('/owner-profile')) {
    return userRole === 'facility_owner';
  }
  
  // Player routes (default/public routes)
  const playerRoutes = ['/', '/venues', '/venue/', '/profile', '/bookings', '/sports-venues'];
  const isPlayerRoute = playerRoutes.some(playerRoute => 
    route === playerRoute || route.startsWith(playerRoute)
  );
  
  if (isPlayerRoute) {
    return userRole === 'player';
  }
  
  // Allow access to auth routes for all users
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];
  if (authRoutes.includes(route)) {
    return true;
  }
  
  return false;
};
