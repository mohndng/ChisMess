document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const attachmentButton = document.getElementById('attachment-button');
    const fileInput = document.getElementById('file-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const modelButton = document.getElementById('model-button');
    const modelModal = document.getElementById('model-modal');
    const closeButton = document.querySelector('.close-button');
    const modelList = document.getElementById('model-list');

    let selectedModel = 'gemini-1.5-flash'; // Default model

    modelButton.addEventListener('click', () => {
        modelModal.style.display = 'block';
        fetchModels();
    });

    closeButton.addEventListener('click', () => {
        modelModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modelModal) {
            modelModal.style.display = 'none';
        }
    });

    function fetchModels() {
        fetch('/models')
            .then(response => response.json())
            .then(models => {
                modelList.innerHTML = '';
                models.forEach(model => {
                    const li = document.createElement('li');
                    li.textContent = model;
                    li.dataset.model = model;
                    li.addEventListener('click', () => {
                        selectedModel = model;
                        modelModal.style.display = 'none';
                        // Optional: Add a visual indicator for the selected model
                        console.log(`Model selected: ${selectedModel}`);
                    });
                    modelList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching models:', error));
    }

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
        formData.append('message', userMessage);
        formData.append('model', selectedModel);
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
            if (data.reply) {
                const cleanedReply = data.reply.replace(/\*/g, '');
                appendMessage('bot', cleanedReply);
            } else if (data.error) {
                appendMessage('bot', data.error);
            }
        })
        .catch(error => {
            typingIndicator.style.display = 'none';
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, there was a network error. Please try again.');
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
