import "../styles/MiniWattpad.css";
import MensajesInicio from "../components/MensajesInicio.jsx";
import RecomendacionInicio from "../components/RecomendacionInicio.jsx";

export default function MiniWattpad() {
  return (
    <div>
      {/* SECCIÓN PRINCIPAL */}
      <div className="inicio-container">
        <div className="inicio-texto">
          <h1>
            Ven por la historia. <br />
            Quédate por la conexión.
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
          <div className="caja-mensaje">
            <span className="comilla"></span>
            <MensajesInicio />
          </div>
        </div>
      </div>

      {/* MINI CARRUSEL */}
      <div className="mini-carrusel-container">
        <h2 className="mini-carrusel-title">Lo Mas Popular</h2>

        <div className="mini-carrusel">
          <button className="carrusel-btn">‹</button>

          <div className="mini-carrusel-items">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM04Wu4kbkTnQb7l_uOFpwFWvJivWGxavtlw&s" alt="img1" />
            <img src="https://images.cdn1.buscalibre.com/fit-in/360x360/87/ac/87ac05af4868b66b9520d3f84dbc886e.jpg" alt="img2" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG9BxxJcDRsBabRy0I6hdrqAEsOekJpksRrw&s" alt="img3" />
            <img src="https://images.cdn2.buscalibre.com/fit-in/360x360/8e/28/8e2808346ffb11afb7f118576999050a.jpg" alt="img4" />
            <img src="https://images.cdn3.buscalibre.com/fit-in/360x360/49/42/4942b939de795b95d9c852609abe48df.jpg" alt="img5" />
            <img src="https://images.cdn1.buscalibre.com/fit-in/520x520/11/d2/11d2f5cc990034a702c1846d57967bb4.jpg" alt="img6" />
          </div>
          <button className="carrusel-btn">›</button>
        </div>
      </div>


       {/* MINI CARRUSEL */}
      <div className="mini-carrusel-container">
        <h2 className="mini-carrusel-title">Lee.Obsesionate</h2>

        <div className="mini-carrusel">
          <button className="carrusel-btn">‹</button>

          <div className="mini-carrusel-items">
            <img src="https://i.pinimg.com/736x/40/e7/07/40e7070cedada68db8a20ac3c371d480.jpg" alt="img1" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1MSV018_HeLS29CJUz9NQu7byQMTURZ7L_g&s" alt="img2" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZoffXYyVRJD_UX5W5XLJCHjHQRKS6TKb11A&s" alt="img3" />
            <img src="https://ramenparados.com/wp-content/uploads/2015/09/normal_kaichou1.jpg" alt="img4" />
            <img src="https://imagedelivery.net/mWv_TJsq38van820M8-SNQ/a16f5c0e-7581-45c0-8364-1102510dd600/original" alt="img5" />
            <img src="https://shinsekai.com.mx/cdn/shop/products/126176-520x520_371x520.jpg?v=1580243410" alt="img6" />
          </div>
          <button className="carrusel-btn">›</button>
        </div>
      </div>





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
          <a>MiniWattpad Originales</a>
        </div>


        <div className="footer-redes">
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
  </div>

        <p className="footer-copy">© 2025 MiniWattpad</p>
      </footer>
    </div>
  );
}
