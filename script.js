// Select relevant elements
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatPanel = document.getElementById('chat-panel');
const piiNoticePanel = document.getElementById('piiNoticePanel');
const proceedSendBtn = document.getElementById('proceedSendBtn');
const anonymizationSectionBody = document.querySelector('.anonymization-section-body');
const togglePanelButton = document.getElementById('togglepanelbutton');

// Toggle panel visibility
togglePanelButton.addEventListener('click', () => {
    document.body.classList.toggle('panel-collapsed');
    togglePanelButton.innerHTML = document.body.classList.contains('panel-collapsed') ? '&laquo;' : '&raquo;';
}); 

// Function to update chat panel height based on input height
function adjustChatPanelHeight() {
    const inputHeight = userInput.scrollHeight + 10;
    const maxHeight = 180;
    const newChatPanelHeight = `calc(100vh - ${Math.min(inputHeight, maxHeight) + 60}px)`;
    chatPanel.style.height = newChatPanelHeight;
}

// Check input content and toggle send button state
function toggleSendButtonState() {
    if (userInput.value.trim() !== '') {
        sendButton.classList.add('active');
    } else {
        sendButton.classList.remove('active');
    }
}

// Function to create PII boxes dynamically
function createPIIBox(type, instances) {
    const box = document.createElement('div');
    box.classList.add('pii-type-box');

    const header = document.createElement('div');
    header.classList.add('pii-header');
    const toggleSign = document.createElement('span');
    toggleSign.classList.add('pii-toggle-sign');
    toggleSign.textContent = '+';
    const typeName = document.createElement('span');
    typeName.textContent = type;

    header.appendChild(toggleSign);
    header.appendChild(typeName);

    const content = document.createElement('div');
    content.classList.add('pii-details');
    content.style.display = 'none';

    instances.forEach(({ text, start, end }) => {
        const instanceElement = document.createElement('div');
        instanceElement.classList.add('pii-instance');

        const locateIcon = document.createElement('img');
        locateIcon.src = 'locate.png';
        locateIcon.classList.add('pii-action-icon', 'locate-icon'); // Add tooltip class
        locateIcon.setAttribute('data-start', start);
        locateIcon.setAttribute('data-end', end);

        const restoreIcon = document.createElement('img');
        restoreIcon.src = 'restore.png';
        restoreIcon.classList.add('pii-action-icon');
        restoreIcon.setAttribute('data-start', start);
        restoreIcon.setAttribute('data-end', end);

        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('pii-dropdown-container');

        const dropdownButton = document.createElement('button');
        dropdownButton.textContent = 'Anonymize ▼';
        dropdownButton.classList.add('pii-action-button');
        dropdownButton.setAttribute('data-start', start);
        dropdownButton.setAttribute('data-end', end);

        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');
        dropdownMenu.style.display = 'none';

        const actions = ['Remove', ...(type === 'Date of Birth' || type === 'Physical Address' ? ['Generalize'] : []), 'Fake'];
        actions.forEach(action => {
            const actionItem = document.createElement('button');
            actionItem.textContent = action;
            actionItem.classList.add('dropdown-item');

            actionItem.addEventListener('click', () => {
                dropdownMenu.style.display = 'none'; // Close the dropdown after action
            });

            dropdownMenu.appendChild(actionItem);
        });

        dropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            // Toggle dropdown visibility
            const isVisible = dropdownMenu.style.display === 'block';
            closeAllDropdowns();
            if (!isVisible) {
                dropdownMenu.style.display = 'block';
            }
        });

        dropdownContainer.appendChild(dropdownButton);
        dropdownContainer.appendChild(dropdownMenu);

        const restoreicon = document.createElement('img');
        restoreicon.src = 'restore.png'; // Replace with your image path
        restoreicon.classList.add('pii-action-icon');

        const instanceText = document.createElement('span');
        instanceText.textContent = text;

        instanceElement.appendChild(instanceText);
        instanceElement.appendChild(locateIcon);
        instanceElement.appendChild(dropdownContainer);
        instanceElement.appendChild(restoreIcon);

        content.appendChild(instanceElement);

    });

    const bulkActionsContainer = document.createElement('div');
    bulkActionsContainer.classList.add('pii-bulk-actions');

    // Create "Anonymize All" dropdown
    const anonymizeAllContainer = document.createElement('div');
    anonymizeAllContainer.classList.add('pii-dropdown-container');

    const anonymizeAllButton = document.createElement('button');
    anonymizeAllButton.textContent = 'Anonymize All ▼';
    anonymizeAllButton.classList.add('pii-bulk-button');

    const anonymizeAllMenu = document.createElement('div');
    anonymizeAllMenu.classList.add('dropdown-menu');
    anonymizeAllMenu.style.display = 'none';

    const bulkActions = ['Remove', ...(type === 'Date of Birth' || type === 'Physical Address' ? ['Generalize'] : []), 'Fake'];
    bulkActions.forEach(action => {
        const actionItem = document.createElement('button');
        actionItem.textContent = action;
        actionItem.classList.add('dropdown-item');

        actionItem.addEventListener('click', () => {
            anonymizeAllMenu.style.display = 'none'; // Close the dropdown after action
        });

        anonymizeAllMenu.appendChild(actionItem);
    });

    anonymizeAllButton.addEventListener('click', (event) => {
        event.stopPropagation();
        // Toggle dropdown visibility
        const isVisible = anonymizeAllMenu.style.display === 'block';
        closeAllDropdowns();
        if (!isVisible) {
            anonymizeAllMenu.style.display = 'block';
        }
    });

    anonymizeAllContainer.appendChild(anonymizeAllButton);
    anonymizeAllContainer.appendChild(anonymizeAllMenu);
    bulkActionsContainer.appendChild(anonymizeAllContainer);

    // Add "Restore All" button
    const restoreAllButton = document.createElement('button');
    restoreAllButton.textContent = 'Restore All';
    restoreAllButton.classList.add('pii-bulk-button');
    bulkActionsContainer.appendChild(restoreAllButton);

    content.appendChild(bulkActionsContainer);

    header.addEventListener('click', () => {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        toggleSign.textContent = isVisible ? '+' : '-';
    });

    box.appendChild(header);
    box.appendChild(content);
    anonymizationSectionBody.appendChild(box);

    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
    // Close dropdowns when clicking outside
    document.addEventListener('click', closeAllDropdowns);

    addLocateListeners();
}


// Function to handle PII detection
function handlePIIDetection(userMessage) {
    const piiData = extractAllPII(userMessage);
    const { datesOfBirth, emails, macAddresses, names, addresses, ssns } = piiData;
    anonymizationSectionBody.innerHTML = ''; // Clear previous PII

    let hasPII = false;
    if (datesOfBirth.length > 0) {
        createPIIBox('Date of Birth', datesOfBirth);
        hasPII = true;
    }
    if (emails.length > 0) {
        createPIIBox('Email Address', emails);
        hasPII = true;
    }
    if (macAddresses.length > 0) {
        createPIIBox('MAC Address', macAddresses);
        hasPII = true;
    }
    if (names.length > 0) {
        createPIIBox('Name', names);
        hasPII = true;
    }
    if (addresses.length > 0) {
        createPIIBox('Physical Address', addresses);
        hasPII = true;
    }
    if (ssns.length > 0) {
        createPIIBox('SSN', ssns);
        hasPII = true;
    }

    if (hasPII) {
        piiNoticePanel.style.display = 'block';
        togglePanelButton.style.display = 'flex';
    } else {
        piiNoticePanel.style.display = 'none';
        togglePanelButton.style.display = 'none';
    }

    return hasPII;
}

// Event listener for the send button
sendButton.addEventListener('click', () => {
    const userMessage = userInput.value;
    if (userMessage.trim() == ''){
        piiNoticePanel.style.display = 'none';
        togglePanelButton.style.display = 'none';
    }

    if (userMessage.trim() !== '') {
        const hasPII = handlePIIDetection(userMessage);
        if(hasPII) {
            sendButton.classList.remove('active');
        }
        if (!hasPII) {
            sendUserMessage(userMessage);
        }
    }
});

// Event listener for the "Proceed with Sending..." button
proceedSendBtn.addEventListener('click', () => {
    const userMessage = userInput.value;
    piiNoticePanel.style.display = 'none';
    togglePanelButton.style.display = 'none';
    if (userMessage.trim() !== '') {
        sendUserMessage(userMessage);
    }
});

function sendUserMessage(message) {
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.textContent = message;
    chatPanel.appendChild(userMessageElement);

    // Clear the input field and reset height to initial value
    userInput.value = '';
    userInput.style.height = '30px';
    adjustChatPanelHeight();
    toggleSendButtonState();

    // Simulate AI response with logo
    setTimeout(() => {
        const aiMessageContainer = document.createElement('div');
        aiMessageContainer.classList.add('ai-message-container');

        const aiLogo = document.createElement('img');
        aiLogo.src = 'chatbotlogo.png'; // Replace with the path to your logo
        aiLogo.alt = 'AI Logo';
        aiLogo.classList.add('ai-logo');

        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('chat-message', 'ai-message');
        aiMessageElement.textContent = "AI's response: This is a simulated response. I'm just trying to put a longer text here to see how it looks like on the screen.";

        aiMessageContainer.appendChild(aiLogo);
        aiMessageContainer.appendChild(aiMessageElement);
        chatPanel.appendChild(aiMessageContainer);

        chatPanel.scrollTop = chatPanel.scrollHeight;
    }, 1000);

    chatPanel.scrollTop = chatPanel.scrollHeight;
}

// Adjust the input height only when text overflows to a new line
userInput.addEventListener('input', () => {
    userInput.style.height = '30px';
    if (userInput.scrollHeight > userInput.clientHeight) {
        userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
    }
    adjustChatPanelHeight();
    toggleSendButtonState();
});

// Allow pressing "Enter" to send the message without a new line
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendButton.click();
    }
});

// Initial call to set button state
toggleSendButtonState();

// Privacy Tips Pop-up Panel
const privacyTipsPopup = document.getElementById('privacyTipsPopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const privacyTipsBtn = document.querySelector('.privacy-tips-btn');

// Show the pop-up and overlay when the privacy tips button is clicked
privacyTipsBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    privacyTipsPopup.style.display = 'block';
});

// Close the pop-up and overlay when the close button is clicked
closePopupBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    privacyTipsPopup.style.display = 'none';
});

// FAQ toggle functionality for multiple questions and answers
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answers = item.querySelectorAll('.faq-answer');

    question.addEventListener('click', () => {
        answers.forEach(answer => {
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
        });

        const toggle = question.querySelector('.faq-toggle');
        if (toggle) {
            toggle.textContent = toggle.textContent === '+' ? '-' : '+';
        }
    });

    answers.forEach(answer => {
        const summary = answer.querySelector('.answer-summary');
        const details = answer.querySelector('.answer-details');
        const toggleSummary = summary.querySelector('.toggle-layertwo');

        summary.addEventListener('click', () => {
            const isDetailsVisible = details.style.display === 'block';
            details.style.display = isDetailsVisible ? 'none' : 'block';
            toggleSummary.textContent = isDetailsVisible ? '+' : '-';
        });
    });
});

function locateAndHighlight(start, end) {
    const textarea = document.getElementById('user-input');
    textarea.focus();

    // Adjust for newlines to align indices with the textarea's interpretation
    const adjustedStart = adjustIndexForNewlines(textarea.value, start);
    const adjustedEnd = adjustIndexForNewlines(textarea.value, end);

    // Highlight the selected text
    textarea.setSelectionRange(adjustedStart, adjustedEnd);

    // Scroll to the highlighted text
    const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight);
    const linesAbove = (textarea.value.slice(0, adjustedStart).match(/\n/g) || []).length;
    textarea.scrollTop = lineHeight * linesAbove;
}

// Helper function to adjust indices for newlines
function adjustIndexForNewlines(text, index) {
    let adjustedIndex = index;
    const newlineMatches = [...text.matchAll(/\r?\n/g)];
    newlineMatches.forEach(match => {
        if (match.index < index) {
            adjustedIndex -= match[0].length - 1; // Adjust for newline discrepancies
        }
    });
    return adjustedIndex;
}


// Add event listeners to locate icons dynamically created in PII boxes
function addLocateListeners() {
    const locateIcons = document.querySelectorAll('.locate-icon');
    locateIcons.forEach(icon => {
        const start = parseInt(icon.getAttribute('data-start'), 10);
        const end = parseInt(icon.getAttribute('data-end'), 10);

        icon.addEventListener('click', () => {
            locateAndHighlight(start, end);
        });
    });
}




