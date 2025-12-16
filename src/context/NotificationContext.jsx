import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "usuarios", user.uid, "notificaciones");
    const q = query(ref, orderBy("fecha", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const noVistas = notifs.filter(n => !n.visto); // solo las no vistas
      setUnreadCount(noVistas.length);
    });

    return () => unsub();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);