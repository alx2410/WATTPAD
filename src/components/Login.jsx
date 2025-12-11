import { useState } from "react";
import { useAuth } from "../context/AuthContext";


export default function Login({ onRegistroClick, onLoginExitoso, onClose }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (onLoginExitoso) onLoginExitoso();
    } catch (err) {
      setError("Error al iniciar sesión.");
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      if (onLoginExitoso) onLoginExitoso();
    } catch (err) {
      setError("Error con Google.");
    }
  };

  return (
      <div className="login-modal">

        {/* BOTÓN CERRAR */}
        <button className="modal-cerrar" onClick={onClose}>×</button>

        <h2 className="modal-title">Iniciar sesión</h2>

        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primario">
            Entrar
          </button>
        </form>

<button className="btn-google" onClick={handleGoogle} aria-label="Continuar con Google">
  <img 
    src="https://image.similarpng.com/file/similarpng/original-picture/2020/06/Logo-google-icon-PNG.png" 
    alt="" 
    aria-hidden="true"
    className="google-icon"
  />
  <span>Continuar con Google</span>
</button>


        <div>
          ¿No tienes cuenta?{" "}
          <button onClick={onRegistroClick} className="login-link">Regístrate</button>
        </div>
      </div>
  );
}