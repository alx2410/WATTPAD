import CrearLibroForm from "../components/escribir/CrearLibroForm";
import EditarLibro from "../components/escribir/EditarLibro";
import CapitulosEditor from "../components/escribir/CapitulosEditor";
import LibroSidebar from "../components/escribir/LibroSidebar";
import { useState } from "react";
import "../styles/Escribir.css"


export default function Escribir() {
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  return (
    <div className="escribir-contenedor">

      {/* Lado izquierdo: lista de libros/borradores */}
      <LibroSidebar onSelect={setLibroSeleccionado} />

      {/* Contenido */}
      <div className="escribir-contenido">
        {/* Si no hay libro elegido, mostramos formulario para crear uno nuevo */}
        {!libroSeleccionado && (
          <CrearLibroForm onCreated={setLibroSeleccionado} />
        )}

        {/* Si ya elegiste un libro, puedes editarlo y manejar capítulos */}
        {libroSeleccionado && (
          <>
            <EditarLibro libroId={libroSeleccionado} />
            <CapitulosEditor libroId={libroSeleccionado} />
          </>
        )}
      </div>
    </div>
  );
}