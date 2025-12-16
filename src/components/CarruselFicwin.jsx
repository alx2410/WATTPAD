import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import "../styles/CarruselFicwin.css";

export default function CarruselFicwin({ libros }) {
  const carruselRef = useRef(null);

  useEffect(() => {
    const carrusel = carruselRef.current;
    if (!carrusel) return;

    // duplicamos los libros para loop infinito
    carrusel.innerHTML += carrusel.innerHTML;

    let scrollSpeed = 0.5; // ajusta velocidad
    let animationFrame;

    const scroll = () => {
      carrusel.scrollLeft += scrollSpeed;
      // reinicia al llegar a la mitad (porque duplicamos)
      if (carrusel.scrollLeft >= carrusel.scrollWidth / 2) {
        carrusel.scrollLeft = 0;
      }
      animationFrame = requestAnimationFrame(scroll);
    };

    scroll();

    return () => cancelAnimationFrame(animationFrame);
  }, [libros]);

  return (
    <div ref={carruselRef} className="ficwin-carrusel">
      {libros.map((libro) => (
        <Link
          key={libro.id}
          to={`/libro/${libro.id}`}
          className="ficwin-carrusel-card"
        >
          <img src={libro.portada} alt={libro.titulo} />
          <h4>{libro.titulo}</h4>
        </Link>
      ))}
    </div>
  );
}