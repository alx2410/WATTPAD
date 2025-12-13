// App.jsx
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import MiniWattpad from "./paginas/MiniWattpad";
import Perfil from "./paginas/Perfil";
import Notificaciones from "./paginas/Notificaciones";

import RutaProtegida from "./components/RutaProtegida";
import RutaAdmin from "./components/RutaAdmin";

import PopularBooks from "./components/PopularBooks";
import LibroDetalle from "./components/LibroDetalle";

import LeerLibro from "./paginas/LeerLibro";
import LeerCapitulo from "./paginas/LeerCapitulo";



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
        <Route path="/notificaciones" element={<Notificaciones />} />


        {/*RUTA DEL CARRUSEL*/}
        <Route path="/libro/:id" element={<LibroDetalle />} /> {/* Página de detalle */}


 {/* LECTURA */}
        <Route path="/leer/:libroId" element={<LeerLibro />} />
        <Route path="/leer/:libroId/:capituloId" element={<LeerCapitulo />} />



      
      </Routes>
    </LibrosProvider>
  );
}