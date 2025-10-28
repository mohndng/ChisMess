document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const attachmentButton = document.getElementById('attachment-button');
    const fileInput = document.getElementById('file-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const attachmentPreview = document.getElementById('attachment-preview');
    const fileName = document.getElementById('file-name');
    const removeFileButton = document.getElementById('remove-file-button');
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

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            fileName.textContent = file.name;
            attachmentPreview.style.display = 'flex';
        }
    });

    removeFileButton.addEventListener('click', () => {
        fileInput.value = '';
        attachmentPreview.style.display = 'none';
    });

    function sendMessage() {
        const userMessage = userInput.value;
        const file = fileInput.files[0];

        if (userMessage.trim() === '' && !file) return;

        appendMessage('user', userMessage);
        userInput.value = '';
        fileInput.value = '';
        attachmentPreview.style.display = 'none';

        typingIndicator.style.display = 'flex';

        const startTime = Date.now();
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
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            typingIndicator.style.display = 'none';
            if (data.reply) {
                const cleanedReply = data.reply.replace(/\*/g, '');
                appendMessage('bot', cleanedReply, duration);
            } else if (data.error) {
                appendMessage('bot', `Error: ${data.error}`, duration);
            }
        })
        .catch(error => {
            typingIndicator.style.display = 'none';
            console.error('Error:', error);
        });
    }

    function appendMessage(sender, message, duration) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const messageText = document.createElement('span');
        messageText.innerText = message;
        messageElement.appendChild(messageText);

        if (duration) {
            const durationElement = document.createElement('span');
            durationElement.classList.add('duration');
            durationElement.innerText = `${duration}s`;
            messageElement.appendChild(durationElement);
        }

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
