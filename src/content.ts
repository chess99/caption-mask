import {
  DEFAULT_RECT,
  fitRectToViewport,
  moveRect,
  parseStoredRect,
  resizeRect,
  type MaskRect,
  type ViewportSize,
} from "./geometry";
import {
  colorWithOpacity,
  loadAppearanceSettings,
  subscribeToAppearance,
  type AppearanceSettings,
} from "./settings";

const HOST_ID = "caption-mask-extension-root";
const STORAGE_KEY = "captionMask.rect.v1";
const LEGACY_STORAGE_KEY = "caption-mask-sizing";

interface CaptionMaskController {
  destroy(): void;
  host: HTMLElement;
}

declare global {
  interface Window {
    __captionMaskController__?: CaptionMaskController;
  }
}

const styles = `
  :host {
    all: initial;
  }

  .mask {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    overflow: hidden;
    cursor: move;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 5px;
    background: var(--caption-mask-background, rgba(63, 63, 63, 0.96));
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    transition: background-color 160ms ease;
    touch-action: none;
    user-select: none;
  }

  .mask:hover {
    background: var(--caption-mask-hover-background, rgba(63, 63, 63, 0.25));
  }

  .settings-button {
    position: absolute;
    top: 3px;
    right: 4px;
    display: grid;
    width: 20px;
    height: 20px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 5px;
    opacity: 0;
    background: rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.94);
    cursor: pointer;
    font: 14px/1 ui-sans-serif, system-ui, sans-serif;
    pointer-events: none;
    transition: opacity 120ms ease, background-color 120ms ease;
  }

  .mask:hover .settings-button,
  .settings-button:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .settings-button:hover {
    background: rgba(0, 0, 0, 0.75);
  }

  .settings-button:focus-visible {
    outline: 2px solid white;
    outline-offset: 1px;
  }

  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 18px;
    height: 18px;
    cursor: se-resize;
    touch-action: none;
  }

  .resize-handle::after {
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(255, 255, 255, 0.86);
    border-bottom: 2px solid rgba(255, 255, 255, 0.86);
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
  }
`;

function getViewport(): ViewportSize {
  return {
    width: document.documentElement.clientWidth || window.innerWidth,
    height: document.documentElement.clientHeight || window.innerHeight,
  };
}

function rectFromElement(element: HTMLElement): MaskRect {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function applyRect(element: HTMLElement, rect: MaskRect): void {
  element.style.top = `${Math.round(rect.top)}px`;
  element.style.left = `${Math.round(rect.left)}px`;
  element.style.width = `${Math.round(rect.width)}px`;
  element.style.height = `${Math.round(rect.height)}px`;
}

function applyAppearance(element: HTMLElement, settings: AppearanceSettings): void {
  element.style.setProperty(
    "--caption-mask-background",
    colorWithOpacity(settings.color, settings.opacity),
  );
  element.style.setProperty(
    "--caption-mask-hover-background",
    colorWithOpacity(settings.color, settings.hoverOpacity),
  );
}

function readChromeStorage(): Promise<MaskRect | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (items) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve(parseStoredRect(items[STORAGE_KEY]));
    });
  });
}

function readLegacyStorage(): MaskRect | null {
  try {
    const value = localStorage.getItem(LEGACY_STORAGE_KEY);
    return value ? parseStoredRect(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

async function loadRect(): Promise<MaskRect> {
  const stored = await readChromeStorage();
  return stored ?? readLegacyStorage() ?? DEFAULT_RECT;
}

function saveRect(rect: MaskRect): void {
  chrome.storage.local.set({ [STORAGE_KEY]: rect });
}

function mountMask(): CaptionMaskController {
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("role", "presentation");
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483647",
    display: "block",
    margin: "0",
    padding: "0",
    border: "0",
    boxSizing: "border-box",
  });
  applyRect(host, fitRectToViewport(DEFAULT_RECT, getViewport()));

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles;
  const mask = document.createElement("div");
  mask.className = "mask";
  mask.setAttribute("aria-label", "字幕遮罩，可拖动");
  const settingsButton = document.createElement("button");
  settingsButton.className = "settings-button";
  settingsButton.type = "button";
  settingsButton.title = "打开 Caption Mask 设置";
  settingsButton.setAttribute("aria-label", "打开 Caption Mask 设置");
  settingsButton.textContent = "⚙";
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "resize-handle";
  resizeHandle.setAttribute("aria-label", "调整字幕遮罩大小");
  mask.append(settingsButton, resizeHandle);
  shadow.append(style, mask);

  let destroyed = false;
  let hasInteracted = false;
  let removePointerListeners: (() => void) | undefined;

  const appendToCurrentRoot = (): void => {
    const root = document.fullscreenElement ?? document.documentElement;
    root.append(host);
  };

  const startPointerOperation = (
    event: PointerEvent,
    operation: "move" | "resize",
  ): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startRect = rectFromElement(host);
    hasInteracted = true;

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextRect =
        operation === "move"
          ? moveRect(startRect, deltaX, deltaY, getViewport())
          : resizeRect(startRect, deltaX, deltaY, getViewport());
      applyRect(host, nextRect);
    };

    const stop = (): void => {
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", stop, true);
      window.removeEventListener("pointercancel", stop, true);
      removePointerListeners = undefined;
      if (!destroyed) saveRect(rectFromElement(host));
    };

    removePointerListeners?.();
    removePointerListeners = stop;
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", stop, true);
    window.addEventListener("pointercancel", stop, true);
  };

  const onMaskPointerDown = (event: PointerEvent): void => {
    if (event.target === resizeHandle || event.target === settingsButton) return;
    startPointerOperation(event, "move");
  };
  const onResizePointerDown = (event: PointerEvent): void => {
    startPointerOperation(event, "resize");
  };
  const onFullscreenChange = (): void => {
    if (destroyed) return;
    appendToCurrentRoot();
    applyRect(host, fitRectToViewport(rectFromElement(host), getViewport()));
  };
  const onWindowResize = (): void => {
    if (destroyed) return;
    applyRect(host, fitRectToViewport(rectFromElement(host), getViewport()));
  };
  const onSettingsPointerDown = (event: PointerEvent): void => {
    event.stopPropagation();
  };
  const onSettingsClick = (event: MouseEvent): void => {
    event.stopPropagation();
    void chrome.runtime.sendMessage({ type: "caption-mask:open-options" });
  };

  mask.addEventListener("pointerdown", onMaskPointerDown);
  resizeHandle.addEventListener("pointerdown", onResizePointerDown);
  settingsButton.addEventListener("pointerdown", onSettingsPointerDown);
  settingsButton.addEventListener("click", onSettingsClick);
  document.addEventListener("fullscreenchange", onFullscreenChange);
  window.addEventListener("resize", onWindowResize);
  appendToCurrentRoot();

  const removeAppearanceSubscription = subscribeToAppearance((settings) => {
    if (!destroyed) applyAppearance(mask, settings);
  });

  void loadAppearanceSettings().then((settings) => {
    if (!destroyed) applyAppearance(mask, settings);
  });

  void loadRect().then((rect) => {
    if (!destroyed && !hasInteracted) {
      const fitted = fitRectToViewport(rect, getViewport());
      applyRect(host, fitted);
      saveRect(fitted);
    }
  });

  return {
    host,
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      removePointerListeners?.();
      mask.removeEventListener("pointerdown", onMaskPointerDown);
      resizeHandle.removeEventListener("pointerdown", onResizePointerDown);
      settingsButton.removeEventListener("pointerdown", onSettingsPointerDown);
      settingsButton.removeEventListener("click", onSettingsClick);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("resize", onWindowResize);
      removeAppearanceSubscription();
      host.remove();
    },
  };
}

const previous = window.__captionMaskController__;
if (previous?.host.isConnected) {
  previous.destroy();
  delete window.__captionMaskController__;
} else {
  previous?.destroy();
  const controller = mountMask();
  window.__captionMaskController__ = controller;
}
