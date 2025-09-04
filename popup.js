/**
 * @file popup.js
 * @description This script handles the logic for the extension's popup window.
 */

const options = document.querySelectorAll('input[name="titleOption"]');

// Save the selected option to chrome.storage
function saveOption(event) {
  chrome.storage.sync.set({
    titleOption: event.target.value
  });
}

// Load the saved option and update the UI
function loadOption() {
  chrome.storage.sync.get({
    // Set a default value of 'append' if nothing is saved yet
    titleOption: 'append'
  }, (data) => {
    document.querySelector(`input[value="${data.titleOption}"]`).checked = true;
  });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadOption);
options.forEach(option => {
  option.addEventListener('change', saveOption);
});