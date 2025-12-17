// components/PopularBooksSidebar.jsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import RecomendadosSidebar from "./RecomendadosSidebar";

export default function PopularBooksSidebar() {
  const [libros, setLibros] = useState([]);

  const librosDestacados = [
   "gynokUb5HufslhzFCU2u",
"k8AvfgWMunknnhigSho4",
"l7yvPwJZrwDNl2RcZ0U4",
"lzwX7riIsEGfBIh8RNog",
"nJOW7S2hb2VdgwRqq8Wq",
"ojDdoYOU1yW0SLYqdLH3",
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
