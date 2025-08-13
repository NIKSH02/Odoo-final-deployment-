import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ThemeProvider from "./context/ThemeContext";
import ToastProvider from "./context/ToastContext";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleSelectionModal from "./components/RoleSelectionModal";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';

import GoogleTranslate from "./services/GoogleTranslate";
import SingleVenueDetailsPage from "./pages/SingleVenueDetailsPage";
import VenueBookingPage from "./pages/VenueBookingPage";
import PaymentPage from "./pages/PaymentPage";
import { useAuth } from "./hooks/useAuth";
import SportsVenuesPage from "./pages/SportsVenuesPage";
import UserProfile from "./components/UserProfile";
import FacilityManagement from "./pages/FacilityManagement";
import FacilityOwnerDashboard from "./pages/FacilityOwnerDashboard";
import BookingOverview from "./pages/BookingOverview";
import OwnerProfile from "./pages/OwnerProfile";
import TimeSlotManagement from "./pages/TimeSlotManagement";
import CourtManagement from "./pages/CourtManagement";
import LocationChat from './pages/LocationChat'
import AboutPage from './pages/AboutPage';

// Inner component that uses the auth context
const AppContent = () => {
  const { user, showRoleModal, closeRoleModal } = useAuth();
  console.log('user in app', user)
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out font-inter">
        <GoogleTranslate />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/venues"
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={["player"]}>
                  <SportsVenuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute requireAuth={true}>
                  <LocationChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/venue/:id"
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={["player"]}>
                  <SingleVenueDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/venue/:id/booking"
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={["player"]}>
                  <VenueBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:bookingId"
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={["player"]}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <ProtectedRoute requireAuth={false}>
                  <OTPVerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <ProtectedRoute requireAuth={false} allowAuthenticatedUsers={true}>
                  <ForgotPasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <ProtectedRoute requireAuth={false} allowAuthenticatedUsers={true}>
                  <ResetPasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAuth={true} requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={["player"]}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Booking confirmation redirect to profile */}
            <Route
              path="/booking-confirmation/:bookingId"
              element={<Navigate to="/profile?tab=bookings" replace />}
            />

            <Route
              path="/facility-management"
              element={
                <ProtectedRoute
                  requireAuth={true}
                  requiredRole="facility_owner"
                >
                  <FacilityManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facility-owner-dashboard"
              element={
                <ProtectedRoute
                  requireAuth={true}
                  requiredRole="facility_owner"
                >
                  <FacilityOwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-overview"
              element={
                <ProtectedRoute
                  requireAuth={true}
                  requiredRole="facility_owner"
                >
                  <BookingOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-slot-management"
              element={
                <ProtectedRoute
                  requireAuth={true}
                  requiredRole="facility_owner"
                >
                  <TimeSlotManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/court-management"
              element={
                <ProtectedRoute
                  requireAuth={true}
                  requiredRole="facility_owner"
                >
                  <CourtManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner-profile"
              element={
                <ProtectedRoute
                  requireAuth={true}
                  requiredRole="facility_owner"
                >
                  <OwnerProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Role Selection Modal for Google login users */}
        <RoleSelectionModal
          isOpen={showRoleModal}
          user={user}
          onComplete={closeRoleModal}
        />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
