import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import MapPage from "./pages/MapPage";
import MemoryDetailPage from "./pages/MemoryDetailPage";
import LoginPage from "./pages/LoginPage";
import ShareMemoryPage from "./pages/ShareMemoryPage";
import ProfilePage from "./pages/ProfilePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Regalon3 from "./components/loader/Regalon3";
import "./App.css";

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(location.pathname === "/");
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Only run timer if we're on home page
  useEffect(() => {
    if (location.pathname !== "/") {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Hide loader when both auth is ready AND 15 seconds have passed
  useEffect(() => {
    if (location.pathname === "/" && !loading && minTimeElapsed) {
      setShowLoader(false);
    }
  }, [loading, minTimeElapsed, location.pathname]);

  if (showLoader && location.pathname === "/") {
    return <Regalon3 />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MapPage />} />
        <Route path="memory/:memoryId" element={<MemoryDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="share"
          element={
            <ProtectedRoute>
              <ShareMemoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
