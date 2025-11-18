import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function Biblioteca() {
  const [libros, setLibros] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "libros"), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibros(lista);
    });

    return () => unsubscribe();
  }, []);

  // 🗑️ Eliminar libro
  const eliminarLibro = async (id) => {
    if (!confirm("¿Seguro que deseas borrar este libro?")) return;
    await deleteDoc(doc(db, "libros", id));
  };

  // Libros con progreso (para sección "Seguir leyendo")
  const enLectura = libros.filter((l) => l.progreso && l.progreso < 100);

  return (
    <div className="biblioteca-container" style={{ padding: "20px" }}>
      <h2 style={{ color: "#ff7300" }}>📚 Tu Biblioteca</h2>

      {/* ================================
          SECCIÓN SEGUIR LEYENDO
      ================================= */}
      {enLectura.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          <h3 style={{ color: "#ff7300" }}>📖 Seguir leyendo</h3>

          <div className="libros-grid">
            {enLectura.map((libro) => (
              <div
                className="libro-card"
                key={libro.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                <img
                  src={libro.portada || "/sin-portada.png"}
                  alt="Portada"
                  className="libro-portada"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                <h4 style={{ marginTop: "10px" }}>{libro.titulo}</h4>

                <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                  Progreso: {libro.progreso || 0}%
                </p>

                <button
                  style={{
                    marginTop: "10px",
                    background: "#ff7300",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                  onClick={() => setLibroSeleccionado(libro)}
                >
                  Seguir leyendo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================
          TODOS LOS LIBROS
      ================================= */}
      <h3 style={{ marginTop: "40px", color: "#ff7300" }}>📚 Libros publicados</h3>

      {libros.length === 0 ? (
        <p>No has publicado ningún libro todavía.</p>
      ) : (
        <div className="libros-grid" style={{ marginTop: "20px" }}>
          {libros.map((libro) => (
            <div
              className="libro-card"
              key={libro.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <img
                src={libro.portada || "/sin-portada.png"}
                alt="Portada"
                className="libro-portada"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <h3 style={{ marginTop: "10px" }}>{libro.titulo}</h3>
              <p style={{ opacity: 0.7 }}>📌 {libro.genero}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {/* Ver más */}
                <button
                  style={{
                    flex: 1,
                    background: "#ff7300",
                    color: "white",
                    padding: "8px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => setLibroSeleccionado(libro)}
                >
                  Ver más
                </button>

                {/* Borrar */}
                <button
                  style={{
                    flex: 1,
                    background: "#d93333",
                    color: "white",
                    padding: "8px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => eliminarLibro(libro.id)}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================
          MODAL VER MÁS
      ================================= */}
      {libroSeleccionado && (
        <div
          className="modal"
          onClick={() => setLibroSeleccionado(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#ff7300" }}>{libroSeleccionado.titulo}</h2>

            {libroSeleccionado.portada && (
              <img
                src={libroSeleccionado.portada}
                alt="Portada"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            )}

            <p style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
              {libroSeleccionado.contenido}
            </p>

            <button
              style={{
                marginTop: "20px",
                background: "#ff7300",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => setLibroSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}