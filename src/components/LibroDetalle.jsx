
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { auth } from "../firebase/auth";
import ReseñassLibro from "../paginas/ReseñasLibro";



export default function LibroDetalle() {
  const { id } = useParams();
  const [libro, setLibro] = useState(null);
  const [recomendados, setRecomendados] = useState([]);

  useEffect(() => {
    const fetchLibro = async () => {
      const ref = doc(db, "libros", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setLibro(data);

        // Recomendaciones por género
        const q = query(collection(db, "libros"), where("genero", "==", data.genero));
        const recSnap = await getDocs(q);

        const lista = [];
        recSnap.forEach((d) => {
          if (d.id !== id) lista.push({ id: d.id, ...d.data() });
        });

        setRecomendados(lista);
      }
    };
    fetchLibro();
  }, [id]);

  // -----------------------------
  // FUNCIONES DE AGREGAR
  // -----------------------------
  const agregarABiblioteca = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Inicia sesión para agregar libros");

    await setDoc(doc(db, "usuarios", user.uid, "biblioteca", id), libro);
    alert("Agregado a tu biblioteca");
  };

  const agregarALista = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Inicia sesión para agregar libros");

    await setDoc(doc(db, "usuarios", user.uid, "lista", id), libro);
    alert("Agregado a tu lista");
  };

  const agregarAFavoritos = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Inicia sesión para agregar libros");

    await setDoc(doc(db, "usuarios", user.uid, "favoritos", id), libro);
    alert("Agregado a favoritos");
  };

  if (!libro) return <p>Cargando...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px", padding: "30px" }}>
      {/* CONTENIDO SUPERIOR */}
      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

        {/* PORTADA */}
        <img
          src={libro.portada}
          alt={libro.titulo}
          style={{
            width: "300px",
            borderRadius: "8px",
            objectFit: "cover"
          }}
        />

        {/* INFO */}
        <div style={{ maxWidth: "600px" }}>
          <h1>{libro.titulo}</h1>
          <h3 style={{ color: "#555" }}>{libro.autor}</h3>

          <p><strong>Género:</strong> {libro.genero}</p>

          <p style={{ marginTop: "15px" }}>{libro.sipnosis}</p>

          {/* BOTONES */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
           <button className="btn-leer" onClick={agregarABiblioteca}>Empezar a leer</button>

<button className="btn-lista" onClick={agregarALista}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
</button>

<button className="btn-lista" onClick={agregarAFavoritos}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 21s-6-4.35-9-8.7C-1 6 3 2 7.5 3.5 9.2 4.1 10.4 5.4 12 7c1.6-1.6 2.8-2.9 4.5-3.5C21 2 25 6 21 12.3 18 16.7 12 21 12 21z"
      stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
</button>

          </div>
        </div>
      </div>

      {/* RECOMENDADOS */}
      {recomendados.length > 0 && (
        <div className="vibes">
          <h2>Historias con las misma vibe.</h2>

          <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "10px" }}>
            {recomendados.map((rec) => (
              <div key={rec.id} style={{ minWidth: "150px" }}>
                <img
                  src={rec.portada}
                  alt={rec.titulo}
                  style={{
                    width: "150px",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                />
                <p style={{ marginTop: "10px", fontWeight: "bold" }}>{rec.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESEÑA */}
      <div className="reseñas">
       <ReseñassLibro libroId={id} usuario={auth.currentUser} />




      </div>
    </div>
  );
}
