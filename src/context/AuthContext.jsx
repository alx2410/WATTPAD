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
      createdAt: serverTimestamp(),
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
        createdAt: serverTimestamp(),
      });
    }

    await cargarUsuarioCompleto(gUser);
    return gUser;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
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
