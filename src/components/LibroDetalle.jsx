import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import { auth } from "../firebase/auth";
import ReseñassLibro from "../paginas/ReseñasLibro";
import "../styles/LibroDetalle.css";
import { arrayUnion } from "firebase/firestore"; // ya tienes updateDoc, doc, etc.

export default function LibroDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libro, setLibro] = useState(null);
  const [recomendados, setRecomendados] = useState([]);
  const [verCompleto, setVerCompleto] = useState(false);
  const [mensajeSesion, setMensajeSesion] = useState("");
  const [autorNombre, setAutorNombre] = useState("");
  const [denunciado, setDenunciado] = useState(false);
  const [activoLista, setActivoLista] = useState(false);
const [activoFavoritos, setActivoFavoritos] = useState(false);
const [openDenuncia, setOpenDenuncia] = useState(false);
const [motivoDenuncia, setMotivoDenuncia] = useState("");


const motivos = [
  { id: "contenido_inapropiado", label: "Contenido inapropiado" },
  { id: "plagio", label: "Plagio" },
  { id: "lenguaje_ofensivo", label: "Lenguaje ofensivo" },
  { id: "violencia", label: "Violencia o abuso" },
  { id: "odio", label: "Discurso de odio" },
  { id: "spam", label: "Spam o publicidad" },
  { id: "informacion_falsa", label: "Información falsa" },
];

  //Votos y ranting
  const [votos, setVotos] = useState(0);
  const [rating, setRating] = useState(0);

  const formatearVistas = (num = 0) => {
    if (num < 1000) return num;
    if (num < 1000000) return `${Math.floor(num / 1000)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const IconoOjo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  // Denuncias

 const handleDenunciar = async () => {
  const user = auth.currentUser;
  if (!user) {
    setMensajeSesion("Inicia sesión para denunciar este libro.");
    return;
  }

  if (!motivoDenuncia) return;

  try {
    await updateDoc(doc(db, "libros", id), {
      denuncias: increment(1),
      usuariosDenunciaron: arrayUnion(user.uid)
    });

    await addDoc(collection(db, "denuncias"), {
      libroId: id,
      tituloLibro: libro.titulo,
      autorId: libro.autorId,
      denunciadoPor: user.uid,
      motivo: motivoDenuncia,
      estado: "pendiente",
      fecha: new Date()
    });

    setDenunciado(true);
    setOpenDenuncia(false);
    setMotivoDenuncia("");
    setMensajeSesion("Denuncia enviada correctamente.");

  } catch (err) {
    console.error("Error denunciando libro:", err);
  }
};



  // Votos en tiempo real
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "reseñas"),
      where("libroId", "==", id)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setVotos(0);
        setRating(0);
        return;
      }

      const total = snap.docs.length;
      const suma = snap.docs.reduce(
        (acc, d) => acc + (d.data().estrellas || 0),
        0
      );

      setVotos(total);
      setRating((suma / total).toFixed(1));
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    const fetchLibro = async () => {
      const ref = doc(db, "libros", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setLibro(data);

        const user = auth.currentUser;
if (user && data.usuariosDenunciaron?.includes(user.uid)) {
  setDenunciado(true);
}


        if (!data.autorNombre && data.autorId) {
          const autorRef = doc(db, "usuarios", data.autorId);
          const autorSnap = await getDoc(autorRef);
          if (autorSnap.exists()) {
            setAutorNombre(autorSnap.data().displayName);
          }
        } else {
          setAutorNombre(data.autorNombre);
        }

        const q = query(
          collection(db, "libros"),
          where("genero", "==", data.genero)
        );

        const recSnap = await getDocs(q);
        const lista = [];
        recSnap.forEach(d => {
          if (d.id !== id && d.data().estado === "publicado") {
            lista.push({ id: d.id, ...d.data() });
          }
        });
        setRecomendados(lista);
      }
    };

    fetchLibro();
  }, [id]);

  const empezarALeer = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMensajeSesion("Por favor, inicia sesión para empezar a leer.");
      return;
    }

    try {
      const lecturaRef = doc(db, "usuarios", user.uid, "lecturas", id);
      const lecturaSnap = await getDoc(lecturaRef);

      if (!lecturaSnap.exists()) {
        await updateDoc(doc(db, "libros", id), {
          vistas: increment(1),
        });

        await setDoc(lecturaRef, { startedAt: new Date() });
      }

      await setDoc(doc(db, "usuarios", user.uid, "biblioteca", id), libro);

      const q = query(collection(db, "capitulos"), where("libroId", "==", id));
      const snap = await getDocs(q);

      if (snap.empty) return alert("Este libro aún no tiene capítulos.");

      const capitulos = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.numero || 0) - (b.numero || 0));

      navigate(`/leer/${id}/${capitulos[0].id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const agregarABiblioteca = async (seccion) => {
    const user = auth.currentUser;
    if (!user) {
      setMensajeSesion("Por favor, inicia sesión para añadir a tu lista.");
      return;
    }

    await setDoc(doc(db, "usuarios", user.uid, seccion, id), libro);
  };

  if (!libro) return <p>Cargando...</p>;

  return (
    <div className="detalle-contenedor">
      <section className="detalle-hero">
        <img src={libro.portada} alt={libro.titulo} className="detalle-portada" />

        <div className="detalle-info">
          <h1 className="detalle-titulo">{libro.titulo}</h1>

          <h3 className="detalle-autor">
            <Link to={`/perfil/${libro.autorId}`}>
              {autorNombre || "Autor desconocido"}
            </Link>
          </h3>

          {libro.estadoProgreso && (
            <span className={`detalle-badge detalle-${libro.estadoProgreso}`}>
              {libro.estadoProgreso === "terminado"
                ? "📘 Historia terminada"
                : "✍️ En proceso"}
            </span>
          )}

          <p className="detalle-genero">
            <strong>Género:</strong> {libro.genero}
          </p>

        {/* Lectura y votos */}
<div className="detalle-stats-bloque">

  {/* LECTURAS */}
  <div className="detalle-stat">
    <div className="detalle-stat-icon">
      <IconoOjo />
    </div>
    <div className="detalle-stat-text">
      <span>Lecturas</span>
      <strong>{formatearVistas(libro.vistas)}</strong>
    </div>
  </div>

  {/* VOTOS */}
  <div className="detalle-stat">
    <div className="detalle-stat-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
      </svg>
    </div>
    <div className="detalle-stat-text">
      <span>Votos</span>
      <strong>{rating} </strong>
      <small>({votos})</small>
    </div>
  </div>

</div>


          <p className={`detalle-sinopsis ${verCompleto ? "expandida" : ""}`}>
            {libro.sinopsis}
          </p>

          {libro.sinopsis.length > 180 && (
            <button
              className="detalle-ver-mas"
              onClick={() => setVerCompleto(!verCompleto)}
            >
              {verCompleto ? "Ver menos" : "Ver más"}
            </button>
          )}

          <div className="detalle-acciones">
            <button className="detalle-btn-leer" onClick={empezarALeer}>
              Empezar a leer
            </button>

            {mensajeSesion && (
              <p className="mensaje-sesion">{mensajeSesion}</p>
            )}

           {/* Botón Lista */}
{/* Botón Lista */}
<button
  className={`detalle-btn-icon ${activoLista ? "activo" : ""}`}
  onClick={() => {
    agregarABiblioteca("lista"); // tu código existente
    setActivoLista(!activoLista); // solo para el diseño
  }}
>
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
</button>

{/* Botón Favoritos */}
<button
  className={`detalle-btn-icon ${activoFavoritos ? "activo" : ""}`}
  onClick={() => {
    agregarABiblioteca("favoritos"); // tu código existente
    setActivoFavoritos(!activoFavoritos); // solo para el diseño
  }}
>
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318C5.006 5.63 5.97 5.25 7 5.25c1.03 0 1.994.38 2.682 1.068L12 8.636l2.318-2.318c.688-.688 1.652-1.068 2.682-1.068 1.03 0 1.994.38 2.682 1.068.688.688 1.068 1.652 1.068 2.682 0 1.03-.38 1.994-1.068 2.682L12 21.25 4.318 11.682C3.63 10.994 3.25 10.03 3.25 9c0-1.03.38-1.994 1.068-2.682z" />
  </svg>
</button>


            <button
  className="detalle-btn-icon"
  onClick={() => setOpenDenuncia(true)}
  disabled={denunciado || libro.usuariosDenunciaron?.includes(auth.currentUser?.uid)}
  title={denunciado ? "Ya has denunciado este libro" : "Denunciar libro"}
>
  ⚠️
</button>

          </div>
        </div>
      </section>

      {recomendados.length > 0 && (
        <section className="detalle-recomendados">
          <h2 className="detalle-subtitulo">Historias con la misma vibe.</h2>
          <div className="detalle-recomendados-scroll">
            {recomendados.map(rec => (
              <Link to={`/libro/${rec.id}`} key={rec.id} className="detalle-card">
                <img
                  src={rec.portada}
                  alt={rec.titulo}
                  className="detalle-card-img"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section className="detalle-reseñas">
        <ReseñassLibro libroId={id} usuario={auth.currentUser} />
      </section>

 {openDenuncia && (
  <div className="modal-overlay">
    <div className="modal-denuncia">

      <div className="modal-header">
        <h3>Reportar Historia</h3>
        <span
          className="cerrar"
          onClick={() => setOpenDenuncia(false)}
        >
          ✕
        </span>
      </div>

      <p className="subtitulo">
        ¿Cuál es el motivo de tu denuncia?
      </p>

      <div className="lista-denuncia">
  {motivos.map((motivo) => (
    <div
      key={motivo.id}
      className={`fila ${
        motivoDenuncia === motivo.id ? "activa" : ""
      }`}
      onClick={() => setMotivoDenuncia(motivo.id)}
    >
      <span>{motivo.label}</span>
      <span className="flecha">›</span>
    </div>
  ))}
</div>


      {/* TU FUNCIONALIDAD SIGUE */}
      <div className="acciones">
        <button
          onClick={handleDenunciar}
          disabled={!motivoDenuncia}
        >
          Enviar denuncia
        </button>
      </div>

    </div>
  </div>
)}

  
    </div>
  );
}