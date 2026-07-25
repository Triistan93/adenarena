import { useLayoutEffect, useRef } from "react";

// Side-effect import FIRST so window.GameData exists before main.js evaluates.
// These live outside src/ on purpose: the idle game is a self-contained
// vanilla-JS app that we mount into a Shadow DOM for style isolation.
// @ts-ignore -- plain JS module, no type declarations
import "../../lineage-idle/data/items.js";
// @ts-ignore
import { init, setRoot, destroy } from "../../lineage-idle/main.js";
// @ts-ignore -- Vite ?raw import returns the CSS source as a string
import idleCss from "../../lineage-idle/style.css?raw";

import { IDLE_MARKUP } from "./markup";
import "../../src/idle/heroImages";

/**
 * Mounts the Lineage Idle game inside a Shadow DOM so its global-looking
 * selectors (and the arena's Tailwind/Three styles) never bleed into each
 * other. The vanilla game code queries the shadow root via setRoot().
 */
export default function IdleGame() {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${idleCss}</style>${IDLE_MARKUP}`;
    setRoot(shadow as unknown as Document);
    init();

    return () => {
      destroy();
      if (host.shadowRoot) {
        host.shadowRoot.innerHTML = "";
      }
    };
  }, []);

  return <div ref={hostRef} id="idle-host" />;
}
