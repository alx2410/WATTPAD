import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { PresenceProvider } from "./context/PresenceContext";
import { NotificationProvider } from "./context/NotificationContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter >
    <AuthProvider>
      <NotificationProvider>
        <PresenceProvider>
      <App />
      </PresenceProvider>
      </NotificationProvider>
    </AuthProvider>
    </BrowserRouter>
    
  </React.StrictMode>
);
