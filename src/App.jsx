// App.jsx
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import MiniWattpad from "./paginas/MiniWattpad";
import Perfil from "./paginas/Perfil";

import RutaProtegida from "./components/RutaProtegida";
import RutaAdmin from "./components/RutaAdmin";

import PopularBooks from "./components/PopularBooks";
import LibroDetalle from "./components/LibroDetalle";


import { LibrosProvider } from "./context/LibrosContext";

import "./App.css";

export default function App() {
  return (
    <LibrosProvider>
      <Navbar />

      <Routes>
        {/* HOME que carga automáticamente */}
        <Route path="/" element={<MiniWattpad />} />

        {/* RUTAS PÚBLICAS */}
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/escribir" element={<Escribir />} />
        <Route path="/perfil/:uid?" element={<Perfil />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/miniwattpad" element={<MiniWattpad />} />


        {/*RUTA DEL CARRUSEL*/}
        <Route path="/libro/:id" element={<LibroDetalle />} /> {/* Página de detalle */}


        {/* RUTAS PROTEGIDAS: INTRANET */}
        <Route
          path="/intranet"
          element={
            <RutaProtegida>
             
            </RutaProtegida>
          }
        >
        

        </Route>
      </Routes>
    </LibrosProvider>
  );
}