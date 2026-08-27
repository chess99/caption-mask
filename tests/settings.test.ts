import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_APPEARANCE,
  colorWithOpacity,
  parseAppearanceSettings,
} from "../src/settings";

test("appearance settings fall back safely when storage is absent", () => {
  assert.deepEqual(parseAppearanceSettings(undefined), DEFAULT_APPEARANCE);
  assert.deepEqual(parseAppearanceSettings({}), DEFAULT_APPEARANCE);
});

test("appearance settings validate color and clamp opacity", () => {
  assert.deepEqual(
    parseAppearanceSettings({ color: "#A1B2C3", opacity: 2, hoverOpacity: -1 }),
    { color: "#a1b2c3", opacity: 1, hoverOpacity: 0 },
  );
  assert.deepEqual(
    parseAppearanceSettings({ color: "red", opacity: Number.NaN, hoverOpacity: "0.5" }),
    DEFAULT_APPEARANCE,
  );
});

test("colorWithOpacity produces a CSS rgba color", () => {
  assert.equal(colorWithOpacity("#3f3f3f", 0.96), "rgba(63, 63, 63, 0.96)");
  assert.equal(colorWithOpacity("#ff8000", 0.25), "rgba(255, 128, 0, 0.25)");
});
