import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export default function BuscadorHistorias() {

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if(searchTerm.trim()==="") return;

    const ref = collection(db,"historias");
    const snap = await getDocs(ref);
    const data = snap.docs.map(d=>({ id:d.id, ...d.data() }));

    // Filtrar por título o categoría automáticamente
    const filtro = data.filter(h =>
      h.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setResults(filtro);
  };

  return (
    <div className="buscador-box">

      {/* SOLO la barra, sin select */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar historias o categorías..."
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      <div className="resultados">
        {results.map(r=>(
          <div key={r.id} className="item-resultado">
            <h3>{r.titulo}</h3>
            <span>[{r.categoria}]</span>
          </div>
        ))}
      </div>

    </div>
  );
}
