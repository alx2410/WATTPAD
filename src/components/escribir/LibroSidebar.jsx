import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth } from "../../firebase/auth";

export default function LibroSidebar({ onSelect }) {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "libros"),
      where("autorId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibros(data);
    });

    return () => unsub();
  }, []);

  return (
    <div className="libro-sidebar">
      <h3>Mis libros</h3>

      {libros.length === 0 && (
        <p className="sin-libros">Aún no tienes libros creados.</p>
      )}

      <ul className="lista-libros">
        {libros.map((libro) => (
          <li
            key={libro.id}
            className="item-libro"
            onClick={() => onSelect(libro.id)}
          >
            <strong>{libro.titulo}</strong>
            <span className="estado">{libro.estado}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
