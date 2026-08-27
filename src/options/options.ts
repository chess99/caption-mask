import {
  DEFAULT_APPEARANCE,
  colorWithOpacity,
  loadAppearanceSettings,
  parseAppearanceSettings,
  saveAppearanceSettings,
  type AppearanceSettings,
} from "../settings";

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing options element: ${id}`);
  return element as T;
}

const form = requiredElement<HTMLFormElement>("appearance-form");
const colorInput = requiredElement<HTMLInputElement>("mask-color");
const opacityInput = requiredElement<HTMLInputElement>("mask-opacity");
const hoverOpacityInput = requiredElement<HTMLInputElement>("hover-opacity");
const opacityValue = requiredElement<HTMLOutputElement>("mask-opacity-value");
const hoverOpacityValue = requiredElement<HTMLOutputElement>("hover-opacity-value");
const preview = requiredElement<HTMLElement>("mask-preview");
const resetButton = requiredElement<HTMLButtonElement>("reset-button");
const status = requiredElement<HTMLElement>("save-status");

function settingsFromForm(): AppearanceSettings {
  return parseAppearanceSettings({
    color: colorInput.value,
    opacity: Number(opacityInput.value) / 100,
    hoverOpacity: Number(hoverOpacityInput.value) / 100,
  });
}

function updatePreview(): void {
  const settings = settingsFromForm();
  opacityValue.value = `${Math.round(settings.opacity * 100)}%`;
  hoverOpacityValue.value = `${Math.round(settings.hoverOpacity * 100)}%`;
  preview.style.setProperty(
    "--preview-background",
    colorWithOpacity(settings.color, settings.opacity),
  );
  preview.style.setProperty(
    "--preview-hover-background",
    colorWithOpacity(settings.color, settings.hoverOpacity),
  );
  status.textContent = "";
}

function populateForm(settings: AppearanceSettings): void {
  colorInput.value = settings.color;
  opacityInput.value = String(Math.round(settings.opacity * 100));
  hoverOpacityInput.value = String(Math.round(settings.hoverOpacity * 100));
  updatePreview();
}

form.addEventListener("input", updatePreview);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveAppearanceSettings(settingsFromForm())
    .then(() => {
      status.textContent = "设置已保存";
    })
    .catch(() => {
      status.textContent = "保存失败，请重试";
    });
});

resetButton.addEventListener("click", () => {
  populateForm(DEFAULT_APPEARANCE);
  void saveAppearanceSettings(DEFAULT_APPEARANCE)
    .then(() => {
      status.textContent = "已恢复默认设置";
    })
    .catch(() => {
      status.textContent = "恢复失败，请重试";
    });
});

void loadAppearanceSettings().then(populateForm);
