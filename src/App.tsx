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

function RequireAuth({ children, role }: { children: ReactNode; role?: "user" | "moderator" }) {
  const { currentUser } = useApp();
  const location = useLocation();
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
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
