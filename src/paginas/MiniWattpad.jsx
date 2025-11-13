import React, { useRef } from "react";
import "./MiniWattpad.css";

export default function MiniWattpad() {
  const carruselRef = useRef(null);

  const libros = [
    { imagen: "https://images.cdn1.buscalibre.com/fit-in/360x360/5c/27/5c274fcb3d66be1483ab9ef5a6fad39e.jpg" },
    { imagen: "https://images.cdn3.buscalibre.com/fit-in/360x360/49/42/4942b939de795b95d9c852609abe48df.jpg" },
    { imagen: "https://www.communitas.pe/web/image/product.template/117279/image_1024?unique=e631bdf" },
    { imagen: "https://pics.filmaffinity.com/Bajo_la_misma_estrella-457483777-mmed.jpg" },
    { imagen: "https://images.cdn1.buscalibre.com/fit-in/360x360/ce/90/ce90b5c4ec2497bd3b1585f445965656.jpg" },
    { imagen: "https://www.crisol.com.pe/media/catalog/product/cache/6b78ac9ed927a3c2db42a3c84dab4ce5/9/7/9789874924995_di9fgclhpe8qjemn.jpg" },
    { imagen: "https://images.cdn3.buscalibre.com/fit-in/360x360/ee/35/ee3539aef23f320de4f6ae616ffb3477.jpg" },
    { imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR101HMIdYjNpQh9VMN7ww8dfY2YV2TOIfwzQ&s" },
    { imagen: "https://img.wattpad.com/cover/216790493-256-k821716.jpg" },
    { imagen: "https://images.cdn3.buscalibre.com/fit-in/360x360/a9/d2/a9d2878e83e4b41ffddedca20771641f.jpg" },
  ];

  const scroll = (direction) => {
    const { current } = carruselRef;
    if (!current) return;
    const scrollAmount = 300;
    current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mini-container">
      <h1 className="titulo-popular">Lo más popular</h1>

      <div className="carrusel-wrapper">
        <button className="flecha izquierda" onClick={() => scroll("left")}>
          ❮
        </button>

        <div className="carrusel-libros" ref={carruselRef}>
          {libros.map((libro, index) => (
            <div className="libro-card" key={index}>
              <img src={libro.imagen} alt={`Libro ${index + 1}`} />
            </div>
          ))}
        </div>

        <button className="flecha derecha" onClick={() => scroll("right")}>
          ❯
        </button>
      </div>
    </div>
  );
}
