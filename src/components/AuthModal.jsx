import { useState } from "react";
import { loginUser, registerUser } from "../firebase/auth";

export default function AuthModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerUser(email, password, name, photo);
        alert("✅ Cuenta creada correctamente");
      } else {
        await loginUser(email, password);
        alert("✅ Sesión iniciada");
      }
      onClose();
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl w-80 shadow-lg">
        <h2 className="text-xl font-bold mb-3 text-center">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && (
            <>
              <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="text" placeholder="URL de foto (opcional)" value={photo} onChange={(e) => setPhoto(e.target.value)} />
            </>
          )}
          <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="bg-blue-600 text-white py-1.5 rounded-lg">
            {isRegister ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-center mt-3 cursor-pointer text-blue-500" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
        <button onClick={onClose} className="block mx-auto mt-4 text-gray-500">Cerrar</button>
      </div>
    </div>
  );
}
