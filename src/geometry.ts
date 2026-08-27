export interface MaskRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export const DEFAULT_RECT: MaskRect = {
  top: 0,
  left: 0,
  width: 800,
  height: 32,
};

export const MIN_MASK_WIDTH = 160;
export const MIN_MASK_HEIGHT = 24;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

export function parseStoredRect(value: unknown): MaskRect | null {
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as Record<keyof MaskRect, unknown>;
  const values = [candidate.top, candidate.left, candidate.width, candidate.height];
  if (!values.every((item) => typeof item === "number" && Number.isFinite(item))) {
    return null;
  }
  if ((candidate.width as number) <= 0 || (candidate.height as number) <= 0) {
    return null;
  }

  return {
    top: candidate.top as number,
    left: candidate.left as number,
    width: candidate.width as number,
    height: candidate.height as number,
  };
}

export function fitRectToViewport(rect: MaskRect, viewport: ViewportSize): MaskRect {
  const viewportWidth = Math.max(1, viewport.width);
  const viewportHeight = Math.max(1, viewport.height);
  const minimumWidth = Math.min(MIN_MASK_WIDTH, viewportWidth);
  const minimumHeight = Math.min(MIN_MASK_HEIGHT, viewportHeight);
  const width = clamp(rect.width, minimumWidth, viewportWidth);
  const height = clamp(rect.height, minimumHeight, viewportHeight);

  return {
    top: clamp(rect.top, 0, viewportHeight - height),
    left: clamp(rect.left, 0, viewportWidth - width),
    width,
    height,
  };
}

export function moveRect(
  start: MaskRect,
  deltaX: number,
  deltaY: number,
  viewport: ViewportSize,
): MaskRect {
  return fitRectToViewport(
    { ...start, left: start.left + deltaX, top: start.top + deltaY },
    viewport,
  );
}

export function resizeRect(
  start: MaskRect,
  deltaX: number,
  deltaY: number,
  viewport: ViewportSize,
): MaskRect {
  const fittedStart = fitRectToViewport(start, viewport);
  const maximumWidth = Math.max(1, viewport.width - fittedStart.left);
  const maximumHeight = Math.max(1, viewport.height - fittedStart.top);
  const minimumWidth = Math.min(MIN_MASK_WIDTH, maximumWidth);
  const minimumHeight = Math.min(MIN_MASK_HEIGHT, maximumHeight);

  return {
    ...fittedStart,
    width: clamp(fittedStart.width + deltaX, minimumWidth, maximumWidth),
    height: clamp(fittedStart.height + deltaY, minimumHeight, maximumHeight),
  };
}
