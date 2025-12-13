import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

import CarruselPopular from "./CarruselPopular";

export default function PopularBooks() {
  const [libros, setLibros] = useState([]);

  // Aquí defines los 7 libros que quieres mostrar (IDs de Firestore)
  const librosDestacados = [
    "l7yvPwJZrwDNl2RcZ0U4",
    "yKZ0IpdaKPO2Chragu0T",
    "PB6gXVnCfvSrzaQqfb7e",
    "86qWw0U0TpEaMoNIMLcc",
    "idLibro5",
    "idLibro6",
    "idLibro7",
  ];

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        // Firestore usa "__name__" para referirse al ID del documento
        const q = query(
          collection(db, "libros"),
          where("__name__", "in", librosDestacados)
        );

        const snapshot = await getDocs(q);
        const librosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordenamos los libros según el array librosDestacados
        const librosOrdenados = librosDestacados
          .map(id => librosData.find(libro => libro.id === id))
          .filter(Boolean); // eliminamos undefined por si algún ID no existe

        setLibros(librosOrdenados);
      } catch (error) {
        console.error("Error al cargar libros destacados:", error);
      }
    };

    fetchLibros();
  }, []);

  return <CarruselPopular libros={libros} />;
}
