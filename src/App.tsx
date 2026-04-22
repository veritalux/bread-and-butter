import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/useApp";
import Navbar from "./components/Navbar";
import MoneyTallyBar from "./components/MoneyTallyBar";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import Login from "./pages/Login";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="text-center animate-fade-in">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-12 h-12 mx-auto mb-3 animate-pulse" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  );
}

function RequireAuth({ children, role }: { children: ReactNode; role?: "user" | "moderator" }) {
  const { currentUser, loading } = useApp();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && currentUser.role !== role) {
    const target = currentUser.role === "moderator" ? "/moderator" : "/";
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}

function Chrome({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  return (
    <>
      {currentUser?.role === "user" && <MoneyTallyBar />}
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const { loading } = useApp();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth role="user">
            <Chrome><Dashboard /></Chrome>
          </RequireAuth>
        }
      />
      <Route
        path="/challenges"
        element={
          <RequireAuth role="user">
            <Chrome><Challenges /></Chrome>
          </RequireAuth>
        }
      />
      <Route
        path="/moderator"
        element={
          <RequireAuth role="moderator">
            <Chrome><ModeratorDashboard /></Chrome>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/bread-and-butter/">
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
