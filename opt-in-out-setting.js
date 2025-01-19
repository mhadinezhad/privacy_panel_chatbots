
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

const menuItems = document.querySelectorAll('.settings-menu .menu-item');
const panels = document.querySelectorAll('.settings-panel');

// Helper function to activate a specific panel and menu item
// function activatePanel(index) {
//   menuItems.forEach((item, i) => {
//     // Toggle active class for menu items
//     item.classList.toggle('active', i === index);

//     // Show/hide corresponding panels
//     if (panels[i]) {
//       panels[i].style.display = i === index ? 'block' : 'none';
//     }
//   });
// }

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

    // Ensure overlay is active
    overlay.classList.add('active');

    // Remove 'active' class from all menu items
    menuItems.forEach(item => item.classList.remove('active'));

    const dataControlsIndex = Array.from(menuItems).findIndex(item => 
      item.classList.contains('data-controls')
    );
    if (dataControlsIndex !== -1) {
        menuItems[dataControlsIndex].classList.add('active');
    }

    panels.forEach(panel => {
      if (panel.id === 'data-controls-panel') {
          panel.style.display = 'block';
      } else {
          panel.style.display = 'none';
      }
    });

    // Add blinking effect
    improveModelSection.classList.add('pulse');

    // Remove the blinking class after 3 blinks (3 seconds)
    setTimeout(() => {
        improveModelSection.classList.remove('pulse');
    }, 3000);
  });

  // Open "Personalization" when clicking on the memory button
document.querySelector('.memory-btn').addEventListener('click', () => {
  settingsPopup.style.display = 'block';

  overlay.classList.add('active');
  
  // Ensure the "Personalization" menu item is active
  document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
  document.querySelector('[data-panel-id="personalization-panel"]').classList.add('active');

  // Show the "Personalization" panel and hide all others
  document.querySelectorAll('.settings-panel').forEach((panel) => (panel.style.display = 'none'));
  document.getElementById('personalization-panel').style.display = 'block';  

  document.querySelector('.memory-header').classList.add('pulse');
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


  // Open the "Data Controls" panel
  document.getElementById('data-controls-btn').addEventListener('click', () => {
    // Set active class for "Data Controls"
    document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
    document.getElementById('data-controls-btn').classList.add('active');

    // Display the "Data Controls" panel and hide others
    document.querySelectorAll('.settings-panel').forEach((panel) => (panel.style.display = 'none'));
    document.getElementById('data-controls-panel').style.display = 'block';

    // Add blinking effect
    improveModelSection.classList.add('pulse');

    // Remove the blinking class after 3 blinks (3 seconds)
    setTimeout(() => {
        improveModelSection.classList.remove('pulse');
    }, 3000);
  });

  // Open the "Personalization" panel
  document.querySelector('[data-panel-id="personalization-panel"]').addEventListener('click', () => {
    // Set active class for "Personalization"
    document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
    document.querySelector('[data-panel-id="personalization-panel"]').classList.add('active');

    // Display the "Personalization" panel and hide others
    document.querySelectorAll('.settings-panel').forEach((panel) => (panel.style.display = 'none'));
    document.getElementById('personalization-panel').style.display = 'block';
  });
