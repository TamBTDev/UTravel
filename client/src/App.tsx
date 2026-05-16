import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { store } from "./app/store";
import { Home } from "./pages/Home";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { VerifyOtpPage } from "./features/auth/pages/VerifyOtpPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ProfilePage } from "./features/user/pages/ProfilePage";
import { Bookings } from "./pages/Bookings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { USER_ROLES } from "@shared/constants/roles";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <MantineProvider>
        <Notifications />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MantineProvider>
    </Provider>
  );
}

export default App;
