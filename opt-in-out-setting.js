
const settingsPopup = document.getElementById('settings-popup');
const closeSettings = document.getElementById('close-settings');
const modelPopup = document.getElementById('model-popup');
const modelDoneBtn = document.getElementById('model-done-btn');
const toggleState = document.getElementById('toggle-state');
const improveModelSection = document.getElementById('model-improvement-panel-toggle');
const modelImproveCheckbox = document.getElementById('model-improve-checkbox');
const profileIcon = document.getElementById('profile-icon');
const profilePanel = document.getElementById('profile-panel');
const settingsMenuItem = document.querySelector('.profile-panel ul li:nth-child(3)');


// Function to toggle the visibility of the panel (the one for the profile picture)
profileIcon.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent click event from propagating to document
  const isPanelVisible = profilePanel.style.display === 'block';
  profilePanel.style.display = isPanelVisible ? 'none' : 'block';
});

// Close the panel (the one for the profile picture) when clicking outside of it
document.addEventListener('click', (event) => {
  if (!profilePanel.contains(event.target) && event.target !== profileIcon) {
      profilePanel.style.display = 'none';
  }
});

// Add functionality for the "Settings" menu item
document.querySelector('.profile-panel ul li:nth-child(3)').addEventListener('click', () => {
  settingsPopup.style.display = 'block';
  overlay.classList.add('active');
  profilePanel.style.display = 'none';
});



document.querySelector('.opt-in-out-btn').addEventListener('click', () => {
    settingsPopup.style.display = 'block';
    overlay.classList.add('active');

    // Add blinking effect
    improveModelSection.classList.add('pulse');

    // Remove the blinking class after 3 blinks (3 seconds)
    setTimeout(() => {
        improveModelSection.classList.remove('pulse');
    }, 3000);
  });
  
  // Close Settings Popup
  closeSettings.addEventListener('click', () => {
    settingsPopup.style.display = 'none';
    overlay.classList.remove('active');
  });
  
  // Show Model Improvement Popup when clicking on either 'section-title' or 'section-toggle'
  document.querySelectorAll('.improve-model-cursor').forEach((element) => {
    element.addEventListener('click', () => {
      modelPopup.style.display = 'block';
      overlay.classList.add('active');
      overlay.style.zIndex = '1310';
    });
  });
  
  // Update Toggle State in Data Controls
  modelImproveCheckbox.addEventListener('change', (e) => {
    toggleState.innerHTML = e.target.checked ? 'On &#8250;' : 'Off &#8250;';
  });
  
  // Done Button in Model Popup
  modelDoneBtn.addEventListener('click', () => {
    modelPopup.style.display = 'none';
    overlay.style.zIndex = '1020';

    const isChecked = modelImproveCheckbox.checked;
    toggleState.innerHTML = isChecked ? 'On &#8250;' : 'Off &#8250;';
  });
  
  // Overlay closes all popups
  overlay.addEventListener('click', () => {
    if (modelPopup.style.display != 'none'){
        modelPopup.style.display = 'none';
        overlay.style.zIndex = '1020';
        return;
    }
    if (settingsPopup.style.display != 'none'){
        settingsPopup.style.display = 'none';
        overlay.classList.remove('active');
        return;
    }
  });