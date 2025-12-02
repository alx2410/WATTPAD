import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/CarruselPopular.css";

export default function CarruselPopular({ libros }) {
  const [i, setI] = useState(0);
  const visibles = 7; // portadas visibles
  const mover = 3;    // portadas que avanzan al presionar los botones

  const prev = () => setI(prev => Math.max(prev - mover, 0));
  const next = () => setI(prev => Math.min(prev + mover, libros.length - visibles));

  return (
    <section className="carrusel-popular">
      <h2>Lo más popular</h2>

      <div className="carrusel-box">
        <button onClick={prev} className="arrow">‹</button>

        <div className="carrusel-items">
          {libros.slice(i, i + visibles).map(libro => (
            <Link to={`/libro/${libro.id}`} key={libro.id} className="item">
              <img src={libro.portada} alt={libro.titulo} />
            </Link>
          ))}
        </div>

        <button onClick={next} className="arrow">›</button>
      </div>
    </section>
  );
}
