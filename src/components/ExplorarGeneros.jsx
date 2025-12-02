import { Link } from "react-router-dom";

export default function ExplorarGeneros({ generos }) {
  return (
    <section className="explorar-generos">
      
      <div className="eg-header">
        <h2>Explora por géneros</h2>
        <p>Encuentra historias según tu mood.</p>
      </div>

      <div className="eg-container">
        {generos.map(g => (
          <Link 
            key={g.nombre}
            to={`/explorar?genero=${g.nombre.toLowerCase()}`}
            className="eg-card"
          >
            <img src={g.img} alt={g.nombre} />
            <span>{g.nombre}</span>
          </Link>
        ))}
      </div>

    </section>
  );
}
