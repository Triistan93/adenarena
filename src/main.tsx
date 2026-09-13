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

  // ── PROTOCOLO DE WIPE GERAL DO SERVIDOR & PURGA TOTAL DE CACHE ──────────────
  const WIPE_EPOCH = "2026-09-13_WIPE_ZERO_V1";
  const APP_VERSION = "4.0.0";

  const currentWipe = localStorage.getItem("aden_wipe_epoch");
  if (currentWipe !== WIPE_EPOCH) {
    console.warn("🚨 [WIPE PROTOCOL] Disparando purga completa de cache e armazenamento local...");

    // 1. Limpa todas as instâncias de CacheStorage do navegador / PWA
    if ("caches" in window) {
      try {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      } catch (e) {
        console.debug("CacheStorage wipe notice:", e);
      }
    }

    // 2. Limpa bancos de dados locais IndexedDB (incluindo cache offline do Firestore)
    if ("indexedDB" in window && typeof indexedDB.databases === "function") {
      try {
        indexedDB.databases().then((dbs) => {
          for (const dbInfo of dbs) {
            if (dbInfo.name) {
              indexedDB.deleteDatabase(dbInfo.name);
            }
          }
        });
      } catch (e) {
        console.debug("IndexedDB wipe notice:", e);
      }
    }

    // 3. Expurgo minucioso do localStorage
    const preserveKeys = new Set(["aden_wipe_epoch", "aden_app_version", "aden_pending_char_creation"]);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !preserveKeys.has(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 4. Limpa sessionStorage
    sessionStorage.clear();

    // 5. Marca a época do wipe e direciona imediatamente para Criação de Personagem
    localStorage.setItem("aden_wipe_epoch", WIPE_EPOCH);
    localStorage.setItem("aden_app_version", APP_VERSION);
    localStorage.setItem("aden_pending_char_creation", "1");
    console.log("✅ [WIPE PROTOCOL] Cache, IndexedDB e LocalStorage zerados com sucesso. Redirecionando para Criação de Personagem.");
  }

  // Clear chunk recovery lock on successful script execution
  sessionStorage.removeItem("chunk_recovery_reloaded");
  sessionStorage.removeItem("chunk_reload_lock");

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
