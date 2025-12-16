// src/layouts/IntranetLayout.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function IntranetLayout() {
  const { user } = useAuth();

  // Solo admins pueden acceder
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // nada visible, todo UI en las secciones
}