import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("manifest uses MV3 and only the reviewed minimum permissions", async () => {
  const source = await readFile(new URL("../src/manifest.json", import.meta.url), "utf8");
  const manifest = JSON.parse(source.replace("$VERSION", "1.0.0")) as Record<string, unknown>;

  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["activeTab", "scripting", "storage"]);
  assert.equal("host_permissions" in manifest, false);
  assert.equal("content_scripts" in manifest, false);
  assert.equal("web_accessible_resources" in manifest, false);
  assert.deepEqual(manifest.commands, {
    _execute_action: { suggested_key: { default: "Alt+M" } },
  });
  assert.deepEqual(manifest.options_ui, {
    page: "options.html",
    open_in_tab: true,
  });
});
