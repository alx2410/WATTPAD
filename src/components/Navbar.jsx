import { useEffect, useState } from "react";
import { logoutUser, onUserStateChange } from "../firebase/auth";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onUserStateChange((user) => setUser(user));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="text-lg font-bold">Mi App</h1>

      {user ? (
        <div className="flex items-center gap-3">
          <img
            src={user.photoURL || "https://i.pravatar.cc/40"}
            alt="perfil"
            className="w-9 h-9 rounded-full border"
          />
          <span>{user.displayName || user.email}</span>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded-lg">Salir</button>
        </div>
      ) : (
        <button onClick={() => setShowAuth(true)} className="bg-blue-600 px-3 py-1 rounded-lg">
          Iniciar sesión
        </button>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
