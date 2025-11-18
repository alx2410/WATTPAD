import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Recomendacion.css"

export default function RecomendacionInicio() {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    try {
      await addDoc(collection(db, "recomendacionesInicio"), {
        texto,
        fecha: new Date(),
      });
      setEstado("enviado");
      setTexto("");
    } catch (err) {
      setEstado("error");
    }
  };

  return (
    <div className="recomendacion-container">
      <h1>Recomienda <br />
        una historia</h1>

      <form onSubmit={enviar} className="recomendacion-form">
        <input
          type="text"
          placeholder="Escribe una recomendación..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>

      {estado === "enviado" && <p className="ok-msg">Recomendación enviada</p>}
      {estado === "error" && <p className="error-msg">Error al enviar</p>}
    </div>
  );
}