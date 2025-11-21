import { useEffect, useState } from "react";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("/api/usuarios")
      .then(res => res.json())
      .then(data => setUsuarios(data));
  }, []);

  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {usuarios.map(u => (
          <li key={u.id}>
            <img src={u.avatar} width={40} />
            {u.nombre} - {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
