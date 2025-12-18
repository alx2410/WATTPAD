import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import Fictory from "./paginas/Fictory";
import Perfil from "./paginas/Perfil";
import Notificaciones from "./paginas/Notificaciones";

import RutaProtegida from "./components/RutaProtegida";
import AuthModal from "./components/AuthModal";

import PopularBooks from "./components/PopularBooks";
import LibroDetalle from "./components/LibroDetalle";
import LeerCapitulo from "./paginas/LeerCapitulo";

import Ficwin from "./paginas/Ficwin";

import Cuenta from "./paginas/Cuenta";

import IntranetLayout from "./components/IntranetLayout";
import Moderacion from "./paginas/intranet/Moderacion";

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
        <Route path="/" element={<Fictory />} />

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

        <Route
  path="/cuenta"
  element={
    <RutaProtegida abrirModal={() => setModalOpen(true)}>
      <Cuenta />
    </RutaProtegida>
  }
/>
        <Route path="/perfil/:uid?" element={<Perfil />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/fictory" element={<Fictory/>} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        
        <Route
  path="/intranet"
  element={
    <RutaProtegida rolePermitido={["admin", "moderador"]}>
      <IntranetLayout />
    </RutaProtegida>
  }
>
  <Route path="moderacion" element={<Moderacion />} />
</Route>

        <Route path="/libro/:id" element={<LibroDetalle />} />
        <Route path="/leer/:libroId/:capituloId" element={<LeerCapitulo />} />

         <Route path="/ficwin" element={<Ficwin />} />
      </Routes>
    </LibrosProvider>
  );
}
