import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Intranet({ children }) {
  const { user } = useAuth();

  // Solo admins pueden acceder
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />; // redirige al home si no es admin
  }

  return children; // aquí se renderiza el contenido real (Moderacion.jsx)
}