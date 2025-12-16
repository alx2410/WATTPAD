import "../styles/MiniWattpad.css";
import MensajesInicio from "../components/MensajesInicio.jsx";
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

  //  8.
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

  {/* CONTENEDOR DE DOS COLUMNAS */}
  <div className="generos-top">

    {/* COLUMNA IZQUIERDA */}
    <div className="generos-left">
  <h1 className="generos-title">
    Todos los géneros. <br />
    ¡Todo lo que necesitas!
  </h1>

  <p className="generos-desc">
    Historias para cada mood, cada momento. <br />
    ¡Que nada te detenga!
  </p>
</div>


    {/* COLUMNA DERECHA: HERO */}
    <div className="generos-right">
      <div className="hero-search-container">
        <div className="hero-search-box">
          <span className="icono-lupa">
            <svg
              width="25"
              height="20"
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
              velocidad={100}
              pausa={1300}
            />
          </div>
        </div>
      </div>
    </div>

  </div>

  {/* CARRUSEL ABAJO DE TODO */}
  <CarruselGeneros
    generos={listaDeGeneros}
    onSelectGenero={(nombre) => navigate(`/explorar?genero=${nombre}`)}
  />

</section>

      

     
 {/* FOOTER */}
<footer className="footer">
  <div className="footer-container">

    <div className="footer-section">
      <h4>Información</h4>
      <a href="/privacidad">Privacidad</a>
      <a href="/condiciones">Condiciones</a>
      <a href="/cookies">Cookies</a>
      <a href="/ayuda">Ayuda</a>
      <a href="/idioma">Idioma</a>
      <a href="/originales">Fictory Originales</a>
    </div>

    <div className="footer-section">
      <h4>Redes</h4>

      <div className="footer-redes">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12z"/>
          </svg>
        </a>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .2 2.4.4a4 4 0 0 1 1.5 1.5c.2.4.3 1.2.4 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 2-.4 2.4a4 4 0 0 1-1.5 1.5c-.4.2-1.2.3-2.4.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.2-2.4-.4a4 4 0 0 1-1.5-1.5c-.2-.4-.3-1.2-.4-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-2 .4-2.4a4 4 0 0 1 1.5-1.5c.4-.2 1.2-.3 2.4-.4C8.4 2.2 8.8 2.2 12 2.2m0 3.5a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6zm6.5-.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
        </a>

        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.8 2h3.2c.1 1.3.6 2.3 1.4 3.2.8.8 1.8 1.3 3.1 1.4v3.3c-1.8-.1-3.3-.7-4.5-1.7v6.9a6 6 0 1 1-6-6c.5 0 1 .1 1.5.2v3.4c-.5-.2-1-.3-1.5-.3a2.6 2.6 0 1 0 2.6 2.6V2z"/>
          </svg>
        </a>
      </div>
    </div>

  </div>

  <p className="footer-copy">© 2025 Fictory</p>
</footer>


    </div>
  );
}
