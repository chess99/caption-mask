chrome.action.onClicked.addListener(function (tab) {
  if (typeof tab.id !== "undefined") {
    console.log("chrome.action.onClicked");
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content.css"],
    });
  } else {
    console.error("Tab ID is undefined.");
  }
});
