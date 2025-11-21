import { Outlet, Link } from "react-router-dom";

export default function Intranet() {
  return (
    <div>
      <nav>
        <Link to="dashboard">Dashboard</Link>
        <Link to="lectores">Lectores</Link>
        <Link to="escritores">Escritores</Link>
        <Link to="admin/usuarios">Usuarios (solo admin)</Link>
      </nav>

      <div>
        <Outlet />
      </div>
    </div>
  );
}
