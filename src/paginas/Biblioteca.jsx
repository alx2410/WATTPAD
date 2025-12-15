// Biblioteca.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/auth";
import { db } from "../firebase/config";
import "../styles/Biblioteca.css";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

export default function Biblioteca() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("enLectura");

  const [enLectura, setEnLectura] = useState([]);
  const [miLista, setMiLista] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const cargarDatos = async (user) => {
    if (!user) return;
    const cargarSeccion = async (ruta, setState) => {
      const snap = await getDocs(collection(db, "usuarios", user.uid, ruta));
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setState(arr);
    };
    await cargarSeccion("biblioteca", setEnLectura);
    await cargarSeccion("lista", setMiLista);
    await cargarSeccion("favoritos", setFavoritos);
  };

  useEffect(() => {
    if (currentUser) cargarDatos(currentUser);
  }, [currentUser]);

  const empezarALeer = async (libro) => {
    if (!currentUser) return;
    await setDoc(doc(db, "usuarios", currentUser.uid, "biblioteca", libro.id), libro);
    await deleteDoc(doc(db, "usuarios", currentUser.uid, "lista", libro.id));
    setMiLista(miLista.filter((l) => l.id !== libro.id));
    setEnLectura([...enLectura, libro]);
    navigate(`/leer/${libro.id}`);
  };

  const seguirLeyendo = (libro) => navigate(`/leer/${libro.id}`);

  const quitarLibro = async (libro, seccion) => {
    if (!currentUser) return;
    const rutaFirestore =
      seccion === "miLista" ? "lista" : seccion === "enLectura" ? "biblioteca" : "favoritos";
    await deleteDoc(doc(db, "usuarios", currentUser.uid, rutaFirestore, libro.id));
    if (seccion === "enLectura") setEnLectura(enLectura.filter((l) => l.id !== libro.id));
    if (seccion === "miLista") setMiLista(miLista.filter((l) => l.id !== libro.id));
    if (seccion === "favoritos") setFavoritos(favoritos.filter((l) => l.id !== libro.id));
  };

  const LibroCard = ({ libro, seccion }) => (
    <div className="biblioteca-card">
      <div className="biblioteca-card-portada-wrapper">
        <img className="biblioteca-card-portada" src={libro.portada} alt={libro.titulo} />
        <div className="biblioteca-card-overlay">
          {seccion === "miLista" && (
            <button onClick={() => empezarALeer(libro)}>Empezar a leer</button>
          )}
          {seccion === "enLectura" && (
            <button onClick={() => seguirLeyendo(libro)}>Seguir leyendo</button>
          )}
          {seccion === "favoritos" && (
            <button onClick={() => seguirLeyendo(libro)}>Leer otra vez</button>
          )}
          <button className="btn-rojo" onClick={() => quitarLibro(libro, seccion)}>
            Quitar
          </button>
        </div>
      </div>
      <div className="biblioteca-card-progreso-wrapper">
        <div className="biblioteca-card-progreso-bar" style={{ width: `${libro.progreso || 0}%` }}></div>
      </div>
      <p className="biblioteca-card-titulo">{libro.titulo}</p>
    </div>
  );

  const renderTab = () => {
    let libros =
      activeTab === "enLectura" ? enLectura : activeTab === "miLista" ? miLista : favoritos;
    if (libros.length === 0) return <p className="biblioteca-empty">No hay libros en esta sección.</p>;
    return (
      <div className="biblioteca-grid">
        {libros.map((libro) => (
          <LibroCard key={libro.id} libro={libro} seccion={activeTab} />
        ))}
      </div>
    );
  };

  if (loading) return <p className="biblioteca-loading">Cargando biblioteca...</p>;
  if (!currentUser) return <p className="biblioteca-empty">Inicia sesión para ver tu biblioteca.</p>;

  return (
    <div className="biblioteca-contenedor">
      <div className="biblioteca-tabs">
        <button
          className={`biblioteca-tab ${activeTab === "enLectura" ? "active" : ""}`}
          onClick={() => setActiveTab("enLectura")}
        >
          Lectura Actual
        </button>
        <button
          className={`biblioteca-tab ${activeTab === "miLista" ? "active" : ""}`}
          onClick={() => setActiveTab("miLista")}
        >
          Mi lista
        </button>
        <button
          className={`biblioteca-tab ${activeTab === "favoritos" ? "active" : ""}`}
          onClick={() => setActiveTab("favoritos")}
        >
          Favoritos
        </button>
      </div>
      {renderTab()}
    </div>
  );
}
