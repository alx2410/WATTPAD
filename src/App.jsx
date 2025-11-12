import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/comunidad" element={<Comunidad />} />
      </Routes>
    </Router>
  );
}
