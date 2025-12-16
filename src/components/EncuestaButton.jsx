import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function EncuestaButton() {
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [opciones, setOpciones] = useState(["", ""]); // Dos opciones por defecto

  if (!user) return null;

  // Agregar nueva opción
  const agregarOpcion = () => setOpciones([...opciones, ""]);

  // Cambiar valor de opción
  const cambiarOpcion = (index, valor) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = valor;
    setOpciones(nuevasOpciones);
  };

  // Crear encuesta y guardarla en Firestore
  const crearEncuesta = async () => {
    const opcionesValidas = opciones.filter(o => o.trim() !== "");
    if (!titulo.trim() || opcionesValidas.length < 2) {
      alert("Debe tener título y al menos 2 opciones válidas");
      return;
    }

    try {
      // Guardar en colección "encuestas"
      const encuestaRef = await addDoc(collection(db, "encuestas"), {
        autorId: user.uid,
        autorNombre: user.displayName || "Autor",
        titulo,
        opciones: opcionesValidas,
        fechaCreacion: serverTimestamp(),
      });

      // Guardar también en "muro"
await addDoc(collection(db, "muro"), {
  uid: user.uid,
  autor: user.displayName || user.email || "Autor",
  encuesta: {
    id: encuestaRef.id,
    titulo,
    opciones: opcionesValidas.map((o) => ({ texto: o, votos: 0 }))
  },
  fecha: serverTimestamp(),
  foto: user.photoURL || "",
  likesUsuarios: [],
  dislikesUsuarios: []
});


      // Resetear estado
      setTitulo("");
      setOpciones(["", ""]);
      setAbierto(false);

      console.log("Encuesta creada y publicada en el muro ✅");
    } catch (err) {
      console.error("Error creando encuesta:", err);
    }
  };

  return (
    <div style={{ margin: "10px 0" }}>
      {/* Botón para abrir el modal */}
      <button onClick={() => setAbierto(true)} className="btn-editar">
        Crear encuesta
      </button>

      {abierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "400px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              padding: 16,
            }}
          >
            {/* Título de la encuesta */}
            <input
              type="text"
              placeholder="Título de la encuesta"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 12,
                border: "1px solid #ccc",
                outline: "none",
                fontSize: 14,
                marginBottom: 6,
              }}
            />

            {/* Opciones */}
            <div style={{ overflowY: "auto", flexGrow: 1, maxHeight: 120 }}>
              {opciones.map((op, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Opción ${i + 1}`}
                  value={op}
                  onChange={(e) => cambiarOpcion(i, e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 12,
                    border: "1px solid #ccc",
                    outline: "none",
                    fontSize: 14,
                    marginBottom: 6,
                  }}
                />
              ))}
            </div>

            <button
              onClick={agregarOpcion}
              className="file-label"
              style={{ marginTop: 10, marginBottom: 6 }}
            >
              + Agregar opción
            </button>

            <div style={{ display: "flex", marginTop: 10 }}>
              <button onClick={crearEncuesta} className="btn-editar">
                Publicar encuesta
              </button>
              <button
                onClick={() => setAbierto(false)}
                className="btn-cancelar"
                style={{ marginLeft: 10 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
