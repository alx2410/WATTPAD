import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { auth } from "../firebase/auth";
import ReseñassLibro from "../paginas/ReseñasLibro";
import { Link } from "react-router-dom";
import "../styles/LibroDetalle.css";

export default function LibroDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libro, setLibro] = useState(null);
  const [recomendados, setRecomendados] = useState([]);
  const [verCompleto, setVerCompleto] = useState(false);
  const [mensajeSesion, setMensajeSesion] = useState("");

  useEffect(() => {
    const fetchLibro = async () => {
      const ref = doc(db, "libros", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setLibro(data);

        const q = query(collection(db, "libros"), where("genero", "==", data.genero));
        const recSnap = await getDocs(q);
        const lista = [];
        recSnap.forEach(d => {
          if (d.id !== id) lista.push({ id: d.id, ...d.data() });
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

    // Guarda en biblioteca
    await setDoc(doc(db, "usuarios", user.uid, "biblioteca", id), libro);

    // Buscar capítulos del libro
    const q = query(
      collection(db, "capitulos"),
      where("libroId", "==", id)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Este libro aún no tiene capítulos.");
      return;
    }

    // Ordenar capítulos
    const capitulos = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.numero || 0) - (b.numero || 0));

    // Ir directo al primer capítulo
    navigate(`/leer/${id}/${capitulos[0].id}`);
  };

  const agregarABiblioteca = async (seccion) => {
    const user = auth.currentUser;
    if (!user) {
      setMensajeSesion("Por favor, inicia sesión para añadir a tu lista.");
      return;
    }

    await setDoc(doc(db, "usuarios", user.uid, seccion, id), libro);

    // Solo redirige si es "En lectura"
    if (seccion === "biblioteca") navigate(`/leer/${id}`);
  };

  if (!libro) return <p>Cargando...</p>;

  return (
    <div className="detalle-contenedor">

      {/* HERO */}
      <section className="detalle-hero">
        <img
          src={libro.portada}
          alt={libro.titulo}
          className="detalle-portada"
        />

        <div className="detalle-info">
          <h1 className="detalle-titulo">{libro.titulo}</h1>
          <h3 className="detalle-autor">
            <Link to={`/perfil/${libro.autorId}`}>
              {libro.autorNombre || libro.autor}
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
  <button
    className="detalle-btn-leer"
    onClick={empezarALeer}
  >
    Empezar a leer
  </button>

  {mensajeSesion && <p className="mensaje-sesion">{mensajeSesion}</p>}

  <button
    className="detalle-btn-icon"
    onClick={() => agregarABiblioteca("lista")}
    title="Añadir a lista"
  >
    ➕
  </button>

  <button
    className="detalle-btn-icon"
    onClick={() => agregarABiblioteca("favoritos")}
    title="Favoritos"
  >
    ❤️
  </button>
</div>

        </div>
      </section>

      <br /><br />

      {/* RECOMENDADOS */}
      {recomendados.length > 0 && (
        <section className="detalle-recomendados">
          <h2 className="detalle-subtitulo">Historias con la misma vibe.</h2>

          <div className="detalle-recomendados-scroll">
            {recomendados.map((rec) => (
              <Link
                to={`/libro/${rec.id}`}
                key={rec.id}
                className="detalle-card"
              >
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

      {/* RESEÑAS */}
      <section className="detalle-reseñas">
        <ReseñassLibro libroId={id} usuario={auth.currentUser} />
      </section>

    </div>
  );
}
