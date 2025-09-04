/**
 * @file background.js
 * @description This script runs in the background to modify tab titles based on saved settings.
 */

// This function is injected into the web page to perform the actual title modification.
function modifyTitle(url, mode) {
  // Use a unique separator to avoid conflicts and to easily find the original title.
  const separator = ' | URL: ';

  // Find the original title by splitting by our separator, in case we've modified it before.
  const originalTitle = document.title.split(separator)[0];

  if (mode === 'replace') {
    // Mode 1: Completely replace the title with the URL.
    document.title = url;
  } else {
    // Mode 2 (Default): Append the URL to the original title.
    document.title = `${originalTitle}${separator}${url}`;
  }
}

// This is the main function that triggers the title update.
function updateTabTitle(tabId, url) {
  // We only act on valid http/https URLs.
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    // First, get the saved option from storage.
    chrome.storage.sync.get({
      titleOption: 'append' // Default to 'append' if no setting is found.
    }, (data) => {
      // Now, execute the script in the tab with the correct mode.
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: modifyTitle,
        args: [url, data.titleOption] // Pass URL and the chosen mode as arguments.
      });
    });
  }
}


// Listen for tab updates (new page, reloads, SPA navigation).
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // The 'onUpdated' event can fire multiple times; we only need to act when we have a URL.
  if (tab.url) {
    updateTabTitle(tabId, tab.url);
  }
});

// Listen for new tabs being created.
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    updateTabTitle(tab.id, tab.url);
  }
});