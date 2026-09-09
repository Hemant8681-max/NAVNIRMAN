import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import DeviceRegister from "./pages/DeviceRegister";
import DeviceDetails from "./pages/DeviceDetails";
import Telemetry from "./pages/Telemetry";
import Alerts from "./pages/Alerts";
import Health from "./pages/Health";
import Controls from "./pages/Controls";
import Configuration from "./pages/Configuration";
import Contacts from "./pages/Contacts";
import Profile from "./pages/Profile";

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}

function Public({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Public>
            <Login />
          </Public>
        }
      />
      <Route
        path="/register"
        element={
          <Public>
            <Register />
          </Public>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/devices"
        element={
          <Protected>
            <Devices />
          </Protected>
        }
      />
      <Route
        path="/devices/new"
        element={
          <Protected>
            <DeviceRegister />
          </Protected>
        }
      />
      <Route
        path="/devices/:id"
        element={
          <Protected>
            <DeviceDetails />
          </Protected>
        }
      />
      <Route
        path="/telemetry"
        element={
          <Protected>
            <Telemetry />
          </Protected>
        }
      />
      <Route
        path="/alerts"
        element={
          <Protected>
            <Alerts />
          </Protected>
        }
      />
      <Route
        path="/health"
        element={
          <Protected>
            <Health />
          </Protected>
        }
      />
      <Route
        path="/controls"
        element={
          <Protected>
            <Controls />
          </Protected>
        }
      />
      <Route
        path="/configuration"
        element={
          <Protected>
            <Configuration />
          </Protected>
        }
      />
      <Route
        path="/contacts"
        element={
          <Protected>
            <Contacts />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <Profile />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
