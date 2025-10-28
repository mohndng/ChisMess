document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const attachmentButton = document.getElementById('attachment-button');
    const fileInput = document.getElementById('file-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const geminiButton = document.getElementById('gemini-button');
    const groqButton = document.getElementById('groq-button');

    let selectedProvider = 'gemini';

    geminiButton.addEventListener('click', () => {
        selectedProvider = 'gemini';
        geminiButton.classList.add('active');
        groqButton.classList.remove('active');
    });

    groqButton.addEventListener('click', () => {
        selectedProvider = 'groq';
        groqButton.classList.add('active');
        geminiButton.classList.remove('active');
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    attachmentButton.addEventListener('click', () => {
        fileInput.click();
    });

    function sendMessage() {
        const userMessage = userInput.value;
        const file = fileInput.files[0];

        if (userMessage.trim() === '' && !file) return;

        appendMessage('user', userMessage);
        userInput.value = '';
        fileInput.value = '';

        typingIndicator.style.display = 'flex';

        const formData = new FormData();
        formData.append('provider', selectedProvider);
        formData.append('message', userMessage);
        if (file) {
            formData.append('file', file);
        }

        fetch('/chat', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.style.display = 'none';
            const cleanedReply = data.reply.replace(/\*/g, '');
            appendMessage('bot', cleanedReply);
        })
        .catch(error => {
            typingIndicator.style.display = 'none';
            console.error('Error:', error);
        });
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerText = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
