import { useState } from "react";
import Login from "./Login";
import Registro from "./Register";

export default function AuthModal({ isOpen, onClose }) {
  const [modo, setModo] = useState("login"); // "login" o "registro"

  if (!isOpen) return null;

  return (
    <div className="login-overlay">

      {modo === "login" && (
        <Login
          onRegistroClick={() => setModo("registro")}
          onLoginExitoso={onClose}
          onClose={onClose} // 👈 AQUÍ ESTÁ LO IMPORTANTE
        />
      )}

      {modo === "registro" && (
        <Registro
          irALogin={() => setModo("login")}
          onRegistroExitoso={onClose}
          onLoginExitoso={onClose}
          onClose={onClose} // 👈 AQUÍ TAMBIÉN
        />
      )}

    </div>
  );
}