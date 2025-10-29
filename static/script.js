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
    const geminiProviderButton = document.getElementById('gemini-provider-button');
    const groqProviderButton = document.getElementById('groq-provider-button');
    const geminiModal = document.getElementById('gemini-modal');
    const groqModal = document.getElementById('groq-modal');
    const geminiModelList = document.getElementById('gemini-model-list');
    const groqModelList = document.getElementById('groq-model-list');

    let selectedProvider = 'gemini';
    let selectedModel = 'gemini-2.5-pro';

    geminiProviderButton.addEventListener('click', () => {
        geminiModal.style.display = 'block';
    });

    groqProviderButton.addEventListener('click', () => {
        groqModal.style.display = 'block';
    });

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            geminiModal.style.display = 'none';
            groqModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == geminiModal || event.target == groqModal) {
            geminiModal.style.display = 'none';
            groqModal.style.display = 'none';
        }
    });

    geminiModelList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            selectedProvider = 'gemini';
            selectedModel = event.target.dataset.model;
            geminiProviderButton.classList.add('active');
            groqProviderButton.classList.remove('active');
            geminiModal.style.display = 'none';
        }
    });

    groqModelList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            selectedProvider = 'groq';
            selectedModel = event.target.dataset.model;
            groqProviderButton.classList.add('active');
            geminiProviderButton.classList.remove('active');
            groqModal.style.display = 'none';
        }
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
        formData.append('model', selectedModel);
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
