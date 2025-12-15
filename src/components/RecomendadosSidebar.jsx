import { Link } from "react-router-dom";
import "../styles/Comunidad.css";

export default function RecomendadosSidebar({ libros }) {
  return (
    <div className="recomendados-sidebar">
      {libros.map((libro) => (
        <Link
          key={libro.id}
          to={`/libro/${libro.id}`}
          className="recomendado-item"
        >
          <img
            src={libro.portada}
            alt={libro.titulo}
            className="recomendado-img"
          />
        </Link>
      ))}
    </div>
  );
}
