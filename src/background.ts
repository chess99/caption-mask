chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;

  void chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    })
    .catch((error: unknown) => {
      // Chrome 内部页面、扩展页面等禁止注入；这不影响普通网页使用。
      console.warn("Caption Mask cannot run on this page.", error);
    });
});
