
// src/components/RutaProtegida.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // o "../context/authContext"

export default function RutaProtegida({ children }) {
  const { user } = useAuth(); // 👈 usuario actual de Firebase

  // Si no hay usuario, redirige al inicio ("/")
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario, renderiza el componente hijo
  return children;
}