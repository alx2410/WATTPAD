// src/components/RutaProtegida.jsx

import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function RutaProtegida({ children, onNeedLogin }) {
  const { user } = useAuth();

  // Si NO está logueado → abre modal y redirige
  if (!user) {
    if (onNeedLogin) onNeedLogin();
    return <Navigate to="/miniwattpad" replace />;
  }

  // Si está logueado → deja entrar
  return children;
}
