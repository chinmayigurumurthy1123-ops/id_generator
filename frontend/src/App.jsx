import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateCard from "./pages/CreateCard";
import CardPage from "./pages/CardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreateCard />} />
      <Route path="/card" element={<CardPage />} />
    </Routes>
  );
}

export default App;