import { useState } from "react";
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
import AuthModal from "./components/AuthModal";

import PopularBooks from "./components/PopularBooks";
import LibroDetalle from "./components/LibroDetalle";
import LeerCapitulo from "./paginas/LeerCapitulo";

import { LibrosProvider } from "./context/LibrosContext";

import "./App.css";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <LibrosProvider>
      <Navbar />

     <AuthModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
/>

      <Routes>
        <Route path="/" element={<MiniWattpad />} />

        {/* RUTAS PÚBLICAS */}
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route
          path="/escribir"
          element={
            <RutaProtegida abrirModal={() => setModalOpen(true)}>
              <Escribir />
            </RutaProtegida>
          }
        />
        <Route path="/perfil/:uid?" element={<Perfil />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/miniwattpad" element={<MiniWattpad />} />
        <Route path="/notificaciones" element={<Notificaciones />} />

        <Route path="/libro/:id" element={<LibroDetalle />} />
        <Route path="/leer/:libroId/:capituloId" element={<LeerCapitulo />} />
      </Routes>
    </LibrosProvider>
  );
}
