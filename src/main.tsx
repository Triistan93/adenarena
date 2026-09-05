import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Force purge stale Service Workers, Web Caches, and handle stale chunk reloads
if (typeof window !== "undefined") {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && typeof ref === "string") {
      const cleanRef = ref.trim().slice(0, 30);
      if (cleanRef) {
        localStorage.setItem("aden_referred_by", cleanRef);
      }
    }
  } catch (e) {
    console.warn("Falha ao capturar ref:", e);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ("caches" in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }

  window.addEventListener("error", (e) => {
    const msg = e.message || "";
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Failed to load module script") ||
      msg.includes("text/html")
    ) {
      if (!sessionStorage.getItem("chunk_reload_lock")) {
        sessionStorage.setItem("chunk_reload_lock", "1");
        window.location.reload();
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
