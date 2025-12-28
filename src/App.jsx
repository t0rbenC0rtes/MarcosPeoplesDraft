import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import MapPage from "./pages/MapPage";
import MemoryDetailPage from "./pages/MemoryDetailPage";
import LoginPage from "./pages/LoginPage";
import ShareMemoryPage from "./pages/ShareMemoryPage";
import ProfilePage from "./pages/ProfilePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
