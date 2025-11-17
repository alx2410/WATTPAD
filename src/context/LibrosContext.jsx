import { createContext, useContext, useState } from "react";

const LibrosContext = createContext();

export function LibrosProvider({ children }) {
  const [libros, setLibros] = useState([]);

  const publicarLibro = (nuevoLibro) => {
    setLibros((prev) => [...prev, nuevoLibro]);
  };

  return (
    <LibrosContext.Provider value={{ libros, publicarLibro }}>
      {children}
    </LibrosContext.Provider>
  );
}

export function useLibros() {
  return useContext(LibrosContext);
}
