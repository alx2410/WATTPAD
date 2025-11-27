
import { useState, useEffect } from "react";

export default function AnimatedText({ frases, velocidad = 100, pausa = 1500 }) {
  const [indiceFrase, setIndiceFrase] = useState(0);
  const [textoMostrado, setTextoMostrado] = useState("");
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    const fraseActual = frases[indiceFrase];

    if (!borrando && textoMostrado.length < fraseActual.length) {
      const timeout = setTimeout(() => {
        setTextoMostrado(fraseActual.slice(0, textoMostrado.length + 1));
      }, velocidad);
      return () => clearTimeout(timeout);
    }

    if (!borrando && textoMostrado.length === fraseActual.length) {
      const timeout = setTimeout(() => setBorrando(true), pausa);
      return () => clearTimeout(timeout);
    }

    if (borrando && textoMostrado.length > 0) {
      const timeout = setTimeout(() => {
        setTextoMostrado(textoMostrado.slice(0, textoMostrado.length - 1));
      }, velocidad / 2);
      return () => clearTimeout(timeout);
    }

    if (borrando && textoMostrado.length === 0) {
      setBorrando(false);
      setIndiceFrase((prev) => (prev + 1) % frases.length);
    }
  }, [textoMostrado, borrando]);

 return (
  <h1 className="animated-text">
    <span className="typing-text">{textoMostrado}</span>
    <span className="cursor"></span>
  </h1>
);

}
