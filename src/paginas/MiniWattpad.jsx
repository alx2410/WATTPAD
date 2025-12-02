import "../styles/MiniWattpad.css";
import MensajesInicio from "../components/MensajesInicio.jsx";
import RecomendacionInicio from "../components/RecomendacionInicio.jsx";
import CarruselPopular from "../components/CarruselPopular.jsx";
import AnimatedText from "../components/AnimatedText.jsx";
import PopularBooks from "../components/PopularBooks.jsx";
import CarruselGeneros from "../components/CarruselGeneros.jsx";
import { useNavigate } from "react-router-dom";



export default function MiniWattpad() {
  const navigate = useNavigate();

  const listaDeGeneros = [
  { nombre: "Romance", icono: "/icons/romance.jpg" },
  { nombre: "Fantasía", icono: "/icons/fantasia.jpg" },
  { nombre: "Ciencia Ficción", icono: "/icons/ciencia.jpeg" },
  { nombre: "Misterio", icono: "/icons/misterioo.jpeg" },
  { nombre: "Drama", icono: "/icons/drama.jpeg" },
  { nombre: "Terror", icono: "/icons/terror.jpeg" },
  { nombre: "Comedia", icono: "/icons/comedia.jpeg" },
  { nombre: "Aventura", icono: "/icons/aventura.jpeg" },
  { nombre: "Fanfic", icono: "/icons/fanfic.jpeg" },
  { nombre: "LGBTQ+", icono: "/icons/lgbt.jpeg" },
  { nombre: "Motivacional", icono: "/icons/motivacional.jpeg" },
  { nombre: "Thriller", icono: "/icons/trhiller.jpeg" },

  // Si quieres más, agrégalos. Igual solo muestra 8.
];

  return (
    <div>
      {/* SECCIÓN PRINCIPAL */}
      <div className="inicio-container">
        <div className="inicio-texto">
         <h1 className="mi-titulo">
  Historias que <br />
  atrapan. <br />
  Lectores que<br />
 vuelven.
</h1>


          <p className="descripcion">
            Historias mejores que el streaming y secciones de comentarios
            mejores que el chat de tu grupo.
          </p>

         

          <button className="btn-comenzar">Explorar Libros</button>

          <p className="texto-sec">
            ¿Ya tienes una cuenta? <span>Inicia sesión</span>
          </p>
        </div>
        

       <div className="inicio-imagen">

  {/* RECUADRO 1 (el que ya tenías) */}
  <div className="caja-mensaje uno">
    <span className="comilla"></span>
    <MensajesInicio startIndex={0}/>
  </div>

  {/* RECUADRO 2 ABAJO EN ZIGZAG */}
  <div className="caja-mensaje dos">
    <span className="comilla"></span>
    <MensajesInicio startIndex={3}/>
  </div>

</div>

      </div>

 <PopularBooks />


     <section className="generos-section">

  {/* IZQUIERDA: TITULO + TEXTO + BARRA ANIMADA */}
  <div className="generos-left">
    <h1 className="generos-title">
      Explora por géneros. <br />
      Todos Tuyos.
    </h1>

    <p className="generos-desc">
      Explora historias para cada estado mental posible.
    </p>
    <br />

    <CarruselGeneros
  generos={listaDeGeneros}
  onSelectGenero={(nombre) => navigate(`/explorar?genero=${nombre}`)}
/>



  </div>

  {/* HERO TIPO WATTPAD - SOLO UNA VEZ */}
<section className="hero-wattpad">

  <div className="hero-search-box">
    <span className="icono-lupa">
      <svg
        width="60"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </span>

    <div className="animated-text">
      <AnimatedText 
      frases={[
        "Romance prohibido",
        "Suspenso que te desvela",
        "Historias que enganchan",
        "Levi 4ever"
      ]}
      velocidad={110}
      pausa={1300}
    /> 
    </div>
   
  </div>
</section>

  
</section>

      {/* FORMULARIO RECOMENDACIÓN */}
      <RecomendacionInicio />

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-links">
          <a>Privacidad</a>
          <a>Condiciones</a>
          <a>Cookies</a>
          <a>Ayuda</a>
          <a>Idioma</a>
          <a>Fictory Originales</a>
        </div>


        <div className="footer-redes">
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a> |
    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a> |
    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a> 
  </div>

        <p className="footer-copy">© 2025 Fictory</p>
      </footer>
    </div>
  );
}
