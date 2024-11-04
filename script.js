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

    instances.forEach(instance => {
        const instanceElement = document.createElement('div');
        instanceElement.classList.add('pii-instance');

        const locateicon = document.createElement('img');
        locateicon.src = 'locate.png'; // Replace with your image path
        locateicon.classList.add('pii-action-icon');

        const anonymizeButton = document.createElement('button');
        anonymizeButton.textContent = 'Anonymize';
        anonymizeButton.classList.add('pii-action-button');
        anonymizeButton.classList.add('anonymize-instance');

        const restoreicon = document.createElement('img');
        restoreicon.src = 'restore.png'; // Replace with your image path
        restoreicon.classList.add('pii-action-icon');

        const instanceText = document.createElement('span');
        instanceText.textContent = instance;

        instanceElement.appendChild(instanceText);
        instanceElement.appendChild(locateicon);
        instanceElement.appendChild(anonymizeButton);
        instanceElement.appendChild(restoreicon);

        content.appendChild(instanceElement);
    });

    const bulkActions = document.createElement('div');
    bulkActions.classList.add('pii-bulk-actions');
    const anonymizeAllButton = document.createElement('button');
    anonymizeAllButton.textContent = 'Anonymize All';
    anonymizeAllButton.classList.add('pii-bulk-button');

    const restoreAllButton = document.createElement('button');
    restoreAllButton.textContent = 'Restore All';
    restoreAllButton.classList.add('pii-bulk-button');

    bulkActions.appendChild(anonymizeAllButton);
    bulkActions.appendChild(restoreAllButton);
    content.appendChild(bulkActions);

    header.addEventListener('click', () => {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        toggleSign.textContent = isVisible ? '+' : '-';
    });

    box.appendChild(header);
    box.appendChild(content);
    anonymizationSectionBody.appendChild(box);
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
        createPIIBox('Address', addresses);
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
    if (userMessage.trim() !== '') {
        const hasPII = handlePIIDetection(userMessage);

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