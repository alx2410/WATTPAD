import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import "./App.css";
import MundoLector from "./paginas/MundoLector";
import Perfil from "./paginas/Perfil";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/escribir" element={<Escribir/>}/>
        <Route path="/biblioteca" element={<Biblioteca/>}/>
        <Route path="/mundolector" element={<MundoLector/>}/>
        <Route path="/perfil" element={<Perfil/>}/>
      </Routes>
    </Router>
  );
}
