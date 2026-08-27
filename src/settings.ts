export interface AppearanceSettings {
  color: string;
  opacity: number;
  hoverOpacity: number;
}

export const APPEARANCE_STORAGE_KEY = "captionMask.appearance.v1";

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  color: "#3f3f3f",
  opacity: 0.96,
  hoverOpacity: 0.25,
};

function normalizedOpacity(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

export function parseAppearanceSettings(value: unknown): AppearanceSettings {
  if (typeof value !== "object" || value === null) return { ...DEFAULT_APPEARANCE };
  const candidate = value as Partial<Record<keyof AppearanceSettings, unknown>>;
  const color =
    typeof candidate.color === "string" && /^#[0-9a-f]{6}$/i.test(candidate.color)
      ? candidate.color.toLowerCase()
      : DEFAULT_APPEARANCE.color;

  return {
    color,
    opacity: normalizedOpacity(candidate.opacity, DEFAULT_APPEARANCE.opacity),
    hoverOpacity: normalizedOpacity(
      candidate.hoverOpacity,
      DEFAULT_APPEARANCE.hoverOpacity,
    ),
  };
}

export function colorWithOpacity(color: string, opacity: number): string {
  const normalized = parseAppearanceSettings({ color, opacity, hoverOpacity: opacity });
  const red = Number.parseInt(normalized.color.slice(1, 3), 16);
  const green = Number.parseInt(normalized.color.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${normalized.opacity})`;
}

export function loadAppearanceSettings(): Promise<AppearanceSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(APPEARANCE_STORAGE_KEY, (items) => {
      if (chrome.runtime.lastError) {
        resolve({ ...DEFAULT_APPEARANCE });
        return;
      }
      resolve(parseAppearanceSettings(items[APPEARANCE_STORAGE_KEY]));
    });
  });
}

export function saveAppearanceSettings(settings: AppearanceSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      { [APPEARANCE_STORAGE_KEY]: parseAppearanceSettings(settings) },
      () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      },
    );
  });
}

export function subscribeToAppearance(
  listener: (settings: AppearanceSettings) => void,
): () => void {
  const onChanged = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== "local" || !changes[APPEARANCE_STORAGE_KEY]) return;
    listener(parseAppearanceSettings(changes[APPEARANCE_STORAGE_KEY].newValue));
  };

  chrome.storage.onChanged.addListener(onChanged);
  return () => chrome.storage.onChanged.removeListener(onChanged);
}
