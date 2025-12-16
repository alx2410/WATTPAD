import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import CarruselFicwin from "./CarruselFicwin";

export default function FicwinPopular() {
  const [libros, setLibros] = useState([]);

  const librosDestacados = [
    "l7yvPwJZrwDNl2RcZ0U4",
    "yKZ0IpdaKPO2Chragu0T",
    "Udvsg9bIIAfk3XPksPd1",
    "em2xANLHSSXtACJzeCWO",
    "XwO6nzTo1RJrVWasLxqQ",
  ];

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        console.log("Buscando IDs:", librosDestacados);

        const q = query(
          collection(db, "libros"),
          where("__name__", "in", librosDestacados)
        );

        const snap = await getDocs(q);

        console.log("Docs encontrados:", snap.docs.length);

        const data = snap.docs.map((doc) => {
          console.log("Doc:", doc.id, doc.data());
          return { id: doc.id, ...doc.data() };
        });

        setLibros(data);
      } catch (e) {
        console.error("ERROR Firestore:", e);
      }
    };

    fetchLibros();
  }, []);

  if (libros.length === 0) {
    return <p style={{ color: "red" }}>⚠️ No se encontraron libros</p>;
  }

  return <CarruselFicwin libros={libros} />;
}