/**
 * @file popup.js
 * @description This script handles the logic for the extension's popup window.
 * Compatible with both Chrome and Firefox. Uses local storage for better Firefox compatibility.
 */

// Polyfill for browser API to work in both Chrome and Firefox
if (typeof browser === "undefined") {
    var browser = chrome;
}

const options = document.querySelectorAll('input[name="titleOption"]');

// Save the selected option to storage
function saveOption(event) {
  browser.storage.local.set({
    titleOption: event.target.value
  }).catch((error) => {
    console.error('Storage save error:', error);
  });
}

// Load the saved option and update the UI
function loadOption() {
  browser.storage.local.get({
    // Set a default value of 'append' if nothing is saved yet
    titleOption: 'append'
  }).then((data) => {
    // Handle the case where data might be undefined
    const titleOption = (data && data.titleOption) ? data.titleOption : 'append';
    document.querySelector(`input[value="${titleOption}"]`).checked = true;
  }).catch((error) => {
    console.error('Storage load error:', error);
    // Fallback to default
    document.querySelector(`input[value="append"]`).checked = true;
  });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadOption);
options.forEach(option => {
  option.addEventListener('change', saveOption);
});