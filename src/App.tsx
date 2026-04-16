import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import MoneyTallyBar from "./components/MoneyTallyBar";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import ModeratorDashboard from "./pages/ModeratorDashboard";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MoneyTallyBar />
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/moderator" element={<ModeratorDashboard />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
