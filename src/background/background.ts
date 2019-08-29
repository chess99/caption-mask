chrome.browserAction.onClicked.addListener(function (tab) {
  console.log('tab', tab)

  const message = { cmd: 'browserActionClicked' }
  chrome.tabs.sendMessage(tab.id, message, function (response) {
    console.log('来自content的回复：' + response);
  });
})

console.log('chrome of background', chrome)
console.log('origin of background', window.origin)