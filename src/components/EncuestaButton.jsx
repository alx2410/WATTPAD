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

  const agregarOpcion = () => setOpciones([...opciones, ""]);
  const cambiarOpcion = (index, valor) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = valor;
    setOpciones(nuevasOpciones);
  };

  const crearEncuesta = async () => {
    if (!titulo || opciones.filter(o => o.trim() !== "").length < 2) {
      alert("Debe tener título y al menos 2 opciones válidas");
      return;
    }

    try {
      await addDoc(collection(db, "encuestas"), {
        autorId: user.uid,
        autorNombre: user.displayName || "Autor",
        titulo,
        opciones: opciones.filter(o => o.trim() !== ""),
        fechaCreacion: serverTimestamp(),
      });

      setTitulo("");
      setOpciones(["", ""]);
      setAbierto(false);
      console.log("Encuesta creada ✅");
    } catch (err) {
      console.error("Error creando encuesta:", err);
    }
  };

  return (
    <div style={{ margin: "10px 0" }}>
      <button onClick={() => setAbierto(true)} className="btn-editar">
        Crear encuesta
      </button>

      {abierto && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: "400px" }}>
            <h3>Crear Encuesta</h3>
            <input
              type="text"
              placeholder="Título de la encuesta"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ width: "100%", marginBottom: 10, padding: 6 }}
            />

            {opciones.map((op, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Opción ${i + 1}`}
                value={op}
                onChange={(e) => cambiarOpcion(i, e.target.value)}
                style={{ width: "100%", marginBottom: 6, padding: 6 }}
              />
            ))}

            <button onClick={agregarOpcion} style={{ marginBottom: 10 }}>+ Agregar opción</button>
            <br />
            <button onClick={crearEncuesta} className="btn-editar">Publicar encuesta</button>
            <button onClick={() => setAbierto(false)} style={{ marginLeft: 10 }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
