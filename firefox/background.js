/**
 * @file background.js
 * @description This script runs in the background to modify tab titles based on saved settings.
 * Compatible with both Chrome and Firefox. Uses local storage for better Firefox compatibility.
 */

// Polyfill for browser API to work in both Chrome and Firefox
if (typeof browser === "undefined") {
    var browser = chrome;
}

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
    browser.storage.local.get({
      titleOption: 'append' // Default to 'append' if no setting is found.
    }).then((data) => {
      // Handle the case where data might be undefined
      const titleOption = (data && data.titleOption) ? data.titleOption : 'append';

      // Now, execute the script in the tab with the correct mode.
      // Use different APIs for Chrome vs Firefox
      if (browser.scripting && browser.scripting.executeScript) {
        // Chrome Manifest V3
        browser.scripting.executeScript({
          target: { tabId: tabId },
          func: modifyTitle,
          args: [url, titleOption] // Pass URL and the chosen mode as arguments.
        });
      } else if (browser.tabs && browser.tabs.executeScript) {
        // Firefox Manifest V2
        browser.tabs.executeScript(tabId, {
          code: `(${modifyTitle.toString()})("${url}", "${titleOption}")`
        });
      }
    }).catch((error) => {
      console.error('Storage error:', error);
      // Fallback to default behavior
      const titleOption = 'append';
      if (browser.tabs && browser.tabs.executeScript) {
        browser.tabs.executeScript(tabId, {
          code: `(${modifyTitle.toString()})("${url}", "${titleOption}")`
        });
      }
    });
  }
}


// Listen for tab updates (new page, reloads, SPA navigation).
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // The 'onUpdated' event can fire multiple times; we only need to act when we have a URL.
  if (tab.url) {
    updateTabTitle(tabId, tab.url);
  }
});

// Listen for new tabs being created.
browser.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    updateTabTitle(tab.id, tab.url);
  }
});