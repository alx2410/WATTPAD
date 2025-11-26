import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/CarruselPopular.css";

export default function CarruselPopular({ libros }) {
  const [i, setI] = useState(0);

  const prev = () => i > 0 && setI(i - 1);
  const next = () => i < libros.length - 7 && setI(i + 1);

  return (
    <section className="carrusel-popular">
      <h2>Lo más popular</h2>

      <div className="carrusel-box">
        <button onClick={prev} className="arrow">‹</button>

        <div className="carrusel-items">
          {libros.slice(i, i + 7).map(libro => (
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
