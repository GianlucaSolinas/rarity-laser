console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.storage.onChanged.addListener(function (changes, areaName) {
  console.log('storage area ', areaName);
  if (changes.extensionConfig) {
    console.log('storage changes', changes.extensionConfig);
  }
});
