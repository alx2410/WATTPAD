import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import MundoLector from "./paginas/MundoLector";
import Perfil from "./paginas/Perfil";
import MiniWattpad from "./paginas/MiniWattpad";
import { RutaProtegida } from "./components/RutaProtegida";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/comunidad" element={<Comunidad />} />
        
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/mundolector" element={<MundoLector />} />
        <Route path="/miniwattpad" element={<MiniWattpad/>}/>

{/*RUTA PROTEGIDA PARA ESCRIBIR*/}
<Route
path="/escribir"
element={
  <RutaProtegida>
    <Escribir />
  </RutaProtegida>
}
/>
        {/* RUTA PROTEGIDA */}
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
          
        />
      </Routes>
    </Router>
  );
}
