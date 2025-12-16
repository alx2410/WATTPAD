import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config"; 
import { sendPasswordResetEmail } from "firebase/auth";
import "../styles/Cuenta.css";

export default function Cuenta() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("cuenta");
  const [showEmail, setShowEmail] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPersonal, setEditPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) {
        setLoadingData(false);
        return;
      }
      try {
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setPersonalForm({
            nombre: data.nombre || "",
            telefono: data.telefono || "",
            direccion: data.direccion || "",
          });
        } else setUserData({});
      } catch (error) {
        console.error(error);
        setUserData({});
      } finally {
        setLoadingData(false);
      }
    }
    fetchUserData();
  }, [currentUser]);

  const ocultarTexto = (text) => {
    if (!text) return "";
    return text.slice(0, 3) + "*".repeat(Math.max(0, text.length - 3));
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Error al intentar reestablecer la contraseña");
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalSave = async () => {
    try {
      const userRef = doc(db, "usuarios", currentUser.uid);
      await updateDoc(userRef, { 
        nombre: personalForm.nombre,
        telefono: personalForm.telefono,
        direccion: personalForm.direccion
      });
      setUserData((prev) => ({ ...prev, ...personalForm }));
      setEditPersonal(false);
    } catch (err) {
      console.error("Error al guardar datos personales:", err);
      alert("No se pudo guardar. Intenta de nuevo.");
    }
  };

  if (authLoading) return <p>Verificando sesión...</p>;
  if (!currentUser) return <p>No estás logueado.</p>;
  if (loadingData) return <p>Cargando información de tu cuenta...</p>;

  return (
    <div className="cuenta-dashboard">
      <aside className="cuenta-sidebar">
        <h2>Mi Cuenta</h2>
        <ul>
          <li className={activeTab === "cuenta" ? "active" : ""} onClick={() => setActiveTab("cuenta")}>
            Información de la cuenta
          </li>
          <li className={activeTab === "personal" ? "active" : ""} onClick={() => setActiveTab("personal")}>
            Datos personales
          </li>
          <li className={activeTab === "membresia" ? "active" : ""} onClick={() => setActiveTab("membresia")}>
            Membresía y beneficios
          </li>
        </ul>
      </aside>

      <main className="cuenta-content">
        {activeTab === "cuenta" && (
          <section>
            <h2>Información de la cuenta</h2>
            <p>
              <strong>Correo:</strong>{" "}
              {showEmail ? currentUser.email : ocultarTexto(currentUser.email)}{" "}
              <button className="btn-secundario" onClick={() => setShowEmail(!showEmail)}>
                {showEmail ? "Ocultar" : "Mostrar"}
              </button>
            </p>
            <p>
              <strong>Contraseña:</strong> ********{" "}
              <button className="btn-primario" onClick={handlePasswordReset}>
                Reestablecer
              </button>
            </p>
            <p><strong>Tipo de cuenta:</strong> {userData.membership || "Free"}</p>
            <p><strong>Fecha de creación:</strong> {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
          </section>
        )}

        {activeTab === "personal" && (
          <section>
            <h2>Datos personales</h2>
            {!editPersonal ? (
              <>
                <p><strong>Nombre completo:</strong> {userData.nombre || "No proporcionado"}</p>
                <p><strong>Teléfono:</strong> {ocultarTexto(userData.telefono)}</p>
                <p><strong>Dirección:</strong> {userData.direccion ? "*****" : "No proporcionado"}</p>
                <button className="btn-primario" onClick={() => setEditPersonal(true)}>Editar</button>
              </>
            ) : (
              <>
                <div>
                  <label>Nombre completo:</label>
                  <input type="text" name="nombre" value={personalForm.nombre} onChange={handlePersonalChange} />
                </div>
                <div>
                  <label>Teléfono:</label>
                  <input type="text" name="telefono" value={personalForm.telefono} onChange={handlePersonalChange} />
                </div>
                <div>
                  <label>Dirección:</label>
                  <input type="text" name="direccion" value={personalForm.direccion} onChange={handlePersonalChange} />
                </div>
                <button className="btn-primario" onClick={handlePersonalSave}>Guardar</button>
                <button className="btn-secundario" onClick={() => setEditPersonal(false)}>Cancelar</button>
              </>
            )}
          </section>
        )}

        {activeTab === "membresia" && (
          <section>
            <h2>Membresía y beneficios</h2>
            {userData.membership === "Premium" ? (
              <ul>
                <li>Acceso ilimitado a todos los contenidos</li>
                <li>Descuentos exclusivos en cursos y eventos</li>
                <li>Soporte prioritario 24/7</li>
              </ul>
            ) : (
              <p>Tu cuenta Free tiene acceso limitado. Actualiza a Premium para desbloquear beneficios exclusivos.</p>
            )}
          </section>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Correo enviado</h3>
            <p>Revisa tu correo para reestablecer tu contraseña. Si no lo ves, revisa la carpeta de spam.</p>
            <button className="btn-primario" onClick={() => setModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}