// Select relevant elements
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatPanel = document.getElementById('chat-panel');
const piiNoticePanel = document.getElementById('piiNoticePanel');
const overlay = document.getElementById('overlay');

// Create and add the toggle button dynamically
const togglePanelButton = document.createElement('div');
togglePanelButton.classList.add('toggle-panel-button');
togglePanelButton.textContent = '>';
document.body.appendChild(togglePanelButton);

// Toggle panel visibility
togglePanelButton.addEventListener('click', () => {
    document.body.classList.toggle('panel-collapsed');
    togglePanelButton.textContent = document.body.classList.contains('panel-collapsed') ? '<' : '>';
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

// Event listener for the send button
sendButton.addEventListener('click', () => {
    const userMessage = userInput.value;
    if (userMessage.trim() !== '') {
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('chat-message', 'user-message');
        userMessageElement.textContent = userMessage;
        chatPanel.appendChild(userMessageElement);

        // Clear the input field and reset height to initial value
        userInput.value = '';
        userInput.style.height = '30px'; // Reset to initial single line height (same as CSS)
        adjustChatPanelHeight(); // Adjust chat panel height after sending
        toggleSendButtonState(); // Update button state

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

            chatPanel.scrollTop = chatPanel.scrollHeight; // Scroll to the bottom
        }, 1000);

        chatPanel.scrollTop = chatPanel.scrollHeight; // Scroll to the bottom
    }
});

// Adjust the input height only when text overflows to a new line
userInput.addEventListener('input', () => {
    userInput.style.height = '30px'; // Reset height to initial one line
    if (userInput.scrollHeight > userInput.clientHeight) {
        userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px'; // Expand if overflow
    }
    adjustChatPanelHeight(); // Adjust chat panel height
    toggleSendButtonState(); // Update button state
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
        // Toggle visibility of all answers for the clicked question
        answers.forEach(answer => {
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
        });

        // Find the toggle button within the clicked question and change the sign
        const toggle = question.querySelector('.faq-toggle');
        if (toggle) {
            toggle.textContent = toggle.textContent === '+' ? '-' : '+';
        }
    });

    // Loop through each answer-summary within each answer
    answers.forEach(answer => {
        const summary = answer.querySelector('.answer-summary');
        const details = answer.querySelector('.answer-details');
        const toggleSummary = summary.querySelector('.toggle-layertwo');

        summary.addEventListener('click', () => {
            // Toggle visibility of the details for the clicked summary
            const isDetailsVisible = details.style.display === 'block';
            details.style.display = isDetailsVisible ? 'none' : 'block';
            toggleSummary.textContent = isDetailsVisible ? '+' : '-';
        });
    });
});
