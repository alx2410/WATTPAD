
import { useNavigate } from "react-router-dom";

export default function SeccionGeneros({ generos }) {
  const navigate = useNavigate();

  const irAGenero = (genero) => {
    navigate(`/explorar?genero=${genero}`);
  };

  return (
    <section className="seccion-generos">
      <div className="header-generos">
        <h2>Explora por Género</h2>

        {/* Aquí tu texto animado */}
        <div className="texto-animado">
          <AnimatedText /> 
        </div>
      </div>

      {/* Carrusel horizontal */}
      <div className="carrusel-generos">
        {generos.map((g, i) => (
          <div 
            className="card-genero"
            key={i}
            onClick={() => irAGenero(g.nombre)}
          >
            <p>{g.nombre}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
