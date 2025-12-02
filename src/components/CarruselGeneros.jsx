import { useState } from "react";
import "../styles/CarruselGeneros.css";

export default function CarruselGeneros({ generos = [], onSelectGenero }) {
  const itemsPorPagina = 8;
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.ceil(generos.length / itemsPorPagina);

  const inicio = pagina * itemsPorPagina;
  const paginaActual = generos.slice(inicio, inicio + itemsPorPagina);

  const handlePrev = () => {
    setPagina((p) => (p > 0 ? p - 1 : totalPaginas - 1));
  };

  const handleNext = () => {
    setPagina((p) => (p < totalPaginas - 1 ? p + 1 : 0));
  };

  return (
    <div className="carruselGeneros">

      <button className="btnNav prev" onClick={handlePrev}>‹</button>

      <div className="gridGen">
        {paginaActual.map((genero) => (
          <div
            key={genero.nombre}
            className="tarjeta"
            onClick={() => onSelectGenero(genero.nombre)}
          >
            <img src={genero.icono} alt={genero.nombre} />
            <p>{genero.nombre}</p>
          </div>
        ))}
      </div>

      <button className="btnNav next" onClick={handleNext}>›</button>

    </div>
  );
}
