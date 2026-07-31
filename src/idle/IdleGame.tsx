import { useLayoutEffect, useRef, useState } from "react";

// Side-effect import FIRST so window.GameData exists before main.js evaluates.
// @ts-ignore -- plain JS module, no type declarations
import "../../lineage-idle/data/items.js";
// @ts-ignore -- Echo of Elements class/skill data — must load BEFORE main.js
import "../../lineage-idle/data/classes_echo.js";
// @ts-ignore -- Grimoire theme FX helpers
import "../../lineage-idle/theme-grimoire.js";
// @ts-ignore
import { init, setRoot, destroy } from "../../lineage-idle/main.js";
// @ts-ignore -- Vite ?raw import returns the CSS source as a string
import idleCss from "../../lineage-idle/style.css?raw";
// @ts-ignore -- Grimoire theme CSS
import grimoireCss from "../../lineage-idle/theme-grimoire.css?raw";

import { IDLE_MARKUP } from "./markup";
import "./heroImages";
import "../utils/idleAudio";
import { CharacterCreation, CharacterCreationData } from "../components/CharacterCreation";

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

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${idleCss}\n${grimoireCss}</style>${IDLE_MARKUP}`;
    setRoot(shadow as unknown as Document);
    init();

    if ((window as any).GrimoireFX) {
      // Cria div fixed que cobre a tela inteira — embers sempre visíveis
      const emberGlobal = shadow.createElement
        ? (shadow as any).createElement('div')
        : document.createElement('div');
      emberGlobal.className = 'g-ember-global';
      // Insere como primeiro filho do #game para ficar abaixo de tudo
      const gameDiv = shadow.getElementById('game') ?? shadow.querySelector('#game');
      if (gameDiv) {
        gameDiv.insertBefore(emberGlobal, gameDiv.firstChild);
      } else {
        shadow.appendChild(emberGlobal);
      }
      (window as any).GrimoireFX.mountEmbers(emberGlobal, {
        count: 45,
        colors: ['#f0883e', '#f0cd7e', '#e87d2e', '#ffd166', '#ff9b42']
      });
    }

    (window as any).onOpenRaceClassChangeModal = (data: any) => {
      setChangeScrollData(data);
    };

    return () => {
      delete (window as any).onOpenRaceClassChangeModal;
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
      <div ref={hostRef} id="idle-host" />
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
