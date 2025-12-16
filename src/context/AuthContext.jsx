// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase/config";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AuthContext = createContext();

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos completos del usuario
  const cargarUsuarioCompleto = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const userRef = doc(db, "usuarios", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      setUser({
  ...firebaseUser,
  username: data.username || firebaseUser.displayName || "Usuario",
  avatar: data.avatar || firebaseUser.photoURL || "",
  role: data.role || "user", // 🔐 CLAVE
  ...data,
});

    } else {
      setUser({
        ...firebaseUser,
        username: firebaseUser.displayName || "Usuario",
        avatar: firebaseUser.photoURL || "",
      });
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) await cargarUsuarioCompleto(firebaseUser);
      else setUser(null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Registro
  const register = async (email, password, { username, avatarFile }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;
    const uid = firebaseUser.uid;

    let avatarUrl = "";

    if (avatarFile) {
      const avatarRef = ref(storage, `usuario/${uid}-${Date.now()}`);
      await uploadBytes(avatarRef, avatarFile);
      avatarUrl = await getDownloadURL(avatarRef);
      await updateProfile(firebaseUser, { photoURL: avatarUrl });
    }

    await setDoc(doc(db, "usuarios", uid), {
      uid,
      email,
      username,
      avatar: avatarUrl,
      bio: "",
      provider: "password",
      role: "user",
      createdAt: serverTimestamp(),
        seguirUsuario,
  dejarSeguirUsuario,
    });

    await cargarUsuarioCompleto(firebaseUser);
    return firebaseUser;
  };

  // Login normal
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cargarUsuarioCompleto(cred.user);
    return cred.user;
  };

  // Login con Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;

    const refUser = doc(db, "usuarios", gUser.uid);
    const snap = await getDoc(refUser);

    if (!snap.exists()) {
      await setDoc(refUser, {
        uid: gUser.uid,
        email: gUser.email,
        username: gUser.displayName || "Usuario",
        avatar: gUser.photoURL || "",
        bio: "",
        provider: "google",
        role: "user",
        createdAt: serverTimestamp(),
      });
    }

    await cargarUsuarioCompleto(gUser);
    return gUser;
  };

  // Cambiar el rol de un usuario
const cambiarRolUsuario = async (uid, nuevoRol) => {
  if (!uid) return;

  try {
    await updateDoc(doc(db, "usuarios", uid), { role: nuevoRol });
    
    // Si el usuario que estás viendo es el mismo que está logueado, recargar datos
    if (user?.uid === uid) {
      setUser(prev => ({ ...prev, role: nuevoRol }));
    }

  } catch (err) {
    console.error("Error cambiando rol del usuario:", err);
  }
};


  // Agrega dentro de AuthProvider, antes de return
const seguirUsuario = async (uidActual, uidObjetivo) => {
  if (!uidActual || !uidObjetivo) return;

  // Agregar en seguidores del usuario objetivo
  await setDoc(doc(db, "usuarios", uidObjetivo, "seguidores", uidActual), {
    timestamp: serverTimestamp(),
  });

  // Agregar en siguiendo del usuario actual
  await setDoc(doc(db, "usuarios", uidActual, "siguiendo", uidObjetivo), {
    timestamp: serverTimestamp(),
  });

  // Opcional: notificación
  await addDoc(collection(db, "usuarios", uidObjetivo, "notificaciones"), {
    tipo: "follow",
    fromUID: uidActual,
    nombreAutor: user?.username || "Usuario",
    fecha: serverTimestamp(),
    leida: false
  });
};

// Función para borrar subcolecciones
const deleteSubcollection = async (parentId, subcollection) => {
  const subColRef = collection(db, "usuarios", parentId, subcollection);
  const snap = await getDocs(subColRef);
  for (let d of snap.docs) {
    await deleteDoc(doc(db, "usuarios", parentId, subcollection, d.id));
  }
};

// Función principal para eliminar usuario
const eliminarUsuario = async (uid) => {
  if (!uid) return;

  try {
    // Primero borramos subcolecciones
    await deleteSubcollection(uid, "biblioteca");
    await deleteSubcollection(uid, "favoritos");
    await deleteSubcollection(uid, "lecturas");
    await deleteSubcollection(uid, "notificaciones");
    await deleteSubcollection(uid, "seguidores");
    await deleteSubcollection(uid, "siguiendo");

    // Luego borramos sus libros y reseñas (si quieres eliminar todo)
    const librosRef = collection(db, "libros");
    const librosSnap = await getDocs(librosRef);
    for (let l of librosSnap.docs) {
      if (l.data().autorId === uid) {
        await deleteDoc(doc(db, "libros", l.id));
      }
    }

    const reseñasRef = collection(db, "reseñas");
    const reseñasSnap = await getDocs(reseñasRef);
    for (let r of reseñasSnap.docs) {
      if (r.data().usuarioId === uid) {
        await deleteDoc(doc(db, "reseñas", r.id));
      }
    }

    // Finalmente borramos el usuario
    await deleteDoc(doc(db, "usuarios", uid));

    console.log("Usuario eliminado completamente ✅");
  } catch (err) {
    console.error("Error eliminando usuario:", err);
  }
};

// Bloquear usuario
const bloquearUsuario = async (uid) => {
  if (!uid) return;
  try {
    await updateDoc(doc(db, "usuarios", uid), { bloqueado: true });
  } catch (err) {
    console.error("Error bloqueando usuario:", err);
  }
};

// Desbloquear usuario
const desbloquearUsuario = async (uid) => {
  if (!uid) return;
  try {
    await updateDoc(doc(db, "usuarios", uid), { bloqueado: false });
  } catch (err) {
    console.error("Error desbloqueando usuario:", err);
  }
};


const dejarSeguirUsuario = async (uidActual, uidObjetivo) => {
  if (!uidActual || !uidObjetivo) return;

  // Eliminar de seguidores del usuario objetivo
  await deleteDoc(doc(db, "usuarios", uidObjetivo, "seguidores", uidActual));

  // Eliminar de siguiendo del usuario actual
  await deleteDoc(doc(db, "usuarios", uidActual, "siguiendo", uidObjetivo));
};


  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
  if (user?.bloqueado) {
    alert("Tu cuenta ha sido suspendida hasta tiempo indefinido. Puedes leer libros, pero no subir ni escribir contenido.");
  }
}, [user]);


 const value = {
  user,
  loading,
  register,
  login,
  loginWithGoogle,
  logout,
  seguirUsuario,      
  dejarSeguirUsuario,  
  cambiarRolUsuario, 
    eliminarUsuario,
  bloquearUsuario,
  desbloquearUsuario,
  updateProfileData: async ({ displayName, bio, file }) => {
    if (!user) return;
    const uid = user.uid;
    let photoURL = user.photoURL;

    if (file) {
      const imgRef = ref(storage, `usuario/${uid}-${Date.now()}`);
      await uploadBytes(imgRef, file);
      photoURL = await getDownloadURL(imgRef);
      await updateProfile(auth.currentUser, { photoURL });
    }

    await updateDoc(doc(db, "usuarios", uid), {
      username: displayName,
      bio: bio || "",
      avatar: photoURL,
    });

    await cargarUsuarioCompleto(auth.currentUser);
  },
};

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}