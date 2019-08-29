//  programmatic inject to avoid "Broad host permissions"
// https://developer.chrome.com/extensions/activeTab
chrome.browserAction.onClicked.addListener(function (tab) {
  console.log('chrome.browserAction.onClicked')
  chrome.tabs.executeScript(null, { file: 'content.js' });
  chrome.tabs.insertCSS(null, { file: 'content.css' });
});