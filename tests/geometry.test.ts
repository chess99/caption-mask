import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_RECT,
  fitRectToViewport,
  moveRect,
  parseStoredRect,
  resizeRect,
} from "../src/geometry";

test("parseStoredRect only accepts finite, positive rectangles", () => {
  assert.deepEqual(parseStoredRect({ top: 1, left: 2, width: 300, height: 40 }), {
    top: 1,
    left: 2,
    width: 300,
    height: 40,
  });
  assert.equal(parseStoredRect(null), null);
  assert.equal(parseStoredRect({ ...DEFAULT_RECT, width: 0 }), null);
  assert.equal(parseStoredRect({ ...DEFAULT_RECT, top: Number.NaN }), null);
});

test("fitRectToViewport keeps a restored mask reachable", () => {
  assert.deepEqual(
    fitRectToViewport({ top: 999, left: -50, width: 900, height: 100 }, { width: 640, height: 360 }),
    { top: 260, left: 0, width: 640, height: 100 },
  );
});

test("moveRect clamps every edge to the viewport", () => {
  const viewport = { width: 500, height: 300 };
  const rect = { top: 50, left: 50, width: 200, height: 50 };
  assert.deepEqual(moveRect(rect, -100, -100, viewport), { ...rect, top: 0, left: 0 });
  assert.deepEqual(moveRect(rect, 999, 999, viewport), { ...rect, top: 250, left: 300 });
});

test("resizeRect honors minimum size and available space", () => {
  const viewport = { width: 500, height: 300 };
  const rect = { top: 100, left: 100, width: 200, height: 50 };
  assert.deepEqual(resizeRect(rect, -999, -999, viewport), {
    ...rect,
    width: 160,
    height: 24,
  });
  assert.deepEqual(resizeRect(rect, 999, 999, viewport), {
    ...rect,
    width: 400,
    height: 200,
  });
});
