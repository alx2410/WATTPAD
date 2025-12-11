import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Registro({ onRegistroExitoso, onLoginExitoso, irALogin, onClose }) {
    const { register, loginWithGoogle } = useAuth();

    const [username, setUsername] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const emailRef = useRef(null);

    useEffect(() => {
        if (emailRef.current) emailRef.current.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await register(email, password, { username, avatarFile });
            if (onRegistroExitoso) onRegistroExitoso();
        } catch (err) {
            console.log(err);
            setError(traducirError(err.code));
        }
    };

    const handleGoogle = async () => {
        setError("");
        try {
            await loginWithGoogle();
            if (onLoginExitoso) onLoginExitoso();
        } catch (err) {
            console.log(err);
            setError(traducirError(err.code));
        }
    };

    function traducirError(code) {
        switch (code) {
            case "auth/email-already-in-use":
                return "Este correo ya está registrado.";
            case "auth/invalid-email":
                return "El correo no es válido.";
            case "auth/weak-password":
                return "La contraseña es muy débil (mínimo 6 caracteres).";
            default:
                return "Ocurrió un error. Intenta nuevamente.";
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        setAvatarFile(file || null);
    };

    return (
            <div className="login-modal">
        <div className="modal-card">

                <button className="modal-cerrar" onClick={onClose}>×</button>

                <h1 className="modal-title">Crear cuenta</h1>

                {error && <p className="modal-error">{error}</p>}

                <form onSubmit={handleSubmit} className="modal-form">

                    <div className="form-group">
                        <label>Nombre de usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ej: xime48"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Avatar (imagen)</label>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </div>

                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input
                            ref={emailRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tucorreo@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    {/* Botones en línea, centrados */}
                    <div id="botoncitos">
                        <button type="button" className="btn-secundario botones" onClick={irALogin}>
                            Ir a iniciar sesión
                        </button>

                        <button type="submit" className="btn-primario botones">
                            Registrarse
                        </button>
                    </div>
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

</div>
            </div>
    
    );
}