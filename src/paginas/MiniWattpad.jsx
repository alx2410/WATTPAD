import React from "react";
import "./MiniWattpad.css";

export default function MiniWattpad() {
  return (
    <div className="home-container">
      {/* Texto principal */}
      <section className="hero">
        <h1>Descubre historias que te atraparán</h1>
        <p>Explora, lee y crea en el mundo de MiniWattpad 📖</p>
      </section>

      {/* Carrusel de categorías */}
      <section className="carruseles">
        <div className="categoria">
          <h2>Romance</h2>
          <div className="carrusel-libros">
            {/* Aquí van tus tarjetas de libros */}
            <div className="libro-card">💞 Historia 1</div>
            <div className="libro-card">💌 Historia 2</div>
            <div className="libro-card">❤️ Historia 3</div>
          </div>
        </div>

        <div className="categoria">
          <h2>Fantasía</h2>
          <div className="carrusel-libros">
            <div className="libro-card">🐉 Dragones</div>
            <div className="libro-card">✨ Magia</div>
            <div className="libro-card">🧝‍♀️ Reinos</div>
          </div>
        </div>
      </section>
    </div>
  );
}
