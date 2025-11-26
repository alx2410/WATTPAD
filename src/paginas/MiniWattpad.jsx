import "../styles/MiniWattpad.css";
import MensajesInicio from "../components/MensajesInicio.jsx";
import RecomendacionInicio from "../components/RecomendacionInicio.jsx";
import CarruselPopular from "../components/CarruselPopular.jsx";


 const librosPopulares = [
    { id:"harry", titulo:"Harry Potter", portada:"https://images.cdn2.buscalibre.com/fit-in/360x360/e6/5f/e65f54742ad7bbc41903d17f75b77d78.jpg" },
    { id:"crepusculo", titulo:"Crepúsculo", portada:"https://images.cdn2.buscalibre.com/fit-in/360x360/d1/f5/d1f5c769f90ed607d8ac3281436f0c65.jpg" },
    { id:"maze", titulo:"Maze Runner", portada:"https://images.cdn1.buscalibre.com/fit-in/360x360/59/6b/596b13d4e4c829e2c42f14d3a3f6bdbf.jpg" },
    { id:"juegos", titulo:"Juegos del Hambre", portada:"https://www.crisol.com.pe/media/catalog/product/cache/85cf14d8514889c3aec4590f746b60f9/9/7/9789878120201_tlexbwzd0crmvl9w.jpg" },
    { id:"sombra", titulo:"Cazadores de Sombras", portada:"https://images.cdn1.buscalibre.com/fit-in/360x360/5c/40/5c40c89a958606fd803898f4039a37a5.jpg" },
    { id:"percy", titulo:"Percy Jackson", portada:"https://www.penguinlibros.com/pe/3008252-large_default/la-maldicion-del-titan-percy-jackson-y-los-dioses-del-olimpo-3.webp" },
    { id:"harry", titulo:"Harry Potter", portada:"https://images.cdn2.buscalibre.com/fit-in/360x360/e6/5f/e65f54742ad7bbc41903d17f75b77d78.jpg" },
    
  ];
export default function MiniWattpad() {
  return (
    <div>
      {/* SECCIÓN PRINCIPAL */}
      <div className="inicio-container">
        <div className="inicio-texto">
          <h1 className="mi-titulo">
            Ven por la <br />
            historia. <br />
            Quédate por la <br />
             conexión.
          </h1>

          <p className="descripcion">
            Historias mejores que el streaming y secciones de comentarios
            mejores que el chat de tu grupo.
          </p>

         

          <button className="btn-comenzar">Comenzar</button>

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

<CarruselPopular libros={librosPopulares}/>





      {/* SECCIÓN: TODOS LOS GÉNEROS */}
<section className="generos-section">
  <div className="generos-left">
    <h1 className="generos-title">
      Todos los géneros. <br />
      Todos Tuyos.
      </h1>
    <p className="generos-desc">Explora historias para cada estado mental posible.</p>
    <br />
    <br />
    <br />

   <div className="generos-container">
  <div className="generos-grid">

    <div className="genero-item">
      <img src="/romace.jpg" alt="Romance" />
      Romance
    </div>

    <div className="genero-item">
      <img src="/fantasia.jpg" alt="Fantasia" />
      Fantasía
    </div>

    <div className="genero-item">
      <img src="/drama.jpg" alt="Drama" />
      Drama
    </div>

    <div className="genero-item">
      <img src="/comedia.jpg" alt="Comedia" />
      Comedia
    </div>

    <div className="genero-item">
      <img src="/aventura.jpg" alt="Aventura" />
      Aventura
    </div>

    <div className="genero-item">
      <img src="/terror.jpg" alt="Terror" />
      Terror
    </div>

     <div className="genero-item">
      <img src="/misterio.jpg" alt="Misterio" />
      Misterio
    </div>

     <div className="genero-item">
      <img src="/terror.jpg" alt="Ciencia" />
      Ciencia Ficción
    </div>

  </div>
</div>



  </div>

  <div className="generos-right">
    <div className="img-container">
      <img
        src="/src/assets/levi.jpg"
        alt="persona leyendo"
        className="generos-img"
      />

     
    </div>
  </div>
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
