// RutaProtegida.jsx
import { useAuth } from "../context/AuthContext"; //Me lleva al modal y despues el contenido

export default function RutaProtegida({ children, abrirModal }) {
  const { user } = useAuth();

  if (!user) {
    if (abrirModal) abrirModal();
    return null;
  }

  return children;
}
