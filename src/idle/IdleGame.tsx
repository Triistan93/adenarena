import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Side-effect import FIRST so window.GameData exists before main.js evaluates.
// @ts-ignore -- plain JS module, no type declarations
import "../../lineage-idle/src/data/items/index.js";

import "../../lineage-idle/src/data/classes/index.js";

// @ts-ignore -- Adapta CLASSES_ECHO.skills[] para SKILL_DEFS_ECHO / CLASS_SKILLS_ECHO / SKILL_TREE_LAYOUT_ECHO
//               que o engine (main.js) precisa. Deve vir DEPOIS de classes_echo.js e ANTES de main.js.
import "../../lineage-idle/data/echo-adapter.js";
// @ts-ignore -- Grimoire theme FX helpers
import "../../lineage-idle/theme-grimoire.js";
// @ts-ignore
import { init, setRoot, destroy } from "../../lineage-idle/main.js";
// @ts-ignore
import { bootstrap, destroyBootstrap } from "../../lineage-idle/src/core/GameBootstrap.js";
// @ts-ignore -- Vite ?raw import returns the CSS source as a string
import idleCss from "../../lineage-idle/style.css?raw";
// @ts-ignore -- Grimoire theme CSS
import grimoireCss from "../../lineage-idle/theme-grimoire.css?raw";

import { IDLE_MARKUP } from "./markup";
import "./heroImages";
import "../utils/idleAudio";
import { deviceDetector } from "../services/DeviceDetector";
import { CharacterCreation, CharacterCreationData } from "../components/CharacterCreation";
import { 
  syncPlayerPublicProfile, 
  fetchLeaderboardRankings, 
  fetchPvPMatchmakingOpponents, 
  createMarketListingInCloud,
  fetchMarketListingsFromCloud,
  deleteMarketListingInCloud,
  checkListingStatusInCloud,
  executeMarketPurchaseInCloud,
  recordMarketSaleInCloud,
  fetchPlayerSalesFromCloud,
  claimPlayerSalesInCloud,
  subscribeToMarketListings,
  savePlayerStateToCloud,
  loadPlayerStateFromCloud,
  onAuthStateChanged,
  auth 
} from "../firebase";

// Expondo FirebaseBridge para os serviços de Rankings, Matchmaking, Mercado Global P2P e Cloud Save
if (typeof window !== "undefined") {
  (window as any).FirebaseBridge = {
    syncPublicProfile: async (profileData: any) => {
      const user = auth.currentUser;
      if (!user) return false;
      return await syncPlayerPublicProfile(user.uid, profileData);
    },
    fetchLeaderboard: fetchLeaderboardRankings,
    fetchMatchmakingOpponents: fetchPvPMatchmakingOpponents,
    getCurrentUserId: () => auth.currentUser?.uid || null,

    // Métodos do Mercado Global P2P em Nuvem (Transações Atômicas & Custódia)
    createMarketListing: createMarketListingInCloud,
    fetchMarketListings: fetchMarketListingsFromCloud,
    deleteMarketListing: deleteMarketListingInCloud,
    checkListingStatus: checkListingStatusInCloud,
    executeMarketPurchase: executeMarketPurchaseInCloud,
    recordMarketSale: recordMarketSaleInCloud,
    fetchPlayerSales: fetchPlayerSalesFromCloud,
    claimPlayerSales: claimPlayerSalesInCloud,
    subscribeMarketListings: subscribeToMarketListings,
    subscribePlayerSales: subscribeToPlayerSales,

    // Pipeline de Save em Nuvem
    savePlayerState: savePlayerStateToCloud,
    loadPlayerState: loadPlayerStateFromCloud
  };

  // Pipeline global de salvamento instantâneo em nuvem
  (window as any).saveCloudNow = async (stateData?: any, immediate: boolean = false) => {
    const user = auth.currentUser;
    if (!user) return false;
    const data = stateData || ((typeof (window as any).getGameState === 'function') ? (window as any).getGameState() : null);
    if (!data) return false;
    return await savePlayerStateToCloud(user.uid, data, immediate);
  };

  (window as any).saveCloudOnUnload = () => {
    const user = auth.currentUser;
    if (!user) return;
    const data = (typeof (window as any).getGameState === 'function') ? (window as any).getGameState() : null;
    if (data) {
      savePlayerStateToCloud(user.uid, data, true);
    }
  };
}

/**
 * Mounts the Lineage Idle game inside a Shadow DOM so its global-looking
 * selectors (and the arena's Tailwind/Three styles) never bleed into each
 * other. The vanilla game code queries the shadow root via setRoot().
 */
export default function IdleGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [changeScrollData, setChangeScrollData] = useState<{
    scrollUid: string;
    charName: string;
    race: string;
    class: string;
  } | null>(null);

  useEffect(() => {
    const syncAdminStatus = async (userUid: string) => {
      try {
        const cloudState = await loadPlayerStateFromCloud(userUid);
        if (cloudState) {
          const priv = Number(cloudState.privilegeLevel) || (cloudState.role === 'admin' ? 1 : 0) || 0;
          (window as any).currentUserPrivilege = priv;
          if (typeof (window as any).getGameState === 'function') {
            const st = (window as any).getGameState();
            if (st) {
              st.privilegeLevel = priv;
            }
          }
          if (typeof (window as any).loadGameState === 'function') {
            (window as any).loadGameState(cloudState);
          }
        }
      } catch (e) {
        console.debug('IdleGame admin cloud sync notice:', e);
      }
    };

    if (auth.currentUser) {
      syncAdminStatus(auth.currentUser.uid);
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        syncAdminStatus(user.uid);
      }
    });

    // Cloud Auto-Save loop periódico a cada 15 segundos
    const cloudSaveInterval = setInterval(() => {
      if (auth.currentUser && typeof (window as any).saveCloudNow === 'function') {
        (window as any).saveCloudNow(undefined, false);
      }
    }, 15000);

    return () => {
      unsub();
      clearInterval(cloudSaveInterval);
    };
  }, []);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${idleCss}\n${grimoireCss}</style>${IDLE_MARKUP}`;
    
    // Inicialização unificada via GameBootstrap
    bootstrap(shadow as unknown as Document);
    init();

    // Device Type Detection & Mobile/Desktop Classes
    const gameDiv = shadow.getElementById
      ? shadow.getElementById('game')
      : (shadow as any).querySelector?.('#game');

    let unsubDevice: (() => void) | null = null;
    if (gameDiv) {
      deviceDetector.applyClasses(gameDiv as HTMLElement);
      unsubDevice = deviceDetector.subscribe(() => {
        deviceDetector.applyClasses(gameDiv as HTMLElement);
      });
    }

    // ---- Embers / brasas de fogo — montagem correta no Shadow DOM ----
    if ((window as any).GrimoireFX) {
      if (gameDiv && !gameDiv.querySelector('.g-ember-global')) {
        const emberDiv = document.createElement('div');
        emberDiv.className = 'g-ember-global';
        gameDiv.insertBefore(emberDiv, gameDiv.firstChild);
        (window as any).GrimoireFX.mountEmbers(emberDiv, {
          count: 60,
          colors: ['#f0883e', '#f0cd7e', '#e87d2e', '#ffd166', '#ff9b42', '#ffb347']
        });
      }
    }

    (window as any).onOpenRaceClassChangeModal = (data: any) => {
      setChangeScrollData(data);
    };

    return () => {
      if (unsubDevice) unsubDevice();
      delete (window as any).onOpenRaceClassChangeModal;
      destroyBootstrap();
      destroy();
      if (host.shadowRoot) {
        host.shadowRoot.innerHTML = "";
      }
    };
  }, []);

  const handleConfirmChange = (data: CharacterCreationData) => {
    if (changeScrollData && (window as any).executeRaceClassChange) {
      (window as any).executeRaceClassChange(changeScrollData.scrollUid, data.race, data.className);
    }
    setChangeScrollData(null);
  };

  return (
    <>
      <div ref={hostRef} id="idle-host" className="w-full h-full min-h-screen block overflow-hidden" />
      {changeScrollData && (
        <CharacterCreation
          isChangeScroll={true}
          initialCharName={changeScrollData.charName}
          initialRace={changeScrollData.race}
          initialClass={changeScrollData.class}
          onComplete={handleConfirmChange}
          onCancel={() => setChangeScrollData(null)}
        />
      )}
    </>
  );
}
