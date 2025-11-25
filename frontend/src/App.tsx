import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import SubmitPinPage from "./pages/SubmitPinPage";
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/submit" element={<SubmitPinPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </AuthProvider>
  );
}
