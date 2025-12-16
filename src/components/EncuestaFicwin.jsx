import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/EncuestaFicwin.css";

export default function EncuestaFicwin() {
  const { user } = useAuth();
  const [libros, setLibros] = useState([]);
  const [libroVotado, setLibroVotado] = useState(null); // para saber qué libro votó

  const librosFicwin = [
    "uw1mLArtkiGummaSBbKD",
    "pqYhv6ZqWHUx7smZWOvf",
    "s8hHhIEwe2FxG71VL7pI",
    "z8huxzsLKtWtRAlWlObr",
    "uFh6ZsJfYl4lNBkD3Qc7",
  ];

  // 🔹 cargar libros reales
  useEffect(() => {
    const q = query(
      collection(db, "libros"),
      where("__name__", "in", librosFicwin)
    );

    const unsub = onSnapshot(q, (snap) => {
      setLibros(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsub();
  }, []);

  // 🔹 verificar si el usuario ya votó
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "ficwinVotos", user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setLibroVotado(snap.data().libroId); // guardar qué libro votó
      }
    });
  }, [user]);

  const votar = async (libroId) => {
    if (!user) {
      alert("Debes iniciar sesión para votar");
      return;
    }

    if (libroVotado) {
      alert("Ya votaste en Ficwin");
      return;
    }

    // sumar voto al libro
    await updateDoc(doc(db, "libros", libroId), {
      votosFicwin: increment(1),
    });

    // registrar voto del usuario
    await setDoc(doc(db, "ficwinVotos", user.uid), {
      libroId,
      votedAt: serverTimestamp(),
    });

    setLibroVotado(libroId); // bloquear más votos
    alert("✅ Tu voto fue registrado");
  };

  return (
    <div className="encuesta">
      <h2>Vota por tu libro favorito</h2>

      <div className="encuesta-grid">
        {libros.map((libro) => (
          <div key={libro.id} className="encuesta-card">
            <Link to={`/libro/${libro.id}`}>
              <img src={libro.portada} alt={libro.titulo} />
            </Link>

            <h4>{libro.titulo}</h4>

            <button
              disabled={!!libroVotado} // deshabilita todos si ya votó
              onClick={() => votar(libro.id)}
            >
              {libroVotado
                ? libroVotado === libro.id
                  ? "Votaste ✔"
                  : "Ya votaste ✔"
                : `Votar ⭐ (${libro.votosFicwin || 0})`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}