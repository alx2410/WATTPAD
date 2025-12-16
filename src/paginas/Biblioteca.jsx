// src/paginas/Biblioteca.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/auth";
import { db } from "../firebase/config";
import "../styles/Biblioteca.css";

import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function Biblioteca() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("enLectura");
  const [enLectura, setEnLectura] = useState([]);
  const [miLista, setMiLista] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // AUTH
 
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  // CARGAR DATOS

  const cargarSeccion = async (ruta, setState, user) => {
    const snap = await getDocs(collection(db, "usuarios", user.uid, ruta));
    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setState(arr);
  };

  useEffect(() => {
    if (!currentUser) return;

    const cargarTodo = async () => {
      await cargarSeccion("biblioteca", setEnLectura, currentUser);
      await cargarSeccion("lista", setMiLista, currentUser);
      await cargarSeccion("favoritos", setFavoritos, currentUser);
    };

    cargarTodo();
  }, [currentUser]);


  // ACCIONES


  //  sale el cap donde te quedas y te lleva automaticamente
  const seguirLeyendo = (libro) => {
    if (!libro.ultimoCapituloId) return;
    navigate(`/leer/${libro.id}/${libro.ultimoCapituloId}`);
  };

  const empezarALeer = async (libro) => {
    if (!currentUser) return;

    const ref = doc(db, "usuarios", currentUser.uid, "biblioteca", libro.id);
    const snap = await getDoc(ref);

    // Si ya existe, continuar donde estaba
    if (snap.exists()) {
      const data = snap.data();
      navigate(`/leer/${libro.id}/${data.ultimoCapituloId}`);
      return;
    }

    // Buscar primer capítulo
    const snapCaps = await getDocs(collection(db, "capitulos"));
    const lista = snapCaps.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.libroId === libro.id)
      .sort((a, b) => (a.numero || 0) - (b.numero || 0));

    if (lista.length === 0) return;

    const primerCap = lista[0];

    await setDoc(ref, {
      ...libro,
      ultimoCapitulo: primerCap.numero || 1,
      ultimoCapituloId: primerCap.id,
      progreso: 0,
    });

    await deleteDoc(
      doc(db, "usuarios", currentUser.uid, "lista", libro.id)
    );

    navigate(`/leer/${libro.id}/${primerCap.id}`);
  };

  const quitarLibro = async (libro, seccion) => {
    if (!currentUser) return;

    const ruta =
      seccion === "enLectura"
        ? "biblioteca"
        : seccion === "miLista"
        ? "lista"
        : "favoritos";

    await deleteDoc(doc(db, "usuarios", currentUser.uid, ruta, libro.id));

    if (seccion === "enLectura")
      setEnLectura(enLectura.filter((l) => l.id !== libro.id));
    if (seccion === "miLista")
      setMiLista(miLista.filter((l) => l.id !== libro.id));
    if (seccion === "favoritos")
      setFavoritos(favoritos.filter((l) => l.id !== libro.id));
  };


  // CARD
 
  const LibroCard = ({ libro, seccion }) => (
    <div className="biblioteca-card">
      <div className="biblioteca-card-portada-wrapper">
        <img
          className="biblioteca-card-portada"
          src={libro.portada}
          alt={libro.titulo}
        />

        <div className="biblioteca-card-overlay">
          {seccion === "miLista" && (
            <button onClick={() => empezarALeer(libro)}>
              Empezar a leer
            </button>
          )}

          {(seccion === "enLectura" || seccion === "favoritos") && (
            <button onClick={() => seguirLeyendo(libro)}>
              Seguir leyendo
            </button>
          )}

          <button
            className="btn-rojo"
            onClick={() => quitarLibro(libro, seccion)}
          >
            Quitar
          </button>
        </div>
      </div>

      <div className="biblioteca-card-progreso-wrapper">
        <div
          className="biblioteca-card-progreso-bar"
          style={{ width: `${libro.progreso || 0}%` }}
        />
      </div>

      <p className="biblioteca-card-titulo">{libro.titulo}</p>
    </div>
  );

  // -------------------------------
  // RENDER
  // -------------------------------
  const renderTab = () => {
    const libros =
      activeTab === "enLectura"
        ? enLectura
        : activeTab === "miLista"
        ? miLista
        : favoritos;

    if (libros.length === 0)
      return (
        <p className="biblioteca-empty">
          No hay libros en esta sección.
        </p>
      );

    return (
      <div className="biblioteca-grid">
        {libros.map((libro) => (
          <LibroCard
            key={libro.id}
            libro={libro}
            seccion={activeTab}
          />
        ))}
      </div>
    );
  };

  if (loading)
    return <p className="biblioteca-loading">Cargando biblioteca...</p>;

  if (!currentUser)
    return (
      <p className="biblioteca-empty">
        Inicia sesión para ver tu biblioteca.
      </p>
    );

  return (
    <div className="biblioteca-contenedor">
      <div className="biblioteca-tabs">
        <button
          className={`biblioteca-tab ${
            activeTab === "enLectura" ? "active" : ""
          }`}
          onClick={() => setActiveTab("enLectura")}
        >
          Lectura actual
        </button>

        <button
          className={`biblioteca-tab ${
            activeTab === "miLista" ? "active" : ""
          }`}
          onClick={() => setActiveTab("miLista")}
        >
          Mi lista
        </button>

        <button
          className={`biblioteca-tab ${
            activeTab === "favoritos" ? "active" : ""
          }`}
          onClick={() => setActiveTab("favoritos")}
        >
          Favoritos
        </button>
      </div>

      {renderTab()}
    </div>
  );
}
