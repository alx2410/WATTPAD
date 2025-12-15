// components/PopularBooksSidebar.jsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import RecomendadosSidebar from "./RecomendadosSidebar";

export default function PopularBooksSidebar() {
  const [libros, setLibros] = useState([]);

  const librosDestacados = [
    "l7yvPwJZrwDNl2RcZ0U4",
    "yKZ0IpdaKPO2Chragu0T",
    "Udvsg9bIIAfk3XPksPd1",
    "em2xANLHSSXtACJzeCWO",
    "XwO6nzTo1RJrVWasLxqQ",
    "72s5PgE1c7tJGN3eMjnE"
  ];

  useEffect(() => {
    const fetchLibros = async () => {
      const q = query(
        collection(db, "libros"),
        where("__name__", "in", librosDestacados)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const ordenados = librosDestacados
        .map(id => data.find(l => l.id === id))
        .filter(Boolean);

      setLibros(ordenados);
    };

    fetchLibros();
  }, []);

  return <RecomendadosSidebar libros={libros} />;
}
