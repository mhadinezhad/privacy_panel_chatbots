// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBXT5HtDjFwTVkQkCxupWkuagXKI2Tc-S4",
    authDomain: "privacy-notice-f01f8.firebaseapp.com",
    databaseURL: "https://privacy-notice-f01f8-default-rtdb.firebaseio.com",
    projectId: "privacy-notice-f01f8",
    storageBucket: "privacy-notice-f01f8.firebasestorage.app",
    messagingSenderId: "85202029299",
    appId: "1:85202029299:web:9261876663039479264586",
    measurementId: "G-3SV3XPHKGN"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Sign in anonymously and retrieve user ID
let userId;
let messagesRef;
let interactionsRef;


signInAnonymously(auth)
    .then((userCredential) => {
        userId = userCredential.user.uid; // Get the user's UID
        console.log("User signed in anonymously with UID:", userId);

        // Initialize references only after UID is obtained
        messagesRef = ref(database, `participants/${userId}/messages`);
        interactionsRef = ref(database, `participants/${userId}/interactions`);
    })
    .catch((error) => {
        console.error("Error during anonymous sign-in:", error);
    });

// ******************************* Above is for Firebase *******************************

// Select relevant elements
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatPanel = document.getElementById('chat-panel');
const piiNoticePanel = document.getElementById('piiNoticePanel');
const proceedSendBtn = document.getElementById('proceedSendBtn');
const anonymizationSectionBody = document.querySelector('.anonymization-section-body');
const togglePanelButton = document.getElementById('togglepanelbutton');
let isProceeding = false;

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
        restoreIcon.classList.add('pii-action-icon', 'restore-icon');
        restoreIcon.setAttribute('data-start', start);
        restoreIcon.setAttribute('data-end', end);

        restoreIcon.addEventListener('click', () => {
            const textarea = document.getElementById('user-input');
            // Replace specific PII text with the original
            updateTextareaWithPreservedIndices(textarea, textarea.value, [{ start, end }], () => text);        
        });

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

            // Add event listeners for the actions
            actionItem.addEventListener('click', () => {
                const textarea = document.getElementById('user-input');
                const replaceFn = (original, index) => {
                    if (action === 'Remove') return `[${type}]`;
                    if (action === 'Fake') return generateFake(type);
                    if (action === 'Generalize') return generalizePII(type, original);
                };

                // Update textarea for this instance
                updateTextareaWithPreservedIndices(textarea, textarea.value, [{ start, end }], replaceFn);

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
        restoreicon.src = 'restore.png';
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

        // Add event listeners for bulk actions
        actionItem.addEventListener('click', () => {
            const textarea = document.getElementById('user-input');
            const replaceFn = (original, index) => {
                if (action === 'Remove') return `[${type}]`;
                if (action === 'Fake') return generateFake(type);
                if (action === 'Generalize') return generalizePII(type, original);
            };

            // Update textarea for all instances
            updateTextareaWithPreservedIndices(textarea, textarea.value, instances, replaceFn);

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

    restoreAllButton.addEventListener('click', () => {
        const textarea = document.getElementById('user-input');
        // Replace all instances of the PII type with their original text
        updateTextareaWithPreservedIndices(textarea, textarea.value, instances, (_, index) => instances[index].text);    
    });

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

// Utility function to replace a PII instance in the text
function replaceInstance(text, start, end, replacement) {
    const replacementWithPadding = replacement.length > (end - start)
        ? replacement.slice(0, end - start - 1) + ']' // Truncate within placeholder brackets
        : replacement.padEnd(end - start, ' ');      // Pad replacement with spaces if shorter
    return text.slice(0, start) + replacementWithPadding + text.slice(end);
}

// Function to update the textarea with preserved indices
function updateTextareaWithPreservedIndices(textarea, text, instances, replaceFn) {
    let offset = 0; // Track the offset due to replacements
    instances.forEach(({ start, end }, index) => {
        const adjustedStart = start + offset;
        const adjustedEnd = end + offset;
        let replacement = replaceFn(text.substring(start, end), index);

        // Ensure replacement length matches the original length
        if (replacement.length > (adjustedEnd - adjustedStart)) {
            replacement = replacement.slice(0, adjustedEnd - adjustedStart - 1) + ']'; // Truncate with closing bracket
        } else {
            replacement = replacement.padEnd(adjustedEnd - adjustedStart, ' '); // Pad with spaces
        }

        // Replace the instance and calculate new offset
        const newText = text.slice(0, adjustedStart) + replacement + text.slice(adjustedEnd);
        offset += replacement.length - (adjustedEnd - adjustedStart);
        text = newText;
    });

    textarea.value = text; // Update the textarea value
}


// Utility function to generate fake data
function generateFake(type) {
    switch (type) {
        case 'Email Address':
            return 'fake.email@example.com';
        case 'Name':
            return 'John Doe';
        case 'Physical Address':
            return '123 Fake Street, Faketown, FK 12345';
        case 'Date of Birth':
            return 'January 1, 1990';
        case 'SSN':
            return '123-45-6789';
        default:
            return '[Fake Data]';
    }
}

// Utility function to generalize PII data
function generalizePII(type, value) {
    if (type === 'Physical Address') {
        const parts = value.split(',');
        return parts.length > 1 ? parts[parts.length - 1].trim() : '[Generalized Address]';
    }
    if (type === 'Date of Birth') {
        const yearMatch = value.match(/\b\d{4}\b/);
        return yearMatch ? yearMatch[0] : '[Generalized Date]';
    }
    return '[Generalized Data]';
}

// Function to handle PII detection
function handlePIIDetection(userMessage) {

    // Remove the inactive message if it exists
    const inactiveMessage = piiNoticePanel.querySelector('.inactive-message');
    if (inactiveMessage) {
        piiNoticePanel.removeChild(inactiveMessage);
    }

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
    if (piiNoticePanel.classList.contains('inactive')) {
        // Clear the inactive state and regenerate the notice
        piiNoticePanel.classList.remove('inactive');
    }
    
    const userMessage = userInput.value.trim(); // Get the user's message

    if (userMessage === '') {
        piiNoticePanel.style.display = 'none';
        togglePanelButton.style.display = 'none';
        return; // Do nothing if the input is empty
    }

    const hasPII = handlePIIDetection(userMessage); // Detect PII
    const sentToAPI = !hasPII; // Determine if the message can be sent to the API

    
    if (hasPII) {
        // If PII exists, log the blocked action and display the notice
        logMessage("sendButton", userMessage, false, null); // Log the block
        sendButton.classList.remove('active'); // Block sending
        return;
    }
    // If no PII, send the message to the API and log the response
    logMessage("sendButton", userMessage, true, null); // Log the initial send action
    sendUserMessage(userMessage);
});

// Event listener for the "Proceed with Sending..." button
proceedSendBtn.addEventListener('click', () => {
    const userMessage = userInput.value;
    piiNoticePanel.style.display = 'none';
    togglePanelButton.style.display = 'none';
    
    if (userMessage === '') {
        return; // Do nothing if the input is empty
    }

    isProceeding = true; // Mark the use of proceedSendBtn
    logMessage("proceedSendBtn", userMessage, false, null); // Log the initial action
    sendUserMessage(userMessage);
});


async function sendUserMessage(message) {
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.textContent = message;
    chatPanel.appendChild(userMessageElement);

    // Clear input field and adjust UI
    userInput.value = '';
    userInput.style.height = '30px';
    adjustChatPanelHeight();
    toggleSendButtonState();

    // Show a placeholder for the AI response
    const aiMessageContainer = document.createElement('div');
    aiMessageContainer.classList.add('ai-message-container');

    const aiLogo = document.createElement('img');
    aiLogo.src = 'chatbotlogo.png';
    aiLogo.alt = 'AI Logo';
    aiLogo.classList.add('ai-logo');

    const aiMessageElement = document.createElement('div');
    aiMessageElement.classList.add('chat-message', 'ai-message');
    aiMessageElement.innerHTML = ''; // Empty placeholder

    aiMessageContainer.appendChild(aiLogo);
    aiMessageContainer.appendChild(aiMessageElement);
    chatPanel.appendChild(aiMessageContainer);
    chatPanel.scrollTop = chatPanel.scrollHeight;

    try {
        const response = await getChatGPTResponse(message, aiMessageElement); // Fetch API response

        // Log the successful response based on the action
        if (isProceeding) {
            logMessage("proceedSendBtn", message, true, response);
            isProceeding = false; // Reset the flag
        } else {
            logMessage("sendButton", message, true, response);
        }
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);

        // Log the error response based on the action
        const action = isProceeding ? "proceedSendBtn" : "sendButton";
        logMessage(action, message, true, null);
        aiMessageElement.textContent = 'Sorry, there was an error processing your request. Please try again later.';
    }
}

function logMessage(action, message, sentToAPI, response = null) {
    const timestamp = Date.now();
    const readableDate = new Date(timestamp).toLocaleString();

    const messageIdRef = push(messagesRef); // Create a unique message ID
    set(messageIdRef, {
        action: action,
        message: message,
        sentToAPI: sentToAPI,
        response: response,
        timestamp: timestamp,
        readableDate: readableDate, // Add the human-readable format
    });
}

function logInteraction(panel, action, element) {
    const timestamp = Date.now();
    const readableDate = new Date(timestamp).toLocaleString();

    const interactionIdRef = push(interactionsRef); // Ensure `interactionsRef` is correctly defined
    set(interactionIdRef, {
        panel: panel,
        action: action,
        element: element,
        timestamp: timestamp,
        readableDate: readableDate, // Add the human-readable format
    });
}

piiNoticePanel.addEventListener('click', (event) => {
    const clickedElement = event.target;

    // Get detailed information about the clicked element
    const elementDetails = {
        id: clickedElement.getAttribute('id') || null,
        class: clickedElement.getAttribute('class') || null,
        dataId: clickedElement.getAttribute('data-id') || null,
        tag: clickedElement.tagName,
        textContent: clickedElement.textContent.trim().substring(0, 40), // First 50 chars of text
    };

    // Log the interaction with detailed element info
    logInteraction("privacyNoticePanel", "click", JSON.stringify(elementDetails));
});


async function getChatGPTResponse(userMessage, aiMessageElement) {
    const apiKey = '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';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: userMessage },
                ],
                max_tokens: 700,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let fullResponse = ''; // Accumulate the entire response

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            const chunk = decoder.decode(value, { stream: true });
            const parsedChunk = extractContentFromChunk(chunk);

            if (parsedChunk) {
                fullResponse += parsedChunk; // Accumulate the full response

                // Process and render interim Markdown
                const interimHtml = marked.parse(cleanUpMarkdown(fullResponse.trim()));
                aiMessageElement.innerHTML = interimHtml;
                chatPanel.scrollTop = chatPanel.scrollHeight; // Scroll to the bottom
            }
        }

        // Final render with cleaned Markdown
        aiMessageElement.innerHTML = marked.parse(cleanUpMarkdown(fullResponse.trim()));
        chatPanel.scrollTop = chatPanel.scrollHeight; // Scroll to the bottom

        return fullResponse.trim(); // Return the final response

    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        throw error;
    }
}

function extractContentFromChunk(chunk) {
    try {
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        // Parse valid lines and construct coherent content
        return lines.map(line => {
            const json = line.replace('data: ', '').trim();
            if (json === '[DONE]') return ''; // End of stream
            const parsed = JSON.parse(json);
            return parsed.choices[0]?.delta?.content || '';
        }).join('');
    } catch (error) {
        console.error('Error parsing chunk:', error);
        return '';
    }
}

function cleanUpMarkdown(markdown) {
    return markdown
        .replace(/\n{2,}/g, '\n\n') // Ensure proper paragraph spacing
        .replace(/(?<!\n)\n(?!\n)/g, ' ') // Replace single newlines with spaces
        .replace(/^\s+|\s+$/g, '') // Trim leading/trailing spaces
        .replace(/ {2,}/g, ' '); // Collapse multiple spaces
}

//  const apiKey = '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';


// Adjust the input height only when text overflows to a new line
userInput.addEventListener('input', () => {
    userInput.style.height = '30px';
    if (userInput.scrollHeight > userInput.clientHeight) {
        userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
    }
    adjustChatPanelHeight();
    toggleSendButtonState();

    if (piiNoticePanel.style.display === 'block') {
        // Check if the inactive message already exists
        if (!piiNoticePanel.querySelector('.inactive-message')) {
            // Fade out and lock the privacy panel
            piiNoticePanel.classList.add('inactive');
            const inactiveMessage = document.createElement('div');
            inactiveMessage.classList.add('inactive-message');
            inactiveMessage.textContent = "Privacy warning inactive due to manual edits. Click Enter or Send button to update it.";
            piiNoticePanel.appendChild(inactiveMessage);
        }
    }
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

// Privacy Tips Pop-up: Log Interactions Dynamically
privacyTipsPopup.addEventListener('click', (event) => {
    const clickedElement = event.target;

    // Get detailed information about the clicked element
    const elementDetails = {
        id: clickedElement.getAttribute('id') || null,
        class: clickedElement.getAttribute('class') || null,
        dataId: clickedElement.getAttribute('data-id') || null,
        tag: clickedElement.tagName,
        textContent: clickedElement.textContent.trim().substring(0, 50), // Log first 50 chars of text
    };

    // Log the interaction with detailed element info
    logInteraction("privacyTipsPopup", "click", JSON.stringify(elementDetails));
});