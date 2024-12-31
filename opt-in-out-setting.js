
const settingsPopup = document.getElementById('settings-popup');
const closeSettings = document.getElementById('close-settings');
const modelPopup = document.getElementById('model-popup');
const modelDoneBtn = document.getElementById('model-done-btn');
const toggleState = document.getElementById('toggle-state');
const improveModelSection = document.getElementById('model-improvement-panel-toggle');
const modelImproveCheckbox = document.getElementById('model-improve-checkbox');

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