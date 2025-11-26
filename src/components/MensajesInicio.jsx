import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export default function MensajesInicio({ startIndex = 0 }) {
  const [mensajes, setMensajes] = useState([]);
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const traer = async () => {
      const ref = collection(db, "mensajesInicio");
      const snap = await getDocs(ref);
      const datos = snap.docs.map(doc => doc.data().Texto);
      setMensajes(datos);
    };
    traer();
  }, []);

  useEffect(() => {
    if (mensajes.length === 0) return;

    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % mensajes.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [mensajes]);

  if (mensajes.length === 0)
    return <p className="mensaje-inicio">Cargando mensaje...</p>;

  return <p className="mensaje-inicio">{mensajes[index]}</p>;
}
