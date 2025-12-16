/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback } from "react";

import { ref, onDisconnect, set, onValue } from "firebase/database";
import { rtdb } from "../firebase/rtdb"; // 👈 ojo aquí
import { useAuth } from "./AuthContext";

const PresenceContext = createContext(null);

export function PresenceProvider({ children }) {
  const { user } = useAuth();

  // 🔴 SOLO: marcar MI presencia
useEffect(() => {
  if (!user?.uid) return;

  const statusRef = ref(rtdb, `status/${user.uid}`);
  const connectedRef = ref(rtdb, ".info/connected");

  const online = {
    estado: "online",
    lastChanged: Date.now(),
  };

  const offline = {
    estado: "offline",
    lastChanged: Date.now(),
  };

  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === false) return;

    onDisconnect(statusRef).set(offline).then(() => {
      set(statusRef, online);
    });
  });

  return () => unsubscribe();
}, [user?.uid]);


  // 🟢 FUNCIÓN PARA ESCUCHAR PRESENCIA DE CUALQUIER UID
 const listenToPresence = useCallback((uid, callback) => {
  const statusRef = ref(rtdb, `status/${uid}`);

  return onValue(statusRef, (snap) => {
    callback(
      snap.exists()
        ? snap.val()
        : { estado: "offline", lastChanged: null }
    );
  });
}, []);
  return (
    <PresenceContext.Provider value={{ listenToPresence }}>
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence debe usarse dentro de PresenceProvider");
  }
  return ctx;
};